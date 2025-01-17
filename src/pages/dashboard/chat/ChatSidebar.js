import React, {useState} from 'react';
import {Box, Typography, CircularProgress, Avatar, Button, Grid} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const ChatSidebar = ({
                         loading,
                         clients,
                         auth,
                         setSelectedChat,
                         markMessagesAsRead,
                         getUnreadMessageCount,
                         setOpenDialog,
                         threads,
                         selectedChat,
                         lgUp
                     }) => {

    const [selectedContactId, setSelectedContactId] = useState(null);

    const sortedThreads = threads
        .slice() // Создаём копию массива, чтобы не мутировать оригинал
        .sort((a, b) => {
            const updatedA = a.updatedAt || 0; // Преобразуем updatedAt в миллисекунды
            const updatedB = b.updatedAt || 0; // Преобразуем updatedAt в миллисекунды
            return updatedB - updatedA; // Сортируем от новых к старым
        });
    return (
        (lgUp || !selectedChat) && (
            <Grid item xs={12} sm={4}>
                <Box
                    sx={{
                        padding: 2,
                        borderRight: 1,
                        borderColor: "divider",
                        backgroundColor: "#fff",
                        borderRadius: 2,
                        height: "90vh",
                        display: "flex",
                        flexDirection: "column",
                        border: "1px solid #d3d3d3",
                    }}
                >
                    <Typography
                        variant="h6"
                        gutterBottom
                        sx={{
                            mb: 3,
                        }}
                    >
                        Contacts
                    </Typography>
                    {loading ? (
                        <CircularProgress/>
                    ) : (
                        sortedThreads.map((thread) => {
                            // Находим контакт, связанный с текущим чатом
                            const contact = clients.find(
                                (client) =>
                                    thread.users.includes(client.id) && client.id !== auth.user.id
                            );

                            // Пропускаем, если контакт не найден
                            if (!contact) return null;

                            const unreadCount = getUnreadMessageCount(thread, auth.user.id);

                            return (
                                <Box
                                    key={thread.id} // Используем уникальный ключ
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        mb: 2,
                                        cursor: "pointer",
                                        p: 1,
                                        borderRadius: 2,
                                        position: "relative",
                                        backgroundColor:
                                            selectedContactId === contact.id ? "#e3f2fd" : "transparent",
                                        "&:hover": {
                                            backgroundColor:
                                                selectedContactId === contact.id
                                                    ? "#e3f2fd"
                                                    : "rgba(0, 0, 0, 0.1)",
                                        },
                                    }}
                                    onClick={() => {
                                        setSelectedChat(thread); // Устанавливаем выбранный чат
                                        setSelectedContactId(contact.id); // Обновляем выбранный контакт
                                        markMessagesAsRead(thread.id, thread, auth.user.id); // Помечаем сообщения как прочитанные
                                    }}
                                >
                                    <Avatar src={contact.avatar} sx={{mr: 2}}/>
                                    <Box sx={{flexGrow: 1}}>
                                        <Typography variant="body1">{contact.name}</Typography>
                                    </Box>
                                    {unreadCount > 0 && (
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                top: 0,
                                                right: 0,
                                                width: 16,
                                                height: 16,
                                                backgroundColor: "red",
                                                color: "white",
                                                fontSize: "12px",
                                                borderRadius: "50%",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            {unreadCount}
                                        </Box>
                                    )}
                                </Box>
                            );
                        })
                    )}
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{mt: 3}}
                        startIcon={<AddIcon/>}
                        onClick={() => setOpenDialog(true)}
                    >
                        Start New Chat
                    </Button>
                </Box>
            </Grid>
        ));
};

export default ChatSidebar;
