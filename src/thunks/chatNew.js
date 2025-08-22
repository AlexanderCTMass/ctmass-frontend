import { slice } from 'src/slices/chatNew';
import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { firestore } from 'src/libs/firebase';
import { profileApi } from "src/api/profile";
import { ERROR, INFO } from "src/libs/log";
import { markMessagesAsRead } from "src/chatService";

let unsubscribe = null;

export const subscribeToOneChat = (threadId) => (dispatch, getState) => {
    INFO(`subscribeToChat threadId=${threadId}`)
    dispatch(slice.actions.incrementSubscriptionCount());

    if (getState().chatNew.subscriptionCount > 1) {
        return;
    }

    if (!threadId) {
        INFO("threadId is required!", new Error("threadId is required!"));
        return;
    }

    dispatch(slice.actions.fetchChatsStart());

    const threadRef = doc(firestore, 'Chat', threadId);
    unsubscribe = onSnapshot(threadRef, async (doc) => {
        INFO("ThreadId is exists!");
        if (!doc.exists()) {
            ERROR("Thread does not exist!", threadId);
            dispatch(slice.actions.fetchChatThreadsError("Thread does not exist!"));
            return;
        }


        try {
            const thread = { id: doc.id, ...doc.data() };
            const allParticipants = await profileApi.getChatProfilesById(thread.users);
            INFO("GET thread", thread, allParticipants);
            dispatch(slice.actions.fetchChatThreadsSuccess([{
                ...thread,
                users: allParticipants
            }]));
        } catch (error) {
            ERROR("Error fetching participants", error);
            dispatch(slice.actions.fetchChatThreadsError(error.message));
        }
    }, (error) => {
        ERROR("Error", error);
        dispatch(slice.actions.fetchChatThreadsError(error.message));
    });
};


export const subscribeToChat = (userId, projectId) => (dispatch, getState) => {
    INFO(`subscribeToChat userId=${userId}, projectId=${projectId}`)
    dispatch(slice.actions.incrementSubscriptionCount());

    if (getState().chatNew.subscriptionCount > 1) {
        return;
    }

    if (!projectId && !userId) {
        INFO("ProjectId or UserId is required!", new Error("ProjectId or UserId is required!"));
        return;
    }

    dispatch(slice.actions.fetchChatsStart());

    const threadCollection = collection(firestore, 'Chat');
    let constraints = [orderBy("createdAt", "desc")];
    if (userId) {
        constraints.unshift(where('users', 'array-contains', userId))
    }
    if (projectId) {
        constraints.unshift(where('projectId', '==', projectId))
    }
    const q = query(threadCollection, ...constraints);

    unsubscribe = onSnapshot(
        q,
        async (querySnapshot) => {
            const threadPromises = querySnapshot.docs.map(async (doc) => ({
                id: doc.id,
                ...doc.data()
            }));

            const threads = await Promise.all(threadPromises);
            const allUserIds = [...new Set(threads.flatMap((thread) => thread.users))];
            const allParticipants = await profileApi.getChatProfilesById(allUserIds);

            dispatch(slice.actions.fetchChatThreadsSuccess(threads.map(t => ({
                ...t,
                users: allParticipants.filter(p => t.users.includes(p.id))
            }))));
        },
        (error) => {
            ERROR("Error", error);
            dispatch(slice.actions.fetchChatThreadsError(error.message));
        }
    );
};

export const unsubscribeFromChat = () => (dispatch, getState) => {
    dispatch(slice.actions.decrementSubscriptionCount());

    if (getState().chatNew.subscriptionCount > 0) {
        return;
    }

    if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
    }
};

const messageSubscriptions = {};

export const subscribeToMessagesForThreads = (threadIds) => (dispatch, getState) => {
    threadIds.forEach((threadId) => {
        dispatch(slice.actions.incrementMessageSubscriptionCount(threadId));

        if (getState().chatNew.messageSubscriptions[threadId] > 1) {
            return;
        }
        dispatch(slice.actions.fetchMessagesStart());

        const messagesCollection = collection(firestore, `Chat/${threadId}/messages`);
        const constraints = [orderBy("createdAt", "asc")];
        const q = query(messagesCollection, ...constraints);

        messageSubscriptions[threadId] = onSnapshot(
            q,
            async (querySnapshot) => {
                const messagesPromises = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));
                const messages = await Promise.all(messagesPromises);

                dispatch(slice.actions.fetchMessagesSuccess({
                    threadId, messages: messages.map(m => {
                        if (!m.createdAt) {
                            return { ...m, createdAt: new Date() }
                        } else {
                            return m;
                        }
                    })
                }));
            },
            (error) => {
                ERROR("Failed subscribeToMessagesForThreads");
                dispatch(slice.actions.fetchMessagesError(error.message));
            }
        );
    });
};

export const unsubscribeFromMessagesForThreads = (threadIds) => (dispatch, getState) => {
    threadIds.forEach((threadId) => {
        // Уменьшаем счетчик подписок для этого threadId
        dispatch(slice.actions.decrementMessageSubscriptionCount(threadId));

        // Если есть активные подписчики, не отписываемся
        if (getState().chatNew.messageSubscriptions[threadId] > 0) {
            return;
        }

        // Отписываемся, если больше нет активных подписчиков
        if (messageSubscriptions[threadId]) {
            messageSubscriptions[threadId]();
            delete messageSubscriptions[threadId];
        }
    });
};