import { useEffect } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useDispatch } from 'react-redux';
import { firestore } from 'src/libs/firebase';
import { chatApi } from 'src/api/chat/newApi';
import { profileApi } from 'src/api/profile';
import { messengerActions } from 'src/slices/messenger';

export const useMessengerSubscriptions = (userId) => {
    const dispatch = useDispatch();

    useEffect(() => {
        if (!userId) return;

        const unsubscribers = { threads: null, messages: {} };

        unsubscribers.threads = onSnapshot(
            query(
                collection(firestore, 'Chat'),
            ),
            async (snap) => {
                const threadDocs = snap.docs
                    .filter((d) => (d.data().users || []).includes(userId))
                    .sort((a, b) => b.data().updatedAt?.seconds - a.data().updatedAt?.seconds)
                    .slice(0, 100);

                const threads = await Promise.all(
                    threadDocs.map(async (d) => {
                        const data = d.data();
                        const peerId = (data.users || []).find((u) => u !== userId);
                        const peer = peerId ? await profileApi.get(peerId) : null;
                        const last = await chatApi.getLastMessageForThread(d.id);

                        return {
                            id: d.id,
                            users: data.users,
                            avatar: peer?.avatar || '/assets/default-avatar.png',
                            name:
                                peer?.businessName || peer?.name || peer?.email || 'Unknown user',
                            lastMessage: last,
                            updatedAt: data.updatedAt?.toMillis
                                ? data.updatedAt.toMillis()
                                : Date.now(),
                            category: data.projectId ? 'projects' : 'chats'
                        };
                    })
                );

                dispatch(messengerActions.fetchThreadsSuccess(threads));

                const needSubscribe = threads
                    .map((t) => t.id)
                    .filter((id) => !unsubscribers.messages[id]);

                needSubscribe.forEach((threadId) => {
                    const q = query(
                        collection(firestore, `Chat/${threadId}/messages`),
                        orderBy('createdAt', 'asc')
                    );

                    unsubscribers.messages[threadId] = onSnapshot(q, (msgSnap) => {
                        const messages = msgSnap.docs.map((m) => ({
                            id: m.id,
                            ...m.data(),
                            createdAt: m.data().createdAt?.toMillis
                                ? m.data().createdAt.toMillis()
                                : Date.now()
                        }));
                        dispatch(
                            messengerActions.fetchMessagesSuccess({ threadId, messages })
                        );
                    });
                });
            }
        );

        return () => {
            unsubscribers.threads && unsubscribers.threads();
            Object.values(unsubscribers.messages).forEach((fn) => fn && fn());
        };
    }, [userId, dispatch]);
};