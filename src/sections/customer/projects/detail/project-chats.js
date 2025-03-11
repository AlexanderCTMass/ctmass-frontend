import PropTypes from 'prop-types';
import {Box, Card, CardContent, Divider, IconButton, Stack, SvgIcon, Typography, useMediaQuery} from '@mui/material';
import * as React from "react";
import {useCallback, useEffect, useRef, useState} from "react";
import {useSearchParams} from 'src/hooks/use-search-params';
import {useRouter} from "src/hooks/use-router";
import {profileApi} from "src/api/profile";
import {paths} from "src/paths";
import {useAuth} from "src/hooks/use-auth";
import {getMessagesRealtime, markMessagesAsRead} from "src/chatService";
import {ChatSidebar} from "src/sections/dashboard/chat/chat-sidebar";
import {ChatContainer} from "src/sections/dashboard/chat/chat-container";
import Menu01Icon from "@untitled-ui/icons-react/build/esm/Menu01";
import {ChatThread} from "src/sections/dashboard/chat/chat-thread";
import {ChatBlank} from "src/sections/dashboard/chat/chat-blank";

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


export const ProjectChat = (props) => {
    const {project, user, ...other} = props;
    const participants = useParticipants("09dtBAEkwKb4NMiouZ1wHGVsYJ43_zWWSI9cTesUKv6eUXVgMky4bGxd2", "zWWSI9cTesUKv6eUXVgMky4bGxd2")
    const {messages} = useThread("09dtBAEkwKb4NMiouZ1wHGVsYJ43_5RhCetRuUiQWDoa3hfinqjskpeu1");

    const rootRef = useRef(null);
    const searchParams = useSearchParams();
    const threadKey = searchParams.get('threadKey') || undefined;
    const [profiles, setProfiles] = useState();

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
                    />
                    <ChatContainer open>
                        {view === 'thread' && <ChatThread threadKey={threadKey}
                                                          actions={[
                                                              {label: "Reject", color: "error"},
                                                              {label: "Choose a specialist"},
                                                          ]}/>}
                        {view === 'blank' && <ChatBlank/>}
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
