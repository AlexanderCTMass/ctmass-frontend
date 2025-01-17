import React from 'react';
import { Box, Typography } from '@mui/material';
import ScrollToBottom from 'react-scroll-to-bottom';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DoneIcon from '@mui/icons-material/Done';
import dayjs from "dayjs";

const DialogWindow = ({ selectedChat, auth}) => {

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});
    };

    const formatDate = (timestamp) => {
        const date = dayjs(timestamp);
        return date.format("MMMM D, YYYY");
    };

    return (
        <Box>
            <ScrollToBottom className="scrollContainer" initialScrollBehavior="smooth">
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
                                            position: "relative",
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
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                mt: 1,
                                            }}
                                        >
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
                                                            color: "green",
                                                            fontSize: "18px",
                                                            ml: 1,
                                                        }}
                                                    />
                                                ) : (
                                                    <DoneIcon
                                                        sx={{
                                                            color: "gray",
                                                            fontSize: "18px",
                                                            ml: 1,
                                                        }}
                                                    />
                                                )
                                            )}
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        ))
                )}
            </ScrollToBottom>
        </Box>
    );
};

export default DialogWindow;
