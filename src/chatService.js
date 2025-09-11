import { collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, where, writeBatch, } from 'firebase/firestore';
import { firestore } from './libs/firebase';
import { profileApi } from 'src/api/profile';

export const getContacts = async (query = '', profiles, setProfiles) => {
    try {
        const contacts = await profileApi.searchProfiles(profiles, setProfiles, query);
        return contacts;
    } catch (error) {
        console.error('Error fetching contacts:', error);
        throw error;
    }
};

export const getThreads = async (user, projectId) => {
    return new Promise((resolve, reject) => {
        try {
            listenToUserChats(user.id, projectId, (threads) => {
                if (!Array.isArray(threads)) {
                    console.error("Expected threads to be an array, but got:", threads);
                    reject(new Error("Invalid data format"));
                } else {
                    resolve(threads);

                }
            });
        } catch (error) {
            console.error('Error fetching threads:', error);
            reject(error);
        }
    });
};

export const getThread = async (threadKey) => {
    const threadRef = doc(firestore, 'Chat', threadKey);
    const threadSnap = await getDoc(threadRef);

    if (!threadSnap.exists()) {
        throw new Error('Thread not found');
    }

    return {
        id: threadSnap.id,
        ...threadSnap.data(),
    };
};

export const getMessagesRealtime = (threadKey, callback) => {
    const messagesRef = collection(firestore, 'Chat', threadKey, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().timestamp?.toMillis(),
        }));
        callback(messages);
    });
};

export const listenToUserChats = async (userId, projectId, callback) => {
    if (!projectId && !userId) {
        throw new Error("ProjectId or UserId is required!")
    }

    const chatRef = collection(firestore, 'Chat');

    let constraints = [orderBy("createdAt", "desc")];
    if (userId) {
        constraints.unshift(where('users', 'array-contains', userId))
    }
    if (projectId) {
        constraints.unshift(where('projectId', '==', projectId))
    }

    const q = query(chatRef, ...constraints);

    return onSnapshot(q, async (snapshot) => {
        const threads = await Promise.all(
            snapshot.docs.map(async (doc) => {
                const threadData = {
                    id: doc.id,
                    ...doc.data(),
                };

                threadData.messages = await getMessagesForThread(doc.id);
                threadData.users = await getProfilesByIds(threadData.users);

                return threadData;
            })
        );

        callback(threads);
    });
};

export const getProfilesByIds = async (userIds) => {
    const profilesRef = collection(firestore, 'profiles');
    const q = query(profilesRef, where('__name__', 'in', userIds));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
};

export const getMessagesForThread = async (threadId) => {
    const messagesRef = collection(firestore, 'Chat', threadId, 'messages');
    const snapshot = await getDocs(messagesRef);
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
};