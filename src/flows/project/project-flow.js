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

    //Accept specialist's response
    async acceptResponse(project, user, response) {
        await projectsApi.updateProjectResponse(project.id, { ...response, state: ProjectResponseStatus.ACCEPTED});
        /*await projectsApi.updateProject(projects.id, {
            state: ProjectStatus.IN_PROGRESS,
            contractorId: response.contractorId
        });
        await projectsApi.addHistoryRecord(projects.id, user.id, user.name, user.avatar, "accept_response$" + response.contractorName, projects.state, ProjectStatus.IN_PROGRESS);*/
    }

    //Accept specialist's response
    async rejectResponse(project, user, response) {
        await projectsApi.updateProjectResponse(project.id, {...response,state: ProjectResponseStatus.REJECTED});
    }

    //Accept specialist's response
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

    async notinterested(project, user) {
        await projectsApi.updateProject(project.id, {uninterestedSpecialists: arrayUnion(user.id)});
    }

    async reinterested(project, user) {
        await projectsApi.updateProject(project.id, {uninterestedSpecialists: arrayRemove(user.id)});
    }


}

export const projectFlow = new ProjectFlow();
