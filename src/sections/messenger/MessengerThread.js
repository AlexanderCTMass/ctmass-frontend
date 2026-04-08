import { Box, CircularProgress, Divider, Avatar, Stack, Typography, IconButton, useMediaQuery, alpha } from '@mui/material';
import { paths } from 'src/paths';
import { useEffect, useState, useLayoutEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { profileApi } from 'src/api/profile';
import { formatDistanceToNowStrict } from 'date-fns';
import { ChatMessages } from 'src/sections/dashboard/chatNew/chat-messages';
import { MessengerMessageAdd } from 'src/sections/dashboard/messenger/MessengerMessageAdd';
import { useAuth } from 'src/hooks/use-auth';
import { chatApi } from 'src/api/chat/newApi';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { firestore } from 'src/libs/firebase';
import { useDispatch } from 'react-redux';
import { messengerActions } from 'src/slices/messenger';

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
        if (initialPeer) {
            setPeer(initialPeer);
        }
        const load = async () => {
            const thread = await chatApi.getChat(threadId);
            const peerId = (thread?.users || []).find(u => u !== user.id);
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
        const unsub = onSnapshot(q, snap => {
            const msgs = snap.docs.map(d => {
                const data = d.data();
                let created = data.createdAt || data.timestamp || Date.now();
                if (created?.toMillis) created = created.toMillis();

                return { id: d.id, ...data, createdAt: created };
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
            await chatApi.sendMessangerMessage(threadId, user.id, body, files, [user.id, peer.id]);
        },
        [threadId, user.id, peer]
    );

    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'auto' });
        }
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [messages.length, threadId]);

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
                        px: 2,
                        py: 1.5,
                        borderBottom: t => `1px solid ${t.palette.divider}`,
                        bgcolor: 'background.paper',
                        flexShrink: 0
                    }}
                >
                    {!mdUp && (
                        <IconButton onClick={onBack} size="small" edge="start">
                            <ChevronLeftIcon />
                        </IconButton>
                    )}
                    <Avatar
                        src={peer.avatar || '/assets/default-avatar.png'}
                        sx={{
                            width: 38,
                            height: 38,
                            flexShrink: 0,
                            ...(isService && {
                                boxShadow: t => `0 0 0 2px ${alpha(t.palette.warning.main, 0.4)}`
                            })
                        }}
                    />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        {isService
                            ? <Typography variant="subtitle2" fontWeight={600}>CTMASS support</Typography>
                            : (
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={600}
                                    noWrap
                                    onClick={handlePeerClick}
                                    sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                                >
                                    {peer.businessName || peer.name || peer.email}
                                </Typography>
                            )}
                        {isService && (
                            <Typography variant="caption" color="text.secondary">
                                Official support chat
                            </Typography>
                        )}
                        {!isService && peer.lastActivity && (
                            <Typography variant="caption" color="success.main">
                                · online {formatDistanceToNowStrict(peer.lastActivity, { addSuffix: true })}
                            </Typography>
                        )}
                    </Box>
                </Stack>
            )}

            <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 2, pt: 1 }}>
                <ChatMessages
                    messages={messages}
                    participants={participants}
                    showUserInfo
                />
                <Box ref={bottomRef} />
            </Box>

            <Divider />

            <MessengerMessageAdd
                disabled={isService}
                inputRef={inputRef}
                onSend={handleSend}
                templatesEnabled={mode === 'projects'}
            />
        </Box>
    );
};