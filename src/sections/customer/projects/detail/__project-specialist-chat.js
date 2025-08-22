import PropTypes from 'prop-types';
import { Card, CardContent, Stack } from '@mui/material';
import * as React from "react";
import { useRef, useState } from "react";
import { ChatContainer } from "src/sections/dashboard/chatNew/chat-container";
import { ChatThread } from "src/sections/dashboard/chatNew/chat-thread";
import { ChatBlank } from "src/sections/dashboard/chatNew/chat-blank";
import { useSelector } from "src/store";
import { useOneChatSubscriptions } from "src/hooks/use-chat-subscriptions";
import useNotificationSound from "src/hooks/use-notification-sound";
import { INFO } from "src/libs/log";


const useThreads = (threadId) => {
    const chats = useSelector((state) => state.chatNew.threads);
    const loading = useSelector((state) => state.chatNew.loading);
    const error = useSelector((state) => state.chatNew.error);
    const unreadMessages = useSelector((state) => state.chatNew.unreadMessages);

    useOneChatSubscriptions(threadId);


    return { chats, loading, error, unreadMessages };
};

const useMessages = (threadId) => {
    const messages = useSelector((state) => state.chatNew.messages[threadId] || []);
    const loading = useSelector((state) => state.chatNew.loadingMessages);
    const error = useSelector((state) => state.chatNew.errorMessages);
    const threads = useSelector((state) => state.chatNew.threads);
    const participants = threads?.filter(c => c.id === threadId).flatMap(c => c.users);
    const currentChat = threads?.find(c => c.id === threadId);
    return { currentChat, messages, participants, loading, error };
};


export const ProjectSpecialistChat = (props) => {
    const { project, threadKey, user, ...other } = props;



    const rootRef = useRef(null);
    const threads = useThreads(threadKey);
    const threadMessages = useMessages(threadKey);

    useNotificationSound(user.id, threads.unreadMessages);

    const view = threadKey && !threads.loading && threads.chats.length > 0
        ? 'thread'
        : 'blank';

    return (
        <Card>
            <CardContent>
                <Stack
                    direction={"row"}
                    spacing={0}
                    ref={rootRef}
                >
                    <ChatContainer open>
                        {view === 'thread' && <ChatThread threadMessages={threadMessages}
                            threadKey={threadKey}
                            showUserInfo={false}
                            actions={[]} />}
                        {view === 'blank' && <ChatBlank
                            text={"Start a dialogue with the customer"} event={() => {
                                alert("Yahoo!")
                            }} />}
                    </ChatContainer>
                </Stack>
            </CardContent>
        </Card>
    );
};

ProjectSpecialistChat.defaultProps = {
    responses: []
};

ProjectSpecialistChat.propTypes = {
    responses: PropTypes.array.isRequired,
};
