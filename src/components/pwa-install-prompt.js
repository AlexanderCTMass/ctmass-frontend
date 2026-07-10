import { useEffect, useState } from 'react';
import { Box, Button, IconButton, Paper, Snackbar, Stack, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import IosShareIcon from '@mui/icons-material/IosShare';
import GetAppIcon from '@mui/icons-material/GetApp';

const DISMISS_KEY = 'pwaInstallDismissed';

const isStandalone = () =>
    window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;

const isIos = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);

export const PwaInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [open, setOpen] = useState(false);
    const [iosHint, setIosHint] = useState(false);

    useEffect(() => {
        if (isStandalone() || localStorage.getItem(DISMISS_KEY)) {
            return undefined;
        }

        const onBeforeInstallPrompt = (event) => {
            event.preventDefault();
            setDeferredPrompt(event);
            setIosHint(false);
            setOpen(true);
        };

        window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);

        // iOS Safari doesn't fire beforeinstallprompt — show manual instructions.
        if (isIos()) {
            setIosHint(true);
            setOpen(true);
        }

        const onInstalled = () => {
            setOpen(false);
            localStorage.setItem(DISMISS_KEY, '1');
        };
        window.addEventListener('appinstalled', onInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
            window.removeEventListener('appinstalled', onInstalled);
        };
    }, []);

    const handleClose = () => {
        setOpen(false);
        localStorage.setItem(DISMISS_KEY, '1');
    };

    const handleInstall = async () => {
        if (!deferredPrompt) {
            return;
        }
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        handleClose();
    };

    return (
        <Snackbar
            open={open}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            sx={{
                top: 'auto !important',
                bottom: 'calc(30px + env(safe-area-inset-bottom, 0px)) !important'
            }}
        >
            <Paper elevation={8} sx={{ p: 2, borderRadius: 3, maxWidth: 420, width: '100%' }}>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box
                        component="img"
                        src="/apple-touch-icon.png"
                        alt="CTMASS"
                        sx={{ width: 40, height: 40, borderRadius: 2, flexShrink: 0 }}
                    />
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            Install the CTMASS app
                        </Typography>
                        {iosHint ? (
                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                Tap <IosShareIcon sx={{ fontSize: 18 }} /> Share, then “Add to Home Screen”.
                            </Typography>
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Add CTMASS to your home screen for quick access and notifications.
                            </Typography>
                        )}
                        {!iosHint && (
                            <Button
                                size="small"
                                variant="contained"
                                startIcon={<GetAppIcon />}
                                onClick={handleInstall}
                                sx={{ mt: 1.5 }}
                            >
                                Install
                            </Button>
                        )}
                    </Box>
                    <IconButton size="small" onClick={handleClose} aria-label="Dismiss">
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Stack>
            </Paper>
        </Snackbar>
    );
};
