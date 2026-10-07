import { useState } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import {
    Alert,
    Button,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    Divider,
    Stack,
    SvgIcon,
    TextField,
    Typography
} from '@mui/material';
import { customersApi } from 'src/api/customers';
import { useAuth } from 'src/hooks/use-auth';
import { emailSender } from 'src/libs/email-sender';
import { EmailSenderFeatureToggles } from 'src/featureToggles/EmailSenderFeatureToggles';

const EMAIL_OPTIONS = {
    CUSTOM: 'Custom message',
    HELLO: 'Hello message',
    PASSWORD_RESET: 'Password reset'
};

export const CustomerEmailsSummary = (props) => {
    const { customer } = props;
    const { sendPasswordResetEmail, user } = useAuth();
    const [emailOption, setEmailOption] = useState(EMAIL_OPTIONS.CUSTOM);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [history, setHistory] = useState(() => [...(customer.emailActions || [])]);

    const isCustom = emailOption === EMAIL_OPTIONS.CUSTOM;
    const canSend = Boolean(customer.email) && !sending && (!isCustom || (subject.trim() && message.trim()));

    const recordEmail = async (description) => {
        const entry = {
            description,
            createdAt: new Date().getTime(),
            sentBy: user?.email || null
        };
        try {
            await customersApi.addEmail(customer.id, entry);
        } catch (err) {
            console.error(err);
        }
        setHistory((prev) => [...prev, entry]);
    };

    const sendEmail = async () => {
        const simulated = !EmailSenderFeatureToggles.sendRealEmail && emailOption !== EMAIL_OPTIONS.PASSWORD_RESET;
        if (simulated) {
            toast('Simulated send: real emails go out only in production');
            return;
        }
        setSending(true);
        try {
            switch (emailOption) {
                case EMAIL_OPTIONS.PASSWORD_RESET:
                    await sendPasswordResetEmail(customer.email);
                    await recordEmail('Password reset');
                    break;
                case EMAIL_OPTIONS.HELLO:
                    await emailSender.sendHello(customer, user, true);
                    await recordEmail('Hello message');
                    break;
                case EMAIL_OPTIONS.CUSTOM:
                    await emailSender.sendAdminDirectMessage(customer, subject.trim(), message.trim());
                    await recordEmail(`Custom: ${subject.trim()}`);
                    setSubject('');
                    setMessage('');
                    break;
                default:
                    break;
            }
            toast.success(`Email sent to ${customer.email}`);
        } catch (err) {
            console.error(err);
            toast.error(err?.text || err?.message || 'Failed to send email');
        } finally {
            setSending(false);
        }
    };

    const sortedHistory = [...history].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    return (
        <Card>
            <CardHeader title="Emails" />
            <CardContent sx={{ pt: 0 }}>
                <Stack spacing={2}>
                    {!EmailSenderFeatureToggles.sendRealEmail && emailOption !== EMAIL_OPTIONS.PASSWORD_RESET && (
                        <Alert severity="info">
                            Real emails are sent only in production. Here sending is simulated and not recorded.
                        </Alert>
                    )}
                    {!customer.email && (
                        <Alert severity="warning">
                            This user has no email address.
                        </Alert>
                    )}
                    <TextField
                        label="Email type"
                        name="option"
                        onChange={(event) => setEmailOption(event.target.value)}
                        select
                        SelectProps={{ native: true }}
                        sx={{ width: 320, maxWidth: '100%' }}
                        value={emailOption}
                    >
                        {Object.values(EMAIL_OPTIONS).map((option) => (
                            <option
                                key={option}
                                value={option}
                            >
                                {option}
                            </option>
                        ))}
                    </TextField>
                    {isCustom && (
                        <>
                            <TextField
                                fullWidth
                                inputProps={{ maxLength: 150 }}
                                label="Subject"
                                onChange={(event) => setSubject(event.target.value)}
                                value={subject}
                            />
                            <TextField
                                fullWidth
                                inputProps={{ maxLength: 5000 }}
                                label="Message"
                                minRows={5}
                                multiline
                                onChange={(event) => setMessage(event.target.value)}
                                value={message}
                            />
                        </>
                    )}
                    <Typography
                        color="text.secondary"
                        variant="body2"
                    >
                        Recipient: {customer.email || '—'}
                    </Typography>
                    <div>
                        <Button
                            disabled={!canSend}
                            endIcon={sending
                                ? <CircularProgress color="inherit" size={18} />
                                : (
                                    <SvgIcon>
                                        <ArrowRightIcon />
                                    </SvgIcon>
                                )}
                            onClick={sendEmail}
                            variant="contained"
                        >
                            Send email
                        </Button>
                    </div>
                </Stack>
            </CardContent>
            {sortedHistory.length > 0 && (
                <>
                    <Divider />
                    <CardContent>
                        <Typography
                            sx={{ mb: 1 }}
                            variant="subtitle2"
                        >
                            Sent emails
                        </Typography>
                        <Stack divider={<Divider flexItem />}>
                            {sortedHistory.map((email, index) => (
                                <Stack
                                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                                    direction={{ xs: 'column', sm: 'row' }}
                                    justifyContent="space-between"
                                    key={`${email.createdAt}-${index}`}
                                    spacing={{ xs: 0, sm: 2 }}
                                    sx={{ py: 1 }}
                                >
                                    <Typography
                                        sx={{ wordBreak: 'break-word' }}
                                        variant="body2"
                                    >
                                        {email.description}
                                    </Typography>
                                    <Typography
                                        color="text.secondary"
                                        sx={{ whiteSpace: 'nowrap' }}
                                        variant="caption"
                                    >
                                        {email.createdAt ? format(email.createdAt, 'MM/dd/yyyy HH:mm') : ''}
                                    </Typography>
                                </Stack>
                            ))}
                        </Stack>
                    </CardContent>
                </>
            )}
        </Card>
    );
};

CustomerEmailsSummary.propTypes = {
    customer: PropTypes.object.isRequired
};
