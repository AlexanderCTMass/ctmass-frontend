import { useMemo } from 'react';
import {
    Avatar,
    Box,
    Button,
    Dialog,
    DialogContent,
    Stack,
    Typography
} from '@mui/material';
import AppleIcon from '@mui/icons-material/Apple';
import AndroidIcon from '@mui/icons-material/Android';

const ANDROID_APP_URL =
    process.env.REACT_APP_ANDROID_APP_URL ||
    'https://play.google.com/store/apps/details?id=com.ctmass.app';

const IOS_APP_URL =
    process.env.REACT_APP_IOS_APP_URL || 'https://apps.apple.com/app/ctmass';

function detectPlatform() {
    if (typeof navigator === 'undefined') return 'other';
    const ua = navigator.userAgent || '';
    if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
    if (/android/i.test(ua)) return 'android';
    return 'other';
}

export const GetTheAppDialog = (props) => {
    const { open, onClose, profile } = props;

    const platform = useMemo(detectPlatform, []);
    const name = profile?.businessName || profile?.name || 'this specialist';
    const avatar = profile?.avatar || '';

    const openStore = (url) => {
        window.location.href = url;
    };

    const iosButton = (
        <Button
            key="ios"
            fullWidth
            size="large"
            variant={platform === 'ios' ? 'contained' : 'outlined'}
            startIcon={<AppleIcon />}
            onClick={() => openStore(IOS_APP_URL)}
        >
            Download for iPhone
        </Button>
    );

    const androidButton = (
        <Button
            key="android"
            fullWidth
            size="large"
            variant={platform === 'android' ? 'contained' : 'outlined'}
            startIcon={<AndroidIcon />}
            onClick={() => openStore(ANDROID_APP_URL)}
        >
            Download for Android
        </Button>
    );

    const buttons =
        platform === 'ios'
            ? [iosButton, androidButton]
            : platform === 'android'
                ? [androidButton, iosButton]
                : [iosButton, androidButton];

    return (
        <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
            <DialogContent>
                <Stack alignItems="center" spacing={2} sx={{ py: 1 }}>
                    <Avatar src={avatar} sx={{ width: 72, height: 72 }}>
                        {name.charAt(0)}
                    </Avatar>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight={700}>
                            See {name} in the CTMASS app
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Get the free CTMASS app to view this profile and connect as
                            friends.
                        </Typography>
                    </Box>
                    <Stack spacing={1.5} sx={{ width: '100%', pt: 1 }}>
                        {buttons}
                        <Button color="inherit" onClick={onClose}>
                            Continue on web
                        </Button>
                    </Stack>
                </Stack>
            </DialogContent>
        </Dialog>
    );
};
