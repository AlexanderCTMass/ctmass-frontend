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
import { APP_STORE_URL, GOOGLE_PLAY_URL, detectMobilePlatform } from 'src/constants/mobile-apps';

export const GetTheAppDialog = (props) => {
    const { open, onClose, profile } = props;

    const platform = useMemo(detectMobilePlatform, []);
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
            onClick={() => openStore(APP_STORE_URL)}
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
            onClick={() => openStore(GOOGLE_PLAY_URL)}
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
