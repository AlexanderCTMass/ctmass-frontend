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
    where
} from "firebase/firestore";
import {firestore} from "./libs/firebase";

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

// Получение сообщений в режиме реального времени
export const getMessages = async (chatId) => {
    const messageRef = collection(firestore, "Chat", chatId, "messages");
    const q = query(messageRef, orderBy("timestamp"));

    const querySnapshot = await getDocs(q);  // Используем getDocs для получения данных
    const messages = [];

    querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
    });

    return messages;
};


// Получение сообщений с использованием onSnapshot (реальное время)
export const getMessagesRealtime = (chatId, callback) => {
    const messagesRef = collection(firestore, "Chat", chatId, "messages");

    return onSnapshot(messagesRef, (snapshot) => {
        console.log("Snapshot received:", snapshot);

        const newMessages = snapshot.docs.map((doc) => {
            try {
                const data = doc.data();
                console.log(`Processing document ${doc.id}:`, data);

                if (!data) {
                    console.error(`Document with ID ${doc.id} has no data`);
                    return null;
                }

                let createdAt;
                if (typeof data.timestamp === "string") {
                    createdAt = new Date(data.timestamp).getTime();
                } else if (data.timestamp?.toMillis) {
                    createdAt = data.timestamp.toMillis();
                } else {
                    createdAt = Date.now();
                }

                return {
                    id: doc.id,
                    text: data.text || "No text",
                    // createdAt,
                    senderId: data.senderId || "unknown",
                };
            } catch (error) {
                console.error(`Error processing document ${doc.id}:`, error);
                return null;
            }
        });

        const validMessages = newMessages.filter((msg) => msg !== null);
        callback(validMessages);
        console.log("New messages passed to callback:", validMessages);
    });
};


// Получение пользователей
export const getUsers = async () => {
    const usersRef = collection(firestore, "Users"); // Предполагаем, что в Firestore есть коллекция "Users"
    const querySnapshot = await getDocs(usersRef);

    const users = [];
    querySnapshot.forEach((doc) => {
        const user = doc.data();
        users.push({
            id: doc.id,
            avatar: user.avatar || "/assets/default-avatar.png",
            isActive: user.isActive || false,
            lastActivity: user.lastActivity || null,
            name: user.name || "Unknown User",
        });
    });

    return users;
};

// Получение чатов пользователя
export const getUserChats = async (userId) => {
    const chatRef = collection(firestore, "Chat");
    const q = query(chatRef, where("users", "array-contains", userId));

    const querySnapshot = await getDocs(q);
    const chats = [];

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        chats.push({
            id: doc.id,
            ...data,
        });
    });

    return chats;
};



// Получение чатов (в формате threads)
export const getThreads = async (userId) => {
    const chatsRef = query(collection(firestore, "Chat"), where("users", "array-contains", userId));
    const querySnapshot = await getDocs(chatsRef);

    const threads = [];
    for (const doc of querySnapshot.docs) {
        const chatData = doc.data();
        const messagesRef = query(
            collection(firestore, "Chat", doc.id, "messages"),
            orderBy("timestamp")
        );
        const messagesSnapshot = await getDocs(messagesRef);

        const messages = [];
        let unreadCount = 0;

        messagesSnapshot.forEach((messageDoc) => {
            const message = messageDoc.data();
            const isUnread = message.senderId !== userId && !message.isRead; // Если сообщение отправлено не текущим пользователем и не прочитано
            if (isUnread) unreadCount++;

            messages.push({
                id: messageDoc.id,
                attachments: message.attachments || [],
                body: message.text,
                contentType: "text",
                createdAt: message.timestamp?.toMillis() || Date.now(),
                authorId: message.senderId,
            });
        });

        threads.push({
            id: doc.id,
            messages,
            participantIds: chatData.users,
            type: "ONE_TO_ONE",
            unreadCount, // Подсчёт непрочитанных сообщений
        });
    }

    return threads;
};
