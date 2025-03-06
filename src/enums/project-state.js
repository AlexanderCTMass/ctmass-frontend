export const ProjectStatus = Object.freeze({
    DRAFT: "draft",
    LOCAL_DRAFT: "local_draft",
    // PENDING_REVIEW: "pending_review",
    // APPROVED: "approved",
    PUBLISHED: "published",
    IN_PROGRESS: "in_progress",
    ON_HOLD: "on_hold",
    ON_CONFIRM: "on_confirm",
    COMPLETED: "completed",
    ARCHIVED: "archived",
    CANCELLED: "cancelled",
});

export const isProjectRemovable = (state) => {
    if (state === ProjectStatus.DRAFT) {
        return true;
    }
    return false;
}

export const isProjectUnpublished = (state) => {
    if (state === ProjectStatus.PUBLISHED) {
        return true;
    }
    return false;
}

function validate(project) {
    if (!project.state) {
        console.log("project not state")
        return false;
    }

    if (!project.specialtyId) {
        console.log("project not specialtyId")
        return false;
    }
    if (!project.serviceId && !project.customService) {
        console.log("project not serviceId")
        return false;
    }

    if (!project.title) {
        console.log("project not title")
        return false;
    }

    if (!project.projectMaximumBudget) {
        console.log("project not projectMaximumBudget")
        return false;
    }

    if (!project.description) {
        console.log("project not description")
        return false;
    }

    if (!project.location) {
        console.log("project not location")
        return false;
    }

    return true;
}

export const isProjectPublished = (project) => {
    if (project.state === ProjectStatus.DRAFT && validate(project)) {
        return true;
    }
    return false;
}