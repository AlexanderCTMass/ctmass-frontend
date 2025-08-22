import { slice } from 'src/slices/chat';
import {
    getContacts as getContactsFromFirebase,
    getThread as getThreadFromFirebase,
    getThreads as getThreadsFromFirebase,
} from '../chatService';

const getContacts = (query = '', profiles, setProfiles) => async (dispatch) => {
    try {
        const response = await getContactsFromFirebase(query, profiles, setProfiles); // Передаем поисковый запрос
        dispatch(slice.actions.getContacts(response));
    } catch (error) {
        console.error('Error fetching contacts:', error);
        throw error;
    }
};

const getThreads = (user, projectId) => async (dispatch) => {
    try {
        const response = await getThreadsFromFirebase(user, projectId);
        dispatch(slice.actions.getThreads(response));
    } catch (error) {
        console.error('Error fetching threads:', error);
        throw error;
    }
};

const getThread = (params) => async (dispatch) => {
    try {
        const response = await getThreadFromFirebase(params.threadKey);
        dispatch(slice.actions.getThread(response));
        return response?.id;
    } catch (error) {
        console.error('Error fetching thread:', error);
        throw error;
    }
};

const markThreadAsSeen = (params) => async (dispatch, getState) => {
    try {
        const { user } = getState().auth;
        dispatch(slice.actions.markThreadAsSeen(params.threadId));
    } catch (error) {
        console.error('Error marking thread as seen:', error);
        throw error;
    }
};

const setCurrentThread = (params) => (dispatch) => {
    dispatch(slice.actions.setCurrentThread(params.threadId));
};


export const thunks = {
    getContacts,
    getThread,
    getThreads,
    markThreadAsSeen,
    setCurrentThread,
};