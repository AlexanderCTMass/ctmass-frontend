import React from "react";
import { Box, Typography } from "@mui/material";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DoneIcon from "@mui/icons-material/Done";

const MessageBubble = ({ message, auth, formatTime }) => {
    if (!auth || !auth.user) return null; // Проверка на наличие auth и user

    return (
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
                        "@keyframes fadeIn": {
                            "0%": { opacity: 0 },
                            "100%": { opacity: 1 },
                        },
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
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {formatTime(message.createdAt)}
                    </Typography>
                    {message.senderId === auth.user.id &&
                        (message.isRead !== undefined ? (
                            message.isRead ? (
                                <DoneAllIcon sx={{ color: "green", fontSize: "18px", ml: 1 }} />
                            ) : (
                                <DoneIcon sx={{ color: "gray", fontSize: "18px", ml: 1 }} />
                            )
                        ) : null)}
                </Box>
            </Box>
        </Box>
    );
};
export default MessageBubble;
