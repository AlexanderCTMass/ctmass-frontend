import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography
} from "@mui/material";
import React from "react";
import {startChat} from "../../../chatService";

const SearchContactDialog = ({
                                 openDialog,
                                 setOpenDialog,
                                 clients,
                                 loadingClients,
                                 auth,
                                 selectedClient,
                                 setSelectedClient,
                             }) => {

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

    return (
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
    )
};
export default SearchContactDialog;