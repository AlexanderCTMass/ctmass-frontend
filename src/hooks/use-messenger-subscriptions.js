import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { firestore } from 'src/libs/firebase';
import { chatApi, isServiceThread } from 'src/api/chat/newApi';
import { profileApi } from 'src/api/profile';
import { messengerActions } from 'src/slices/messenger';

export const useMessengerSubscriptions = (userId) => {
    const dispatch = useDispatch();

    useEffect(() => {
        if (!userId) return;

        chatApi.getOrCreateServiceThreadForUser(userId).catch(console.error);

        const unsubThreads = onSnapshot(
            query(collection(firestore, 'Chat'), orderBy('updatedAt', 'desc')),
            async snap => {
                const docs = snap.docs
                    .filter(d => (d.data().users || []).includes(userId))

                const threads = await Promise.all(docs.map(async d => {
                    const data = d.data();
                    const svc = isServiceThread({ id: d.id, ...data });
                    const last = await chatApi.getLastMessageForThread(d.id);
                    const created = last?.createdAt || last?.timestamp || Date.now();

                    let avatar, name;
                    if (svc) {
                        avatar = '/assets/logo.jpg';
                        name = 'CTMASS support';
                    } else {
                        const peerId = (data.users || []).find(u => u !== userId);
                        const peer = peerId ? await profileApi.get(peerId) : null;
                        avatar = peer?.avatar || '/assets/default-avatar.png';
                        name = peer?.businessName || peer?.name || peer?.email || 'Unknown user';
                    }

                    return {
                        id: d.id,
                        users: data.users,
                        avatar,
                        name,
                        lastMessage: { ...last, createdAt: created },
                        updatedAt: data.updatedAt?.toMillis ? data.updatedAt.toMillis() : Date.now(),
                        category: svc ? 'service' : (data.projectId ? 'projects' : 'chats'),
                        pinned: svc,
                        isService: svc
                    }
                }));

                dispatch(messengerActions.fetchThreadsSuccess(threads));
            }
        );

        return () => unsubThreads();
    }, [userId, dispatch]);
};