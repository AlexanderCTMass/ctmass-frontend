import { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Chip,
    Stack,
    Typography
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import toast from 'react-hot-toast';
import { useAuth } from 'src/hooks/use-auth';
import { pushSupported, requestAndEnablePush } from 'src/libs/push';

const isIos = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);
const isStandalone = () =>
    window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;

export const AccountPushSettings = () => {
    const { user } = useAuth();
    const supported = pushSupported();
    const [permission, setPermission] = useState(() =>
        supported ? Notification.permission : 'unsupported'
    );
    const [busy, setBusy] = useState(false);

    const handleEnable = async () => {
        setBusy(true);
        try {
            const result = await requestAndEnablePush(user?.id);
            setPermission(supported ? Notification.permission : 'unsupported');
            if (result.ok) {
                toast.success('Push notifications enabled on this device');
            } else if (result.reason === 'denied') {
                toast.error('Notifications are blocked in your browser settings');
            } else if (result.reason === 'unsupported') {
                toast.error('Push notifications are not supported on this device');
            }
        } catch (error) {
            console.error(error);
            toast.error('Could not enable notifications');
        } finally {
            setBusy(false);
        }
    };

    const renderControl = () => {
        if (!supported) {
            if (isIos() && !isStandalone()) {
                return (
                    <Typography variant="body2" color="text.secondary">
                        Install the app first (Share → “Add to Home Screen”), then open it to enable notifications.
                    </Typography>
                );
            }
            return (
                <Typography variant="body2" color="text.secondary">
                    Push notifications are not supported on this browser.
                </Typography>
            );
        }

        if (permission === 'granted') {
            return (
                <Chip
                    color="success"
                    variant="soft"
                    label="Enabled on this device"
                    sx={{ alignSelf: 'flex-start' }}
                />
            );
        }

        if (permission === 'denied') {
            return (
                <Typography variant="body2" color="text.secondary">
                    Notifications are blocked. Allow them for this site in your browser settings, then reload.
                </Typography>
            );
        }

        return (
            <LoadingButton
                variant="contained"
                loading={busy}
                onClick={handleEnable}
                sx={{ alignSelf: 'flex-start' }}
            >
                Enable notifications
            </LoadingButton>
        );
    };

    return (
        <Card variant="outlined">
            <CardContent sx={{ p: { xs: 2, md: 5 } }}>
                <Stack spacing={3}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <NotificationsActiveOutlinedIcon color="primary" />
                        <Typography variant="h6">Push notifications</Typography>
                    </Stack>
                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Get alerts on this device about new messages, projects and updates — even when the app is closed.
                        </Typography>
                        {renderControl()}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
};
