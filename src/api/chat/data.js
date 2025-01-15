import { useEffect, useState } from "react";
import { getMessagesRealtime, listenToUserChats } from "../../chatService"; // Обновленный метод для чатов
import { useAuth } from "../../hooks/use-auth";
import { profileApi } from "../profile";

// Функция для получения контактов
const fetchContacts = async (chats, userId) => {
    const contacts = await Promise.all(
        chats.map(async (chat) => {
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

// Функция для форматирования потоков сообщений
const formatThreads = async (chats, userId) => {
    return Promise.all(
        chats.map(async (chat) => {
            const messages = [];
            let unreadCount = 0;

            // Форматируем сообщения для чата
            const formattedMessages = messages.map((msg) => {
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
                updatedAt: chat.updatedAt
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
        if (!auth.user?.id) return;

        const userId = auth.user.id;

        // Подписываемся на чаты пользователя
        const unsubscribeChats = listenToUserChats(userId, async (chats) => {
            try {
                // Загружаем контакты
                const fetchedContacts = await fetchContacts(chats, userId);
                setContacts(fetchedContacts);

                // Форматируем потоки сообщений
                const formattedThreads = await formatThreads(chats, userId);
                setThreads(formattedThreads);

                // Подписываемся на обновления сообщений для каждого чата
                chats.forEach((chat) => {
                    getMessagesRealtime(chat.id, (newMessages) => {
                        setThreads((prevThreads) =>
                            prevThreads.map((t) =>
                                t.id === chat.id
                                    ? { ...t, messages: newMessages }
                                    : t
                            )
                        );
                    });
                });
            } catch (error) {
                console.error("Ошибка при загрузке данных чатов:", error);
            } finally {
                setLoading(false);
            }
        });

        // Отписка при размонтировании
        return () => unsubscribeChats();
    }, [auth.user?.id]);

    // Добавляем новый контакт
    const addContact = (newContact) => {
        setContacts((prevContacts) => [...prevContacts, newContact]);
    };

    return { contacts, threads, loading, addContact };
};
