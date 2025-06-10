import {useCallback, useState} from 'react';
import {Box, Divider} from '@mui/material';
import {useRouter} from 'src/hooks/use-router';
import {paths} from 'src/paths';
import {ChatComposerRecipients} from './chat-composer-recipients';
import {ChatMessageAdd} from './chat-message-add';
import {sendMessage, startChat} from "src/chatService";
import {useAuth} from "src/hooks/use-auth";

const useRecipients = () => {
    const [recipients, setRecipients] = useState([]);

    const handleRecipientAdd = useCallback((recipient) => {
        setRecipients((prevState) => {
            const found = prevState.find((_recipient) => _recipient.id === recipient.id);

            if (found) {
                return prevState;
            }

            return [...prevState, recipient];
        });
    }, []);

    const handleRecipientRemove = useCallback((recipientId) => {
        setRecipients((prevState) => {
            return prevState.filter((recipient) => recipient.id !== recipientId);
        });
    }, []);

    return {
        handleRecipientAdd,
        handleRecipientRemove,
        recipients
    };
};

export const ChatComposer = (props) => {
    const {user} = useAuth();
    const router = useRouter();
    const {handleRecipientAdd, handleRecipientRemove, recipients} = useRecipients();

    const handleSend = useCallback(async (body) => {
        if (!user?.id || recipients.length === 0) return;

        try {
            // Создаем или получаем существующий чат
            const recipientIds = recipients.map(r => r.id);
            const chatId = await startChat(user.id, recipientIds[0]); // Для групповых чатов нужно модифицировать

            // Отправляем сообщение
            await sendMessage(chatId, user.id, body);

            // Перенаправляем в чат
            router.push(`${paths.dashboard.chat}?threadKey=${chatId}`);

        } catch (err) {
            console.error('Send message failed:', err);
            // Можно добавить обработку ошибок
        }
    }, [user, recipients, router]);

    const canAddMessage = recipients.length > 0;

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1
            }}
            {...props}>
            <ChatComposerRecipients
                onRecipientAdd={handleRecipientAdd}
                onRecipientRemove={handleRecipientRemove}
                recipients={recipients}
            />
            <Divider/>
            <Box sx={{flexGrow: 1}}/>
            <Divider/>
            <ChatMessageAdd
                disabled={!canAddMessage}
                onSend={handleSend}
            />
        </Box>
    );
};
