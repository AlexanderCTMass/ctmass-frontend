import React from 'react';
import {Box, Typography} from '@mui/material';
import ScrollToBottom from 'react-scroll-to-bottom';
import dayjs from "dayjs";
import MessageBubble from "./MessageBubble";

const DialogWindow = ({ selectedChat, auth }) => {
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const formatDate = (timestamp) => {
        const date = dayjs(timestamp);
        return date.format("MMMM D, YYYY");
    };

    return (
        <Box
            sx={{
                flex: 1,
                display: 'flex',
                flexDirection: "column",
            }}
        >
            <ScrollToBottom
                className="scrollContainer"
                initialScrollBehavior="smooth"
                style={{
                    flex: 1, // Растягиваем контейнер, чтобы он заполнил всё доступное пространство
                }}
            >
                {selectedChat.messages.length === 0 ? (
                    <Typography variant="body2" color="textSecondary" sx={{ textAlign: "center", mt: 2 }}>
                        No messages yet. Start chatting!
                    </Typography>
                ) : (
                    <Box sx={{ flex: 1 }}>
                        {selectedChat.messages
                            .slice()
                            .sort((a, b) => a.createdAt - b.createdAt)
                            .map((message, idx) => (
                                <>
                                    {(idx === 0 ||
                                        formatDate(message.createdAt) !==
                                        formatDate(selectedChat.messages[idx - 1].createdAt)) && (
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
                                    )}
                                    <MessageBubble message={message} auth={auth} formatTime={formatTime} />
                                </>
                            ))}
                    </Box>
                )}
            </ScrollToBottom>
        </Box>
    );
};

export default DialogWindow;
