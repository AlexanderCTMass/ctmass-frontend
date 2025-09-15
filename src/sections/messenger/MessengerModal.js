import { useMemo, useRef, useState } from 'react';
import {
    Badge, Box, Dialog, Fab, IconButton, Stack, SvgIcon,
    Tabs, Tab, Tooltip, useMediaQuery
} from '@mui/material';
import MessageDotsSquareIcon from '@untitled-ui/icons-react/build/esm/MessageDotsSquare';
import SearchMdIcon from '@untitled-ui/icons-react/build/esm/SearchMd';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import { useDispatch, useSelector } from 'react-redux';
import { messengerActions } from 'src/slices/messenger';
import { useAuth } from 'src/hooks/use-auth';
import { useMessengerSubscriptions } from 'src/hooks/use-messenger-subscriptions';
import { chatApi } from 'src/api/chat/newApi';
import { MessengerSidebar } from './MessengerSidebar';
import { MessengerThread } from './MessengerThread';
import { ChatBlank } from 'src/sections/dashboard/chatNew/chat-blank';
import { MessengerSearchDialog } from './MessengerSearchDialog';

export const MessengerModal = () => {
    const { user } = useAuth();
    const mdUp = useMediaQuery((t) => t.breakpoints.up('md'));
    const dispatch = useDispatch();
    const containerRef = useRef(null);

    const isOpen = useSelector((s) => s.messenger.isOpen);
    const tab = useSelector((s) => s.messenger.tab);
    const currentThreadId = useSelector((s) => s.messenger.currentThreadId);
    const unread = useSelector((s) => s.messenger.unread);
    const threads = useSelector((s) => s.messenger.threads);
    const messages = useSelector((s) => s.messenger.messages[currentThreadId] || []);
    const loadingMessages = useSelector((s) => s.messenger.loadingMessages);
    const errorMessages = useSelector((s) => s.messenger.errorMessages);

    const [searchOpen, setSearchOpen] = useState(false);

    useMessengerSubscriptions(user?.id);

    const totalUnread = unread.filter((m) => m.senderId !== user?.id).length || 0;

    const handleOpen = () => dispatch(messengerActions.open());
    const handleClose = () => dispatch(messengerActions.close());
    const handleTab = (_, v) => dispatch(messengerActions.setTab(v));
    const handleSelect = async (idOrUser) => {
        const exists = threads.find((t) => t.id === idOrUser);
        if (exists) {
            dispatch(messengerActions.selectThread(idOrUser));
        } else {
            const chatId = await chatApi.startChat(user.id, idOrUser);
            dispatch(messengerActions.selectThread(chatId));
        }
        setSearchOpen(false);
    };

    const shellStyles = useMemo(
        () => ({
            display: 'flex',
            flexDirection: mdUp ? 'row' : 'column',
            width: mdUp ? 920 : '100%',
            height: mdUp ? 600 : '100vh',
            backgroundColor: 'background.paper',
            position: 'relative'
        }),
        [mdUp]
    );

    return (
        <>
            {!isOpen && (
                <Tooltip title="Messenger">
                    <Badge
                        color="error"
                        overlap="circular"
                        badgeContent={totalUnread || null}
                        invisible={!totalUnread}
                        sx={{
                            position: 'fixed',
                            bottom: mdUp ? 96 : 80,
                            right: mdUp ? 24 : 16
                        }}
                    >
                        <Fab color="primary" onClick={handleOpen} style={{ zIndex: 1 }}>
                            <SvgIcon>
                                <MessageDotsSquareIcon />
                            </SvgIcon>
                        </Fab>
                    </Badge>
                </Tooltip>
            )}

            {!mdUp && (
                <MessengerSearchDialog
                    open={searchOpen}
                    onClose={() => setSearchOpen(false)}
                    onSelect={handleSelect}
                />
            )}

            <Dialog
                fullScreen={!mdUp}
                open={isOpen}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        borderRadius: mdUp ? 2 : 0,
                        overflow: 'hidden',
                        width: mdUp ? 920 : '100%',
                        maxWidth: mdUp ? 'calc(100vw - 48px)' : '100%',
                        m: mdUp ? 'auto' : 0
                    }
                }}
            >
                {!mdUp && (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            p: 1,
                            borderBottom: t => `1px solid ${t.palette.divider}`
                        }}
                    >
                        <IconButton onClick={() => setSearchOpen(true)} sx={{ mr: 1 }}>
                            <SvgIcon><SearchMdIcon /></SvgIcon>
                        </IconButton>
                        <IconButton onClick={handleClose}>
                            <SvgIcon><XIcon /></SvgIcon>
                        </IconButton>
                    </Box>
                )}

                <Box ref={containerRef} sx={shellStyles}>
                    {mdUp && (
                        <IconButton
                            onClick={handleClose}
                            sx={{
                                position: 'absolute',
                                top: 12,
                                right: 8,
                                zIndex: 2
                            }}
                        >
                            <SvgIcon><XIcon /></SvgIcon>
                        </IconButton>
                    )}

                    {(mdUp || !currentThreadId) && (
                        <MessengerSidebar
                            container={containerRef.current}
                            tab={tab}
                            threads={threads}
                            onSelectThread={handleSelect}
                            currentThreadId={currentThreadId}
                            mobileSearch={() => setSearchOpen(true)}
                        />
                    )}
                    {(mdUp || currentThreadId) && (
                        <Box
                            sx={{
                                flexGrow: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden'
                            }}
                        >
                            {!currentThreadId && (
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    sx={{
                                        p: 1,
                                        borderBottom: t => `1px solid ${t.palette.divider}`,
                                        flexShrink: 0,
                                        height: 48,
                                    }}
                                >
                                    <Tabs value={tab} onChange={handleTab}>
                                        <Tab label="Chats"
                                            value="chats"
                                            sx={{ px: 3, borderRadius: 2, textTransform: 'none', fontWeight: 600 }} />
                                        {/* <Tab label="Projects"
                                        value="projects"
                                        sx={{ px: 3, borderRadius: 2, textTransform: 'none', fontWeight: 600 }} /> */}
                                    </Tabs>

                                    {!mdUp && (
                                        <Tooltip title="Search">
                                            <IconButton sx={{ mr: 5 }} onClick={() => setSearchOpen(true)}>
                                                <SvgIcon><SearchMdIcon /></SvgIcon>
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Stack>
                            )}

                            {currentThreadId ? (
                                <MessengerThread
                                    threadId={currentThreadId}
                                    messages={messages}
                                    loading={loadingMessages}
                                    error={errorMessages}
                                    mode={threads.find(t => t.id === currentThreadId)?.category || 'chats'}
                                    onBack={() => dispatch(messengerActions.selectThread(null))}
                                />
                            ) : (
                                mdUp && <ChatBlank text="Choose a dialogue or start a new one" />
                            )}
                        </Box>
                    )}
                </Box>
            </Dialog>
        </>
    );
};