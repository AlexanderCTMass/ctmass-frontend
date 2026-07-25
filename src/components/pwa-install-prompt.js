import { useEffect, useRef, useState } from 'react';
import { Box, Button, IconButton, Paper, Snackbar, Stack, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import IosShareIcon from '@mui/icons-material/IosShare';
import GetAppIcon from '@mui/icons-material/GetApp';

const INSTALLED_KEY = 'pwaInstallCompleted';
const SNOOZE_KEY = 'pwaInstallSnoozedUntil';
const LEGACY_DISMISS_KEY = 'pwaInstallDismissed';
const SNOOZE_MS = 60 * 60 * 1000;

const readStorage = (key) => {
    try {
        return window.localStorage.getItem(key);
    } catch (error) {
        return null;
    }
};

const writeStorage = (key, value) => {
    try {
        window.localStorage.setItem(key, value);
    } catch (error) {
        console.warn('[pwa] storage unavailable');
    }
};

const clearStorage = (key) => {
    try {
        window.localStorage.removeItem(key);
    } catch (error) {
        console.warn('[pwa] storage unavailable');
    }
};

const isStandalone = () =>
    window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;

const isIos = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);

const snoozeLeft = () => {
    const until = Number(readStorage(SNOOZE_KEY));
    if (!Number.isFinite(until) || until <= Date.now()) {
        return 0;
    }
    return Math.min(until - Date.now(), SNOOZE_MS);
};

const snooze = () => writeStorage(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));

const markInstalled = () => {
    writeStorage(INSTALLED_KEY, '1');
    clearStorage(SNOOZE_KEY);
};

export const PwaInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [open, setOpen] = useState(false);
    const [iosHint, setIosHint] = useState(false);
    const revealRef = useRef(null);

    useEffect(() => {
        clearStorage(LEGACY_DISMISS_KEY);

        if (isStandalone() || readStorage(INSTALLED_KEY)) {
            return undefined;
        }

        let timer;

        const reveal = (ios) => {
            const left = snoozeLeft();
            if (left > 0) {
                window.clearTimeout(timer);
                timer = window.setTimeout(() => reveal(ios), left + 1000);
                return;
            }
            setIosHint(ios);
            setOpen(true);
        };

        revealRef.current = reveal;

        const onBeforeInstallPrompt = (event) => {
            event.preventDefault();
            window.__ctmassInstallPrompt = event;
            setDeferredPrompt(event);
            reveal(false);
        };

        window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);

        if (window.__ctmassInstallPrompt) {
            setDeferredPrompt(window.__ctmassInstallPrompt);
            reveal(false);
        } else if (isIos()) {
            // iOS Safari doesn't fire beforeinstallprompt — show manual instructions.
            reveal(true);
        }

        const onInstalled = () => {
            setOpen(false);
            setDeferredPrompt(null);
            window.__ctmassInstallPrompt = null;
            markInstalled();
        };
        window.addEventListener('appinstalled', onInstalled);

        return () => {
            window.clearTimeout(timer);
            revealRef.current = null;
            window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
            window.removeEventListener('appinstalled', onInstalled);
        };
    }, []);

    const handleClose = () => {
        setOpen(false);
        snooze();
        revealRef.current?.(iosHint);
    };

    const handleInstall = async () => {
        if (!deferredPrompt) {
            return;
        }
        setOpen(false);
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        window.__ctmassInstallPrompt = null;

        if (choice?.outcome === 'accepted') {
            markInstalled();
        } else {
            snooze();
        }
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
