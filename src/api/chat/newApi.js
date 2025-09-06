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

class ChatApi {

    startChat = async (userId1, userId2, projectId = undefined) => {
        const chatRef = collection(firestore, 'Chat');

        let constraints = [where("users", "in", [[userId1, userId2], [userId2, userId1]])];

        if (projectId) {
            constraints.unshift(where("projectId", "==", projectId));
        }

        const q = query(
            chatRef,
            ...constraints
        );

        const querySnapshot = await getDocs(q);

        const existingChat = querySnapshot.docs.find((doc) => {
            const users = doc.data().users;
            return (
                users.length === 2 &&
                users.includes(userId1) &&
                users.includes(userId2)
            );
        });

        if (existingChat) {
            INFO("Chat exist:", existingChat.id);
            return existingChat.id;
        }

        const documentReference = await addDoc(chatRef, {
            users: [userId1, userId2],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            ...(projectId && { projectId: projectId })
        });

        INFO("New chat created:", documentReference.id);
        return documentReference.id;
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
}

export const chatApi = new ChatApi();
