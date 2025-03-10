import {slice} from 'src/slices/chat';
import {
    getContacts as getContactsFromFirebase,
    getThread as getThreadFromFirebase,
    getThreads as getThreadsFromFirebase,
    markMessagesAsRead,
    sendMessage,
    startChat,
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

const getThreads = (user) => async (dispatch) => {
    try {
        const response = await getThreadsFromFirebase(user);
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
        const {user} = getState().auth;
        await markMessagesAsRead(params.threadId, user.uid);
        dispatch(slice.actions.markThreadAsSeen(params.threadId));
    } catch (error) {
        console.error('Error marking thread as seen:', error);
        throw error;
    }
};

const setCurrentThread = (params) => (dispatch) => {
    dispatch(slice.actions.setCurrentThread(params.threadId));
};

const addMessage = (params) => async (dispatch, getState) => {
    try {
        let threadId = params.threadId;

        if (!threadId) {
            if (!params.recipientIds) {
                throw new Error('Recipient IDs are required to start a new chat');
            }
            threadId = await startChat(params.recipientIds);
        }

        const response = await sendMessage(threadId, params.body, params.file);
        dispatch(slice.actions.addMessage(response));

        return threadId;
    } catch (error) {
        console.error('Error adding message:', error);
        throw error;
    }
};

export const thunks = {
    addMessage,
    getContacts,
    getThread,
    getThreads,
    markThreadAsSeen,
    setCurrentThread,
};