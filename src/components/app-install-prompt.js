import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, IconButton, Paper, Snackbar, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { BRAND, FONT, RADIUS, SHADOW } from 'src/theme/ctmass-tokens';
import CloseIcon from '@mui/icons-material/Close';
import AppleIcon from '@mui/icons-material/Apple';
import ShopIcon from '@mui/icons-material/Shop';
import { APP_STORE_URL, GOOGLE_PLAY_URL, detectMobilePlatform } from 'src/constants/mobile-apps';

const SNOOZE_KEY = 'appInstallSnoozedUntil';
const LEGACY_KEYS = ['pwaInstallCompleted', 'pwaInstallSnoozedUntil', 'pwaInstallDismissed'];
const DISMISS_SNOOZE_MS = 60 * 60 * 1000;
const STORE_SNOOZE_MS = 30 * 24 * 60 * 60 * 1000;

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
        console.warn('[app-install] storage unavailable');
    }
};

const clearStorage = (key) => {
    try {
        window.localStorage.removeItem(key);
    } catch (error) {
        console.warn('[app-install] storage unavailable');
    }
};

const snoozeLeft = () => {
    const until = Number(readStorage(SNOOZE_KEY));
    if (!Number.isFinite(until) || until <= Date.now()) {
        return 0;
    }
    return Math.min(until - Date.now(), STORE_SNOOZE_MS);
};

const snooze = (ms) => writeStorage(SNOOZE_KEY, String(Date.now() + ms));

const storeButtonSx = {
    flex: 1,
    whiteSpace: 'nowrap',
    backgroundColor: 'common.black',
    color: 'common.white',
    '&:hover': { backgroundColor: 'grey.800' }
};

export const AppInstallPrompt = () => {
    const platform = useMemo(detectMobilePlatform, []);
    const [open, setOpen] = useState(false);
    const revealRef = useRef(null);
    const paperRef = useRef(null);

    useEffect(() => {
        const root = document.documentElement;
        const node = paperRef.current;
        if (!open || !node || typeof ResizeObserver === 'undefined') {
            root.style.removeProperty('--ctmass-floating-offset');
            return undefined;
        }
        const update = () => {
            root.style.setProperty('--ctmass-floating-offset', `${Math.ceil(node.getBoundingClientRect().height) + 30}px`);
        };
        update();
        const observer = new ResizeObserver(update);
        observer.observe(node);
        return () => {
            observer.disconnect();
            root.style.removeProperty('--ctmass-floating-offset');
        };
    }, [open]);

    useEffect(() => {
        LEGACY_KEYS.forEach(clearStorage);
    }, []);

    useEffect(() => {
        let timer;

        const reveal = () => {
            const left = snoozeLeft();
            if (left > 0) {
                window.clearTimeout(timer);
                if (left <= DISMISS_SNOOZE_MS) {
                    timer = window.setTimeout(reveal, left + 1000);
                }
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
    }, []);

    const handleClose = () => {
        setOpen(false);
        snooze(DISMISS_SNOOZE_MS);
        revealRef.current?.();
    };

    const handleStoreClick = () => {
        setOpen(false);
        snooze(STORE_SNOOZE_MS);
    };

    const showAppStore = platform !== 'android';
    const showGooglePlay = platform !== 'ios';

    const description =
        platform === 'ios'
            ? 'Get CTMASS for iPhone from the App Store for quick access and notifications.'
            : platform === 'android'
                ? 'Get CTMASS for Android from Google Play for quick access and notifications.'
                : 'Get CTMASS on your phone for quick access and notifications.';

    return (
        <Snackbar
            open={open}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            sx={{
                zIndex: (theme) => theme.zIndex.speedDial,
                top: 'auto !important',
                bottom: 'calc(30px + env(safe-area-inset-bottom, 0px)) !important'
            }}
        >
            <Paper
                ref={paperRef}
                elevation={0}
                sx={{
                    p: 2,
                    borderRadius: RADIUS.card,
                    maxWidth: 420,
                    width: '100%',
                    border: `1px solid ${alpha(BRAND.navy, 0.08)}`,
                    boxShadow: SHADOW.lg
                }}
            >
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box
                        component="img"
                        src="/apple-touch-icon.png"
                        alt="CTMASS"
                        sx={{ width: 44, height: 44, borderRadius: '12px', flexShrink: 0 }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 16, color: BRAND.navy }}>
                            Get the CTMASS app
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {description}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                            {showAppStore && (
                                <Button
                                    size="small"
                                    variant="contained"
                                    href={APP_STORE_URL}
                                    target="_blank"
                                    rel="noopener"
                                    startIcon={<AppleIcon />}
                                    onClick={handleStoreClick}
                                    sx={storeButtonSx}
                                >
                                    App Store
                                </Button>
                            )}
                            {showGooglePlay && (
                                <Button
                                    size="small"
                                    variant="contained"
                                    href={GOOGLE_PLAY_URL}
                                    target="_blank"
                                    rel="noopener"
                                    startIcon={<ShopIcon />}
                                    onClick={handleStoreClick}
                                    sx={storeButtonSx}
                                >
                                    Google Play
                                </Button>
                            )}
                        </Stack>
                    </Box>
                    <IconButton size="small" onClick={handleClose} aria-label="Dismiss">
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Stack>
            </Paper>
        </Snackbar>
    );
};
