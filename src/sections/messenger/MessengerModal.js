import { useMemo, useRef, useState } from 'react';
import {
    Badge, Box, Dialog, Fab, IconButton, Stack, SvgIcon,
    Tabs, Tab, Tooltip, Typography, useMediaQuery, alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
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
    const theme = useTheme();
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
            width: mdUp ? 960 : '100%',
            height: mdUp ? 620 : '100vh',
            backgroundColor: 'background.paper',
            position: 'relative',
            overflow: 'hidden'
        }),
        [mdUp]
    );

    return (
        <>
            {!isOpen && (
                <Tooltip title="Messenger" style={{ zIndex: 999 }}>
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
                        <Fab
                            color="primary"
                            onClick={handleOpen}
                            style={{ zIndex: 1 }}
                            sx={{
                                boxShadow: theme.shadows[8],
                                '&:hover': {
                                    transform: 'scale(1.05)'
                                },
                                transition: 'transform 0.2s'
                            }}
                        >
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
                TransitionProps={{ onExited: () => dispatch(messengerActions.clearThread()) }}
                PaperProps={{
                    elevation: 24,
                    sx: {
                        borderRadius: mdUp ? 3 : 0,
                        overflow: 'hidden',
                        width: mdUp ? 960 : '100%',
                        maxWidth: mdUp ? 'calc(100vw - 48px)' : '100%',
                        m: mdUp ? 'auto' : 0,
                        border: mdUp ? `1px solid ${alpha(theme.palette.divider, 0.6)}` : 'none'
                    }
                }}
            >
                {!mdUp && (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            px: 2,
                            py: 1,
                            borderBottom: t => `1px solid ${t.palette.divider}`,
                            bgcolor: 'background.paper'
                        }}
                    >
                        <Typography variant="subtitle1" fontWeight={600}>
                            Messages
                        </Typography>
                        <Stack direction="row" spacing={0.5}>
                            <IconButton onClick={() => setSearchOpen(true)}>
                                <SvgIcon fontSize="small"><SearchMdIcon /></SvgIcon>
                            </IconButton>
                            <IconButton onClick={handleClose}>
                                <SvgIcon fontSize="small"><XIcon /></SvgIcon>
                            </IconButton>
                        </Stack>
                    </Box>
                )}

                <Box ref={containerRef} sx={shellStyles}>
                    {mdUp && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                zIndex: 10,
                                p: 1
                            }}
                        >
                            <IconButton
                                onClick={handleClose}
                                size="small"
                                sx={{
                                    bgcolor: alpha(theme.palette.background.paper, 0.9),
                                    backdropFilter: 'blur(4px)',
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                            >
                                <SvgIcon fontSize="small"><XIcon /></SvgIcon>
                            </IconButton>
                        </Box>
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
                                flex: { xs: '1 1 auto', md: '0 0 60%' },
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                                bgcolor: theme.palette.mode === 'dark'
                                    ? alpha(theme.palette.background.default, 0.4)
                                    : alpha(theme.palette.grey[50], 0.8)
                            }}
                        >
                            {!currentThreadId && (
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    sx={{
                                        px: 2,
                                        borderBottom: t => `1px solid ${t.palette.divider}`,
                                        flexShrink: 0,
                                        height: 56,
                                        bgcolor: 'background.paper'
                                    }}
                                >
                                    <Tabs
                                        value={tab}
                                        onChange={handleTab}
                                        sx={{
                                            '& .MuiTab-root': {
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                minWidth: 80
                                            }
                                        }}
                                    >
                                        <Tab label="Chats" value="chats" />
                                    </Tabs>

                                    {!mdUp && (
                                        <Tooltip title="Search">
                                            <IconButton size="small" sx={{ mr: 5 }} onClick={() => setSearchOpen(true)}>
                                                <SvgIcon fontSize="small"><SearchMdIcon /></SvgIcon>
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
                                    initialPeer={(() => {
                                        const t = threads.find(t => t.id === currentThreadId);
                                        if (!t) return null;
                                        return { id: t.peerId || null, name: t.name, avatar: t.avatar, isService: t.isService };
                                    })()}
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
