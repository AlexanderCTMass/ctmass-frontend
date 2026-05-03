import { useCallback, useState } from 'react';
import { trackEvent } from 'src/libs/analytics/ga4';
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
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import * as Yup from 'yup'
import { emailService } from 'src/service/email-service';
import { smsService } from 'src/service/sms-service';
import { useAuth } from "src/hooks/use-auth";
import { CATEGORY_META } from './utils';

const WORKER_CATEGORIES = ['trustedColleagues', 'localPros'];
const getInviteCategoryType = (categoryKey) =>
    WORKER_CATEGORIES.includes(categoryKey) ? 'worker' : 'homeowner';

const CategoryCard = ({ categoryKey, meta, selected, onSelect }) => {
    const theme = useTheme();
    return (
        <Box
            onClick={() => onSelect(categoryKey)}
            sx={{
                flex: '1 1 calc(50% - 8px)',
                minWidth: 0,
                p: 1.5,
                borderRadius: 2,
                border: '2px solid',
                borderColor: selected ? theme.palette[meta.color]?.main || 'primary.main' : 'divider',
                bgcolor: selected ? `${meta.color}.lighter` : 'background.paper',
                cursor: 'pointer',
                transition: 'all 0.15s',
                '&:hover': {
                    borderColor: theme.palette[meta.color]?.main || 'primary.main',
                    bgcolor: `${meta.color}.lighter`
                }
            }}
        >
            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                <Box sx={{ color: `${meta.color}.main` }}>{meta.icon}</Box>
                <Typography variant="body2" fontWeight={selected ? 700 : 500} noWrap>
                    {meta.title}
                </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.3 }}>
                {meta.description}
            </Typography>
        </Box>
    );
};

export const InviteDialog = ({ open, onClose, categoryMeta: categoryMetaProp, profileId }) => {
    const [channel, setChannel] = useState('email');
    const [to, setTo] = useState('');
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [selectedCategoryKey, setSelectedCategoryKey] = useState('trustedColleagues');
    const { user } = useAuth();

    const activeMeta = categoryMetaProp || CATEGORY_META[selectedCategoryKey];

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
                    categoryTitle: activeMeta.title,
                    profileId,
                    personalText: text,
                    categoryKey: categoryMetaProp ? (Object.keys(CATEGORY_META).find(k => CATEGORY_META[k] === categoryMetaProp) || selectedCategoryKey) : selectedCategoryKey
                });
                setSnackbar({
                    open: true,
                    message: 'Invitation sent successfully!',
                    severity: 'success'
                });
            } else {
                const formattedPhone = formatPhoneNumber(to);

                await smsService.sendSMSViaQueue({
                    to: formattedPhone,
                    inviterName: user?.name || 'CTMASS user',
                    categoryTitle: activeMeta.title,
                    profileId,
                    personalText: text
                });

                setSnackbar({
                    open: true,
                    message: 'SMS invitation sent successfully!',
                    severity: 'success'
                });
            }
            const activeCategoryKey = categoryMetaProp
                ? (Object.keys(CATEGORY_META).find(k => CATEGORY_META[k] === categoryMetaProp) || selectedCategoryKey)
                : selectedCategoryKey;
            trackEvent('invite_sent', {
                category: activeCategoryKey,
                category_type: getInviteCategoryType(activeCategoryKey),
                channel
            });
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
    }, [channel, to, text, user?.name, activeMeta.title, profileId, onClose, categoryMetaProp, selectedCategoryKey]);

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Invite a Friend
                    <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <Divider />

                <Box sx={{ p: 3 }}>
                    <Stack spacing={2.5}>
                        {!categoryMetaProp && (
                            <Box>
                                <Typography variant="body2" fontWeight={600} mb={1.5}>
                                    Add to category
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {Object.entries(CATEGORY_META).map(([key, meta]) => (
                                        <CategoryCard
                                            key={key}
                                            categoryKey={key}
                                            meta={meta}
                                            selected={selectedCategoryKey === key}
                                            onSelect={setSelectedCategoryKey}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {categoryMetaProp && (
                            <Typography variant="body2" color="text.secondary">
                                Inviting to: <strong>{activeMeta.title}</strong>
                            </Typography>
                        )}

                        <RadioGroup row value={channel} onChange={(e) => {
                            setChannel(e.target.value);
                            setTo('');
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
                                ? `Recipient will receive your invitation with message.`
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