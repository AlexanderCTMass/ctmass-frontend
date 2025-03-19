import debug from "debug";
import {
    addDoc,
    and,
    collection, collectionGroup,
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
import {INFO} from "src/libs/log";
import * as turf from "@turf/turf";
import {ProjectSpecialistStatus} from "src/enums/project-specialist-state";
import {v4 as uuidv4} from 'uuid';

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
            logger('Error creating projects:', error);
            throw error;
        }
    };

    getProjectById = async (id, transaction = undefined) => {
        try {
            const docRef = doc(firestore, 'projects', id);
            const snapshot = transaction ? await transaction.get(docRef) : await getDoc(docRef);
            if (!snapshot.exists()) {
                return null;
            }
            return {id: snapshot.id, ...snapshot.data()};
        } catch (error) {
            logger('Error fetching projects:', error);
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

    getProjects = async (request = {}) => {
        const {filters, rowsPerPage, lastVisible} = request;
        INFO("getProjects request=", request);

        const projectCollection = collection(firestore, 'projects');

        let constraints = [orderBy("createdAt", "desc"), limit(rowsPerPage)];

        if (filters.state === ProjectSpecialistStatus.RESPONDED) {
            constraints.unshift(where("state", "==", ProjectStatus.PUBLISHED));
        } else {

            if (filters.customer) {
                constraints.unshift(where("userId", "==", filters.customer.id));
            }

            if (filters.contractor) {
                constraints.unshift(where("contractorId", "==", filters.contractor.id));
            }

            if (filters.notShowMy && filters.specialist) {
                constraints.unshift(where("userId", "!=", filters.specialist));
            }

            if (filters.state) {
                constraints.unshift(where("state", "==", filters.state));
            }

            if (filters.specialties?.length > 0) {
                constraints.unshift(where("specialtyId", "in", filters.specialties.map(s => s.id)));
            }
        }

        // Фильтр по projectPeriod
        if (filters.projectPeriod) {
            const {startDate, endDate} = filters.projectPeriod;

            if (startDate) {
                constraints.unshift(where("end", ">=", startDate));
            }

            if (endDate) {
                constraints.unshift(where("start", "<=", endDate));
            }
        }
        /*
                if (filters.regionFilter && filters.regionFilter.isochronePolygon) {
                    const bbox = turf.bbox(filters.regionFilter.isochronePolygon);
                    INFO("bbox", bbox);
                    constraints.unshift(where("location.geometry.coordinates.0", ">=", bbox[0]));
                    constraints.unshift(where("location.geometry.coordinates.0", "<=", bbox[2]));
                    constraints.unshift(where("location.geometry.coordinates.1", ">=", bbox[1]));
                    constraints.unshift(where("location.geometry.coordinates.1", "<=", bbox[3]));
                }*/

        if (lastVisible) {
            constraints.push(startAfter(lastVisible));
        }

        INFO("getProjects Contraints", constraints);

        const q = query(projectCollection, ...constraints);

        return getDocs(q);
    }

    updateProject = async (id, updatedFields, transaction = undefined) => {
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

            const data = {
                ...updatedFields,
                updatedAt: serverTimestamp(),
            };
            if (transaction) {
                transaction.update(docRef, data);
            } else {
                await updateDoc(docRef, data);
            }
            logger("Project update fields:", updatedFields);
            return {id, ...updatedFields};
        } catch (error) {
            logger('Error updating projects:', error);
            throw error;
        }
    };

    deleteProject = async (id) => {
        try {
            const docRef = doc(firestore, 'projects', id);
            await deleteDoc(docRef);
            return {id};
        } catch (error) {
            logger('Error deleting projects:', error);
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
            logger('Error fetching user draft projects:', error);
            throw error;
        }
    };

    addHistoryRecord = async (projectId, changedBy, changedByName, changedByAvatar, type, oldStatus, newStatus, comment = "", transaction = undefined) => {
        const historyRecord = {
            changedBy,
            changedByName,
            changedByAvatar,
            type,
            oldStatus,
            newStatus,
            changedAt: serverTimestamp(),
            comment
        };

        if (transaction) {
            const reference = doc(firestore, "projects", projectId, "history", uuidv4());
            transaction.set(reference, historyRecord);
        } else {
            const reference = collection(firestore, "projects", projectId, "history");
            await addDoc(reference, historyRecord);
        }
    };

    getHistoryRecords = async (projectId) => {
        let res = [];

        const historyQuery = query(
            collection(firestore, "projects", projectId, "history"),
            orderBy("changedAt", "desc") // Сортировка по убыванию
        );

        const subquerySnapshot = await getDocs(historyQuery);

        subquerySnapshot.forEach((doc) => {
            res.push({...doc.data(), id: doc.id, path: doc.ref.path, projectId: projectId});
        });

        return res;
    };


    addProjectResponse = async (projectId, response) => {
        await addDoc(collection(firestore, "projects", projectId, "responses"), {
            ...response,
            createdAt: serverTimestamp()
        });
    };

    updateProjectResponse = async (projectId, response) => {
        const responseRef = doc(firestore, "projects", projectId, "responses", response.id);

        await updateDoc(responseRef, {
            ...response,
            changedAt: serverTimestamp()
        });
    };

    getProjectResponses = async (projectId) => {
        let res = [];

        const historyQuery = query(
            collection(firestore, "projects", projectId, "responses"),
            orderBy("createdAt", "desc")
        );

        const subquerySnapshot = await getDocs(historyQuery);

        subquerySnapshot.forEach((doc) => {
            res.push({...doc.data(), id: doc.id, path: doc.ref.path, projectId: projectId});
        });

        return res;
    };
}

export const projectsApi = new ProjectsApi();
