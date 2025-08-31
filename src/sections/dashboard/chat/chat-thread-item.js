import PropTypes from 'prop-types';
import { formatDistanceStrict } from 'date-fns';
import { Avatar, avatarClasses, AvatarGroup, Box, Stack, Typography } from '@mui/material';
import { useAuth } from 'src/hooks/use-auth'; // Используем реального пользователя
import { customLocale } from 'src/utils/date-locale';
import { INFO } from "src/libs/log";

const getLastMessage = (thread) => {
    return thread.messages?.[thread.messages.length - 1];
};

const getRecipients = (participants, userId) => {
    if (!participants || !userId) return [];
    return participants.filter((participant) => participant.id !== userId);
};

const getDisplayName = (recipients) => {
    if (!recipients?.length) return 'Unknown';
    return recipients
        .map((participant) => participant.businessName || participant.name || participant.email || 'Unknown')
        .join(', ');
};

const getDisplayContent = (userId, lastMessage, recipients) => {
    if (!lastMessage) return '';

    const lastSender = recipients.filter(recipients => recipients.id === lastMessage.senderId)[0];
    const author = lastMessage.senderId === userId ? 'Me: ' : (lastSender.businessName || lastSender.name) + ': ';
    let message = '';
    const strings = lastMessage.text?.split("%INFO:") || [];
    if (strings.length === 3) {
        if (lastMessage.senderId === userId) {
            message = strings[1];
        } else {
            message = strings[2];
        }
    } else {

        if (lastMessage.fileUrl) {
            message = lastMessage.fileType?.startsWith('image') ? 'Sent a photo' : 'Sent a file';
        } else {
            message = lastMessage.text || '';
        }
    }

    return `${author}${message}`;
};

const getLastActivity = (lastMessage) => {
    if (!lastMessage?.createdAt) return null;

    const timestamp = typeof lastMessage.createdAt === 'number'
        ? lastMessage.createdAt
        : lastMessage.createdAt.toMillis();

    return formatDistanceStrict(timestamp, new Date(), {
        addSuffix: false,
        locale: customLocale
    });
};

export const ChatThreadItem = (props) => {
    const { active, thread, onSelect, ...other } = props;
    const { user } = useAuth();

    const recipients = getRecipients(thread.users, user.id);
    const lastMessage = getLastMessage(thread);
    const lastActivity = getLastActivity(lastMessage);
    const displayName = getDisplayName(recipients);
    const displayContent = getDisplayContent(user?.id, lastMessage, recipients);
    const groupThread = recipients.length > 1;
    const isUnread = !!(thread.unreadCount && thread.unreadCount > 0);

    return (
        <Stack
            component="li"
            direction="row"
            onClick={onSelect}
            spacing={2}
            sx={{
                borderRadius: 2.5,
                cursor: 'pointer',
                px: 3,
                py: 2,
                '&:hover': {
                    backgroundColor: 'action.hover'
                },
                ...(active && {
                    backgroundColor: 'action.hover'
                })
            }}
            {...other}>
            <div>
                <AvatarGroup
                    max={2}
                    sx={{
                        [`& .${avatarClasses.root}`]: groupThread
                            ? {
                                height: 26,
                                width: 26,
                                '&:nth-of-type(2)': {
                                    mt: '10px'
                                }
                            }
                            : {
                                height: 36,
                                width: 36
                            }
                    }}
                >
                    {recipients.map((recipient) => (
                        <Avatar
                            key={recipient.id}
                            src={recipient.avatar || '/assets/default-avatar.png'}
                            alt={recipient.businessName || recipient.email}
                        />
                    ))}
                </AvatarGroup>
            </div>
            <Box
                sx={{
                    flexGrow: 1,
                    overflow: 'hidden'
                }}
            >
                <Typography
                    noWrap
                    variant="subtitle2"
                >
                    {displayName}
                </Typography>
                <Stack
                    alignItems="center"
                    direction="row"
                    spacing={1}
                >
                    {isUnread && (
                        <Box
                            sx={{
                                backgroundColor: 'primary.main',
                                borderRadius: '50%',
                                height: 8,
                                width: 8
                            }}
                        />
                    )}
                    <Typography
                        color="text.secondary"
                        noWrap
                        sx={{ flexGrow: 1 }}
                        variant="subtitle2"
                    >
                        {displayContent}
                    </Typography>
                </Stack>
            </Box>
            {lastActivity && (
                <Typography
                    color="text.secondary"
                    sx={{ whiteSpace: 'nowrap' }}
                    variant="caption"
                >
                    {lastActivity}
                </Typography>
            )}
        </Stack>
    );
};

ChatThreadItem.propTypes = {
    active: PropTypes.bool,
    onSelect: PropTypes.func,
    thread: PropTypes.object.isRequired
};

ChatThreadItem.defaultProps = {
    active: false
};
