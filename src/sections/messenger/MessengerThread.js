import { Box, CircularProgress, Avatar, Stack, Typography, IconButton, Link, useMediaQuery, alpha } from '@mui/material';
import { IconTile } from 'src/components/ctmass-ui';
import { BRAND, FONT, RADIUS } from 'src/theme/ctmass-tokens';
import { paths } from 'src/paths';
import { useEffect, useState, useLayoutEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ChevronLeftIcon from '@mui/icons-material/ArrowBackRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import BookmarkIcon from '@mui/icons-material/BookmarkRounded';
import { profileApi } from 'src/api/profile';
import { formatDistanceToNowStrict } from 'date-fns';
import { ChatMessages } from 'src/sections/dashboard/chatNew/chat-messages';
import { MessengerMessageAdd } from 'src/sections/dashboard/messenger/MessengerMessageAdd';
import { useAuth } from 'src/hooks/use-auth';
import { chatApi, isSelfThread } from 'src/api/chat/newApi';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { firestore } from 'src/libs/firebase';
import { useDispatch } from 'react-redux';
import { messengerActions } from 'src/slices/messenger';
import { openFeedbackDialog } from 'src/components/feedBack/feedback-button';

export const MessengerThread = ({
    threadId,
    messages,
    loading,
    error,
    mode,
    onBack,
    initialPeer
}) => {
    const { user } = useAuth();
    const mdUp = useMediaQuery(t => t.breakpoints.up('md'));
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [peer, setPeer] = useState(initialPeer || null);

    const handlePeerClick = useCallback(() => {
        dispatch(messengerActions.close());
        navigate(paths.specialist.publicPage.replace(':profileId', peer?.id));
    }, [dispatch, navigate, peer?.id]);

    useLayoutEffect(() => {
        if (threadId.startsWith('service:')) {
            setPeer({ id: 'system', avatar: '/assets/logo.jpg', name: 'CTMASS support', isService: true });
            return;
        }
        if (isSelfThread(threadId, user.id)) {
            setPeer({
                id: user.id,
                avatar: '/assets/logo.jpg',
                name: 'Saved Messages',
                isSelf: true
            });
            return;
        }
        if (initialPeer) {
            setPeer(initialPeer);
        }
        const load = async () => {
            const thread = await chatApi.getChat(threadId);
            const users = thread?.users || [];
            const peerId = users.find(u => u !== user.id);
            if (!peerId && users.includes(user.id)) {
                setPeer({
                    id: user.id,
                    avatar: '/assets/logo.jpg',
                    name: 'Saved Messages',
                    isSelf: true
                });
                return;
            }
            if (peerId) {
                const p = await profileApi.get(peerId);
                setPeer({ id: peerId, ...p });
            }
        };
        load();
    }, [threadId, user.id]);

    useEffect(() => {
        if (!threadId) return;
        const q = query(
            collection(firestore, 'Chat', threadId, 'messages'),
            orderBy('createdAt', 'asc')
        );
        const toMillis = (v) => (v?.toMillis ? v.toMillis() : v ?? null);
        const unsub = onSnapshot(q, snap => {
            const msgs = snap.docs.map(d => {
                const data = d.data();
                const created = toMillis(data.createdAt) ?? toMillis(data.timestamp) ?? Date.now();
                return {
                    id: d.id,
                    ...data,
                    createdAt: created,
                    timestamp: toMillis(data.timestamp)
                };
            }
            );

            const unread = msgs.filter(
                m => !m.isRead && m.senderId !== user.id
            ).length;

            dispatch(
                messengerActions.fetchMessagesSuccess({
                    threadId,
                    messages: msgs
                })
            );

            dispatch(
                messengerActions.updateThreadUnread({
                    threadId,
                    unreadCount: unread
                })
            );
        });
        return () => unsub();
    }, [threadId, dispatch]);

    useEffect(() => {
        if (threadId && messages.length) {
            chatApi.markMessagesAsRead(threadId, user.id)
                .catch(console.error);
        }
    }, [threadId, messages.length, user.id]);

    const isService = peer?.isService ?? threadId.startsWith('service:');
    const isSelf = peer?.isSelf ?? isSelfThread(threadId, user.id);

    const handleOpenContact = useCallback(() => {
        dispatch(messengerActions.close());
        navigate(paths.contact);
    }, [dispatch, navigate]);

    const handleOpenFeedback = useCallback(() => {
        dispatch(messengerActions.close());
        openFeedbackDialog();
    }, [dispatch]);

    const participants = useMemo(() => {
        const base = [
            { id: user.id, avatar: user.avatar, name: user.name || user.email }
        ];
        if (peer) {
            base.push({
                id: peer.id,
                avatar: peer.avatar || '/assets/default-avatar.png',
                name: peer.businessName || peer.name || peer.email
            });
        }
        return base;
    }, [user, peer]);

    const handleSend = useCallback(
        async (body, files) => {
            if (!peer) return;
            const participantIds = isSelf ? [user.id] : [user.id, peer.id];
            await chatApi.sendMessangerMessage(threadId, user.id, body, files, participantIds);
        },
        [threadId, user.id, peer, isSelf]
    );

    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'auto' });
        }
        if (inputRef.current && mdUp) {
            inputRef.current.focus();
        }
    }, [messages.length, threadId, mdUp]);

    if (loading) return <CircularProgress sx={{ m: 2 }} />;
    if (error) return <Box sx={{ p: 2 }}>{error}</Box>;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
            {peer && (
                <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{
                        px: { xs: 1.5, md: 2.5 },
                        pr: { md: 8 },
                        pt: { xs: 'calc(env(safe-area-inset-top) + 10px)', md: 1.75 },
                        pb: 1.5,
                        borderBottom: `1px solid ${alpha(BRAND.navy, 0.08)}`,
                        bgcolor: '#FFFFFF',
                        flexShrink: 0
                    }}
                >
                    {!mdUp && (
                        <IconButton aria-label="Back to chats" onClick={onBack} sx={{ color: BRAND.navy }}>
                            <ChevronLeftIcon />
                        </IconButton>
                    )}
                    {isSelf ? (
                        <IconTile size={42} tone="navy" sx={{ borderRadius: '50%' }}><BookmarkIcon /></IconTile>
                    ) : (
                        <Avatar
                            src={peer.avatar || '/assets/default-avatar.png'}
                            sx={{ width: 42, height: 42, flexShrink: 0 }}
                        />
                    )}
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        {isService || isSelf ? (
                            <Typography noWrap sx={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 16, color: BRAND.navy }}>
                                {isService ? 'CTMASS support' : 'Saved messages'}
                            </Typography>
                        ) : (
                            <Typography
                                component="button"
                                type="button"
                                noWrap
                                onClick={handlePeerClick}
                                sx={{
                                    display: 'block',
                                    maxWidth: '100%',
                                    p: 0,
                                    border: 0,
                                    bgcolor: 'transparent',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    fontFamily: FONT.display,
                                    fontWeight: 700,
                                    fontSize: 16,
                                    color: BRAND.navy,
                                    '&:hover': { textDecoration: 'underline' }
                                }}
                            >
                                {peer.businessName || peer.name || peer.email}
                            </Typography>
                        )}
                        <Typography noWrap sx={{ fontSize: 12, fontWeight: 500, color: BRAND.muted }}>
                            {isService
                                ? 'Official notifications channel'
                                : isSelf
                                    ? 'Notes, links and files for yourself'
                                    : peer.lastActivity
                                        ? `Active ${formatDistanceToNowStrict(peer.lastActivity, { addSuffix: true })}`
                                        : 'Open profile'}
                        </Typography>
                    </Box>
                </Stack>
            )}

            <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', px: { xs: 1.5, md: 2.5 }, pt: 2 }}>
                {isService && (
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 1.25,
                            alignItems: 'flex-start',
                            p: 2,
                            mb: 2,
                            borderRadius: RADIUS.inner,
                            bgcolor: '#FFFFFF',
                            border: `1px solid ${alpha(BRAND.navy, 0.08)}`
                        }}
                    >
                        <InfoOutlinedIcon
                            fontSize="small"
                            sx={{ color: BRAND.navy, mt: '2px', flexShrink: 0 }}
                        />
                        <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                                This is a service channel
                            </Typography>
                            <Typography variant="caption" color="text.secondary" component="div" sx={{ lineHeight: 1.5 }}>
                                We use it to send you personal notifications and product updates. You can't reply here.
                                <br />
                                To reach us with a question, use the{' '}
                                <Link
                                    component="button"
                                    type="button"
                                    onClick={handleOpenContact}
                                    sx={{ verticalAlign: 'baseline' }}
                                >
                                    contact page
                                </Link>
                                {'. '}
                                Ran into a bug? Submit a report via the{' '}
                                <Link
                                    component="button"
                                    type="button"
                                    onClick={handleOpenFeedback}
                                    sx={{ verticalAlign: 'baseline' }}
                                >
                                    feedback form
                                </Link>
                                {' '}and we will get back to you shortly.
                            </Typography>
                        </Box>
                    </Box>
                )}
                <ChatMessages
                    messages={messages}
                    participants={participants}
                    showUserInfo
                />
                <Box ref={bottomRef} />
            </Box>

            {!isService && (
                <>
                    <Box sx={{ borderTop: `1px solid ${alpha(BRAND.navy, 0.08)}` }} />
                    <MessengerMessageAdd
                        inputRef={inputRef}
                        onSend={handleSend}
                        templatesEnabled={mode === 'projects'}
                    />
                </>
            )}
        </Box>
    );
};