import {projectsApi} from "src/api/projects";
import {ProjectStatus} from "src/enums/project-state";
import {projectsLocalApi} from "src/api/projects/project-local-storage";
import {projectResponseApi} from "src/api/projects/project-response-api";
import {addDoc, arrayRemove, arrayUnion, collection, serverTimestamp} from "firebase/firestore";
import toast from "react-hot-toast";
import {emailSender} from "src/libs/email-sender";
import {firestore} from "src/libs/firebase";
import {wait} from "src/utils/wait";
import {paths} from "src/paths";
import {ProjectResponseStatus} from "src/enums/project-response-state";
import {chatApi} from "src/api/chat/newApi";
import {getFileType} from "src/utils/get-file-type";
import {INFO} from "src/libs/log";

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

function createInfoMessage(text1, text2) {
    return `%INFO:${text1}%INFO:${text2}`
}

class ProjectFlow {

    //Publish new projects
    async create(project, user) {
        const newProject = await projectsApi.createProject({
            ...project,
            userId: user.id,
            customerAvatar: user.avatar,
            customerName: user.name,
            state: ProjectStatus.PUBLISHED
        });

        projectsLocalApi.deleteProject();
        await projectsApi.addHistoryRecord(newProject.id, user.id, user.name, user.avatar, "publish", project.state, ProjectStatus.PUBLISHED);
        try {
            emailSender.sendAdmin_newOrder(project, user).then(r => {
            });
            /*const data = {
                createdAt: serverTimestamp(),
                authorId: projects.userId,

                customerId: user.id,
                customerEmail: user.email,
                customerName: user.businessName || user.name,
                customerAvatar: user.avatar || '',

                title: projects.title,
                startDate: projects.start,
                endDate: projects.end,
                description: projects.description,

                specialties: [],
                finalDescription: '',
                photos: [],
                existingPhotos: [],

                // address: projects.location || '',
                comments: [],

                postType: "projects",
                projectStatus: ProjectStatus.PUBLISHED
            };
            addDoc(collection(firestore, "specialistPosts"), data).then(r => {
                const postId = r.id;
                setIsComplete(true);
                wait(1000).then(r => router.replace(paths.dashboard.specialistProfile.index));
            });*/
        } catch (e) {
            console.log(e);
        }
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
    async publish(project, user) {
        await projectsApi.updateProject(project.id, {
            state: ProjectStatus.PUBLISHED,
            userId: user.id,
            customerAvatar: user.avatar,
            customerName: user.name
        });
        await projectsApi.addHistoryRecord(project.id, user.id, user.name, user.avatar, "publish", project.state, ProjectStatus.PUBLISHED);
    }

    //Remove projects
    async remove(project) {
        if (!project.id) {
            projectsLocalApi.deleteProject();
        } else {
            await projectsApi.deleteProject(project.id);
        }
    }

    //Cancel projects
    async cancel(project) {
        await projectsApi.updateProject(project.id, {state: ProjectStatus.CANCELLED});
    }

    //Unpublish projects
    async unpublish(project, user) {
        if (project.state !== ProjectStatus.PUBLISHED) {
            throw new Error("Only the published draft can be returned to the draft.")
        }
        await projectsApi.updateProject(project.id, {state: ProjectStatus.DRAFT});

        await projectsApi.addHistoryRecord(project.id, user.id, user.name, user.avatar, "unpublish", project.state, ProjectStatus.DRAFT);

    }

    /**
     * @Deprecated
     */
    async acceptResponse(project, user, response) {
        await projectsApi.updateProjectResponse(project.id, {...response, state: ProjectResponseStatus.ACCEPTED});
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
        await projectsApi.updateProjectResponse(project.id, {...response, state: ProjectResponseStatus.REJECTED});
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
        await projectsApi.updateProject(project.id, {state: ProjectStatus.ON_HOLD, holdComment: comment});
    }

    //Unhold projects
    async unholdProject(project) {
        await projectsApi.updateProject(project.id, {state: ProjectStatus.IN_PROGRESS});
    }

    async toConfirmationProject(project, contractorCompleteReview) {
        await projectsApi.updateProject(project.id, {
            state: ProjectStatus.ON_CONFIRM,
            contractorCompleteReview: contractorCompleteReview
        });
    }

    async completeProject(project, consumerCompleteReview) {
        await projectsApi.updateProject(project.id, {
            state: ProjectStatus.COMPLETED,
            consumerCompleteReview: consumerCompleteReview
        });
    }

    async archiveProject(project) {
        await projectsApi.updateProject(project.id, {state: ProjectStatus.ARCHIVED});
    }

    async notInterested(project, user) {
        await projectsApi.updateProject(project.id, {uninterestedSpecialists: arrayUnion(user.id)});
    }

    async reInterested(project, user) {
        await projectsApi.updateProject(project.id, {uninterestedSpecialists: arrayRemove(user.id)});
    }

    async response(project, user) {
        //Start new chat or get existing
        const threadId = await chatApi.startChat(user.id, project.userId, project.id);

        //Add user.id to array of specialist who responded
        await projectsApi.updateProject(project.id, {
            respondedSpecialists: arrayUnion({
                userId: user.id,
                threadId: threadId
            })
        });

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

        return threadId;
    }

    async rejectSpecialist(thread, userId) {
        await chatApi.rejectChat(thread.id);

        await chatApi.sendMessage(thread.id, userId, createInfoMessage("You refused to cooperate with this specialist.", "The customer informed us that he refused to cooperate with you. Don't worry! Go ahead for new orders :)"), null, thread.users);
    }

    async unrejectSpecialist(thread, userId) {
        await chatApi.rejectChat(thread.id, false);

        await chatApi.sendMessage(thread.id, userId, createInfoMessage("A specialist can work.", "The customer has informed us that he is ready to work with you again."), null, thread.users);
    }
}

export const projectFlow = new ProjectFlow();
