import { useRef, useState } from 'react';
import { Badge, Box, Dialog, Fab, IconButton, Stack, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import { useDispatch, useSelector } from 'react-redux';
import { messengerActions } from 'src/slices/messenger';
import { useAuth } from 'src/hooks/use-auth';
import { useMessengerSubscriptions } from 'src/hooks/use-messenger-subscriptions';
import { chatApi } from 'src/api/chat/newApi';
import { IconTile } from 'src/components/ctmass-ui';
import { BRAND, FONT, RADIUS, SHADOW } from 'src/theme/ctmass-tokens';
import { MessengerSidebar } from './MessengerSidebar';
import { MessengerThread } from './MessengerThread';
import { MessengerSearchDialog } from './MessengerSearchDialog';

const ThreadPlaceholder = () => (
    <Stack alignItems="center" justifyContent="center" sx={{ flexGrow: 1, px: 4, textAlign: 'center' }}>
        <IconTile size={64} tone="navy"><ForumOutlinedIcon /></IconTile>
        <Typography sx={{ mt: 2, fontFamily: FONT.display, fontWeight: 700, fontSize: 20, color: BRAND.navy }}>
            Pick a conversation
        </Typography>
        <Typography sx={{ mt: 0.75, maxWidth: 300, fontSize: 14, lineHeight: 1.55, color: BRAND.muted }}>
            Choose a chat on the left, or search for a person to start a new one.
        </Typography>
    </Stack>
);

export const MessengerModal = () => {
    const { user } = useAuth();
    const mdUp = useMediaQuery((t) => t.breakpoints.up('md'));
    const dispatch = useDispatch();
    const containerRef = useRef(null);

    const isOpen = useSelector((s) => s.messenger.isOpen);
    const tab = useSelector((s) => s.messenger.tab);
    const currentThreadId = useSelector((s) => s.messenger.currentThreadId);
    const threads = useSelector((s) => s.messenger.threads);
    const messages = useSelector((s) => s.messenger.messages[currentThreadId] || []);
    const loadingMessages = useSelector((s) => s.messenger.loadingMessages);
    const errorMessages = useSelector((s) => s.messenger.errorMessages);

    const [searchOpen, setSearchOpen] = useState(false);

    useMessengerSubscriptions(user?.id);

    const totalUnread = threads.reduce((sum, t) => sum + (Number(t.unreadCount) || 0), 0);
    const currentThread = threads.find((t) => t.id === currentThreadId);

    const handleOpen = () => dispatch(messengerActions.open());
    const handleClose = () => dispatch(messengerActions.close());
    const handleSelect = async (idOrUser) => {
        const exists = threads.find((t) => t.id === idOrUser);
        if (exists) {
            dispatch(messengerActions.selectThread(idOrUser));
        } else if (idOrUser === user.id) {
            const chatId = await chatApi.getOrCreateSelfThreadForUser(user.id);
            dispatch(messengerActions.selectThread(chatId));
        } else {
            const chatId = await chatApi.startChat(user.id, idOrUser);
            dispatch(messengerActions.selectThread(chatId));
        }
        setSearchOpen(false);
    };

    return (
        <>
            <Box
                sx={{
                    position: 'fixed',
                    right: { xs: 16, md: 24 },
                    bottom: { xs: 'calc(22px + var(--ctmass-floating-offset, 0px) + var(--ctmass-counter-offset, 0px))', md: 'calc(26px + var(--ctmass-floating-offset, 0px))' },
                    zIndex: (t) => t.zIndex.speedDial,
                    transition: 'bottom .3s cubic-bezier(.2,.8,.2,1), opacity .2s ease, transform .2s ease',
                    opacity: isOpen ? 0 : 1,
                    transform: isOpen ? 'scale(0.85)' : 'none',
                    pointerEvents: isOpen ? 'none' : 'auto'
                }}
            >
                <Tooltip title="Messages" placement="left" disableTouchListener>
                    <Badge
                        overlap="circular"
                        badgeContent={totalUnread || null}
                        invisible={!totalUnread}
                        sx={{
                            '& .MuiBadge-badge': {
                                pointerEvents: 'none',
                                zIndex: 2,
                                bgcolor: BRAND.danger,
                                color: '#FFFFFF',
                                fontWeight: 800,
                                border: '2px solid #FFFFFF',
                                minWidth: 22,
                                height: 22
                            }
                        }}
                    >
                        <Fab
                            aria-label={totalUnread ? `Messages, ${totalUnread} unread` : 'Messages'}
                            onClick={handleOpen}
                            sx={{
                                width: 58,
                                height: 58,
                                zIndex: 1,
                                color: '#FFFFFF',
                                background: `linear-gradient(150deg, ${BRAND.navy} 0%, ${BRAND.navyDeep} 100%)`,
                                boxShadow: SHADOW.lg,
                                transition: 'transform .2s ease, box-shadow .2s ease',
                                '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 20px 40px ${alpha(BRAND.navy, 0.35)}` },
                                '&:active': { transform: 'scale(0.96)' },
                                '&:focus-visible': { outline: `3px solid ${BRAND.green}`, outlineOffset: 3 }
                            }}
                        >
                            <ChatRoundedIcon />
                        </Fab>
                    </Badge>
                </Tooltip>
            </Box>

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
                    elevation: 0,
                    sx: {
                        borderRadius: mdUp ? RADIUS.panel : 0,
                        overflow: 'hidden',
                        width: mdUp ? 1000 : '100%',
                        maxWidth: mdUp ? 'calc(100vw - 48px)' : '100%',
                        m: mdUp ? 'auto' : 0,
                        border: mdUp ? `1px solid ${alpha(BRAND.navy, 0.08)}` : 'none',
                        boxShadow: SHADOW.lg,
                        backgroundImage: 'none'
                    }
                }}
            >
                {!mdUp && !currentThreadId && (
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{
                            px: 2,
                            pt: 'calc(env(safe-area-inset-top) + 12px)',
                            pb: 1.5,
                            borderBottom: `1px solid ${alpha(BRAND.navy, 0.08)}`,
                            bgcolor: '#FFFFFF'
                        }}
                    >
                        <Typography component="h2" sx={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', color: BRAND.navy }}>
                            Messages
                        </Typography>
                        <Stack direction="row" spacing={0.5}>
                            <IconButton aria-label="Search people" onClick={() => setSearchOpen(true)} sx={{ color: BRAND.navy, bgcolor: alpha(BRAND.navy, 0.06) }}>
                                <SearchRoundedIcon />
                            </IconButton>
                            <IconButton aria-label="Close messages" onClick={handleClose} sx={{ color: BRAND.navy, bgcolor: alpha(BRAND.navy, 0.06) }}>
                                <CloseRoundedIcon />
                            </IconButton>
                        </Stack>
                    </Stack>
                )}

                <Box
                    ref={containerRef}
                    sx={{
                        display: 'flex',
                        flexDirection: mdUp ? 'row' : 'column',
                        width: '100%',
                        height: mdUp ? 'min(660px, calc(100dvh - 64px))' : 'auto',
                        flex: mdUp ? 'none' : '1 1 auto',
                        minHeight: 0,
                        bgcolor: '#FFFFFF',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {mdUp && (
                        <IconButton
                            aria-label="Close messages"
                            onClick={handleClose}
                            sx={{
                                position: 'absolute',
                                top: 14,
                                right: 14,
                                zIndex: 10,
                                color: BRAND.navy,
                                bgcolor: alpha('#FFFFFF', 0.9),
                                border: `1px solid ${alpha(BRAND.navy, 0.1)}`,
                                '&:hover': { bgcolor: BRAND.mist }
                            }}
                        >
                            <CloseRoundedIcon fontSize="small" />
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
                                flex: { xs: '1 1 auto', md: '1 1 auto' },
                                minWidth: 0,
                                minHeight: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                                bgcolor: BRAND.mist
                            }}
                        >
                            {currentThreadId ? (
                                <MessengerThread
                                    threadId={currentThreadId}
                                    messages={messages}
                                    loading={loadingMessages}
                                    error={errorMessages}
                                    mode={currentThread?.category || 'chats'}
                                    initialPeer={currentThread
                                        ? { id: currentThread.peerId || null, name: currentThread.name, avatar: currentThread.avatar, isService: currentThread.isService }
                                        : null}
                                    onBack={() => dispatch(messengerActions.selectThread(null))}
                                />
                            ) : (
                                mdUp && <ThreadPlaceholder />
                            )}
                        </Box>
                    )}
                </Box>
            </Dialog>
        </>
    );
};
