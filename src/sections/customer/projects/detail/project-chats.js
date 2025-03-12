import PropTypes from 'prop-types';
import {Card, CardContent, Stack, Typography} from '@mui/material';
import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {ChatContainer} from "src/sections/dashboard/chatNew/chat-container";
import {ChatThread} from "src/sections/dashboard/chatNew/chat-thread";
import {ChatBlank} from "src/sections/dashboard/chatNew/chat-blank";
import {ChatSidebar} from "src/sections/dashboard/chatNew/chat-sidebar";
import {useSelector} from "src/store";
import useChatSubscriptions from "src/hooks/use-chat-subscriptions";
import useNotificationSound from "src/hooks/use-notification-sound";


const useThreads = (projectId) => {
    const chats = useSelector((state) => state.chatNew.threads);
    const loading = useSelector((state) => state.chatNew.loading);
    const error = useSelector((state) => state.chatNew.error);
    const unreadMessages = useSelector((state) => state.chatNew.unreadMessages);

    useChatSubscriptions(null, projectId)

    return {chats, loading, error, unreadMessages};
};

const useMessages = (threadId) => {
    const messages = useSelector((state) => state.chatNew.messages[threadId] || []);
    const loading = useSelector((state) => state.chatNew.loadingMessages);
    const error = useSelector((state) => state.chatNew.errorMessages);
    const threads = useSelector((state) => state.chatNew.threads);
    const participants = threads.filter(c => c.id === threadId).flatMap(c => c.users);
    return {messages, participants, loading, error};
};


export const ProjectChat = (props) => {
    const {project, threadKey, user, ...other} = props;

    const rootRef = useRef(null);
    const [profiles, setProfiles] = useState();
    const threads = useThreads(project.id);
    const threadMessages = useMessages(threadKey);

    useNotificationSound(user.id, threads.unreadMessages);

    const view = threadKey
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
                    <ChatSidebar
                        currentThreadId={threadKey}
                        threads={threads}
                        open
                        container={rootRef.current}
                        profiles={profiles}
                        setProfiles={setProfiles}
                        sidebarLabel={<Typography
                            color="text.secondary"
                            component="p"
                            variant="overline"
                        >
                            Specialists
                        </Typography>}
                        searchEnabled={false}
                    />
                    <ChatContainer open>
                        {view === 'thread' && <ChatThread threadMessages={threadMessages}
                                                          threadKey={threadKey}
                                                          showUserInfo={false}
                                                          actions={[
                                                              {label: "Reject", color: "error"},
                                                              {label: "Choose a specialist"},
                                                          ]}/>}
                        {view === 'blank' && <ChatBlank
                            text={"Start a dialogue with one of the specialists from the list on the left"}/>}
                    </ChatContainer>
                </Stack>
            </CardContent>
        </Card>
    );
};

ProjectChat.defaultProps = {
    responses: []
};

ProjectChat.propTypes = {
    responses: PropTypes.array.isRequired,
};
