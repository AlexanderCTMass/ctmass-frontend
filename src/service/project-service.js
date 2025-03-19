import {ERROR, INFO} from "src/libs/log";

class ProjectsService {
    getRespondedChatId = (project, user) => {
        const methodName = "getRespondedChatId";
        try {
            INFO(methodName, project, user);
            return project?.respondedSpecialists?.find(r => r.userId === user.id)?.threadId || undefined;
        } catch (e) {
            ERROR(methodName, e);
        }
    }

    isUninterestedForMe = (project, user) => {
        const methodName = "getRespondedChatId";
        try {
            INFO(methodName, project, user);
            return project?.uninterestedSpecialists?.includes(user.id);
        } catch (e) {
            ERROR(methodName, e);
        }
    }

    getServiceLabel = (project, dictionaryServices) => {
        const methodName = "getServiceLabel";
        try {
            INFO(methodName, project);
            return dictionaryServices?.byId[project?.serviceId]?.label || project?.customService;
        } catch (e) {
            ERROR(methodName, e);
        }
    }

    selectSpecialistInRespondedList = (project, selectedUserId) => {
        const methodName = "selectSpecialistInRespondedList";
        try {
            INFO(methodName, project, selectedUserId)
            project.respondedSpecialists = project.respondedSpecialists?.map(rs => {
                if (rs.userId === selectedUserId) {
                    return {
                        ...rs,
                        state: 'selected'
                    };
                } else {
                    return {
                        ...rs,
                        state: 'rejected'
                    }
                }

            })
            INFO(methodName + " result:", project);
            return project;
        } catch (e) {
            ERROR(methodName, e);
        }
    }

    /**
     * Reject selected and unreject another
     * @param project
     * @param selectedUserId
     * @returns {*}
     */
    rejectSelectedSpecialistInRespondedList = (project, selectedUserId) => {
        const methodName = "selectSpecialistInRespondedList";
        try {
            INFO(methodName, project, selectedUserId)
            project.respondedSpecialists = project.respondedSpecialists?.map(rs => {
                if (project.uninterestedSpecialists && project.uninterestedSpecialists.includes(rs.userId)) {
                    return {
                        ...rs,
                        state: 'rejected'
                    };
                }
                if (rs.userId === selectedUserId) {
                    return {
                        ...rs,
                        state: 'rejected'
                    };
                } else {
                    return {
                        ...rs,
                        state: 'responded'
                    }
                }

            })
            INFO(methodName + " result:", project);
            return project;
        } catch (e) {
            ERROR(methodName, e);
        }
    }

    updateRespondedSpecialistItem = (project, updatedItem) => {
        const methodName = "updateRespondedSpecialistItem";
        try {
            INFO(methodName, project, updatedItem)
            project.respondedSpecialists = project.respondedSpecialists?.map(rs => {
                if (rs.userId === updatedItem.userId) {
                    return {
                        ...rs,
                        ...updatedItem
                    };
                }
                return rs;
            })
            INFO(methodName + " result:", project);
            return project;
        } catch (e) {
            ERROR(methodName, e);

        }
    }

}

export const projectService = new ProjectsService();