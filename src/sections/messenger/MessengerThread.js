import { Box, CircularProgress, Divider, Avatar, Stack, Typography, Link, IconButton, useMediaQuery } from '@mui/material';
import { useEffect, useState, useLayoutEffect, useMemo, useRef, useCallback } from 'react';
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
    onBack
}) => {
    const { user } = useAuth();
    const mdUp = useMediaQuery(t => t.breakpoints.up('md'));
    const dispatch = useDispatch();

    const [peer, setPeer] = useState(null);

    useLayoutEffect(() => {
        const load = async () => {
            if (!threadId) return;
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

    const isService = threadId.startsWith('service:');

    const participants = useMemo(() => {
        const base = [
            { id: user.id, avatar: user.avatar, name: user.name || user.email }
        ];
        if (isService) {
            base.push({
                id: 'system',
                avatar: '/assets/logo.jpg',
                name: 'CTMASS support'
            });
        } else if (peer) {
            base.push({
                id: peer.id,
                avatar: peer.avatar || '/assets/default-avatar.png',
                name: peer.businessName || peer.name || peer.email
            });
        }
        return base;
    }, [user, peer, isService]);

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
                    spacing={2}
                    alignItems="center"
                    sx={{ p: 2, borderBottom: t => `1px solid ${t.palette.divider}` }}
                >
                    {!mdUp && (
                        <IconButton onClick={onBack} size="large">
                            <ChevronLeftIcon />
                        </IconButton>
                    )}
                    <Avatar src={isService ? '/assets/logo.jpg' : (peer.avatar || '/assets/default-avatar.png')} />
                    <Box sx={{ minWidth: 0 }}>
                        {isService
                            ? <Typography variant="subtitle2">CTMASS support</Typography>
                            : <Link href={`/cabinet/profiles/${peer.id}`} underline="hover" target="_blank"><Typography variant="subtitle2" noWrap>
                                {peer.businessName || peer.name || peer.email}
                            </Typography></Link>}
                        {!isService && <Typography variant="caption" color="text.secondary" noWrap>{peer.email}</Typography>}
                        {!isService && peer.lastActivity && (
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
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