import React from 'react';
import { Box, TextField, Button } from '@mui/material';

const ChatMessageAdd = ({ newMessage, setNewMessage, handleSendMessage, handleKeyPress }) => {
    return (
        <Box sx={{ display: "flex", alignItems: "center" }}>
            <TextField
                fullWidth
                variant="outlined"
                multiline
                rows={3} // Количество строк по умолчанию
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
    );
};

export default ChatMessageAdd;
