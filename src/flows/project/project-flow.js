import { projectsApi } from "src/api/projects";
import { ProjectStatus } from "src/enums/project-state";
import { projectsLocalApi } from "src/api/projects/project-local-storage";
import { projectResponseApi } from "src/api/projects/project-response-api";
import { addDoc, arrayRemove, arrayUnion, collection, doc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import { emailSender } from "src/libs/email-sender";
import { firestore } from "src/libs/firebase";
import { wait } from "src/utils/wait";
import { paths } from "src/paths";
import { ProjectResponseStatus } from "src/enums/project-response-state";
import { chatApi } from "src/api/chat/newApi";
import { getFileType } from "src/utils/get-file-type";
import { ERROR, INFO } from "src/libs/log";
import { sendNotificationToUser } from "src/notificationApi";
import { projectService } from "src/service/project-service";
import { profileApi } from "src/api/profile";
import { extendedProfileApi } from "src/pages/cabinet/profiles/my/data/extendedProfileApi";
import { runTransaction } from "firebase/firestore";
import { emailService } from "src/service/email-service";
import { deepCopy } from "src/utils/deep-copy";
import { EmailTriggers } from "src/constants/email-triggers";

function projectToHTML(project) {
    let html = `%HTML:<div>`;

    if (project.description) {
        html += `<p><strong>Description:</strong> ${project.description}</p>`;
    }

    if (project.location && project.location.place_name) {
        html += `<p><strong>Location:</strong> ${project.location.place_name}</p>`;
    }

    if (project.projectMaximumBudget) {
        html += `<p><strong>Maximum Budget:</strong> $${project.projectMaximumBudget}</p>`;
    }
    if (project.attach && project.attach.length > 0) {
        html += `<p><strong>Attachments:</strong></p>`;
    }
    html += `</div>`;

    return html;
}

const escapeHtml = (text) => {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

const formatReviewToHTML = (rating, message, title = "Work Review") => {
    const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);

    const html = `%HTML:
        <div class="review-container">
            <h2 class="review-title">
                ${escapeHtml(title)}
            </h2>
            <div class="review-stars">
                ${stars}
            </div>
            <div class="review-message">
                ${escapeHtml(message)}
            </div>
        </div>
    `;

    return html;
};

function createInfoMessage(text1, text2) {
    return `%INFO:${text1}%INFO:${text2}`
}


class ProjectFlow {

    //Publish new projects
    async moderate(project) {
        const logTitle = "ProjectFlow moderate";
        try {
            INFO(logTitle, "startTransaction");

            const newProject = await projectsApi.createProject({
                ...project,
                state: ProjectStatus.MODERATE
            });

            try {
                await emailSender.sendAdmin_newOrderForModerate(newProject, false);
                if (project.customerEmail) {
                    await emailSender.sendProjectActionNotification(project.customerEmail, "Project is under moderation!",
                        emailService.createWelcomeRequestEmail());
                }
            } catch (e) {
                ERROR("sendProjectActionNotification", e);
            }
            INFO(logTitle, "endTransaction");
        } catch (e) {
            ERROR(logTitle, e);
        }
    }


    //Publish new projects
    async create(project, user) {
        const logTitle = "ProjectFlow create";
        try {
            INFO(logTitle, "startTransaction");
            let upUser = deepCopy(user);
            if (!upUser) {
                upUser = await profileApi.get(project.userId);
            }
            const newProject = await projectsApi.createProject({
                ...project,
                userId: upUser.id,
                projectMaximumBudget: project.projectMaximumBudget || null,
                customerAvatar: upUser.avatar,
                customerName: upUser.name,
                customerMail: upUser.email,
                state: ProjectStatus.PUBLISHED
            });
            let chat = null;
            if (newProject.proposerUserId) {
                try {
                    const proposer = await profileApi.get(newProject.proposerUserId);
                    if (proposer) {
                        chat = await this.responseProposal(newProject, proposer);
                    }
                } catch (e) {
                    ERROR("sendAdmin_newOrderForModerate", e);
                }
            }

            await projectsApi.addHistoryRecord(newProject.id, upUser.id, upUser.name, upUser.avatar, "publish", project.state, ProjectStatus.PUBLISHED);
            await emailSender.sendAdmin_newOrder(newProject, upUser, false);

            const specialistsIds = await profileApi.getUserIdsForSpecialty(newProject.specialtyId);
            const usersEmails = await profileApi.getUsersEmails(specialistsIds);
            INFO("Specialists: ", specialistsIds);
            for (const specialistId of specialistsIds) {
                if (specialistId !== upUser.id) {
                    const title = `New project available!`;
                    const text = `A new project is available for you. Please check it out <a href="${paths.cabinet.projects.find.detail.replace(":projectId", newProject.id)}">${newProject.title}</a>!`;

                    if (usersEmails[specialistId]) {
                        emailSender.sendProjectActionNotification(usersEmails[specialistId], title, emailService.createProjectNotificationEmail(newProject));
                    }
                    await sendNotificationToUser(specialistId, title, text);
                }
            }
            if (chat) {
                return chat;
            }

            INFO(logTitle, "endTransaction");
        } catch (e) {
            ERROR(logTitle, e);
        }
    }

    prepareLinkForMail = (text) => {
        return text.replace(/<a href="([^"]+)"/g, (match, url) => {
            return `<a href="${process.env.REACT_APP_HOST_P}${url}"`;
        });
    }


    //Edit draft projects
    async edit(project, user) {
        await projectsApi.updateProject(project.id, {
            ...project,
            userId: user.id,
            customerAvatar: user.avatar,
            customerName: user.name
        });
        await projectsApi.addHistoryRecord(project.id, user.id, user.name, user.avatar, "edit", project.state, project.state);
    }

    //Publish exist projects
    async publish(projectId, user) {
        const logTitle = "ProjectFlow publish";
        try {
            await runTransaction(firestore, async (transaction) => {
                INFO(logTitle, "startTransaction");

                //Get project from DB for real state
                const project = await projectsApi.getProjectById(projectId, transaction);

                if (!project || project.state !== ProjectStatus.DRAFT) {
                    const error = new Error("Error state of project");
                    ERROR(logTitle, error);
                    throw error
                }

                await projectsApi.updateProject(project.id, {
                    state: ProjectStatus.PUBLISHED,
                    userId: user.id,
                    customerAvatar: user.avatar,
                    customerName: user.name
                }, transaction);
                await projectsApi.addHistoryRecord(project.id, user.id, user.name, user.avatar, "publish", project.state, ProjectStatus.PUBLISHED, '', transaction);

                const respondedSpecialists = project.respondedSpecialists || [];
                for (const rs of respondedSpecialists) {
                    if (rs.state !== ProjectResponseStatus.REJECTED) {
                        await chatApi.sendMessage(rs.threadId, user.id, createInfoMessage("You have published a project.", "The customer has published the project. It is available for viewing again"), null, null, transaction);
                        await sendNotificationToUser(rs.userId, "Project published", `The customer has published the project <a href="${paths.cabinet.projects.find.detail.replace(":projectId", project.id)}">${project.title}</a>!`, transaction);
                    }
                }
                INFO(logTitle, "endTransaction");
            });
        } catch (e) {
            ERROR(logTitle, e);
            throw (e);
        }
    }

    //Remove projects
    async remove(project) {
        if (!project.id) {
            projectsLocalApi.deleteProject();
        } else {
            {
                await projectsApi.deleteProject(project.id);
                const threadIds = await chatApi.getThreadIdsByProjectId(project.id);
                await chatApi.deleteThreads(threadIds);
            }
        }
    }

    //Cancel projects
    async cancel(project) {
        await projectsApi.updateProject(project.id, { state: ProjectStatus.CANCELLED });
    }

    //Unpublish projects
    async unpublish(projectId, user) {
        const logTitle = "ProjectFlow unpublish";
        try {
            await runTransaction(firestore, async (transaction) => {
                INFO(logTitle, "startTransaction");

                //Get project from DB for real state
                const project = await projectsApi.getProjectById(projectId, transaction);

                if (!project || project.state !== ProjectStatus.PUBLISHED) {
                    const error = new Error("Only the published draft can be returned to the draft.");
                    ERROR(logTitle, error);
                    throw error
                }

                await projectsApi.updateProject(project.id, { state: ProjectStatus.DRAFT }, transaction);
                await projectsApi.addHistoryRecord(project.id, user.id, user.name, user.avatar, "unpublish", project.state, ProjectStatus.DRAFT, '', transaction);

                const respondedSpecialists = project.respondedSpecialists || [];
                for (const rs of respondedSpecialists) {
                    if (rs.state !== ProjectResponseStatus.REJECTED) {
                        await chatApi.sendMessage(rs.threadId, user.id, createInfoMessage("You have removed the project from publication.", "The customer removed the project from publication. It's probably temporary. You will receive a notification if he returns it again."), null, null, transaction);
                        await sendNotificationToUser(rs.userId, "Project unpublished", `The customer removed the project from publication <a href="${paths.cabinet.projects.find.detail.replace(":projectId", project.id)}">${project.title}</a>!`, transaction);
                    }
                }
                INFO(logTitle, "endTransaction");
            });
        } catch (e) {
            ERROR(logTitle, e);
            throw (e);
        }
    }

    /**
     * @Deprecated
     */
    async acceptResponse(project, user, response) {
        await projectsApi.updateProjectResponse(project.id, { ...response, state: ProjectResponseStatus.ACCEPTED });
        /*await projectsApi.updateProject(projects.id, {
            state: ProjectStatus.IN_PROGRESS,
            contractorId: response.contractorId
        });
        await projectsApi.addHistoryRecord(projects.id, user.id, user.name, user.avatar, "accept_response$" + response.contractorName, projects.state, ProjectStatus.IN_PROGRESS);*/
    }

    /**
     * @Deprecated
     */
    async rejectResponse(project, user, response) {
        await projectsApi.updateProjectResponse(project.id, { ...response, state: ProjectResponseStatus.REJECTED });
    }

    /**
     * @Deprecated
     */
    async pendingResponse(project, user, message) {
        await projectsApi.addProjectResponse(project.id, {
            state: ProjectResponseStatus.PENDING,
            message: message || null,
            contractorId: user.id,
            contractorAvatar: user?.avatar || null,
            contractorName: user.name,
            contractorRating: user?.rating || 0,
            contractorRatingCounts: user?.ratingCounts || 0,
            projectId: project.id
        });

        await projectsApi.addHistoryRecord(project.id, user.id, user.name, user.avatar, "pending_response", project.state, project.state);
    }

    //Hold projects
    async holdProject(project, comment) {
        await projectsApi.updateProject(project.id, { state: ProjectStatus.ON_HOLD, holdComment: comment });
    }

    //Unhold projects
    async unholdProject(project) {
        await projectsApi.updateProject(project.id, { state: ProjectStatus.IN_PROGRESS });
    }

    async toConfirmationProject(project, contractorCompleteReview) {
        await projectsApi.updateProject(project.id, {
            state: ProjectStatus.ON_CONFIRM,
            contractorCompleteReview: contractorCompleteReview
        });
    }

    async archiveProject(project) {
        await projectsApi.updateProject(project.id, { state: ProjectStatus.ARCHIVED });
    }

    async notInterested(project, user) {
        await projectsApi.updateProject(project.id, { uninterestedSpecialists: arrayUnion(user.id) });
    }

    async reInterested(project, user) {
        await projectsApi.updateProject(project.id, { uninterestedSpecialists: arrayRemove(user.id) });
    }

    async response(project, user, tradeId = null) {
        //Start new chat or get existing
        const threadId = await chatApi.startChat(project.userId, user.id, project.id);

        //Add user.id to array of specialist who responded
        const updateData = {
            respondedSpecialists: arrayUnion({
                userId: user.id,
                userName: user.businessName || user.name,
                userAvatar: user.avatar,
                threadId: threadId,
                createdAt: new Date(),
                tradeId: tradeId
            })
        };

        if (tradeId && !project.tradeId) {
            updateData.tradeId = tradeId;
        }

        await projectsApi.updateProject(project.id, updateData);

        //Add to chat first message with project description
        /*await chatApi.sendMessage(threadId,
            project.userId,
            projectToHTML(project),
            project.attach?.map(a => ({
                type: getFileType(a),
                url: a
            })),
            [user.id, project.userId],
            false);*/
        //Add to chat first message
        await chatApi.sendMessage(threadId,
            user.id,
            createInfoMessage("Have you responded to the project. You can ask clarifying questions from the customer in this chat.",
                "The specialist responded to the project. You can ask clarifying questions in this chat before deciding on the choice of this specialist."),
            null,
            [user.id, project.userId]);

        //Send notification to customer
        await sendNotificationToUser(project.userId, "New response to the project", `Specialist ${user.businessName} is ready to help you with the project <a href="${paths.cabinet.projects.detail.replace(":projectId", project.id)}?threadKey=${threadId}">${project.title}</a>!`);

        try {
            const emails = await profileApi.getUsersEmails(project.userId);
            if (emails[project.userId]) {
                await emailService.sendByTrigger(
                    EmailTriggers.SPECIALIST_READY,
                    { user, project, threadId },
                    () => emailService.createSpecialistReadyEmail(user, project, threadId)
                );
            }
        } catch (e) {
            ERROR("sendProjectActionNotification", e);
        }

        return threadId;
    }

    async responseProposal(project, user) {
        //Start new chat or get existing
        const threadId = await chatApi.startChat(project.userId, user.id, project.id);

        //Add user.id to array of specialist who responded
        await projectsApi.updateProject(project.id, {
            respondedSpecialists: arrayUnion({
                userId: user.id,
                userName: user.businessName || user.name,
                userAvatar: user.avatar,
                threadId: threadId,
                createdAt: new Date()
            })
        });
        await chatApi.sendMessage(threadId,
            project.userId,
            createInfoMessage("You published the project and offered it to this specialist. You can ask clarifying questions to a specialist or describe the project and goals in more detail.",
                "The customer offers you to complete his project. You can ask clarifying questions from the customer in this chat."),
            null,
            [project.userId, user.id]);
        //Add to chat first message with project description
        await chatApi.sendMessage(threadId,
            project.userId,
            projectToHTML(project),
            project.attach?.map(a => ({
                type: getFileType(a),
                url: a
            })),
            [user.id, project.userId],
            false);
        //Add to chat first message

        if (project.proposerMessage) {
            await chatApi.sendMessage(threadId,
                project.userId,
                project.proposerMessage,
                null,
                [user.id, project.userId],
                false);
        }

        //Send notification to proposer
        await sendNotificationToUser(user.id, "You have been offered a project", `The customer offers you to complete his project: <a href="${paths.cabinet.projects.find.detail.replace(":projectId", project.id)}?threadKey=${threadId}">${project.title}</a>!`);

        try {
            await emailService.sendTemplate(
                "project_offer",
                { user: { name: project.customerName, email: project.customerMail }, project, threadId },
                () => emailService.createProjectOfferEmail(
                    { name: project.customerName, email: project.customerMail },
                    project,
                    threadId
                )
            )
        } catch (e) {
            ERROR("sendProjectActionNotification", e);
        }

        return threadId;
    }

    /**
     * Review from contractor
     * @param project
     * @param contractorCompleteReview
     * @param thread
     * @param publishProjectToPortfolio - {date, title, shortDescription, images} or null
     * @returns {Promise<void>}
     */
    async reviewFromContractor(project, contractorCompleteReview, thread, publishProjectToPortfolio) {
        await projectsApi.updateProject(project.id, {
            contractorCompleteReview: contractorCompleteReview
        });

        try {
            if (publishProjectToPortfolio) {
                await profileApi.addPortfolio(project.userId, publishProjectToPortfolio);
            }
        } catch (e) {
            ERROR("reviewFromContractor", e);
        }

        const contractor = thread.users.find(item => item.id !== project.userId);
        const customer = thread.users.find(item => item.id === project.userId);

        await chatApi.sendMessage(thread.id, contractor.id, formatReviewToHTML(contractorCompleteReview.rating, contractorCompleteReview.message), null, thread.users);
        await sendNotificationToUser(customer.id, "New review", `The specialist appreciated the interaction with you on the project <a href="${paths.cabinet.projects.detail.replace(":projectId", project.id)}?threadKey=${thread.id}">${project.title}</a>!`);
    }

    async completeProjectFromContractor(project, thread) {
        const contractor = thread.users.find(item => item.id !== project.userId);
        const customer = thread.users.find(item => item.id === project.userId);

        await chatApi.sendMessage(thread.id, contractor.id, createInfoMessage("Wait for confirmation from the customer", "The specialist has completed the project, confirm"), null, null);

        await sendNotificationToUser(customer.id, "Project is completed", `The specialist has completed the project, confirm <a href="${paths.cabinet.projects.detail.replace(":projectId", project.id)}?threadKey=${thread.id}">${project.title}</a>!`);
        try {
            await emailService.sendTemplate(
                "project_completion_confirmation",
                { project, thread },
                () => emailService.createProjectCompletionConfirmationEmail(
                    project,
                    thread
                )
            );
        } catch (e) {
            ERROR("sendProjectActionNotification", e);
        }
    }

    async completeProject(project, customerCompleteReview, thread) {
        await projectsApi.updateProject(project.id, {
            state: ProjectStatus.COMPLETED,
            customerCompleteReview: customerCompleteReview
        });

        const contractor = thread.users.find(item => item.id !== project.userId);
        const customer = thread.users.find(item => item.id === project.userId);

        await extendedProfileApi.addReview(contractor.id, project.id, customerCompleteReview.message, customerCompleteReview.rating, customer.id);
        await chatApi.sendMessage(thread.id, customer.id, createInfoMessage("The project is completed", "The project is completed"), null, thread.users);
        await chatApi.sendMessage(thread.id, customer.id, formatReviewToHTML(customerCompleteReview.rating, customerCompleteReview.message), null, thread.users);

        await projectsApi.addHistoryRecord(project.id, customer.id, customer.name, customer.avatar, `complete`, project.state, ProjectStatus.COMPLETED);
        //Send notification to specialist
        await sendNotificationToUser(contractor.id, "New review", `Your work has been appreciated <a href="${paths.cabinet.projects.find.detail.replace(":projectId", project.id)}?threadKey=${thread.id}">${project.title}</a>!`);
        await sendNotificationToUser(contractor.id, "Project is completed", `Evaluate the interaction with the customer on the project <a href="${paths.cabinet.projects.find.detail.replace(":projectId", project.id)}?threadKey=${thread.id}">${project.title}</a>!`);

        try {
            await emailService.sendTemplate(
                "evaluate_interaction",
                { project, thread },
                () => emailService.createEvaluateInteractionEmail(project, thread)
            );
        } catch (e) {
            ERROR("sendProjectActionNotification", e);
        }
    }


    async selectSpecialist(selectedThread, rejectedThreads, user) {
        const logTitle = "ProjectFlow selectSpecialist";

        try {
            await runTransaction(firestore, async (transaction) => {
                INFO(logTitle, "startTransaction");
                // Update contractor in project
                const contractor = selectedThread.users.find(item => item.id !== user.id);
                const projectId = selectedThread.projectId;
                //Get project from DB for real state
                const project = await projectsApi.getProjectById(projectId, transaction);

                projectService.selectSpecialistInRespondedList(project, contractor.id);

                await projectsApi.updateProject(projectId, {
                    contractorId: contractor.id,
                    contractorAvatar: contractor.avatar,
                    contractorName: contractor.businessName || contractor.name,
                    state: ProjectStatus.IN_PROGRESS,
                    respondedSpecialists: project.respondedSpecialists
                }, transaction)


                //Update selected in Thread
                await chatApi.update(selectedThread.id, { selectedForProject: true, rejected: false }, transaction);

                //Reject another threads
                const threadIds = rejectedThreads.map(c => c.id).filter(c => c !== selectedThread.id);
                if (threadIds && threadIds.length > 0) {
                    for (const t of threadIds) {
                        await chatApi.update(t, { rejected: true }, transaction);
                        await chatApi.sendMessage(t, user.id, createInfoMessage("You have chosen another specialist.", "The customer informed that he had chosen another contractor for the project. If the plans change, you will receive a notification."), null, null, transaction);
                    }
                }
                await chatApi.sendMessage(selectedThread.id, user.id, createInfoMessage("You have chosen another specialist.", "You have been selected as the project executor"), null, selectedThread.users, transaction);
                await projectsApi.addHistoryRecord(projectId, user.id, user.name, user.avatar, `select_specialist$${(contractor.businessName || contractor.name)}`, project.state, ProjectStatus.IN_PROGRESS, "", transaction);
                //Send notification to specialist
                await sendNotificationToUser(contractor.id, "You've been hired", `You have been selected as a performer for the project <a href="${paths.cabinet.projects.find.detail.replace(":projectId", projectId)}">${project.title}</a>!`, transaction);
                try {
                    await emailService.sendTemplate(
                        "selected_performer",
                        { project, threadId: selectedThread.id },
                        () => emailService.createSelectedAsPerformerEmail(
                            project,
                            selectedThread.id
                        )
                    );
                } catch (e) {
                    ERROR("sendProjectActionNotification", e);
                }

                INFO(logTitle, "endTransaction");
            });
        } catch (e) {
            ERROR(logTitle, e);
            throw (e);
        }
    }

    async rejectSpecialist(thread, userId, rejectedReview = undefined) {
        const logTitle = "ProjectFlow rejectSpecialist";
        try {
            await runTransaction(firestore, async (transaction) => {
                INFO(logTitle, "startTransaction");
                const contractor = thread.users.find(item => item.id !== userId);
                const customer = thread.users.find(item => item.id === userId);
                const project = await projectsApi.getProjectById(thread.projectId, transaction);

                if (project.state === ProjectStatus.IN_PROGRESS) {
                    //Send message
                    await chatApi.sendMessage(thread.id, customer.id, createInfoMessage("You refused to cooperate with this specialist.", "The customer informed us that he refused to cooperate with you. Don't worry! Go ahead for new orders :)"), null, null, transaction);
                    await sendNotificationToUser(contractor.id, "Project rejected", `You have been rejected from the project <a href="${paths.cabinet.projects.find.detail.replace(":projectId", project.id)}">${project.title}</a>!`, transaction);

                    try {
                        await emailService.sendTemplate(
                            "project_rejected",
                            { project },
                            () => emailService.createRejectedFromProjectEmail(project)
                        );
                    } catch (e) {
                        ERROR("sendProjectActionNotification", e);
                    }

                    //Reject current chat and Unreject another who not in uninterestedList
                    // selected or uninterested => rejected,  rejected => pending
                    projectService.rejectSelectedSpecialistInRespondedList(project, contractor.id);

                    const responded = project?.respondedSpecialists || [];
                    const respondedUserIds = responded.filter(r => r.state === ProjectResponseStatus.PENDING).map(r => r.userId);
                    const emails = await profileApi.getUsersEmails(respondedUserIds);

                    for (const t of responded) {
                        await chatApi.update(t.threadId, {
                            rejected: t.state === ProjectResponseStatus.REJECTED,
                            selectedForProject: false
                        }, transaction);
                        if (t.state === ProjectResponseStatus.PENDING) {
                            await chatApi.sendMessage(t.threadId, customer.id, createInfoMessage("You have returned the project to the specialist search.", "The customer has opened a search for a specialist for this project"), null, null, transaction);
                            await sendNotificationToUser(t.userId, "The project is available again", `You can become a performer in the project <a href="${paths.cabinet.projects.find.detail.replace(":projectId", project.id)}">${project.title}</a>!`, transaction);
                            if (emails[t.userId]) {
                                try {
                                    await emailSender.sendProjectActionNotification(emails[t.userId], "Project is available again",
                                        emailService.createCustomerReadyToWorkAgainEmail(project.id, t.threadId));
                                } catch (e) {
                                    ERROR("sendProjectActionNotification", e);
                                }
                            }
                        }
                    }

                    await projectsApi.updateProject(project.id, {
                        state: ProjectStatus.PUBLISHED,
                        contractorId: null,
                        contractorAvatar: null,
                        contractorName: null,
                        respondedSpecialists: project.respondedSpecialists
                    }, transaction);

                    if (rejectedReview) {
                        await extendedProfileApi.addReview(contractor.id, project.id, rejectedReview.message, rejectedReview.rating, customer.id, transaction);
                        await chatApi.sendMessage(thread.id, customer.id, formatReviewToHTML(rejectedReview.rating, rejectedReview.message), null, null, transaction);
                        //Send notification to specialist
                        await sendNotificationToUser(contractor.id, "New rejected review", `Your work has been appreciated <a href="${paths.cabinet.projects.find.detail.replace(":projectId", project.id)}">${project.title}</a>!`, transaction);
                    }

                    await projectsApi.addHistoryRecord(project.id, customer.id, customer.name, customer.avatar, `select_specialist_rejected$${(contractor.businessName || contractor.name)}`, project.state, ProjectStatus.IN_PROGRESS, '', transaction);
                } else {
                    await chatApi.update(thread.id, { rejected: true }, transaction);
                    await chatApi.sendMessage(thread.id, customer.id, createInfoMessage("You refused to cooperate with this specialist.", "The customer informed us that he refused to cooperate with you. Don't worry! Go ahead for new orders :)"), null, null, transaction);
                    projectService.updateRespondedSpecialistItem(project, {
                        userId: contractor.id,
                        state: ProjectResponseStatus.REJECTED
                    })

                    await projectsApi.updateProject(project.id, {
                        respondedSpecialists: project.respondedSpecialists
                    }, transaction);

                    try {
                        await emailSender.sendProjectActionNotification(contractor.email, "Project rejected",
                            emailService.createRejectedFromProjectEmail(project));
                    } catch (e) {
                        ERROR("sendProjectActionNotification", e);
                    }
                }
                INFO(logTitle, "endTransaction");
            });
        } catch (e) {
            ERROR(logTitle, e);
            throw (e);
        }
    }

    async unrejectSpecialist(thread, userId) {
        await chatApi.rejectChat(thread.id, false);
        const contractor = thread.users.find(item => item.id !== userId);

        await chatApi.sendMessage(thread.id, userId, createInfoMessage("A specialist can work.", "The customer has informed us that he is ready to work with you again."), null, thread.users);

        try {
            if (contractor) {
                await emailSender.sendProjectActionNotification(contractor.email, "Project is available again",
                    emailService.createCustomerReadyToWorkAgainEmail(thread.projectId, thread.id));
            }
        } catch (e) {
            ERROR("sendProjectActionNotification", e);
        }
    }

    async rejectProjectResponse(threadId, userId) {
        const thread = await chatApi.getChat(threadId);

        await chatApi.rejectChat(thread.id);
        await chatApi.sendMessage(thread.id, userId, createInfoMessage("You have abandoned the project", "The specialist refused the project"), null, thread.users);

        //Hide
        const project = await projectsApi.getProjectById(thread.projectId);
        projectService.updateRespondedSpecialistItem(project, { userId: userId, state: ProjectResponseStatus.REJECTED })
        await projectsApi.updateProject(project.id, {
            uninterestedSpecialists: arrayUnion(userId),
            respondedSpecialists: project.respondedSpecialists
        });
    }

    /**
     * Send message to customer for review project
     * @param contractorId - contractor id
     * @param contractorName - contractor name
     * @param contractorEmail - contractor email
     * @param project - {addToPortfolio, projectName, projectDate, projectDescription, specialtyId}
     * @param customerEmail - customer email
     * @param reviewMessage - review message
     * @returns {Promise<void>}
     */
    async sendReviewRequestPastClients(contractorId, contractorName, contractorEmail, project, customerEmail, reviewMessage) {
        INFO("ProjectFlow sendReviewRequestPastClients", contractorId, contractorName, contractorEmail, project, customerEmail, reviewMessage);
        try {
            const savedProject = project.id ? await extendedProfileApi.updatePortfolioWithoutImages(contractorId, project.id, { customerEmail: customerEmail })
                : await extendedProfileApi.addPortfolio(contractorId, {
                    date: project.projectDate,
                    title: project.projectName,
                    shortDescription: project.projectDescription,
                    specialtyId: project.specialtyId,
                    customerEmail: customerEmail,
                    location: project.location || '',
                    images: project.files || []
                }, project.addToPortfolio);

            if (customerEmail && reviewMessage) {
                await emailService.sendTemplate(
                    "review_request_past_clients",
                    {
                        contractorName,
                        contractorEmail,
                        message: reviewMessage,
                        link: `${process.env.REACT_APP_HOST_P}${paths.reviewForm.index
                            .replace(":specialistId", contractorId)
                            .replace(":projectId", savedProject.id)}`
                    },
                    () =>
                        emailService.createReviewRequestPastClients(
                            contractorName,
                            contractorEmail,
                            reviewMessage,
                            `${process.env.REACT_APP_HOST_P}${paths.reviewForm.index
                                .replace(":specialistId", contractorId)
                                .replace(":projectId", savedProject.id)}`
                        )
                );
            }
        } catch (e) {
            ERROR("sendReviewRequestPastClients", e);
            throw e;
        }
    }

    async submitReviewFromPastClient(contractor, customerEmail, customerName, project, review) {
        const customer = await profileApi.addGuestProfile(customerEmail, customerName);

        await extendedProfileApi.updatePortfolioWithoutImages(contractor.id, project.id, { review: review });
        await extendedProfileApi.addReview(contractor.id, project.id, review.message, review.rating, customer.id);
        //Send notification to specialist
        await sendNotificationToUser(contractor.id, "New review", `Your portfolio project has been appreciated!`);

        try {
            await emailSender.sendProjectActionNotification(customerEmail, "Thank you for your feedback!",
                emailService.createThankYouEmail({ name: customerName }, [
                    { icon: "✓", text: "All specialists are verified with document checks" },
                    { icon: "⭐", text: "Ratings and reviews from real clients" },
                    { icon: "🔒", text: "Secure transactions with quality guarantees" },
                    { icon: "📱", text: "Convenient app for ordering services" }
                ]));
        } catch (e) {
            ERROR("sendProjectActionNotification", e);
        }
        try {
            await emailService.sendTemplate(
                "specialist_review_notification",
                {
                    specialist: { name: contractor.name },
                    review: { rating: review.rating, message: review.message, authorName: customerName },
                    project
                },
                () =>
                    emailService.createSpecialistReviewNotificationEmail(
                        { name: contractor.name },
                        { rating: review.rating, message: review.message, authorName: customerName },
                        project
                    )
            );
        } catch (e) {
            ERROR("sendProjectActionNotification", e);
        }
    }


    async submitSpecialistReviewFromPastClient(contractor, customerEmail, customerName, review) {
        const customer = await profileApi.addGuestProfile(customerEmail, customerName);

        await extendedProfileApi.addReview(contractor.id, null, review.message, review.rating, customer.id);
        //Send notification to specialist
        await sendNotificationToUser(contractor.id, "New review", `Your portfolio project has been appreciated!`);

        try {
            await emailSender.sendProjectActionNotification(customerEmail, "Thank you for your feedback!",
                emailService.createThankYouEmail({ name: customerName }, [
                    { icon: "✓", text: "All specialists are verified with document checks" },
                    { icon: "⭐", text: "Ratings and reviews from real clients" },
                    { icon: "🔒", text: "Secure transactions with quality guarantees" },
                    { icon: "📱", text: "Convenient app for ordering services" }
                ]));
        } catch (e) {
            ERROR("sendProjectActionNotification", e);
        }
        try {
            await emailSender.sendProjectActionNotification(contractor.email, "New Review on Your Profile",
                emailService.createSpecialistReviewNotificationEmail({ name: contractor.name },
                    { rating: review.rating, message: review.message, authorName: customerName }, null));
        } catch (e) {
            ERROR("sendProjectActionNotification", e);
        }
    }
    async sendTradeReviewRequest(contractorId, contractorName, contractorEmail, tradeId, project, customerEmail, reviewMessage) {
        INFO("ProjectFlow sendTradeReviewRequest", contractorId, contractorName, contractorEmail, tradeId, project, customerEmail, reviewMessage);
        try {
            const savedProject = project.id ? await extendedProfileApi.updatePortfolioWithoutImages(contractorId, project.id, { customerEmail: customerEmail, tradeId: tradeId })
                : await extendedProfileApi.addPortfolio(contractorId, {
                    date: project.projectDate,
                    title: project.projectName,
                    shortDescription: project.projectDescription,
                    specialtyId: project.specialtyId,
                    customerEmail: customerEmail,
                    location: project.location || '',
                    images: project.files || [],
                    tradeId: tradeId
                }, project.addToPortfolio);

            if (customerEmail && reviewMessage) {
                await emailService.sendTemplate(
                    "review_request_past_clients",
                    {
                        contractorName,
                        contractorEmail,
                        message: reviewMessage,
                        link: `${process.env.REACT_APP_HOST_P}${paths.reviewForm.index
                            .replace(":specialistId", contractorId)
                            .replace(":projectId", savedProject.id)}`
                    },
                    () =>
                        emailService.createReviewRequestPastClients(
                            contractorName,
                            contractorEmail,
                            reviewMessage,
                            `${process.env.REACT_APP_HOST_P}${paths.reviewForm.index
                                .replace(":specialistId", contractorId)
                                .replace(":projectId", savedProject.id)}`
                        )
                );
            }

            return savedProject.id;
        } catch (e) {
            ERROR("sendTradeReviewRequest", e);
            throw e;
        }
    }
}

export const projectFlow = new ProjectFlow();
