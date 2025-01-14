import React, { useEffect, useState } from "react";
import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    Typography,
    TextField,
} from "@mui/material";
import { useAuth } from "../../hooks/use-auth";
import {startChat, sendMessage, getThreads} from "../../chatService"; // Функция для отправки сообщений
import AddIcon from "@mui/icons-material/Add";
import { useChatData } from "../../api/chat/data";
import { profileApi } from "../../api/profile";

const Page = () => {
    const auth = useAuth(); // Получаем текущего п
    const { contacts, threads, loading, addContact } = useChatData();// ользователя
    const [openDialog, setOpenDialog] = useState(false); // Состояние диалога для выбора клиента
    const [clients, setClients] = useState([]); // Список клиентов
    const [selectedClient, setSelectedClient] = useState(null); // Выбранный клиент для нового чата
    const [loadingClients, setLoadingClients] = useState(true); // Загрузка клиентов
    const [selectedChat, setSelectedChat] = useState(null); // Выбранный чат
    const [newMessage, setNewMessage] = useState(""); // Новое сообщение

    // Загружаем список клиентов из коллекции profile
    useEffect(() => {
        const fetchClients = async () => {
            try {
                const profiles = await profileApi.getProfiles();
                setClients(profiles);
            } catch (error) {
                console.error("Ошибка при загрузке клиентов:", error);
            } finally {
                setLoadingClients(false);
            }
        };

        fetchClients();
    }, []);

    useEffect(() => {
        if (selectedChat) {
            const currentChat = threads.find((thread) => thread.id === selectedChat.id);
            setSelectedChat(currentChat || null);
        }
    }, [selectedChat, threads]);

    // Закрытие диалога
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedClient(null);
    };

    useEffect(() => {
        if (openDialog) {
            const dialogElement = document.getElementById("dialog-title");
            dialogElement?.focus();
        }
    }, [openDialog]);

    // Создание нового чата
    const handleStartChat = async () => {
        if (selectedClient) {
            try {
                const chatId = await startChat(auth.user.id, selectedClient.id); // Создаем чат
                console.log("Chat created with ID:", chatId);

                // Обновляем список контактов через addContact
                const newContact = {
                    id: selectedClient.id,
                    avatar: `/assets/avatars/avatar-${selectedClient.id}.png`, // Исправлено на строку
                    isActive: false,
                    lastActivity: Date.now(),
                    name: selectedClient.name,
                };
                addContact(newContact);

                // Открываем новый чат
                setSelectedChat({
                    id: chatId,
                    messages: [],
                    users: [auth.user.id, selectedClient.id],
                });

                handleCloseDialog(); // Закрываем диалог
            } catch (error) {
                console.error("Ошибка при создании чата:", error);
            }
        }
    };

    // Отправка нового сообщения
    const handleSendMessage = async () => {
        if (newMessage.trim() && selectedChat) {
            await sendMessage(selectedChat.id, auth.user.id, newMessage);

            // После отправки сообщения обновим список сообщений в чате
            setSelectedChat((prevChat) => ({
                ...prevChat,
                messages: [
                    ...prevChat.messages,
                    {
                        id: Date.now(), // Идентификатор для временного сообщения
                        text: newMessage,
                        senderId: auth.user.id,
                        createdAt: Date.now()
                    },
                ],
            }));

            setNewMessage(""); // Очищаем поле ввода
        }
    };


    // Получаем имя и аватар клиента из списка клиентов
    const getClientDetails = (clientId) => {
        const client = clients.find((client) => client.id === clientId);
        return client ? client : { name: "Unknown", avatar: "" };
    };

    return (
        <Box
            component="main"
            sx={{
                flexGrow: 1,
                backgroundColor: "neutral.50",
                pb: "40px",
                pt: "60px",
                minHeight: "100vh",
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={2}>
                    {/* Список чатов */}
                    <Grid item xs={12} sm={4}>
                        <Box
                            sx={{
                                padding: 2,
                                borderRight: 1,
                                borderColor: "divider",
                                backgroundColor: "#f9f9f9",
                                borderRadius: 2,
                            }}
                        >
                            <Typography variant="h6" gutterBottom>
                                Contacts
                            </Typography>
                            {loading ? (
                                <CircularProgress />
                            ) : (
                                contacts.map((contact) => (
                                    <Box
                                        key={contact.id}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            mb: 2,
                                            cursor: "pointer",
                                            p: 1,
                                            borderRadius: 2,
                                            "&:hover": {
                                                backgroundColor: "rgba(0, 0, 0, 0.1)",
                                            },
                                        }}
                                        onClick={() => {
                                            const chatThread = threads.find((thread) =>
                                                thread.users.includes(contact.id)
                                            );
                                            setSelectedChat(chatThread || null);
                                        }}// Открытие диалога при клике на контакт
                                    >
                                        <Avatar src={contact.avatar} sx={{ mr: 2 }} />
                                        <Typography variant="body1" sx={{ flexGrow: 1 }}>
                                            {contact.name}
                                        </Typography>
                                    </Box>
                                ))
                            )}
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                sx={{ mt: 3 }}
                                startIcon={<AddIcon />}
                                onClick={() => setOpenDialog(true)} // Открываем диалог выбора клиента
                            >
                                Start New Chat
                            </Button>
                        </Box>
                    </Grid>

                    {/* Выбранный чат */}
                    <Grid item xs={12} sm={8}>
                        {/* Если выбран чат */}
                        {selectedChat ? (
                            <Box sx={{ backgroundColor: "#fff", p: 3, borderRadius: 2 }}>
                                <Typography variant="h5" gutterBottom>
                                    Chat with {getClientDetails(selectedChat.users.find(id => id !== auth.user.id)).name}
                                </Typography>

                                {/* Сообщения */}
                                <Box
                                    sx={{
                                        maxHeight: 400,
                                        overflowY: "auto",
                                        mb: 2,
                                        p: 2,
                                        backgroundColor: "#f5f5f5",
                                        borderRadius: 2,
                                    }}
                                >
                                    {selectedChat.messages.length === 0 ? (
                                        <Typography variant="body2" color="textSecondary">
                                            No messages yet. Start chatting!
                                        </Typography>
                                    ) : (
                                        selectedChat.messages.map((msg) => {
                                            const sender = getClientDetails(msg.senderId);
                                            return (
                                                <Box
                                                    key={msg.id}
                                                    sx={{
                                                        mb: 2,
                                                        display: "flex",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <Avatar src={sender.avatar} sx={{ mr: 2 }} />
                                                    <Box>
                                                        <Typography variant="body1">
                                                            {sender.name}
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            {msg.text}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            );
                                        })
                                    )}
                                </Box>

                                {/* Поле ввода сообщения */}
                                <TextField
                                    label="Type a message"
                                    variant="outlined"
                                    fullWidth
                                    multiline
                                    rows={4}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim()}
                                >
                                    Send
                                </Button>
                            </Box>
                        ) : (
                            <Typography variant="body1">Select or create a chat to start messaging.</Typography>
                        )}
                    </Grid>
                </Grid>
            </Container>

            {/* Диалог для выбора клиента */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth>
                <DialogTitle>Select a Client</DialogTitle>
                <DialogContent>
                    {loadingClients ? (
                        <CircularProgress />
                    ) : (
                        <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
                            {clients.map((client) => (
                                <Box
                                    key={client.id}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        mb: 2,
                                        cursor: "pointer",
                                        p: 1,
                                        borderRadius: 2,
                                        backgroundColor:
                                            selectedClient?.id === client.id
                                                ? "rgba(0, 0, 0, 0.1)"
                                                : "transparent",
                                        "&:hover": {
                                            backgroundColor: "rgba(0, 0, 0, 0.05)",
                                        },
                                    }}
                                    onClick={() => setSelectedClient(client)}
                                >
                                    <Avatar src={client.avatar} sx={{ mr: 2 }} />
                                    <Typography variant="body1">{client.name}</Typography>
                                </Box>
                            ))}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="secondary">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleStartChat}
                        color="primary"
                        disabled={!selectedClient}
                    >
                        Start Chat
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Page;
