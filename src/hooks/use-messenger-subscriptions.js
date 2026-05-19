import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { firestore } from 'src/libs/firebase';
import { chatApi, isServiceThread, isSelfThread } from 'src/api/chat/newApi';
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

                const threads = (await Promise.all(docs.map(async d => {
                    const data = d.data();
                    const svc = isServiceThread({ id: d.id, ...data });
                    const self = isSelfThread({ id: d.id, ...data }, userId);
                    const last = await chatApi.getLastMessageForThread(d.id);

                    const unreadSnap = await chatApi.getUnreadCountForThread(d.id, userId);
                    const unreadCount = unreadSnap;

                    const rawCreated = last?.createdAt || last?.timestamp || Date.now();
                    const created = rawCreated?.toMillis ? rawCreated.toMillis() : rawCreated;

                    let avatar, name, peerId;
                    if (svc) {
                        avatar = '/assets/logo.jpg';
                        name = 'CTMASS support';
                        peerId = 'system';
                    } else if (self) {
                        avatar = '/assets/logo.jpg';
                        name = 'Saved Messages';
                        peerId = userId;
                    } else {
                        peerId = (data.users || []).find(u => u !== userId);
                        const peer = peerId ? await profileApi.get(peerId) : null;
                        if (!peerId || !peer) {
                            return null;
                        }
                        avatar = peer.avatar || '/assets/default-avatar.png';
                        name = peer.businessName || peer.name || peer.email || 'Unknown user';
                    }

                    const sanitizedLast = last
                        ? {
                            ...last,
                            createdAt: created,
                            timestamp: last.timestamp?.toMillis ? last.timestamp.toMillis() : last.timestamp ?? null
                        }
                        : { createdAt: created };

                    return {
                        id: d.id,
                        users: data.users,
                        peerId,
                        avatar,
                        name,
                        lastMessage: sanitizedLast,
                        updatedAt: data.updatedAt?.toMillis ? data.updatedAt.toMillis() : Date.now(),
                        category: svc ? 'service' : self ? 'self' : (data.projectId ? 'projects' : 'chats'),
                        unreadCount,
                        pinned: svc || self,
                        isService: svc,
                        isSelf: self
                    }
                }))).filter(Boolean);

                dispatch(messengerActions.fetchThreadsSuccess(threads));
            }
        );

        return () => unsubThreads();
    }, [userId, dispatch]);
};