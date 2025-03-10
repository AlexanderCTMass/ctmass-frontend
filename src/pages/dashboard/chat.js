import {useCallback, useEffect, useRef, useState} from 'react';
import Menu01Icon from '@untitled-ui/icons-react/build/esm/Menu01';
import {Box, Divider, IconButton, SvgIcon, useMediaQuery} from '@mui/material';
import {Seo} from 'src/components/seo';
import {usePageView} from 'src/hooks/use-page-view';
import {useSearchParams} from 'src/hooks/use-search-params';
import {ChatBlank} from 'src/sections/dashboard/chat/chat-blank';
import {ChatComposer} from 'src/sections/dashboard/chat/chat-composer';
import {ChatContainer} from 'src/sections/dashboard/chat/chat-container';
import {ChatSidebar} from 'src/sections/dashboard/chat/chat-sidebar';
import {ChatThread} from 'src/sections/dashboard/chat/chat-thread';
import {useDispatch} from 'src/store';
import {thunks} from 'src/thunks/chat';
import {listenToUserChats} from "src/chatService";
import {useAuth} from "src/hooks/use-auth";
import {profileApi} from "src/api/profile";
import {collection, getDocs, limit, orderBy, query} from "firebase/firestore";
import {firestore} from "src/libs/firebase";

/**
 * NOTE:
 * In our case there two possible routes
 * one that contains /chat and one with a chat?threadKey={{threadKey}}
 * if threadKey does not exist, it means that the chat is in compose mode
 */

const useThreads = () => {
    const dispatch = useDispatch();
    const {user} = useAuth(); // Предполагается, что есть хук для авторизации

    useEffect(() => {
        if (!user?.id) return;

        const unsubscribe = listenToUserChats(user.id, async (chats) => {
            try {
                // Форматируем чаты в структуру threads
                const threads = await Promise.all(
                    chats.map(async (chat) => {
                        // Получаем участников чата
                        const participants = await profileApi.getChatProfilesById(chat.users);

                        // Получаем последние сообщения
                        const messagesSnapshot = await getDocs(
                            query(
                                collection(firestore, "Chat", chat.id, "messages"),
                                orderBy("timestamp", "desc"),
                                limit(20)
                            )
                        );

                        const messages = messagesSnapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data(),
                            createdAt: doc.data().timestamp?.toMillis()
                        }));

                        return {
                            id: chat.id,
                            participants: participants.map(p => ({
                                id: p.id,
                                name: p.name,
                                avatar: p.avatar
                            })),
                            messages,
                            unreadCount: messages.filter(m =>
                                m.senderId !== user.id && !m.isRead
                            ).length,
                            updatedAt: chat.updatedAt?.toMillis()
                        };
                    })
                );

                dispatch({
                    type: 'chat/SET_THREADS',
                    payload: {
                        byId: threads.reduce((acc, thread) => {
                            acc[thread.id] = thread;
                            return acc;
                        }, {}),
                        allIds: threads.map(t => t.id)
                    }
                });

            } catch (error) {
                console.error("Error loading threads:", error);
            }
        });

        return () => unsubscribe();
    }, [user?.uid, dispatch]);
};

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

const Page = () => {
    const rootRef = useRef(null);
    const searchParams = useSearchParams();
    const compose = searchParams.get('compose') === 'true';
    const threadKey = searchParams.get('threadKey') || undefined;
    const sidebar = useSidebar();
    const [profiles, setProfiles] = useState();

    usePageView();

    useThreads();

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
                        {view === 'thread' && <ChatThread threadKey={threadKey}/>}
                        {view === 'compose' && <ChatComposer/>}
                        {view === 'blank' && <ChatBlank/>}
                    </ChatContainer>
                </Box>
            </Box>
        </>
    );
};

export default Page;
