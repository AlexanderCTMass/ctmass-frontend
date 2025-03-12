import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
    subscribeToChat,
    subscribeToMessagesForThreads,
    unsubscribeFromChat,
    unsubscribeFromMessagesForThreads
} from "src/thunks/chatNew"
import {chatApi} from "src/api/chat/newApi";

const useChatSubscriptions = (userId, projectId) => {
    const dispatch = useDispatch();

    useEffect(() => {
        const subscribe = async () => {
            try {
                console.log("Subscribe to threads changes for: ", projectId);
                dispatch(subscribeToChat(userId, projectId));

                const threadsIds = userId ? await chatApi.getThreadIdsByUserId(userId) : await chatApi.getThreadIdsByProjectId(projectId);
                console.log("Subscribe to message changes for: ", threadsIds);

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
    }, [projectId, dispatch]);
};

export default useChatSubscriptions;