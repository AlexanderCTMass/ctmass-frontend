import {useEffect, useState} from 'react';
import {profileApi} from '../profile';
import {useAuth} from "src/hooks/use-auth";
import {getMessagesRealtime, listenToUserChats} from "src/chatService";

/**
 * Загружает контакты для списка чатов.
 * @param {Array} chats - Список чатов.
 * @param {string} userId - ID текущего пользователя.
 * @returns {Promise<Array>} - Массив контактов.
 */
const fetchContacts = async (chats, userId) => {
    if (!chats?.length || !userId) return [];

    try {
        const contacts = await Promise.all(
            chats.map(async (chat) => {
                const otherUserId = chat.users.find((id) => id !== userId);
                if (!otherUserId) return null;

                const otherUserProfile = await profileApi.get(otherUserId);

                return {
                    id: otherUserId,
                    avatar: otherUserProfile?.photoURL || '/assets/default-avatar.png',
                    name: otherUserProfile?.displayName || 'Unknown User',
                    lastActivity: chat.updatedAt?.toMillis() || Date.now(),
                };
            })
        );

        return contacts.filter(Boolean); // Убираем null значения
    } catch (error) {
        console.error('Error fetching contacts:', error);
        return [];
    }
};

/**
 * Форматирует чаты в структуру потоков сообщений.
 * @param {Array} chats - Список чатов.
 * @param {string} userId - ID текущего пользователя.
 * @returns {Promise<Array>} - Массив форматированных потоков.
 */
const formatThreads = async (chats, userId) => {
    if (!chats?.length || !userId) return [];

    try {
        return Promise.all(
            chats.map(async (chat) => {
                const messages = await getMessagesRealtime(chat.id); // Загружаем сообщения
                const unreadCount = messages.filter(
                    (msg) => msg.senderId !== userId && !msg.isRead
                ).length;

                return {
                    id: chat.id,
                    messages: messages.map((msg) => ({
                        id: msg.id,
                        text: msg.text,
                        fileUrl: msg.fileUrl,
                        fileType: msg.fileType,
                        createdAt: msg.timestamp?.toMillis() || Date.now(),
                        senderId: msg.senderId,
                        isRead: msg.isRead,
                    })),
                    users: chat.users,
                    updatedAt: chat.updatedAt?.toMillis() || Date.now(),
                    unreadCount,
                };
            })
        );
    } catch (error) {
        console.error('Error formatting threads:', error);
        return [];
    }
};

/**
 * Хук для загрузки данных чатов и контактов.
 * @returns {Object} - Данные чатов, контактов и состояние загрузки.
 */
export const useChatData = () => {
    const {user} = useAuth();
    const [contacts, setContacts] = useState([]);
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) return;

        const userId = user.uid;

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
                    const unsubscribeMessages = getMessagesRealtime(chat.id, (newMessages) => {
                        setThreads((prevThreads) =>
                            prevThreads.map((t) =>
                                t.id === chat.id
                                    ? {...t, messages: newMessages}
                                    : t
                            )
                        );
                    });

                    return unsubscribeMessages; // Отписка при размонтировании
                });
            } catch (error) {
                console.error('Error loading chat data:', error);
            } finally {
                setLoading(false);
            }
        });

        // Отписка при размонтировании
        return () => unsubscribeChats();
    }, [user?.uid]);

    /**
     * Добавляет новый контакт.
     * @param {Object} newContact - Новый контакт.
     */
    const addContact = (newContact) => {
        setContacts((prevContacts) => [...prevContacts, newContact]);
    };

    return {contacts, threads, loading, addContact};
};