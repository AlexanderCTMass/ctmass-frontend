import {
    addDoc,
    collection,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    where,
} from "firebase/firestore";
import { firestore } from "./libs/firebase";

// Начало нового чата
export const startChat = async (userId1, userId2) => {
    const chatUId = [userId1, userId2].sort().join("_");
    const chatRef = doc(firestore, "Chat", chatUId);

    const chatDoc = await getDocs(query(collection(firestore, "Chat"), where("id", "==", chatUId)));

    if (chatDoc.empty) {
        await setDoc(chatRef, {
            users: [userId1, userId2],
            createdAt: serverTimestamp(),
        });
    }

    return chatUId;
};

// Добавление сообщения
export const sendMessage = async (chatId, senderId, text) => {
    const messageRef = collection(firestore, "Chat", chatId, "messages");
    await addDoc(messageRef, {
        senderId,
        text,
        timestamp: serverTimestamp(),
    });
};

// Получение сообщений (однократное чтение)
export const getMessages = async (chatId) => {
    const messageRef = collection(firestore, "Chat", chatId, "messages");
    const q = query(messageRef, orderBy("timestamp"));

    const querySnapshot = await getDocs(q);
    const messages = [];

    querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
    });

    return messages;
};

// Получение сообщений в режиме реального времени
export const getMessagesRealtime = (chatId, callback) => {
    const messagesRef = collection(firestore, "Chat", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp"));

    return onSnapshot(q, (snapshot) => {
        const newMessages = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                text: data.text || "No text",
                senderId: data.senderId || "unknown",
                createdAt: data.timestamp?.toMillis() || Date.now(),
            };
        });
        callback(newMessages);
    });
};

// Получение чатов пользователя в режиме реального времени
export const listenToUserChats = (userId, callback) => {
    const chatRef = collection(firestore, "Chat");
    const q = query(chatRef, where("users", "array-contains", userId));

    return onSnapshot(q, (snapshot) => {
        const chats = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        callback(chats);
    });
};
