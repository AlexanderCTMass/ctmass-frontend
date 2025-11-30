import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { firestore } from 'src/libs/firebase';

const projectDocRef = (projectId) => doc(firestore, 'projects', projectId);

class ProjectsApi {
    async getById(projectId) {
        if (!projectId) {
            throw new Error('projectId is required');
        }

        const snapshot = await getDoc(projectDocRef(projectId));
        if (!snapshot.exists()) {
            return null;
        }

        return {
            id: snapshot.id,
            ...snapshot.data()
        };
    }

    async updateStatus(projectId, status, extra = {}) {
        if (!projectId) {
            throw new Error('projectId is required to update status');
        }

        await updateDoc(projectDocRef(projectId), {
            ...extra,
            status,
            statusUpdatedAt: serverTimestamp()
        });

        return status;
    }

    async update(projectId, fields = {}) {
        if (!projectId) {
            throw new Error('projectId is required to update project');
        }

        await updateDoc(projectDocRef(projectId), {
            ...fields,
            updatedAt: serverTimestamp()
        });

        return true;
    }
}

export const projectsApi = new ProjectsApi();