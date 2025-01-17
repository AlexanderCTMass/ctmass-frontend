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
                           setNewMessage,
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
            // Отправляем сообщение
            await sendMessage(selectedChat.id, auth.user.id, newMessage);
            setNewMessage("");
        }
    };

    return (
        <Grid item xs={12} sm={11}>
            {selectedChat ? (
                <Box
                    sx={{
                        backgroundColor: "#fff",
                        p: 3,
                        borderRadius: 2,
                        width: "100%",
                        height: "90vh",
                        display: "flex", // Flexbox для управления внутренними элементами
                        flexDirection: "column",
                        marginRight: "10%"
                    }}
                >
                    <BackChatButton
                        handleBack={handleBack}
                        lgUp={lgUp}
                        selectedChat={selectedChat}
                        auth={auth}
                        clientsMap={clientsMap}
                    />
                    <Box
                        sx={{
                            flex: 1, // Занимает всё доступное пространство
                            overflow: "hidden", // Обрезает лишний контент
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <DialogWindow selectedChat={selectedChat} auth={auth}/>
                    </Box>

                    <Box
                        sx={{
                            mt: 1,
                        }}
                    >
                        <ChatMessageAdd
                            newMessage={newMessage}
                            setNewMessage={setNewMessage}
                            handleSendMessage={handleSendMessage}
                            handleKeyPress={handleKeyPress}
                        />
                    </Box>
                </Box>
            ) : lgUp ? (
                <Box
                    sx={{backgroundColor: "#fff", p: 3, borderRadius: 2, height: "95%"}}
                />
            ) : null}
        </Grid>
    );
};
export default ChatMainPanel;
