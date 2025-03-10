import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    where,
    writeBatch,
} from 'firebase/firestore';
import {firestore, storage} from './libs/firebase';
import {getDownloadURL, ref, uploadBytes} from 'firebase/storage';
import {profileApi} from 'src/api/profile';
import {v4 as uuidv4} from 'uuid';

export const startChat = async (userId1, userId2) => {
    const chatUId = [userId1, userId2].sort().join('_');
    const chatRef = doc(firestore, 'Chat', chatUId);

    const chatDoc = await getDocs(query(collection(firestore, 'Chat'), where('id', '==', chatUId)));

    if (chatDoc.empty) {
        await setDoc(chatRef, {
            users: [userId1, userId2],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }

    return chatUId;
};

export const getContacts = async (query = '', profiles, setProfiles) => {
    try {
        const contacts = await profileApi.searchProfiles(profiles, setProfiles, query);
        return contacts;
    } catch (error) {
        console.error('Error fetching contacts:', error);
        throw error;
    }
};


export const getThreads = async (user) => {
    return new Promise((resolve, reject) => {
        try {
            listenToUserChats(user.id, (threads) => {
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

export const sendMessage = async (threadKey, senderId, text, file) => {
    const messagesRef = collection(firestore, 'Chat', threadKey, 'messages');

    let fileUrl = null;
    let fileType = null;

    if (file) {
        fileUrl = await uploadFile(file);
        fileType = file.type;
    }

    await addDoc(messagesRef, {
        senderId,
        text: fileUrl ? null : text,
        fileUrl,
        fileType,
        timestamp: serverTimestamp(),
        isRead: false,
    });
};

export const uploadFile = async (file) => {
    try {
        if (!file) {
            throw new Error('No file provided');
        }

        const fileExtension = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const storageRef = ref(storage, `chat/${fileName}`);

        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        return downloadURL;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error('Failed to upload file');
    }
};

export const markMessagesAsRead = async (threadKey, userId) => {
    const messagesRef = collection(firestore, 'Chat', threadKey, 'messages');
    const unreadQuery = query(messagesRef, where('isRead', '==', false));

    const snapshot = await getDocs(unreadQuery);
    const batch = writeBatch(firestore);

    snapshot.forEach((doc) => {
        if (doc.data().senderId !== userId) {
            batch.update(doc.ref, {isRead: true});
        }
    });

    await batch.commit();
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

export const listenToUserChats = async (userId, callback) => {
    const chatRef = collection(firestore, 'Chat');
    const q = query(chatRef, where('users', 'array-contains', userId));

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