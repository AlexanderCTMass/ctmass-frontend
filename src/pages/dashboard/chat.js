import {useCallback, useEffect, useRef, useState} from 'react';
import Menu01Icon from '@untitled-ui/icons-react/build/esm/Menu01';
import {Box, Divider, IconButton, SvgIcon, Typography, useMediaQuery} from '@mui/material';
import {Seo} from 'src/components/seo';
import {usePageView} from 'src/hooks/use-page-view';
import {useSearchParams} from 'src/hooks/use-search-params';
import {ChatBlank} from 'src/sections/dashboard/chatNew/chat-blank';
import {ChatComposer} from 'src/sections/dashboard/chatNew/chat-composer';
import {ChatContainer} from 'src/sections/dashboard/chatNew/chat-container';
import {ChatSidebar} from 'src/sections/dashboard/chatNew/chat-sidebar';
import {ChatThread} from 'src/sections/dashboard/chatNew/chat-thread';
import {useSelector} from 'src/store';
import {useAuth} from "src/hooks/use-auth";
import {useChatSubscriptions} from "src/hooks/use-chat-subscriptions";
import * as React from "react";
import useNotificationSound from "src/hooks/use-notification-sound";


const useSidebar = () => {
    const searchParams = useSearchParams();
    const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));
    const [open, setOpen] = useState(mdUp);

    const handleScreenResize = useCallback(() => {
        if (!mdUp) {
            setOpen(false);
        } else {
            setOpen(true);
        }
    }, [mdUp]);

    useEffect(() => {
            handleScreenResize();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [mdUp]);

    const handeParamsUpdate = useCallback(() => {
        if (!mdUp) {
            setOpen(false);
        }
    }, [mdUp]);

    useEffect(() => {
            handeParamsUpdate();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [searchParams]);

    const handleToggle = useCallback(() => {
        setOpen((prevState) => !prevState);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    return {
        handleToggle,
        handleClose,
        open
    };
};


const useThreads = (userId) => {
    const chats = useSelector((state) => state.chatNew.threads || []);
    const loading = useSelector((state) => state.chatNew.loading);
    const error = useSelector((state) => state.chatNew.error);
    const unreadMessages = useSelector((state) => state.chatNew.unreadMessages);

    useChatSubscriptions(userId)

    return {chats, loading, error, unreadMessages};
};

const useMessages = (threadId) => {
    const messages = useSelector((state) => state.chatNew.messages[threadId] || []);
    const loading = useSelector((state) => state.chatNew.loadingMessages);
    const error = useSelector((state) => state.chatNew.errorMessages);
    const threads = useSelector((state) => state.chatNew.threads || []);
    const participants = threads.filter(c => c.id === threadId).flatMap(c => c.users);

    return {messages, participants, loading, error};
};

const Page = () => {
    const {user} = useAuth();

    const rootRef = useRef(null);
    const searchParams = useSearchParams();
    const compose = searchParams.get('compose') === 'true';
    const threadKey = searchParams.get('threadKey') || undefined;
    const sidebar = useSidebar();
    const [profiles, setProfiles] = useState();
    const threads = useThreads(user.id);
    const threadMessages = useMessages(threadKey);

    useNotificationSound(user.id, threads.unreadMessages);

    usePageView();

    const view = threadKey
        ? 'thread'
        : compose
            ? 'compose'
            : 'blank';

    return (
        <>
            <Seo title="ctmass chat"/>
            <Divider/>
            <Box
                component="main"
                sx={{
                    backgroundColor: 'background.paper',
                    flex: '1 1 auto',
                    overflow: 'hidden',
                    position: 'relative'
                }}
            >
                <Box
                    ref={rootRef}
                    sx={{
                        bottom: 0,
                        display: 'flex',
                        left: 0,
                        position: 'absolute',
                        right: 0,
                        top: 0
                    }}
                >
                    <ChatSidebar
                        currentThreadId={threadKey}
                        threads={threads}
                        container={rootRef.current}
                        onClose={sidebar.handleClose}
                        open={sidebar.open}
                        profiles={profiles}
                        setProfiles={setProfiles}
                    />
                    <ChatContainer open={sidebar.open}>
                        <Box sx={{p: 2}}>
                            <IconButton onClick={sidebar.handleToggle}>
                                <SvgIcon>
                                    <Menu01Icon/>
                                </SvgIcon>
                            </IconButton>
                        </Box>
                        <Divider/>
                        {view === 'thread' && <ChatThread threadMessages={threadMessages}
                                                          threadKey={threadKey}
                        />}
                        {view === 'compose' && <ChatComposer/>}
                        {view === 'blank' && <ChatBlank/>}
                    </ChatContainer>
                </Box>
            </Box>
        </>
    );
};

export default Page;
