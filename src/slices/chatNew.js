import {createSlice} from '@reduxjs/toolkit';

const initialState = {
    threads: [],
    messages: {}, //{ threadId: [messages] }
    unreadMessages: [],
    loading: false,
    subscriptionCount: 0,
    messageSubscriptions: {},
    errorMessages: null,
    loadingMessages: false,
};

const reducers = {
    fetchChatsStart(state) {
        state.loading = true;
        state.error = null;
    },
    fetchMessagesStart(state) {
        state.loadingMessages = true;
        state.errorMessages = null;
    },
    fetchChatThreadsSuccess(state, action) {
        state.threads = action.payload;
        state.loading = false;
        state.error = null;
    },
    fetchChatThreadsError(state, action) {
        state.error = action.payload;
        state.loading = false;
    },
    fetchMessagesSuccess(state, action) {
        const {threadId, messages} = action.payload;
        state.messages[threadId] = messages;
        state.unreadMessages = messages.filter(m => !m.isRead);
        state.loadingMessages = false;
        state.errorMessages = null;
    },
    fetchMessagesError(state, action) {
        state.errorMessages = action.payload;
        state.loadingMessages = false;
    },
    incrementSubscriptionCount(state) {
        state.subscriptionCount += 1;
    },
    decrementSubscriptionCount(state) {
        state.subscriptionCount = Math.max(0, state.subscriptionCount - 1);
    },
    incrementMessageSubscriptionCount(state, action) {
        const threadId = action.payload;
        state.messageSubscriptions[threadId] = (state.messageSubscriptions[threadId] || 0) + 1;
    },
    decrementMessageSubscriptionCount(state, action) {
        const threadId = action.payload;
        state.messageSubscriptions[threadId] = Math.max(0, (state.messageSubscriptions[threadId] || 0) - 1);
    }
};


export const slice = createSlice({
    name: 'chatNew',
    initialState,
    reducers
});

export const {reducer} = slice;