import PropTypes from 'prop-types';
import {formatDistanceStrict} from 'date-fns';
import {Avatar, avatarClasses, AvatarGroup, Box, Stack, Typography} from '@mui/material';
import {useAuth} from 'src/hooks/use-auth'; // Используем реального пользователя
import {customLocale, getValidDate} from 'src/utils/date-locale';
import {useSelector} from "src/store";
import {styled} from "@mui/material/styles";
import {INFO} from "src/libs/log";

const UnreadBox = styled(Box)(({theme}) => ({
    '& ': {
        backgroundColor: '#44b700',
        color: '#44b700',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        position: 'relative',
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
        overflow: 'show',
        '&::after': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            animation: 'ripple 1.2s infinite ease-in-out',
            border: '1px solid currentColor',
            content: '""',
        },
    },
    '@keyframes ripple': {
        '0%': {
            transform: 'scale(.8)',
            opacity: 1,
        },
        '100%': {
            transform: 'scale(2.4)',
            opacity: 0,
        },
    },
}));

const getLastMessage = (thread) => {
    const messages = useSelector((state) => state.chatNew.messages[thread.id] || []);
    return messages?.[messages.length - 1];
};

const getUnreadMessages = (thread, userId) => {
    const messages = useSelector((state) => state.chatNew.messages[thread.id] || []);
    return messages.filter(m => m.senderId !== userId && !m.isRead);
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
    INFO("asdfsadfDS",lastMessage);
    const strings = lastMessage.text?.split("%INFO:") || [];
    if (strings.length === 3) {
        if (lastMessage.senderId === userId) {
            message = strings [1];
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
    if (!lastMessage) return null;

    return formatDistanceStrict(getValidDate(lastMessage.createdAt), new Date(), {
        addSuffix: false,
        locale: customLocale
    });
};

export const ChatThreadItem = (props) => {
    const {active, thread, onSelect, ...other} = props;
    const {user} = useAuth();

    const recipients = getRecipients(thread.users, user.id);
    const lastMessage = getLastMessage(thread);
    const lastActivity = getLastActivity(lastMessage);
    const displayName = getDisplayName(recipients);
    const displayContent = getDisplayContent(user?.id, lastMessage, recipients);
    const unreadMessages = getUnreadMessages(thread, user?.id);
    const groupThread = recipients.length > 1;
    const isUnread = unreadMessages.length > 0;
    const isRejected = thread?.rejected || false;

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
                }),
                ...(isRejected && {
                    opacity: 0.35
                })
            }}
            {...other}>
            <>
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
            </>
            <Box
                sx={{
                    flexGrow: 1,
                    overflow: 'visible'
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
                        <UnreadBox/>
                    )}
                    <Typography
                        color="text.secondary"
                        noWrap
                        sx={{
                            flexGrow: 1,
                            display: 'inline-block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            width: "180px"
                        }}
                        variant="subtitle2"
                    >
                        {isRejected ? "REJECTED" : displayContent}
                    </Typography>
                </Stack>
            </Box>
            {lastActivity && (
                <Typography
                    color="text.secondary"
                    sx={{whiteSpace: 'nowrap'}}
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
