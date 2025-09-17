import { useState, useMemo } from 'react';
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import { profileApi } from 'src/api/profile';
import { chatApi } from 'src/api/chat/newApi';

export default function ServiceMessagesPage() {
    const [recipient, setRecipient] = useState('all');
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState([]);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [done, setDone] = useState(false);

    const loading = useMemo(() => !!query && options.length === 0, [query, options]);

    const handleInput = async (v) => {
        setQuery(v);
        if (!v) { setOptions([]); return; }
        const res = await profileApi.searchMessengerProfiles(null, null, v);
        setOptions(res);
    };

    const handleSend = async () => {
        if (!message.trim()) return;
        setSending(true);
        try {
            if (recipient === 'all') {
                await chatApi.sendServiceMessageToAll(message);
            } else {
                await chatApi.sendServiceMessageToUser(recipient.id, message);
            }
            setMessage('')
            setRecipient('all');
            setDone(true);
            setTimeout(() => setDone(false), 2000);
        } finally { setSending(false); }
    };

    return (
        <Card sx={{ mx: 'auto', width: '70vw', mt: 2 }}>
            <CardContent>
                <Stack spacing={3}>
                    <Typography variant="h5">Send service message</Typography>

                    <Autocomplete
                        fullWidth
                        value={recipient}
                        onChange={(_e, v) => setRecipient(v)}
                        inputValue={query}
                        onInputChange={(_e, v) => handleInput(v)}
                        options={['all', ...options]}
                        loading={loading}
                        getOptionLabel={(o) =>
                            o === 'all' ? 'All users' : o?.name || o?.email || ''}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Recipient"
                                placeholder="Type name or e-mail"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {loading ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    )
                                }}
                            />
                        )}
                    />

                    <TextField
                        label="Message"
                        multiline
                        minRows={4}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        fullWidth
                    />

                    <Divider />

                    <Box textAlign="right">
                        <Button
                            variant="contained"
                            startIcon={<UploadIcon />}
                            disabled={sending || !message.trim()}
                            onClick={handleSend}
                        >
                            {sending ? 'Sending…' : 'Send'}
                        </Button>
                    </Box>

                    {done && <Alert severity="success">Message sent.</Alert>}
                </Stack>
            </CardContent>
        </Card>
    );
}