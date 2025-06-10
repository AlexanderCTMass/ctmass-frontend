import debug from "debug";
import {and, collection, doc, getDocs, limit, query, updateDoc, where} from "firebase/firestore";
import {firestore} from "../libs/firebase";
import {slice} from "../slices/projects";

const logger = debug('app:projects:api');



// Асинхронные Thunk-экшены

// Получить черновик проекта пользователя
const getDraftProject = (userId) => async (dispatch) => {
    dispatch(slice.actions.fetchStart());
    try {
        if (!userId) {
            logger("UserId is undefined!");
            dispatch(slice.actions.fetchSuccess([]));
        } else {
            const q = query(
                collection(firestore, 'projects'),
                and(where('userId', '==', userId),
                    where('state', '==', 'draft'))
            );
            const snapshot = await getDocs(q);
            const projects = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
            dispatch(slice.actions.fetchSuccess(projects));
        }
    } catch (error) {
        logger(error);
        dispatch(slice.actions.fetchFailure(error.message));
    }
};

// Получить список всех проектов с лимитом
const getProjects = (projectLimit) => async (dispatch) => {
    dispatch(slice.actions.fetchStart());
    try {
        const q = query(collection(firestore, 'projects'), limit(projectLimit));
        const snapshot = await getDocs(q);
        const projects = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
        dispatch(slice.actions.fetchSuccess(projects));
    } catch (error) {
        dispatch(slice.actions.fetchFailure(error.message));
    }
};

// Получить список проектов пользователя
const getUserProjects = (userId) => async (dispatch) => {
    dispatch(slice.actions.fetchStart());
    try {
        const q = query(collection(firestore, 'projects'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        const projects = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
        dispatch(slice.actions.fetchSuccess(projects));
    } catch (error) {
        dispatch(slice.actions.fetchFailure(error.message));
    }
};

// Сохранить проект
const updateProject = (project) => async (dispatch) => {
    dispatch(slice.actions.fetchStart());
    try {
        const projectRef = doc(firestore, 'projects', project.id);
        await updateDoc(projectRef, project);
        dispatch(slice.actions.fetchSuccess([project])); // Обновляем состояние с новым проектом
    } catch (error) {
        dispatch(slice.actions.fetchFailure(error.message));
    }
};

export const thunks = {
    getDraftProject,
    updateProject,
    getUserProjects,
    getProjects
}