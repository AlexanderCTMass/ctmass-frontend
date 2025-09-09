// src/pages/dashboard/ServiceMessagesPage.js
import { useState } from 'react';
import {
    Box, Button, Card, CardContent, Stack, TextField, Typography, Autocomplete,
    CircularProgress, Snackbar, Alert, IconButton
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import { profileApi } from 'src/api/profile';
import { chatApi } from 'src/api/chat/newApi';

export default function ServiceMessagesPage() {
    const [rec, setRec] = useState(null);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [open, setOpen] = useState(false);

    const handleSend = async () => {
        if (!message.trim()) return;
        setSending(true);
        try {
            if (rec === 'all') {
                await chatApi.sendServiceMessageToAll(message);
            } else {
                await chatApi.sendServiceMessageToUser(rec.id, message);
            }
            setMessage('');
            setRec(null);
            setOpen(true);
        } finally { setSending(false); }
    };

    return (
        <Card>
            <CardContent>
                <Stack spacing={2}>
                    <Typography variant="h5">Send service message</Typography>

                    <Autocomplete
                        fullWidth
                        value={rec}
                        onChange={(_, v) => setRec(v)}
                        options={[]}
                        filterOptions={(x) => x}
                        getOptionLabel={o => o === 'all' ? 'All users' : o?.name || ''}
                        renderInput={(params) =>
                            <TextField {...params} label="Recipient"
                                placeholder="Start typing email / name"
                                onChange={async e => {
                                    const q = e.target.value;
                                    if (!q) return;
                                    const users = await profileApi.searchMessengerProfiles(null, null, q);
                                    params.inputProps.onChange && params.inputProps.onChange(e);
                                    params.inputProps.options = [{ id: '*', name: 'All users' }].concat(users);
                                }}
                            />
                        }
                    />

                    <TextField
                        label="Message"
                        multiline
                        minRows={4}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        fullWidth
                    />

                    <Stack direction="row" justifyContent="flex-end">
                        <Button
                            startIcon={sending ? <CircularProgress size={16} /> : <UploadIcon />}
                            disabled={sending || !message.trim()}
                            variant="contained"
                            onClick={handleSend}
                        >
                            Send
                        </Button>
                    </Stack>
                </Stack>
            </CardContent>
            <Snackbar open={open} autoHideDuration={4000} onClose={() => setOpen(false)}>
                <Alert severity="success">Message sent</Alert>
            </Snackbar>
        </Card>
    );
}