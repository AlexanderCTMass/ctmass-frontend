import {projectsApi} from "src/api/projects";
import {ProjectStatus} from "src/enums/project-state";
import {projectsLocalApi} from "src/api/projects/project-local-storage";
import {projectResponseApi} from "src/api/projects/project-response-api";
import {arrayRemove, arrayUnion} from "firebase/firestore";

class ProjectFlow {

    //Publish project
    async publish(project, user) {
        await projectsApi.updateProject(project.id, {
            state: ProjectStatus.PUBLISHED,
            userId: user.id,
            customerAvatar: user.avatar,
            customerName: user.name
        });
        await projectsApi.addHistoryRecord(project.id, user.id, user.name, user.avatar, "publish", project.state, ProjectStatus.PUBLISHED);
    }

    //Remove project
    async remove(project) {
        if (project.state === ProjectStatus.DRAFT) {
            projectsLocalApi.deleteProject();
        } else {
            await projectsApi.deleteProject(project.id);
        }
    }

    //Cancel project
    async cancel(project) {
        await projectsApi.updateProject(project.id, {state: ProjectStatus.CANCELLED});
    }

    //Unpublish project
    async unpublish(project, user) {
        if (project.state !== ProjectStatus.PUBLISHED) {
            throw new Error("Only the published draft can be returned to the draft.")
        }
        await projectsApi.updateProject(project.id, {state: ProjectStatus.DRAFT});

        await projectsApi.addHistoryRecord(project.id, user.id, user.name, user.avatar, "unpublish", project.state, ProjectStatus.DRAFT);

    }

    //Accept specialist's response
    async acceptResponse(project, response) {
        await projectResponseApi.updateProjectResponse(response.id, {state: "accepted"});
        await projectsApi.updateProject(project.id, {state: ProjectStatus.IN_PROGRESS, contractorId: response.userId});
    }

    //Hold project
    async holdProject(project, comment) {
        await projectsApi.updateProject(project.id, {state: ProjectStatus.ON_HOLD, holdComment: comment});
    }

    //Unhold project
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
