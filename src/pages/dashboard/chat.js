import React, {useEffect, useState} from "react";
import {Box, Container, Grid, useMediaQuery,} from "@mui/material";
import {useAuth} from "../../hooks/use-auth";
import {markMessagesAsReads} from "../../chatService";
import {useChatData} from "../../api/chat/data";
import {profileApi} from "../../api/profile";
import "./chat/chatCss.css";
import ChatSidebar from "./chat/ChatSidebar";
import SearchContactDialog from "./chat/SerachContact";
import ChatMainPanel from "./chat/ChatMainPanel";
import {useParams} from "react-router";

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

    const url = window.location.href.split("/");
    const userId = url[url.length - 1].toString();
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
        if (selectedChat) {

            const currentChat = threads.find((thread) => thread.id === selectedChat.id);
            if (currentChat?.messages?.length) {
                setSelectedChat(currentChat || null);
            }

            const unreadCount = getUnreadMessageCount(selectedChat, auth.user.id);

            if (unreadCount > 0) {
                markMessagesAsRead(selectedChat.id, selectedChat, auth.user.id);
            }
        }
    }, [threads]);

    const getUnreadMessageCount = (chatThread, userId) => {
        if (!chatThread) return 0;

        const thread = threads.find((thread) => thread.id === chatThread.id);

        return thread?.messages.filter(
            (msg) => !msg.isRead && msg.senderId !== userId
        ).length || 0;
    };

    const markMessagesAsRead = async (chatId, chatThread, userId) => {
        const unreadCount = getUnreadMessageCount(selectedChat, auth.user.id);

        if (unreadCount === 0) {
            return;
        }

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


    return (
        <Box>
            <Grid container spacing={0} sx={{display: 'flex', flexDirection: 'row', height: '100vh'}}>
                {/* Левая панель (ChatSidebar) */}
                <Grid item xs={12} lg={4} sx={{display: {lg: 'block'}}}>
                    <ChatSidebar
                        loading={loading}
                        clients={clients}
                        auth={auth}
                        setSelectedChat={setSelectedChat}
                        markMessagesAsRead={markMessagesAsRead}
                        getUnreadMessageCount={getUnreadMessageCount}
                        setOpenDialog={setOpenDialog}
                        threads={threads}
                        selectedChat={selectedChat}
                        selectContactId = {userId}
                        lgUp={lgUp}
                    />
                </Grid>

                <Grid item xs={12} lg={8} sx={{display: 'flex', flexDirection: 'column', height: '100vh'}}>
                    <ChatMainPanel
                        selectedChat={selectedChat}
                        setOpenDialog={setOpenDialog}
                        setSelectedChat={setSelectedChat}
                        lgUp={lgUp}
                        auth={auth}
                        clientsMap={clientsMap}
                        newMessage={newMessage}
                        setNewMessage={setNewMessage}/>
                </Grid>
            </Grid>

            <SearchContactDialog openDialog={openDialog}
                                 setOpenDialog={setOpenDialog}
                                 clients={clients}
                                 loadingClients={loadingClients}
                                 auth={auth}
                                 selectedClient={selectedClient}
                                 setSelectedClient={setSelectedClient}
                                 threads={threads}
                                 addContact={addContact}
                                 setSelectedChat={setSelectedChat}
            />

        </Box>
    );
};

export default Page;