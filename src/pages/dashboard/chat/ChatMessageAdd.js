import React, {useEffect, useRef, useState} from 'react';
import {Box, TextField, InputAdornment, IconButton} from '@mui/material';
import SendIcon from "@mui/icons-material/Send";

const ChatMessageAdd = ({ newMessage, setNewMessage, handleSendMessage, handleKeyPress }) => {
    const [height, setHeight] = useState(56); // Начальная высота текстового поля (2 строки)
    const textAreaRef = useRef(null);

    const handleInputChange = (e) => {
        setNewMessage(e.target.value);

        // Динамическая высота
        if (textAreaRef.current) {
            const scrollHeight = textAreaRef.current.scrollHeight;
            setHeight(Math.min(scrollHeight, 200)); // Максимальная высота (например, 200px)
        }
    };

    useEffect(() => {
        if (textAreaRef.current) {
            const scrollHeight = textAreaRef.current.scrollHeight;
            setHeight(Math.min(scrollHeight, 200));
        }
    }, [newMessage]);

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column-reverse", // Растягиваем вверх
                alignItems: "flex-end", // Кнопка отправки остаётся внизу
                width: "100%",
            }}
        >
            <Box
                sx={{
                    position: "relative",
                    width: "100%",
                }}
            >
                <TextField
                    inputRef={textAreaRef}
                    fullWidth
                    variant="outlined"
                    multiline
                    minRows={3}
                    maxRows={3}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim()}
                                    color="primary"
                                >
                                    <SendIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        textarea: {
                            overflow: "hidden", // Убираем прокрутку
                            resize: "none", // Отключаем изменение размера вручную
                        },
                    }}
                />
            </Box>
        </Box>
    );
};
export default ChatMessageAdd;
