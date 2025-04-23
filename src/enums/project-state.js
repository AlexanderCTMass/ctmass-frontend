export const ProjectStatus = Object.freeze({
    DRAFT: "draft", //Customer: create, edit, publish, remove
    // PENDING_REVIEW: "pending_review",
    // APPROVED: "approved",
    MODERATE: "moderate", //Customer: edit, remove, selectSpecialist; Contractor: hide, respond
    PUBLISHED: "published", //Customer: edit, remove, selectSpecialist; Contractor: hide, respond
    IN_PROGRESS: "in_progress", //Customer: rejectedSpecialist, complete; Contractor: rejectedProject, complete;
    // ON_HOLD: "on_hold",
    // ON_CONFIRM: "on_confirm",
    COMPLETED: "completed", //Customer: complete, review; Contractor: review
    ARCHIVED: "archived",
    CANCELLED: "cancelled",
});

export const isProjectRemovable = (state, role) => {
    if (role === "contractor") {
        return false;
    }
    if (state === ProjectStatus.DRAFT) {
        return true;
    }
    return false;
}

export const isProjectUnpublished = (state, role) => {
    if (role === "contractor") {
        return false;
    }
    if (state === ProjectStatus.PUBLISHED) {
        return true;
    }
    return false;
}

function validate(project) {
    if (!project.state) {
        console.log("projects not state")
        return false;
    }

    if (!project.specialtyId) {
        console.log("projects not specialtyId")
        return false;
    }
    if (!project.serviceId && !project.customService) {
        console.log("projects not serviceId")
        return false;
    }

    if (!project.title) {
        console.log("projects not title")
        return false;
    }

    if (!project.projectMaximumBudget) {
        console.log("projects not projectMaximumBudget")
        return false;
    }

    if (!project.description) {
        console.log("projects not description")
        return false;
    }

    if (!project.location) {
        console.log("projects not location")
        return false;
    }

    return true;
}

export const isProjectPublished = (project, role) => {
    if (role === "contractor") {
        return false;
    }
    if (project.state === ProjectStatus.DRAFT && validate(project)) {
        return true;
    }
    return false;
}


export const isProjectSearched = (project, role) => {
    if (role === "customer") {
        return false;
    }
    if (project.state === ProjectStatus.PUBLISHED) {
        return true;
    }
    return false;
}