import { useEffect, useRef, useState } from 'react';
import { Box, Button, IconButton, Paper, Snackbar, Stack, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import IosShareIcon from '@mui/icons-material/IosShare';
import GetAppIcon from '@mui/icons-material/GetApp';
import { usePwaInstall } from 'src/hooks/use-pwa-install';

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
    const { canInstall, isInstalled, isIos, promptInstall } = usePwaInstall();
    const [open, setOpen] = useState(false);
    const revealRef = useRef(null);

    const iosHint = isIos && !canInstall;

    useEffect(() => {
        clearStorage(LEGACY_DISMISS_KEY);
    }, []);

    useEffect(() => {
        if (isInstalled) {
            setOpen(false);
            markInstalled();
            return undefined;
        }

        if (readStorage(INSTALLED_KEY) || (!canInstall && !isIos)) {
            return undefined;
        }

        let timer;

        const reveal = () => {
            const left = snoozeLeft();
            if (left > 0) {
                window.clearTimeout(timer);
                timer = window.setTimeout(reveal, left + 1000);
                return;
            }
            setOpen(true);
        };

        revealRef.current = reveal;
        reveal();

        return () => {
            window.clearTimeout(timer);
            revealRef.current = null;
        };
    }, [canInstall, isInstalled, isIos]);

    const handleClose = () => {
        setOpen(false);
        snooze();
        revealRef.current?.();
    };

    const handleInstall = async () => {
        setOpen(false);
        const outcome = await promptInstall();

        if (outcome === 'accepted') {
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
