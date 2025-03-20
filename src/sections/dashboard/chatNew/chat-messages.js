import PropTypes from 'prop-types';
import {Stack, useMediaQuery} from '@mui/material';
import {ChatMessage} from './chat-message';
import {useAuth} from "src/hooks/use-auth";
import {getValidDate} from "src/utils/date-locale";

const getAuthor = (message, participants, user) => {
    if (!message || !participants || !user) {
        return {
            name: 'Unknown',
            avatar: '',
            isUser: false
        };
    }

    const participant = participants.find((p) => p.id === message.senderId);

    if (!participant) {
        return {
            name: 'Unknown',
            avatar: '',
            isUser: false
        };
    }

    // Если сообщение от текущего пользователя
    if (message.senderId === user.id) {
        return {
            name: 'Me',
            avatar: user.avatar || '/assets/default-avatar.png',
            isUser: true
        };
    }

    return {
        avatar: participant.avatar || '/assets/default-avatar.png',
        name: participant.businessName || participant.name || participant.email,
        isUser: false
    };
};

export const ChatMessages = (props) => {
    const {messages = [], participants = [], showUserInfo = true, ...other} = props;
    const {user} = useAuth(); // Используем реального пользователя
    const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));

    return (
        <Stack
            spacing={2}
            sx={mdUp ? {p: 3} :{p: 0}}
            {...other}>
            {messages.map((message) => {
                const author = getAuthor(message, participants, user);
                return (
                    <ChatMessage
                        showUserInfo={showUserInfo}
                        key={message.id}
                        authorAvatar={author.avatar}
                        authorName={author.name}
                        body={message.text}
                        attachments={message.attachments}
                        createdAt={message.createdAt}
                        position={author.isUser ? 'right' : 'left'}
                        isRead={message.isRead}
                    />
                );
            })}
        </Stack>
    );
};

ChatMessages.propTypes = {
    messages: PropTypes.array,
    participants: PropTypes.array
};
