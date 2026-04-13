import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    threads: [],
    messages: {},
    loadingThreads: false,
    loadingMessages: false,
    unread: [],
    errorThreads: null,
    errorMessages: null,
    isOpen: false,
    currentThreadId: null,
    tab: 'chats'
};

const reducers = {
    open(state) { state.isOpen = true; },
    close(state) { state.isOpen = false; },
    clearThread(state) { state.currentThreadId = null; },
    setTab(state, action) { state.tab = action.payload; },

    fetchThreadsStart(state) { state.loadingThreads = true; state.errorThreads = null; },
    fetchThreadsSuccess(state, action) {
        state.threads = action.payload;
        state.loadingThreads = false;
    },
    fetchThreadsError(state, action) { state.errorThreads = action.payload; state.loadingThreads = false; },

    fetchMessagesStart(state) { state.loadingMessages = true; state.errorMessages = null; },
    fetchMessagesSuccess(state, action) {
        const { threadId, messages } = action.payload;
        state.messages[threadId] = messages;
        state.unread = messages.filter(m => !m.isRead);
        state.loadingMessages = false;
    },
    fetchMessagesError(state, action) { state.errorMessages = action.payload; state.loadingMessages = false; },

    selectThread(state, action) { state.currentThreadId = action.payload; },

    updateThreadUnread(state, action) {
        const { threadId, unreadCount } = action.payload;
        const t = state.threads.find(t => t.id === threadId);
        if (t) t.unreadCount = unreadCount;
    },
};

export const messengerSlice = createSlice({
    name: 'messenger',
    initialState,
    reducers
});

export const { reducer } = messengerSlice;
export const messengerActions = messengerSlice.actions;