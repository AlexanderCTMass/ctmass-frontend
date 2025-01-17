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
    writeBatch,
    updateDoc,
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
            updatedAt: serverTimestamp(), // Инициализируем updatedAt
        });
    }

    return chatUId;
};

// Отправка сообщения
export const sendMessage = async (chatId, senderId, text) => {
    const messageRef = collection(firestore, "Chat", chatId, "messages");
    const chatRef = doc(firestore, "Chat", chatId);

    // Добавляем сообщение
    await addDoc(messageRef, {
        senderId,
        text,
        timestamp: serverTimestamp(),
        isRead: false,
    });
    // Обновляем поле updatedAt в чате
    await updateDoc(chatRef, {
        updatedAt: serverTimestamp(),
    });
};

// Пометка сообщений как прочитанных
export const markMessagesAsReads = async (chatId, userId) => {
    try {
        const messagesRef = collection(firestore, "Chat", chatId, "messages");
        const unreadMessagesQuery = query(messagesRef, where("isRead", "==", false));
        const querySnapshot = await getDocs(unreadMessagesQuery);

        if (querySnapshot.empty) {
            return;
        }

        const batch = writeBatch(firestore);

        querySnapshot.forEach((doc) => {
            const message = doc.data();
            if (message.senderId !== userId) {
                batch.update(doc.ref, { isRead: true });
            }
        });

        await batch.commit();

        console.log("Сообщения успешно помечены как прочитанные");
    } catch (error) {
        console.error("Ошибка при обновлении статуса сообщений:", error);
    }
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
                isRead: data.isRead || false,
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
