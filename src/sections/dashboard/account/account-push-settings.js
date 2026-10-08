import { useState } from 'react';
import { Button, Typography } from '@mui/material';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import toast from 'react-hot-toast';
import { useAuth } from 'src/hooks/use-auth';
import { pushSupported, requestAndEnablePush } from 'src/libs/push';
import { btn, StatusPill, Surface, SurfaceHeader } from 'src/components/ctmass-ui';
import { BRAND } from 'src/theme/ctmass-tokens';

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
                toast.success('Push notifications are on for this device');
            } else if (result.reason === 'denied') {
                toast.error('Notifications are blocked in your browser settings');
            } else if (result.reason === 'unsupported') {
                toast.error('This device does not support push notifications');
            }
        } catch (error) {
            console.error(error);
            toast.error("We couldn't turn on notifications. Please try again.");
        } finally {
            setBusy(false);
        }
    };

    const status = permission === 'granted'
        ? <StatusPill>On for this device</StatusPill>
        : permission === 'denied'
            ? <StatusPill tone="danger">Blocked</StatusPill>
            : null;

    const renderControl = () => {
        if (!supported) {
            return (
                <Typography sx={{ fontSize: 14, color: BRAND.muted }}>
                    {isIos() && !isStandalone()
                        ? 'Install the app first (Share, then "Add to Home Screen"), open it and turn notifications on there.'
                        : 'This browser does not support push notifications.'}
                </Typography>
            );
        }

        if (permission === 'denied') {
            return (
                <Typography sx={{ fontSize: 14, color: BRAND.muted }}>
                    Allow notifications for ctmass.com in your browser settings, then reload this page.
                </Typography>
            );
        }

        if (permission === 'granted') {
            return null;
        }

        return (
            <Button onClick={handleEnable} disabled={busy} sx={{ ...btn.green, px: 3 }}>
                {busy ? 'Turning on...' : 'Turn on notifications'}
            </Button>
        );
    };

    return (
        <Surface>
            <SurfaceHeader
                icon={<NotificationsActiveOutlinedIcon />}
                title="Push notifications"
                subtitle="Alerts on this device about new messages, projects and updates, even when CTMASS is closed."
                action={status}
                sx={{ mb: permission === 'granted' ? 0 : { xs: 2.5, md: 3 } }}
            />
            {renderControl()}
        </Surface>
    );
};
