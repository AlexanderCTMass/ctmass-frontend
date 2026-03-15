// src/sections/invite-dialog.js (или ваш текущий путь)
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
    Typography,
    Alert,
    Snackbar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import * as Yup from 'yup';
import { emailService } from 'src/service/email-service';
import { smsService } from 'src/service/sms-service';
import { useAuth } from "src/hooks/use-auth";

export const InviteDialog = ({ open, onClose, categoryKey, categoryMeta, profileId }) => {
    const [channel, setChannel] = useState('email');
    const [to, setTo] = useState('');
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const { user } = useAuth();

    // Схема валидации в зависимости от канала
    const getValidationSchema = () => {
        if (channel === 'email') {
            return Yup.object({
                to: Yup.string().email('Invalid e-mail').required('Email is required')
            });
        } else {
            return Yup.object({
                to: Yup.string()
                    .test('phone', 'Use format +1XXXXXXXXXX or 10-digit number', (value) => {
                        if (!value) return false;
                        // Валидация для США
                        const cleaned = value.replace(/\D/g, '');
                        return cleaned.length === 10 || (cleaned.length === 11 && cleaned.startsWith('1'));
                    })
                    .required('Phone number is required')
            });
        }
    };

    const schema = getValidationSchema();
    const valid = schema.isValidSync({ to });

    // Форматирование номера перед отправкой
    const formatPhoneNumber = (phone) => {
        return smsService.formatPhoneNumber(phone);
    };

    const handleSend = useCallback(async () => {
        setSending(true);
        try {
            if (channel === 'email') {
                await emailService.sendInviteEmail({
                    inviterName: user?.name || 'CTMASS user',
                    toEmail: to,
                    categoryTitle: categoryMeta.title,
                    profileId,
                    personalText: text
                });
                setSnackbar({
                    open: true,
                    message: 'Invitation sent successfully!',
                    severity: 'success'
                });
            } else {
                // Форматируем номер телефона
                const formattedPhone = formatPhoneNumber(to);

                // Отправляем SMS
                await smsService.sendSMSViaQueue({
                    to: formattedPhone,
                    inviterName: user?.name || 'CTMASS user',
                    categoryTitle: categoryMeta.title,
                    profileId,
                    personalText: text
                });

                setSnackbar({
                    open: true,
                    message: 'SMS invitation sent successfully!',
                    severity: 'success'
                });
            }
            onClose();
        } catch (error) {
            console.error('Error sending invitation:', error);
            setSnackbar({
                open: true,
                message: `Failed to send invitation: ${error.message}`,
                severity: 'error'
            });
        } finally {
            setSending(false);
        }
    }, [channel, to, text, user?.name, categoryMeta.title, profileId, onClose]);

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // Сброс состояния при открытии/закрытии
    const handleDialogClose = () => {
        setTo('');
        setText('');
        setChannel('email');
        onClose();
    };

    return (
        <>
            <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Invite to {categoryMeta.title}
                    <IconButton onClick={handleDialogClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <Divider />

                <Box sx={{ p: 3 }}>
                    <Stack spacing={2}>
                        <RadioGroup row value={channel} onChange={(e) => {
                            setChannel(e.target.value);
                            setTo(''); // Сбрасываем поле при смене канала
                        }}>
                            <Stack direction="row" spacing={3}>
                                <label><Radio value="email" />Email</label>
                                <label><Radio value="phone" />Phone (SMS)</label>
                            </Stack>
                        </RadioGroup>

                        <TextField
                            label={channel === 'email' ? 'E-mail address' : 'Phone number'}
                            value={to}
                            onChange={e => setTo(e.target.value)}
                            fullWidth
                            error={!valid && !!to}
                            helperText={!valid && to ? (
                                channel === 'email'
                                    ? 'Enter a valid e-mail'
                                    : 'Enter 10-digit US number (e.g., 5551234567 or +15551234567)'
                            ) : (
                                channel === 'phone' ? 'Format: 5551234567 or +15551234567' : ' '
                            )}
                            placeholder={channel === 'phone' ? '+1 555 123 4567' : ''}
                        />

                        <TextField
                            label="Personal message (optional)"
                            multiline
                            minRows={4}
                            value={text}
                            onChange={e => setText(e.target.value)}
                            fullWidth
                            placeholder="I'd love to connect with you on CTMASS…"
                            helperText={channel === 'phone' ? 'Note: Long messages may be truncated in SMS' : ''}
                        />

                        <Typography variant="caption" color="text.secondary">
                            {channel === 'email'
                                ? `Recipient will receive: “${categoryMeta.title} invited you to join CTMASS and adds you to the category «${categoryMeta.title}». ${text && 'Personal note is attached.'}”`
                                : `Recipient will receive SMS with invitation link and your message (if provided).`
                            }
                        </Typography>

                        <Box textAlign="right">
                            <Button
                                variant="contained"
                                disabled={!valid || sending}
                                onClick={handleSend}
                            >
                                {sending ? 'Sending...' : `Send invitation via ${channel === 'email' ? 'email' : 'SMS'}`}
                            </Button>
                        </Box>
                    </Stack>
                </Box>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};