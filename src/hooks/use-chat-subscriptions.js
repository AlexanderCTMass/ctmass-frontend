import {useEffect} from "react";
import {useDispatch} from "react-redux";
import {
    subscribeToChat,
    subscribeToMessagesForThreads, subscribeToOneChat,
    unsubscribeFromChat,
    unsubscribeFromMessagesForThreads
} from "src/thunks/chatNew"
import {chatApi} from "src/api/chat/newApi";
import {INFO} from "src/libs/log";

export const useChatSubscriptions = (userId, projectId) => {
    const dispatch = useDispatch();

    useEffect(() => {
        const subscribe = async () => {
            try {
                INFO("Subscribe to threads changes for: ", projectId);
                dispatch(subscribeToChat(userId, projectId));

                const threadsIds = userId ? await chatApi.getThreadIdsByUserId(userId) : await chatApi.getThreadIdsByProjectId(projectId);
                INFO("Subscribe to message changes for: ", threadsIds);

                dispatch(subscribeToMessagesForThreads(threadsIds));
            } catch (error) {
                console.error("Error chat subscriptions:", error);
            }
        };

        subscribe();

        return () => {
            dispatch(unsubscribeFromChat());

            chatApi.getThreadIdsByProjectId(projectId)
                .then((threadsIds) => {
                    dispatch(unsubscribeFromMessagesForThreads(threadsIds));
                })
                .catch((error) => {
                    console.error("Error chat unSubscriptions:", error);
                });
        };
    }, [projectId, dispatch]); //todo userId???
};


export const useOneChatSubscriptions = (threadId) => {
    const dispatch = useDispatch();
    useEffect(() => {
        INFO("Start useOneChatSubscriptions: ", threadId);

        const subscribe = async () => {
            try {
                INFO("Subscribe to thread changes for threadId: ", threadId);
                dispatch(subscribeToOneChat(threadId));

                INFO("Subscribe to message changes for: ", threadId);

                dispatch(subscribeToMessagesForThreads([threadId]));
            } catch (error) {
                console.error("Error chat subscriptions:", error);
            }
        };

        if (threadId) {
            subscribe();
        }

        return () => {
            dispatch(unsubscribeFromChat());
            dispatch(unsubscribeFromMessagesForThreads([threadId]));
        };
    }, [threadId, dispatch]);
};
