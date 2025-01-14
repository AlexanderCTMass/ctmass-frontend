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
    Grid,
    Typography,
    TextField,
} from "@mui/material";
import { useAuth } from "../../hooks/use-auth";
import { startChat, sendMessage } from "../../chatService";
import AddIcon from "@mui/icons-material/Add";
import { useChatData } from "../../api/chat/data";
import { profileApi } from "../../api/profile";
import dayjs from "dayjs";

const Page = () => {
    const auth = useAuth();
    const { contacts, threads, loading, addContact } = useChatData();
    const [openDialog, setOpenDialog] = useState(false);
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [loadingClients, setLoadingClients] = useState(true);
    const [selectedChat, setSelectedChat] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [unreadMessages, setUnreadMessages] = useState({});

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

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedClient(null);
    };

    const handleStartChat = async () => {
        if (selectedClient) {
            const existingThread = threads.find((thread) =>
                thread.users.includes(auth.user.id) && thread.users.includes(selectedClient.id)
            );

            if (existingThread) {
                setSelectedChat(existingThread);
                handleCloseDialog(); // Закрытие диалогового окна, если чат уже существует
                setSelectedClient(null); // Обновление состояния для клиента
            } else {
                try {
                    const chatId = await startChat(auth.user.id, selectedClient.id);
                    addContact({
                        id: selectedClient.id,
                        avatar: `/assets/avatars/avatar-${selectedClient.id}.png`,
                        isActive: false,
                        lastActivity: Date.now(),
                        name: selectedClient.name,
                    });
                    setSelectedChat({
                        id: chatId,
                        messages: [],
                        users: [auth.user.id, selectedClient.id],
                    });
                    handleCloseDialog();
                } catch (error) {
                    console.error("Ошибка при создании чата:", error);
                }
            }
        }
    };

    const handleSendMessage = async () => {
        if (newMessage.trim() && selectedChat) {
            const message = {
                text: newMessage,
                senderId: auth.user.id,
                createdAt: Date.now(),
            };
            await sendMessage(selectedChat.id, auth.user.id, newMessage);

            setSelectedChat((prevChat) => ({
                ...prevChat,
                messages: [...prevChat.messages, message],
            }));

            setNewMessage("");
        }
    };

    const handleKeyPress = (e) => {
        if (e.ctrlKey && e.key === "Enter") {
            handleSendMessage();
        }
    };

    const getClientDetails = (clientId) => {
        const client = clients.find((client) => client.id === clientId);
        return client ? client : { name: "Unknown", avatar: "" };
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const messagesEndRef = React.useRef(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [selectedChat?.messages]);

    const getUnreadMessageCount = (chatId) => {
        const chat = threads.find((thread) => thread.id === chatId);
        if (!chat) return 0;
        return chat.messages.filter((msg) => !msg.isRead && msg.senderId !== auth.user.id).length;
    };

    // Функция для разделения сообщений по датам
    const formatDate = (timestamp) => {
        const date = dayjs(timestamp);
        return date.format("MMMM D, YYYY");
    };

    const [selectedContactId, setSelectedContactId] = useState(null);

    const handleMessageNotification = (chatId) => {
        const chat = threads.find((thread) => thread.id === chatId);
        if (chat) {
            const unreadCount = getUnreadMessageCount(chatId);
            if (unreadCount > 0) {
                setUnreadMessages((prev) => ({
                    ...prev,
                    [chatId]: unreadCount,
                }));
            }
        }
    };

    // Фильтруем клиентов, чтобы отображать только тех, с кем есть активные чаты
    const activeChatsClients = clients.filter((client) => {
        // Проверка на существование threads и clients
        return (
            threads &&
            threads.some((thread) =>
                thread.users && thread.users.includes(auth.user.id) && thread.users.includes(client.id) && client.id !== auth.user.id
            )
        );
    });
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
                    <Grid item xs={12} sm={4}>
                        <Box
                            sx={{
                                padding: 2,
                                borderRight: 1,
                                borderColor: "divider",
                                backgroundColor: "#f7f7f7",
                                borderRadius: 2,
                                height: "100vh",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <Typography variant="h6" gutterBottom>
                                Contacts
                            </Typography>
                            {loading ? (
                                <CircularProgress />
                            ) : (
                                activeChatsClients.map((contact) => (
                                    <Box
                                        key={contact.id}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            mb: 2,
                                            cursor: "pointer",
                                            p: 1,
                                            borderRadius: 2,
                                            position: "relative",
                                            backgroundColor: selectedContactId === contact.id ? "#e3f2fd" : "transparent",
                                            "&:hover": {
                                                backgroundColor: selectedContactId === contact.id ? "#e3f2fd" : "rgba(0, 0, 0, 0.1)",
                                            },
                                        }}
                                        onClick={() => {
                                            const chatThread = threads.find((thread) =>
                                                thread.users.includes(contact.id)
                                            );
                                            if (chatThread) {
                                                setSelectedChat(chatThread);
                                                setSelectedContactId(contact.id);
                                                handleCloseDialog(); // Закрываем диалоговое окно при выборе чата
                                            } else {
                                                setSelectedClient(contact);
                                                setOpenDialog(true);
                                            }
                                        }}
                                    >
                                        <Avatar src={contact.avatar} sx={{ mr: 2 }} />
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="body1">{contact.name}</Typography>
                                        </Box>
                                        {getUnreadMessageCount(contact.id) > 0 && (
                                            <Box
                                                sx={{
                                                    position: "absolute",
                                                    top: 0,
                                                    right: 0,
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: "50%",
                                                    backgroundColor: "red",
                                                    border: "2px solid white",
                                                }}
                                            />
                                        )}
                                    </Box>
                                ))
                            )}
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                sx={{ mt: 3 }}
                                startIcon={<AddIcon />}
                                onClick={() => setOpenDialog(true)}
                            >
                                Start New Chat
                            </Button>
                        </Box>
                    </Grid>

                    <Grid item xs={12} sm={8}>
                        {selectedChat ? (
                            <Box sx={{ backgroundColor: "#fff", p: 3, borderRadius: 2, height: "100%" }}>
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <Avatar
                                        src={getClientDetails(selectedChat.users.find((id) => id !== auth.user.id)).avatar}
                                        sx={{ mr: 1.2, ml: 1.2 }}
                                    />
                                    <Typography variant="h5" gutterBottom>
                                        {getClientDetails(selectedChat.users.find((id) => id !== auth.user.id)).name}
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        maxHeight: "calc(100vh - 180px)",
                                        overflowY: "auto",
                                        mb: 2,
                                        p: 2,
                                    }}
                                >
                                    {selectedChat.messages.length === 0 ? (
                                        <Typography variant="body2" color="textSecondary">
                                            No messages yet. Start chatting!
                                        </Typography>
                                    ) : (
                                        selectedChat.messages
                                            .slice()
                                            .sort((a, b) => a.createdAt - b.createdAt)
                                            .map((message, idx) => (
                                                <Box key={idx}>
                                                    {idx === 0 ||
                                                    formatDate(message.createdAt) !== formatDate(
                                                        selectedChat.messages[idx - 1].createdAt
                                                    ) ? (
                                                        <Typography
                                                            variant="caption"
                                                            color="textSecondary"
                                                            sx={{
                                                                textAlign: "center",
                                                                mt: 3,
                                                                mb: 1,
                                                                fontWeight: "bold",
                                                                textDecoration: "underline",
                                                            }}
                                                        >
                                                            {formatDate(message.createdAt)}
                                                        </Typography>
                                                    ) : null}
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            justifyContent: message.senderId === auth.user.id ? "flex-end" : "flex-start",
                                                            mb: 2,
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                backgroundColor: message.senderId === auth.user.id ? "#dcf8c6" : "#e4e6eb",
                                                                color: message.senderId === auth.user.id ? "black" : "inherit",
                                                                padding: "10px 15px",
                                                                borderRadius: "20px",
                                                                maxWidth: "80%",
                                                                display: "inline-block",
                                                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    wordBreak: "break-word",
                                                                }}
                                                            >
                                                                {message.text}
                                                            </Typography>
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    display: "block",
                                                                    textAlign: "right",
                                                                    color: "text.secondary",
                                                                    mt: 1,
                                                                }}
                                                            >
                                                                {formatTime(message.createdAt)}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            ))
                                    )}
                                    <div ref={messagesEndRef} />
                                </Box>

                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        sx={{ mr: 2 }}
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
                            </Box>
                        ) : (
                            <Typography variant="body1">Select a chat to start messaging</Typography>
                        )}
                    </Grid>
                </Grid>
            </Container>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle id="dialog-title" tabIndex={-1}>
                    Choose a client to chat with
                </DialogTitle>
                <DialogContent>
                    {loadingClients ? (
                        <CircularProgress />
                    ) : (
                        clients
                            .filter((client) => client.id !== auth.user.id) // Исключаем самого себя
                            .map((client) => (
                                <Box
                                    key={client.id}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        cursor: "pointer",
                                        mb: 2,
                                        p: 1,
                                        borderRadius: 1,
                                        backgroundColor: selectedClient?.id === client.id ? "#e3f2fd" : "transparent",
                                        "&:hover": {
                                            backgroundColor: "rgba(0, 0, 0, 0.1)",
                                        },
                                    }}
                                    onClick={() => setSelectedClient(client)}
                                >
                                    <Avatar src={`/assets/avatars/avatar-${client.id}.png`} sx={{ mr: 2 }} />
                                    <Typography>{client.name}</Typography>
                                </Box>
                            ))
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleStartChat} color="primary" disabled={!selectedClient}>
                        Start Chat
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Page;
