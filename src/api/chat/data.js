import {useEffect, useState} from 'react';
import {getMessages, getMessagesRealtime, getUserChats} from "../../chatService";
import {useAuth} from "../../hooks/use-auth";
import {profileApi} from "../profile";


// Функция для получения контактов
const fetchContacts = async (userId) => {
    const userChats = await getUserChats(userId);

    const contacts = await Promise.all(
        userChats.map(async (chat) => {
            const otherUserId = chat.users.find((id) => id !== userId);
            const otherUserProfile = await profileApi.get(otherUserId); // Получаем данные клиента

            if (!otherUserProfile) {
                return {
                    id: otherUserId,
                    avatar: "/assets/default-avatar.png",
                    name: "Unknown User", // Защита от пустых профилей
                };
            }

            return {
                id: otherUserId,
                avatar: otherUserProfile.avatar || "/assets/default-avatar.png", // проверка наличия аватарки
                isActive: chat.lastActivity?.isActive || false,
                lastActivity: chat.lastActivity?.toMillis() || Date.now(),
                name: otherUserProfile?.name || "Unknown User",
            };
        })
    );

    return contacts;
};

// Функция для получения потоков сообщений
const fetchThreads = async (userId) => {
    const userChats = await getUserChats(userId);

    return Promise.all(
        userChats.map(async (chat) => {
            const messages = await getMessages(chat.id);
            console.log(chat)
            if (!Array.isArray(messages) || messages.length === 0) {
                return {
                    id: chat.id,
                    messages: [],
                    users: chat.users,
                };
            }

            let unreadCount = 0;

            const formattedMessages = messages.map((msg) => {
                console.log(msg)
                let createdAt;
                if (typeof msg.timestamp === "string") {
                    createdAt = new Date(msg.timestamp).getTime();
                } else if (msg.timestamp?.toMillis) {
                    createdAt = msg.timestamp.toMillis();
                } else {
                    createdAt = Date.now();
                }

                const isUnread = msg.senderId !== userId && !msg.isRead;
                if (isUnread) unreadCount++;

                return {
                    id: msg.id,
                    text: msg.text,
                    createdAt,
                    senderId: msg.senderId,
                };
            });

            return {
                id: chat.id,
                messages: formattedMessages,
                users: chat.users,
            };
        })
    );
};
// Хук для загрузки данных
export const useChatData = () => {
    const auth = useAuth(); // Получаем текущего пользователя
    const [contacts, setContacts] = useState([]);
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (auth.user?.id) {
                const userId = auth.user.id;

                try {
                    const [fetchedContacts, fetchedThreads] = await Promise.all([
                        fetchContacts(userId),
                        fetchThreads(userId),
                    ]);

                    setContacts(fetchedContacts);
                    setThreads(fetchedThreads);

                    // Проверяем, что fetchedThreads - это массив
                    if (Array.isArray(fetchedThreads)) {
                        // Подписываемся на обновления сообщений для каждого чата
                        fetchedThreads.forEach((thread) => {
                            // Подписка на новые сообщения
                            const unsubscribe = getMessagesRealtime(thread.id, (newMessages) => {
                                console.log(newMessages)
                                setThreads((prevThreads) =>
                                    prevThreads.map((t) =>
                                        t.id === thread.id
                                            ? {...t, messages: newMessages}
                                            : t
                                    )
                                );
                            });

                            // Возвращаем функцию отписки, которая будет вызвана при размонтировании компонента
                            return unsubscribe;
                        });
                    } else {
                        console.error("fetchedThreads не является массивом");
                    }
                } catch (error) {
                    console.error("Ошибка при загрузке данных чата:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        loadData();
    }, [auth.user?.id]);

    // Добавляем новый контакт
    const addContact = (newContact) => {
        setContacts((prevContacts) => [...prevContacts, newContact]);
    };

    return {contacts, threads, loading, addContact};
};
