import { Box, CircularProgress, Divider, Avatar, Stack, Typography, Link, IconButton, useMediaQuery } from '@mui/material';
import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { profileApi } from 'src/api/profile';
import { formatDistanceToNowStrict } from 'date-fns';
import { ChatMessages } from 'src/sections/dashboard/chatNew/chat-messages';
import { MessengerMessageAdd } from 'src/sections/dashboard/messenger/MessengerMessageAdd';
import { useAuth } from 'src/hooks/use-auth';
import { chatApi } from 'src/api/chat/newApi';

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

    const [peer, setPeer] = useState(null);
    useEffect(() => {
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

    const participants = useMemo(() => {
        if (!peer) return [];
        return [
            { id: user.id, avatar: user.avatar, name: user.name || user.email },
            {
                id: peer.id, avatar: peer.avatar || '/assets/default-avatar.png',
                name: peer.businessName || peer.name || peer.email
            }
        ];
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
                    spacing={2}
                    alignItems="center"
                    sx={{ p: 2, borderBottom: t => `1px solid ${t.palette.divider}` }}
                >
                    {!mdUp && (
                        <IconButton onClick={onBack} size="large">
                            <ChevronLeftIcon />
                        </IconButton>
                    )}
                    <Avatar src={peer.avatar || '/assets/default-avatar.png'} />
                    <Box sx={{ minWidth: 0 }}>
                        <Link href={`/cabinet/profiles/${peer.id}`} underline="hover" target="_blank" rel="noopener">
                            <Typography variant="subtitle2" noWrap>
                                {peer.businessName || peer.name || peer.email || ''}
                            </Typography>
                        </Link>
                        <Typography variant="caption" color="text.secondary" noWrap>
                            {peer.email || ''}
                        </Typography>
                        {peer.lastActivity && (
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
                inputRef={inputRef}
                onSend={handleSend}
                templatesEnabled={mode === 'projects'}
            />
        </Box>
    );
};