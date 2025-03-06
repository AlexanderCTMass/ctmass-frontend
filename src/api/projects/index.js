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

const logger = debug("[Projects API]")
const projectCollection = collection(firestore, 'projects');

class ProjectsApi {
    createProject = async (project) => {
        try {
            const docRef = await addDoc(projectCollection, {
                ...project,
                createdAt: new Date(),
            });
            const newProject = {id: docRef.id, ...project};
            logger("Project created:", newProject);
            return newProject;
        } catch (error) {
            logger('Error creating project:', error);
            throw error;
        }
    };

    getProjectById = async (id) => {
        try {
            const docRef = doc(firestore, 'projects', id);
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

    getProjects2 = async (limitCount = 100) => {
        try {
            const q = query(projectCollection);
            const snapshot = await getDocs(q);
            return snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
        } catch (error) {
            logger('Error fetching projects:', error);
            throw error;
        }
    };

    getProjects(request = {}) {
        const {filters, rowsPerPage, lastVisible} = request;
        const projectCollection = collection(firestore, 'projects');

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


    updateProject = async (id, updatedFields) => {
        try {
            // Проверка ID
            if (!id || typeof id !== "string") {
                throw new Error("Неверный ID проекта");
            }

            // Проверка обновляемых полей
            if (!updatedFields || typeof updatedFields !== "object" || Object.keys(updatedFields).length === 0) {
                throw new Error("Нет полей для обновления или неверный формат данных");
            }

            const docRef = doc(firestore, 'projects', id);

            // Обновление документа
            await updateDoc(docRef, {
                ...updatedFields,
                updatedAt: serverTimestamp(), // Используем serverTimestamp
            });

            logger("Project update fields:", updatedFields);
            return { id, ...updatedFields };
        } catch (error) {
            logger('Error updating project:', error);
            throw error;
        }
    };

    deleteProject = async (id) => {
        try {
            const docRef = doc(firestore, 'projects', id);
            await deleteDoc(docRef);
            return {id};
        } catch (error) {
            logger('Error deleting project:', error);
            throw error;
        }
    };

    getUserProjects = async (userId, limitCount = 10) => {
        try {
            const q = query(
                projectCollection,
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


    getUserDraftProject = async (userId) => {
        try {
            const q = query(
                collection(firestore, 'projects'),
                and(where('userId', '==', userId),
                    where('state', '==', ProjectStatus.DRAFT))
            );
            const snapshot = await getDocs(q);
            if (snapshot.empty) {
                logger('No documents found!');
                return null;
            }
            const firstDoc = snapshot.docs[0];
            const newVar = {id: firstDoc.id, ...firstDoc.data()};
            logger("Draft loaded:", newVar);
            return newVar;
        } catch (error) {
            logger('Error fetching user draft project:', error);
            throw error;
        }
    };
}

export const projectsApi = new ProjectsApi();
