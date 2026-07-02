import { useQuery } from '@tanstack/react-query';
import { projectsApi } from 'src/api/projects';

export const projectKey = (projectId) => ['project', projectId];
export const userProjectsKey = (userId, limit) => ['projects', 'by-user', userId, limit];

// Single project by id (detail pages).
export const useProject = (projectId) =>
    useQuery({
        queryKey: projectKey(projectId),
        queryFn: () => projectsApi.getProjectById(projectId),
        enabled: Boolean(projectId),
        staleTime: 60 * 1000
    });

// A user's projects (one-shot read).
export const useUserProjects = (userId, limit = 10) =>
    useQuery({
        queryKey: userProjectsKey(userId, limit),
        queryFn: () => projectsApi.getUserProjects(userId, limit),
        enabled: Boolean(userId),
        staleTime: 60 * 1000
    });
