import {useCallback, useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {Box, Divider, Stack} from '@mui/material';
import {Scrollbar} from 'src/components/scrollbar';
import {useRouter} from 'src/hooks/use-router';
import {paths} from 'src/paths';
import {ChatMessageAdd} from './chat-message-add';
import {ChatMessages} from './chat-messages';
import {ChatThreadToolbar} from './chat-thread-toolbar';
import {useAuth} from "src/hooks/use-auth";
import {getMessagesRealtime, markMessagesAsRead, sendMessage, uploadFile} from "src/chatService";
import {profileApi} from "src/api/profile";

const useParticipants = (threadKey, userId) => {
    const router = useRouter();
    const [participants, setParticipants] = useState([]);

    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                // Получаем данные участников чата
                let users = [];
                if (threadKey.includes("_")) {
                    users = threadKey.split('_');
                } else {
                    users.push(threadKey)
                    users.push(userId)
                }
                const participants = await profileApi.getChatProfilesById(users);
                setParticipants(participants);
            } catch (err) {
                console.error('Error loading participants:', err);
                router.push(paths.dashboard.chat);
            }
        };

        if (threadKey) {
            fetchParticipants();
        }
    }, [threadKey, router]);

    return participants;
};

const useThread = (threadKey) => {
    const [thread, setThread] = useState(null);
    const [messages, setMessages] = useState([]);
    const {user} = useAuth();

    useEffect(() => {
        if (!threadKey) return;

        // Подписываемся на сообщения в реальном времени
        const unsubscribe = getMessagesRealtime(threadKey, (newMessages) => {
            setMessages(newMessages);

            // Помечаем сообщения как прочитанные
            if (user?.id) {
                markMessagesAsRead(threadKey, user.id);
            }
        });

        return () => unsubscribe();
    }, [threadKey, user]);

    return {messages, participants: thread?.participants || []};
};

const useMessagesScroll = (messages) => {
    const messagesRef = useRef(null);

    useEffect(() => {
        if (messagesRef.current) {
            const container = messagesRef.current;
            const scrollElement = container.getScrollElement();
            if (scrollElement) {
                scrollElement.scrollTop = container.el.scrollHeight;
            }
        }
    }, [messages]);

    return {messagesRef};
};

export const ChatThread = (props) => {
    const {threadKey, ...other} = props;
    const {user} = useAuth();
    const router = useRouter();
    const participants = useParticipants(threadKey, user.id);
    const {messages} = useThread(threadKey);
    const {messagesRef} = useMessagesScroll(messages);

    const handleSend = useCallback(
        async (body, file, participants) => {
            if (!user?.id || !threadKey) return;

            try {
                let messageBody = body;

                // Если есть файл, загружаем его в Firebase Storage
                // if (file) {
                //     const fileUrl = await uploadFile(file); // Реализуйте эту функцию
                //     messageBody = fileUrl;
                // }

                // Отправляем сообщение
                await sendMessage(threadKey, user.id, messageBody, file?.type, participants);
            } catch (err) {
                console.error('Error sending message:', err);
            }
        },
        [threadKey, user]
    );

    return (
        <Stack
            sx={{
                flexGrow: 1,
                overflow: 'hidden'
            }}
            {...other}>
            <ChatThreadToolbar participants={participants}/>
            <Divider/>
            <Box
                sx={{
                    flexGrow: 1,
                    overflow: 'hidden'
                }}
            >
                <Scrollbar
                    ref={messagesRef}
                    sx={{maxHeight: '100%'}}
                >
                    <ChatMessages
                        messages={messages}
                        participants={participants}
                    />
                </Scrollbar>
            </Box>
            <Divider/>
            <ChatMessageAdd onSend={handleSend} participants={participants} />
        </Stack>
    );
};

ChatThread.propTypes = {
    threadKey: PropTypes.string.isRequired
};
