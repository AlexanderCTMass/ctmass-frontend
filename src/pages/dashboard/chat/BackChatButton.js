import React from 'react';
import { Box, IconButton, Avatar, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const BackChatButton = ({ handleBack, lgUp, selectedChat, auth, clientsMap }) => {

    const getClientDetails = (clientId) => {
        return clientsMap[clientId] || { name: "Unknown", avatar: "" };
    };

    const otherUser = getClientDetails(selectedChat.users.find((id) => id !== auth.user.id));

    return (
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            {!lgUp && <IconButton onClick={handleBack} sx={{ mr: 2 }}>
                <ArrowBackIcon />
            </IconButton>}
            <Avatar
                src={otherUser.avatar}
                sx={{ mr: 1.2, ml: 1.2 }}
            />
            <Typography variant="h5" gutterBottom sx={{
                whiteSpace: 'nowrap',  // Ожидаем, что текст будет на одной строке
                overflow: 'hidden',    // Обрезаем текст, если он выходит за границы
                textOverflow: 'ellipsis', // Добавляем многоточие в конце длинного текста
                maxWidth: 'calc(100% - 80px)',
            }}>
                {otherUser.name}
            </Typography>
        </Box>
    );
};

export default BackChatButton;
