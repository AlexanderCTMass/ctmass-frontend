import React from "react";
import {Box, Grid} from "@mui/material";
import BackChatButton from "./BackChatButton";
import DialogWindow from "./DialogWindow";
import ChatMessageAdd from "./ChatMessageAdd";
import {sendMessage} from "../../../chatService";

const ChatMainPanel = ({
                           selectedChat,
                           setOpenDialog,
                           setSelectedChat,
                           lgUp,
                           auth,
                           clientsMap,
                           newMessage,
                           setNewMessage
}) => {


    const handleBack = () => {
        setOpenDialog(false); // Закрываем диалог
        setSelectedChat(null); // Очищаем выбранный чат
    };

    const handleKeyPress = (e) => {
        if (e.ctrlKey && e.key === "Enter") {
            handleSendMessage();
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
            setNewMessage("");
        }
    };

    return (
        <Grid item xs={12} sm={8}>
            {selectedChat && (
                <Box sx={{backgroundColor: "#fff", p: 3, borderRadius: 2, height: "100%"}}>
                    <BackChatButton
                        handleBack={handleBack}
                        lgUp={lgUp}
                        selectedChat={selectedChat}
                        auth={auth}
                        clientsMap={clientsMap}
                    />

                    <DialogWindow
                        selectedChat={selectedChat}
                        auth={auth}
                    />

                    <ChatMessageAdd
                        newMessage={newMessage}
                        setNewMessage={setNewMessage}
                        handleSendMessage={handleSendMessage}
                        handleKeyPress={handleKeyPress}
                    />
                </Box>
            )}
        </Grid>
    );
};

export default ChatMainPanel;
