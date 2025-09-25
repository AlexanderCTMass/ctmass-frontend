import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
    writeBatch
} from "firebase/firestore";
import { firestore, storage } from "src/libs/firebase";
import { ERROR, INFO } from "src/libs/log";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';

const SERVICE_CHAT_PREFIX = "service:";

export const isServiceThread = (thread) =>
    thread?.category === "service" ||
    (thread?.id && thread.id.startsWith(SERVICE_CHAT_PREFIX));

class ChatApi {

    startChat = async (userId1, userId2, projectId = undefined) => {
        const chatRef = collection(firestore, 'Chat');

        const usersCond = where('users', 'in', [[userId1, userId2], [userId2, userId1]]);
        let q;

        if (projectId) {
            q = query(chatRef, usersCond, where('projectId', '==', projectId));
        } else {
            q = query(chatRef, usersCond, where('type', '==', 'direct'));
        }

        const snap = await getDocs(q);
        const existing = snap.docs[0];

        if (existing) return existing.id;

        const docRef = await addDoc(chatRef, {
            users: [userId1, userId2],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            type: projectId ? 'project' : 'direct',
            ...(projectId && { projectId })
        });
        return docRef.id;
    };

    update = async (id, updatedFields, transaction = undefined) => {
        try {
            if (!id || typeof id !== "string") {
                throw new Error("Неверный ID проекта");
            }

            if (!updatedFields || typeof updatedFields !== "object" || Object.keys(updatedFields).length === 0) {
                throw new Error("Нет полей для обновления или неверный формат данных");
            }

            const docRef = doc(firestore, 'Chat', id);

            const data = {
                ...updatedFields,
                updatedAt: serverTimestamp(),
            };
            if (transaction) {
                transaction.update(docRef, data)
            } else {
                await updateDoc(docRef, data);
            }
            INFO("Thread update fields:", id, updatedFields);
            return { id, ...updatedFields };
        } catch (error) {
            ERROR('Error updating Threads:', error);
            throw error;
        }
    };

    getChat = async (threadId) => {
        try {
            const docRef = doc(firestore, 'Chat', threadId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }
        } catch (error) {
            ERROR('Error getting Threads:', error);
        }
    }


    rejectChat = async (threadId, value = true) => {
        try {
            const threadIds = Array.isArray(threadId) ? threadId : [threadId];
            INFO("RejectChat for:", threadIds);

            const batch = writeBatch(firestore);

            threadIds.forEach((id) => {
                const threadRef = doc(firestore, "Chat", id);
                batch.update(threadRef, { rejected: value });
            });

            await batch.commit();
            INFO("Rejected status updated successfully for threadIds:", threadIds);
        } catch (error) {
            ERROR("Error updating rejected status:", error);
            throw error;
        }
    }

    getLastMessageForThread = async (threadId) => {
        try {
            const messagesCollection = collection(firestore, `Chat/${threadId}/messages`);
            const q = query(messagesCollection, orderBy("createdAt", "desc"), limit(1));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const lastMessageDoc = querySnapshot.docs[0];
                return { id: lastMessageDoc.id, threadId: threadId, ...lastMessageDoc.data() };
            }
            return null;
        } catch (error) {
            ERROR("Error getLastMessageForThread:", error);
            throw error;
        }
    };

    getLastMessagesForThreads = async (treadsIds) => {
        try {
            const promises = treadsIds.map(async (treadId) => this.getLastMessageForThread(treadId));
            return await Promise.all(promises);
        } catch (error) {
            ERROR("Error getLastMessagesForThreads:", error);
            throw error;
        }
    }

    getThreadIds = async (userId, projectId) => {
        INFO("getThreadIds", userId, projectId);
        if (!projectId && !userId)
            return [];
        try {
            let constraints = [orderBy("updatedAt", "desc"), limit(10)];

            if (userId) {
                constraints.unshift(where('users', 'array-contains', userId));
            }

            if (projectId) {
                constraints.unshift(where("projectId", "==", projectId));
            }

            const chatCollection = collection(firestore, "Chat");
            const q = query(chatCollection, ...constraints);
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map((doc) => doc.id);
        } catch (error) {
            ERROR("Error get threadIds:", error);
            throw error;
        }
    };


    getThreadIdsByProjectId = async (projectId) => {
        if (!projectId)
            return [];
        try {
            const chatCollection = collection(firestore, "Chat");
            const q = query(chatCollection, where("projectId", "==", projectId));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map((doc) => doc.id);
        } catch (error) {
            ERROR("Error get threadIds:", error);
            throw error;
        }
    };

    getThreadIdsByUserId = async (userId) => {
        if (!userId)
            return [];
        try {
            const chatCollection = collection(firestore, "Chat");
            const q = query(chatCollection, where('users', 'array-contains', userId));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map((doc) => doc.id);
        } catch (error) {
            ERROR("Error get threadIds:", error);
            throw error;
        }
    };


    sendMessage = async (threadId, senderId, text, files, participants, filesMustUpload = true, transaction = undefined) => {
        try {
            const chatRef = doc(firestore, 'Chat', threadId);
            if (!transaction) {
                const chatDoc = await getDoc(chatRef);

                if (!chatDoc.exists()) {
                    if (!participants) {
                        throw new Error("Participants is required")
                    }

                    await setDoc(chatRef, {
                        users: participants.map(item => typeof item === 'string' ? item : item.id),
                        createdAt: serverTimestamp(),
                        type: 'project'
                    });
                }
            }
            const messagesCollection = collection(firestore, `Chat/${threadId}/messages`);

            const attachments = filesMustUpload ? [] : files;

            if (filesMustUpload) {
                if (files && files.length > 0) {
                    for (const file of files) {
                        let fileUrl = await this.uploadFile(file);
                        let fileType = file.type;
                        attachments.push({ url: fileUrl, type: fileType })
                    }
                }
            }
            const message = {
                senderId,
                text: text,
                attachments: attachments,
                createdAt: serverTimestamp(),
                isRead: false,
            };
            if (transaction) {
                transaction.add(message);
            } else {
                await addDoc(messagesCollection, message);
            }
        } catch (error) {
            ERROR('Error add message:', error);
            throw error;
        }
    }

    sendMessangerMessage = async (threadId, senderId, text, files, participants, filesMustUpload = true, transaction = undefined) => {
        try {
            const chatRef = doc(firestore, 'Chat', threadId);
            if (!transaction) {
                const chatDoc = await getDoc(chatRef);

                if (!chatDoc.exists()) {
                    if (!participants) {
                        throw new Error("Participants is required")
                    }

                    await setDoc(chatRef, {
                        users: participants.map(item => typeof item === 'string' ? item : item.id),
                        createdAt: serverTimestamp(),
                        type: 'direct'
                    });
                }
            }
            const messagesCollection = collection(firestore, `Chat/${threadId}/messages`);

            const attachments = filesMustUpload ? [] : files;

            if (filesMustUpload) {
                if (files && files.length > 0) {
                    for (const file of files) {
                        let fileUrl = await this.uploadFile(file);
                        let fileType = file.type;
                        attachments.push({ url: fileUrl, type: fileType })
                    }
                }
            }
            const message = {
                senderId,
                text: text,
                attachments: attachments,
                createdAt: serverTimestamp(),
                isRead: false,
            };
            if (transaction) {
                transaction.add(message);
            } else {
                await addDoc(messagesCollection, message);
                await updateDoc(chatRef, { updatedAt: serverTimestamp() });
            }
        } catch (error) {
            ERROR('Error add message:', error);
            throw error;
        }
    }

    getUnreadCountForThread = async (threadId, userId) => {
        const q = query(
            collection(firestore, `Chat/${threadId}/messages`),
            where('isRead', '==', false)
        );
        const snap = await getDocs(q);

        return snap.docs.filter(d => d.data().senderId !== userId).length;
    };


    uploadFile = async (file) => {
        try {
            if (!file) {
                throw new Error('No file provided');
            }

            const fileExtension = file.name.split('.').pop();
            const fileName = `${uuidv4()}.${fileExtension}`;
            const storageRef = ref(storage, `chat/${fileName}`);

            await uploadBytes(storageRef, file);
            return await getDownloadURL(storageRef);
        } catch (error) {
            ERROR('Error uploading file:', error);
            throw error;
        }
    };


    markMessagesAsRead = async (threadKey, userId) => {
        try {
            const messagesRef = collection(firestore, 'Chat', threadKey, 'messages');
            const unreadQuery = query(messagesRef, where('isRead', '==', false));

            const snapshot = await getDocs(unreadQuery);
            const batch = writeBatch(firestore);

            snapshot.forEach((doc) => {
                if (doc.data().senderId !== userId) {
                    batch.update(doc.ref, { isRead: true });
                }
            });

            await batch.commit();
            INFO("Messages mark as read success for", threadKey, userId);
        } catch (e) {
            ERROR("Error mark messages as read", e);
        }
    };

    async deleteThreads(threadIds) {
        try {
            const batch = writeBatch(firestore);

            threadIds.forEach((threadId) => {
                const threadRef = doc(firestore, 'Chat', threadId);
                batch.delete(threadRef);
            });

            await batch.commit();
            INFO("Threads deleted successfully:", threadIds);
        } catch (error) {
            ERROR("Error deleting threads:", error);
        }
    }

    getOrCreateServiceThreadForUser = async (userId) => {
        if (!userId) throw new Error("userId required");

        const threadId = `${SERVICE_CHAT_PREFIX}${userId}`;
        const threadRef = doc(firestore, "Chat", threadId);
        const snap = await getDoc(threadRef);

        if (snap.exists()) {
            return threadId;
        }

        await setDoc(threadRef, {
            users: [userId],
            category: "service",
            pinned: true,
            name: "CTMASS support",
            avatar: "/assets/logo.jpg",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            type: 'direct'
        });
        INFO("Service thread created:", threadId);
        return threadId;
    };

    sendServiceMessageToUser = async (
        userId,
        text,
        attachments = [],
        adminId = "system"
    ) => {
        if (!text) return;

        const threadId = await this.getOrCreateServiceThreadForUser(userId);
        await this.sendMessangerMessage(
            threadId,
            adminId,
            text,
            attachments,
            [userId],
            false
        );
    };

    sendServiceMessageToAll = async (text, attachments = [], adminId = 'system') => {
        if (!text) return;

        const { profileApi } = await import('src/api/profile');
        const users = await profileApi.getAllProfiles();

        const CHUNK = 450;
        for (let i = 0; i < users.length; i += CHUNK) {
            const slice = users.slice(i, i + CHUNK);
            const batch = writeBatch(firestore);

            await Promise.all(
                slice.map(async (u) => {
                    const threadId = `${SERVICE_CHAT_PREFIX}${u.id}`;
                    const ref = doc(firestore, 'Chat', threadId);
                    const snap = await getDoc(ref);
                    if (!snap.exists()) {
                        batch.set(ref, {
                            users: [u.id],
                            category: 'service',
                            pinned: true,
                            name: 'CTMASS support',
                            avatar: '/assets/logo.jpg',
                            createdAt: serverTimestamp(),
                            updatedAt: serverTimestamp()
                        });
                    }
                })
            );

            await batch.commit();
        }

        await Promise.allSettled(
            users.map((u) =>
                this.sendServiceMessageToUser(u.id, text, attachments, adminId)
            )
        );
    };
}

export const chatApi = new ChatApi();
