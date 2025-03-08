import debug from "debug";
import {
    addDoc,
    and,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit, orderBy,
    query, serverTimestamp, startAfter,
    updateDoc,
    where,
} from 'firebase/firestore';
import {ProjectStatus} from "src/enums/project-state";
import {firestore} from "src/libs/firebase";

const logger = debug("[ProjectResponse API]")
const path = 'projectResponses';
const responseCollection = collection(firestore, path);

class ProjectResponseApi {
    createProjectResponse = async (project) => {
        try {
            const docRef = await addDoc(responseCollection, {
                ...project,
                createdAt: new Date(),
            });
            const newProjectResponse = {id: docRef.id, ...project};
            logger("ProjectResponse created:", newProject);
            return newProject;
        } catch (error) {
            logger('Error creating project:', error);
            throw error;
        }
    };

    getProjectResponseById = async (id) => {
        try {
            const docRef = doc(firestore, path, id);
            const snapshot = await getDoc(docRef);
            if (!snapshot.exists()) {
                return null;
            }
            return {id: snapshot.id, ...snapshot.data()};
        } catch (error) {
            logger('Error fetching project:', error);
            throw error;
        }
    };


    getProjectResponses(request = {}) {
        const {filters, rowsPerPage, lastVisible} = request;
        let constraints = [orderBy("createdAt", "desc"), limit(rowsPerPage)];

        if (filters.customer) {
            constraints.unshift(where("userId", "==", filters.customer.id))
        }

        if (filters.state) {
            constraints.unshift(where("state", "==", filters.state))
        }


        // filter by specialty.id
        if (filters.specialty?.length > 0) {
            constraints.unshift(where("specialty.id", "in", filters.specialty));
        }

        // filter by dates
        if (filters.projectPeriod) {
            const {startDate, endDate} = filters.projectPeriod;

            if (startDate) {
                constraints.unshift(where("end", ">=", startDate));
            }

            if (endDate) {
                constraints.unshift(where("start", "<=", endDate));
            }
        }

        // paging
        if (lastVisible) {
            constraints.push(startAfter(lastVisible));
        }

        const q = query(projectCollection, ...constraints);

        return getDocs(q);
    }


    updateProjectResponse = async (id, updatedFields) => {
        try {
            // Проверка ID
            if (!id || typeof id !== "string") {
                throw new Error("Неверный ID проекта");
            }

            // Проверка обновляемых полей
            if (!updatedFields || typeof updatedFields !== "object" || Object.keys(updatedFields).length === 0) {
                throw new Error("Нет полей для обновления или неверный формат данных");
            }

            const docRef = doc(firestore, path, id);

            // Обновление документа
            await updateDoc(docRef, {
                ...updatedFields,
                updatedAt: serverTimestamp(), // Используем serverTimestamp
            });

            logger("ProjectResponse update fields:", updatedFields);
            return {id, ...updatedFields};
        } catch (error) {
            logger('Error updating ProjectResponse:', error);
            throw error;
        }
    };

    deleteProjectResponse = async (id) => {
        try {
            const docRef = doc(firestore, path, id);
            await deleteDoc(docRef);
            return {id};
        } catch (error) {
            logger('Error deleting project:', error);
            throw error;
        }
    };

    getUserProjectResponses = async (userId, limitCount = 10) => {
        try {
            const q = query(
                responseCollection,
                where('userId', '==', userId),
                limit(limitCount)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
        } catch (error) {
            logger('Error fetching user projects:', error);
            throw error;
        }
    };


}

export const projectResponseApi = new ProjectResponseApi();
