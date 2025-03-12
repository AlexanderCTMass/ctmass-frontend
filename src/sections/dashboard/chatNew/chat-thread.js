import {useCallback, useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {Box, Button, Divider, Stack} from '@mui/material';
import {Scrollbar} from 'src/components/scrollbar';
import {ChatMessageAdd} from './chat-message-add';
import {ChatMessages} from './chat-messages';
import {ChatThreadToolbar} from './chat-thread-toolbar';
import {useAuth} from "src/hooks/use-auth";
import {chatApi} from "src/api/chat/newApi";
import toast from "react-hot-toast";

const useMessagesScroll = (thread, messages) => {
    const messagesRef = useRef(null);

    const handleUpdate = useCallback(() => {
        // Thread does not exist
        if (!thread) {
            return;
        }

        // Ref is not used
        if (!messagesRef.current) {
            return;
        }

        const container = messagesRef.current;
        const scrollElement = container.getScrollElement();

        if (scrollElement) {
            scrollElement.scrollTop = scrollElement.scrollHeight;
        }
    }, [thread, messages]); // Добавляем messages в зависимости

    useEffect(() => {
        handleUpdate();
    }, [handleUpdate]); // Зависимость от handleUpdate

    return {
        messagesRef,
    };
};

export const ChatThread = (props) => {
    const {threadMessages, threadKey, showUserInfo, actions, ...other} = props;
    const {user} = useAuth();
    const {messagesRef} = useMessagesScroll(threadKey, threadMessages.messages);
    const [sendingMessage, setSendingMessage] = useState(false);

    useEffect(() => {
        const markMessages = async () => {
            console.log("mark")
            await chatApi.markMessagesAsRead(threadKey, user.id);
        }

        if (threadKey) {
            markMessages();
        }
    }, [threadMessages.messages]);


    const handleSend = useCallback(
        async (body, files) => {
            if (!user?.id || !threadKey) return;
            setSendingMessage(true);

            try {
                await chatApi.sendMessage(threadKey, user.id, body, files, threadMessages.participants);
            } catch (err) {
                console.error(err);
                toast.error("Error send message")
            } finally {
                setSendingMessage(false);
            }
        },
        [threadKey, user]
    );

    if (threadMessages.loadingMessages) {
        return <div>Loading...</div>
    }

    if (threadMessages.errorMessages) {
        return <div>Error: {threadMessages.errorMessages}</div>
    }

    return (
        <Stack
            sx={{
                flexGrow: 1,
                overflow: 'hidden'
            }}
            {...other}>
            <ChatThreadToolbar participants={threadMessages.participants}/>
            <Divider/>
            <Box
                sx={{
                    flexGrow: 1,
                    overflow: 'hidden'
                }}
            >
                <Scrollbar
                    ref={messagesRef}
                    sx={{maxHeight: '100%', height: "500px"}}
                >
                    <ChatMessages
                        showUserInfo={showUserInfo}
                        messages={threadMessages.messages}
                        participants={threadMessages.participants}
                    />
                </Scrollbar>
            </Box>
            <Divider/>
            {actions &&
                <Box
                    sx={{
                        display: 'block',
                        overflowX: 'auto',
                        whiteSpace: 'nowrap',
                        gap: 2, // Отступ между элементами
                        mx: 2,
                        mt: 2,
                        width: "auto"
                    }}>
                    {actions.map((action) => {
                        return (<Button
                            color={action?.color || "success"}
                        >
                            {action.label}
                        </Button>)
                    })}
                </Box>
            }
            <ChatMessageAdd onSend={handleSend} isSending={sendingMessage}/>
        </Stack>
    );
};

ChatThread.propTypes = {
    threadMessages: PropTypes.object.isRequired
};
