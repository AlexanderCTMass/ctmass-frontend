import { useState, useEffect } from 'react';
import {
    Box, Button, Typography, Stack, Switch, Divider, Slide, Link, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CookieIcon from '@mui/icons-material/Cookie';
import { logEvent } from 'firebase/analytics';
import { analytics } from 'src/libs/firebase';
import {
    getConsent, acceptAll, declineAll,
    getPrefs, saveCustom
} from './cookie-consent';

const trackCookieChoice = (action, prefs = {}) => {
    if (!analytics) return;
    logEvent(analytics, "cookie_consent", {
        action,
        ...prefs
    });
};

export default function CookieBanner() {
    const [open, setOpen] = useState(false);
    const [showPrefs, setShowPrefs] = useState(false);
    const [prefs, setPrefs] = useState(() => (
        getPrefs() || { analytics: false, marketing: false }
    ));

    useEffect(() => {
        if (!getConsent()) setOpen(true);
    }, []);

    const handleAgree = () => {
        trackCookieChoice("accept_all");
        acceptAll();
        setOpen(false);
        window.location.reload();
    };

    const handleDecline = () => {
        trackCookieChoice("decline_all");
        declineAll();
        setOpen(false);
    };

    const handleSave = () => {
        trackCookieChoice("save_custom", prefs);
        saveCustom(prefs);
        setOpen(false);
        window.location.reload();
    };

    if (!open) return null;

    return (
        <Slide direction="up" in={open} mountOnEnter unmountOnExit>
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    zIndex: 13000000,
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    boxShadow: 8,
                    border: '1px solid',
                    borderColor: 'divider',
                    p: 2.5,
                    maxWidth: 360,
                    width: { xs: 'calc(100vw - 32px)', sm: 360 }
                }}
            >
                {!showPrefs ? (
                    <Stack spacing={2}>
                        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <CookieIcon color="primary" fontSize="small" />
                                <Typography variant="subtitle2" fontWeight={700}>
                                    Cookie Preferences
                                </Typography>
                            </Stack>
                            <IconButton size="small" onClick={handleDecline} sx={{ mt: -0.5, mr: -0.5 }}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Stack>

                        <Typography variant="body2" color="text.secondary">
                            We use cookies to enhance your experience and analyse traffic.{' '}
                            <Link href="/privacy-policy" underline="always" variant="body2">
                                Privacy Policy
                            </Link>
                        </Typography>

                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleAgree}
                                sx={{ flex: 1 }}
                            >
                                Accept all
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => setShowPrefs(true)}
                                sx={{ flex: 1 }}
                            >
                                Manage
                            </Button>
                        </Stack>
                    </Stack>
                ) : (
                    <Stack spacing={2}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography variant="subtitle2" fontWeight={700}>
                                Manage cookies
                            </Typography>
                            <IconButton size="small" onClick={() => setShowPrefs(false)} sx={{ mt: -0.5, mr: -0.5 }}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Stack>

                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                                <Typography variant="body2">Essential</Typography>
                                <Typography variant="caption" color="text.secondary">Always active</Typography>
                            </Box>
                            <Switch size="small" checked disabled />
                        </Stack>

                        <Divider />

                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2">Analytics</Typography>
                            <Switch
                                size="small"
                                color="primary"
                                checked={prefs.analytics}
                                onChange={e => setPrefs(p => ({ ...p, analytics: e.target.checked }))}
                            />
                        </Stack>

                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2">Marketing</Typography>
                            <Switch
                                size="small"
                                color="primary"
                                checked={prefs.marketing}
                                onChange={e => setPrefs(p => ({ ...p, marketing: e.target.checked }))}
                            />
                        </Stack>

                        <Stack direction="row" spacing={1} pt={0.5}>
                            <Button variant="contained" size="small" onClick={handleSave} sx={{ flex: 1 }}>
                                Save
                            </Button>
                            <Button variant="outlined" size="small" onClick={handleDecline} sx={{ flex: 1 }}>
                                Decline all
                            </Button>
                        </Stack>
                    </Stack>
                )}
            </Box>
        </Slide>
    );
}
