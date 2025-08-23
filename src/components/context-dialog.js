import React from 'react';
import {
    Box,
    Container,
    Paper,
    Stack,
    Avatar,
    Typography,
    Button,
    SvgIcon, Dialog,
} from '@mui/material';

const ContextDialog = ({ icon, title, message, buttons, onClose, open }) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <Paper elevation={12}>
                <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                        display: 'flex',
                        p: 3,
                    }}
                >
                    <Avatar
                        sx={{
                            backgroundColor: 'error.lightest',
                            color: 'error.main',
                        }}
                    >
                        <SvgIcon>{icon}</SvgIcon>
                    </Avatar>
                    <div>
                        <Typography variant="h5">{title}</Typography>
                        <Typography
                            color="text.secondary"
                            sx={{ mt: 1 }}
                            variant="body2"
                        >
                            {message}
                        </Typography>
                    </div>
                </Stack>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        pb: 3,
                        px: 3,
                    }}
                >
                    {buttons}
                </Box>
            </Paper>
        </Dialog>
    );
};

export default ContextDialog;