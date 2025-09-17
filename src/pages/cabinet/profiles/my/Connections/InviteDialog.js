import { useCallback } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    Divider,
    IconButton,
    Radio,
    RadioGroup,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import * as Yup from 'yup'
import { inviteApi } from 'src/api/invite';

export const InviteDialog = ({ open, onClose, categoryKey, categoryMeta, profileId }) => {
    const [channel, setChannel] = useState('email');
    const [to, setTo] = useState('');
    const [text, setText] = useState('');

    const schema = Yup.object({
        to: channel === 'email'
            ? Yup.string().email('Invalid e-mail').required()
            : Yup.string()
                .matches(/^\+1\d{10}$/, 'Use format +1XXXXXXXXXX')
                .required()
    });
    const valid = schema.isValidSync({ to });

    const handleSend = useCallback(async () => {
        await inviteApi.send({
            to,
            channel,
            text,
            categoryKey,
            profileId
        });
        onClose();
    }, [categoryKey, channel, onClose, profileId, text, to]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                Invite to {categoryMeta.title}
                <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Divider />

            <Box sx={{ p: 3 }}>
                <Stack spacing={2}>
                    <RadioGroup row value={channel} onChange={(e) => setChannel(e.target.value)}>
                        <Stack direction="row" spacing={3}>
                            <label><Radio value="email" />Email</label>
                            <label><Radio value="phone" />Phone</label>
                        </Stack>
                    </RadioGroup>

                    <TextField
                        label={channel === 'email' ? 'E-mail address' : 'Phone number'}
                        value={to}
                        onChange={e => setTo(e.target.value)}
                        fullWidth
                        error={!valid && !!to}
                        helperText={!valid && to ? (channel === 'email'
                            ? 'Enter a valid e-mail'
                            : 'Use format +1XXXXXXXXXX') : ' '}
                    />

                    <TextField
                        label="Personal message (optional)"
                        multiline
                        minRows={4}
                        value={text}
                        onChange={e => setText(e.target.value)}
                        fullWidth
                        placeholder="I'd love to connect with you on CTMASS…"
                    />

                    <Typography variant="caption" color="text.secondary">
                        Recipient will receive: “{categoryMeta.title} invited you to join CTMASS and adds you to
                        the category «{categoryMeta.title}». {text && 'Personal note is attached.'}”
                    </Typography>

                    <Box textAlign="right">
                        <Button variant="contained" disabled={!valid} onClick={handleSend}>
                            Send invitation
                        </Button>
                    </Box>
                </Stack>
            </Box>
        </Dialog>
    );
};