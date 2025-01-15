import React, {useEffect, useRef, useState} from "react";
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
    IconButton,
    TextField,
    Typography,
    useMediaQuery,
} from "@mui/material";
import {useAuth} from "../../hooks/use-auth";
import {markMessagesAsReads, sendMessage, startChat} from "../../chatService";
import AddIcon from "@mui/icons-material/Add";
import {useChatData} from "../../api/chat/data";
import {profileApi} from "../../api/profile";
import dayjs from "dayjs";
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DoneIcon from '@mui/icons-material/Done';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Page = () => {
    const auth = useAuth();
    const {threads, loading, addContact} = useChatData();
    const [openDialog, setOpenDialog] = useState(false);
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [loadingClients, setLoadingClients] = useState(true);
    const [selectedChat, setSelectedChat] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));


    const [clientsMap, setClientsMap] = useState({});

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const profiles = await profileApi.getProfiles();
                setClients(profiles);

                const clientsObj = profiles.reduce((acc, client) => {
                    acc[client.id] = client;
                    return acc;
                }, {});
                setClientsMap(clientsObj);
            } catch (error) {
                console.error("Ошибка при загрузке клиентов:", error);
            } finally {
                setLoadingClients(false);
            }
        };

        fetchClients();
    }, []);

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
                updatedAt: Date.now()
            };

            // Отправляем сообщение
            await sendMessage(selectedChat.id, auth.user.id, newMessage);

            // Обновляем локальное состояние
            setSelectedChat((prevChat) => ({
                ...prevChat,
                messages: [...prevChat.messages, message],
                updatedAt: Date.now(), // Обновляем время последнего изменения
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
        return clientsMap[clientId] || {name: "Unknown", avatar: ""};
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});
    };
    useEffect(() => {
        if (selectedChat) {
            const unreadCount = getUnreadMessageCount(selectedChat, auth.user.id);

            if (unreadCount > 0) {
                markMessagesAsRead(selectedChat.id, selectedChat, auth.user.id);
            }
        }
    }, [selectedChat]);

    const getUnreadMessageCount = (chatThread, userId) => {
        return chatThread.messages.filter(
            (msg) => !msg.isRead && msg.senderId !== userId
        ).length;
    };

    const formatDate = (timestamp) => {
        const date = dayjs(timestamp);
        return date.format("MMMM D, YYYY");
    };

    const [selectedContactId, setSelectedContactId] = useState(null);

    const markMessagesAsRead = async (chatId, chatThread, userId) => {
        const updatedMessages = chatThread.messages.map((message) => {
            if (!message.isRead && message.senderId !== userId) {
                return {...message, isRead: true}; // Пометить как прочитанное
            }
            return message;
        });

        // Обновляем локальное состояние выбранного чата
        setSelectedChat((prevChat) => ({
            ...prevChat,
            messages: updatedMessages,
        }));

        try {
            await markMessagesAsReads(chatId, userId);
        } catch (error) {
            console.error("Ошибка при обновлении статуса сообщений:", error);
        }
    };

    const sortedThreads = threads
        .slice() // Создаём копию массива, чтобы не мутировать оригинал
        .sort((a, b) => {
            const updatedA = a.updatedAt || 0; // Преобразуем updatedAt в миллисекунды
            const updatedB = b.updatedAt || 0; // Преобразуем updatedAt в миллисекунды
            return updatedB - updatedA; // Сортируем от новых к старым
        });

    const handleBack = () => {
        setOpenDialog(false); // Закрываем диалог
        setSelectedChat(null); // Очищаем выбранный чат
    };


    const messagesEndRef = useRef(null);
    // Функция прокрутки вниз
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    };

    // Прокрутка вниз при изменении списка сообщений
    useEffect(() => {
        scrollToBottom();
    }, [selectedChat?.messages]);

    return (
        <Box>
            <Container maxWidth="lg">
                <Grid container spacing={2}>
                    {(lgUp || !selectedChat) && (
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
                                    overflowY: "auto", // Включаем прокрутку
                                    "&::-webkit-scrollbar": {
                                        width: "8px", // Ширина вертикальной полосы прокрутки
                                    },
                                    "&::-webkit-scrollbar-track": {
                                        background: "#f0f0f0", // Фон полосы прокрутки
                                        borderRadius: "10px", // Скругляем углы
                                    },
                                    "&::-webkit-scrollbar-thumb": {
                                        backgroundColor: "#888", // Цвет ползунка
                                        borderRadius: "10px", // Скругляем ползунок
                                        border: "2px solid #f0f0f0", // Окантовка
                                    },
                                    "&::-webkit-scrollbar-thumb:hover": {
                                        backgroundColor: "#555", // Цвет ползунка при наведении
                                    }
                                }}
                            >
                                <Typography variant="h6" gutterBottom
                                            sx={{
                                                mb: 3,
                                            }}>
                                    Contacts
                                </Typography>
                                {loading ? (
                                    <CircularProgress/>
                                ) : (
                                    sortedThreads.map((thread) => {
                                        // Находим контакт, связанный с текущим чатом
                                        const contact = clients.find((client) =>
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
                                                    backgroundColor: selectedContactId === contact.id ? "#e3f2fd" : "transparent",
                                                    "&:hover": {
                                                        backgroundColor: selectedContactId === contact.id ? "#e3f2fd" : "rgba(0, 0, 0, 0.1)",
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
                                    }))}
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
                        </Grid>)}

                    <Grid item xs={12} sm={8}>
                        {selectedChat ? (
                            <Box sx={{backgroundColor: "#fff", p: 3, borderRadius: 2, height: "100%"}}>
                                <Box sx={{display: "flex", alignItems: "center", mb: 1}}>
                                    {!lgUp && <IconButton onClick={handleBack} sx={{mr: 2}}>
                                        <ArrowBackIcon/>
                                    </IconButton>}
                                    <Avatar
                                        src={getClientDetails(selectedChat.users.find((id) => id !== auth.user.id)).avatar}
                                        sx={{mr: 1.2, ml: 1.2}}
                                    />
                                    <Typography variant="h5" gutterBottom sx={{
                                        whiteSpace: 'nowrap',  // Ожидаем, что текст будет на одной строке
                                        overflow: 'hidden',    // Обрезаем текст, если он выходит за границы
                                        textOverflow: 'ellipsis', // Добавляем многоточие в конце длинного текста
                                        maxWidth: 'calc(100% - 80px)',
                                    }}>
                                        {getClientDetails(selectedChat.users.find((id) => id !== auth.user.id)).name}
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        maxHeight: "calc(70vh)", // Высота ограничена
                                        minHeight: "calc(70vh)", // Высота ограничена
                                        overflowY: "auto", // Включаем прокрутку
                                        mb: 2,
                                        p: 2,
                                        "&::-webkit-scrollbar": {
                                            width: "8px", // Ширина полосы прокрутки
                                        },
                                        "&::-webkit-scrollbar-track": {
                                            background: "#f0f0f0", // Фон полосы прокрутки
                                            borderRadius: "10px", // Скругление углов
                                        },
                                        "&::-webkit-scrollbar-thumb": {
                                            backgroundColor: "#888", // Цвет ползунка
                                            borderRadius: "10px", // Скругление ползунка
                                            border: "2px solid #f0f0f0", // Окантовка
                                        },
                                        "&::-webkit-scrollbar-thumb:hover": {
                                            backgroundColor: "#555", // Цвет ползунка при наведении
                                        }
                                    }}
                                >
                                    {selectedChat.messages.length === 0 ? (
                                        <Typography variant="body2" color="textSecondary">
                                            No messages yet. Start chatting!
                                        </Typography>
                                    ) : (selectedChat.messages
                                        .slice()
                                        .sort((a, b) => a.createdAt - b.createdAt)
                                        .map((message, idx) => (
                                            <Box key={idx}>
                                                {idx === 0 || formatDate(message.createdAt) !== formatDate(selectedChat.messages[idx - 1].createdAt) ? (
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
                                                            position: "relative", // Для корректного позиционирования
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                wordBreak: "break-word",
                                                                animation: "fadeIn 0.3s ease-in-out",
                                                            }}
                                                        >
                                                            {message.text}
                                                        </Typography>
                                                        <Box sx={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "center",
                                                            mt: 1
                                                        }}>
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    color: "text.secondary",
                                                                }}
                                                            >
                                                                {formatTime(message.createdAt)}
                                                            </Typography>
                                                            {message.senderId === auth.user.id && (
                                                                message.isRead ? (
                                                                    <DoneAllIcon
                                                                        sx={{
                                                                            color: "green", // Цвет галочки
                                                                            fontSize: "18px", // Размер иконки
                                                                            ml: 1
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <DoneIcon
                                                                        sx={{
                                                                            color: "gray", // Цвет одной галочки
                                                                            fontSize: "18px", // Размер иконки
                                                                            ml: 1
                                                                        }}
                                                                    />
                                                                ))}
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        )))}
                                    <div ref={messagesEndRef}/>
                                </Box>

                                <Box sx={{display: "flex", alignItems: "center"}}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        sx={{mr: 2}}
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
                        ) : (lgUp && (
                            <Box sx={{backgroundColor: "#fff", p: 3, borderRadius: 2, height: "100%"}}>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        height: "100%", // Занять всю высоту родительского контейнера
                                        textAlign: "center", // Дополнительно для центрирования текста
                                    }}
                                >
                                    Select a chat to start messaging
                                </Typography>
                            </Box>
                        ))}
                    </Grid>
                </Grid>
            </Container>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle id="dialog-title" tabIndex={-1}>
                    Choose a client to chat with
                </DialogTitle>
                <DialogContent>
                    {loadingClients ? (
                        <CircularProgress/>
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
                                    <Avatar src={`/assets/avatars/avatar-${client.id}.png`} sx={{mr: 2}}/>
                                    <Typography>{client.name}"</Typography>
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