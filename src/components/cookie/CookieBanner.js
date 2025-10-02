import { useState, useEffect } from 'react';
import {
    Box, Button, Typography, Stack, Switch, Divider, Slide, Link
} from '@mui/material';
import {
    getConsent, acceptAll, declineAll,
    getPrefs, saveCustom
} from './cookie-consent';

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
        acceptAll();
        setOpen(false);
        window.location.reload();
    };

    const handleDecline = () => {
        declineAll();
        setOpen(false);
    };

    const handleSave = () => {
        saveCustom(prefs);
        setOpen(false);
        window.location.reload();
    };

    if (!open) return null;

    return (
        <Slide direction="up" in={open} mountOnEnter unmountOnExit>
            <Box sx={{
                position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 13000000,
                bgcolor: 'rgba(0,0,0,0.85)', color: '#fff', p: 3
            }}>
                {!showPrefs ? (
                    <Stack spacing={2}>
                        <Typography variant="h6">Cookie Preferences</Typography>
                        <Typography variant="body2">
                            We use cookies to enhance your browsing experience and analyse our traffic.
                            By clicking <q>I Agree</q> you consent to our use of cookies.
                        </Typography>
                        <Stack direction="row" spacing={2}>
                            <Button variant="contained" color="primary" onClick={handleAgree}>I Agree</Button>
                            <Button variant="outlined" color="inherit" onClick={handleDecline}>I Decline</Button>
                            <Button color="inherit" onClick={() => setShowPrefs(true)}>Change my preference</Button>
                        </Stack>
                        <Link href="/privacy-policy" color="inherit" underline="always">
                            Read our Privacy Policy
                        </Link>
                    </Stack>
                ) : (
                    <Stack spacing={2}>
                        <Typography variant="h6">Manage cookie categories</Typography>

                        <Stack direction="row" justifyContent="space-between">
                            <Typography>Essential cookies</Typography>
                            <Typography variant="caption">Always active</Typography>
                        </Stack>

                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

                        <Stack direction="row" justifyContent="space-between">
                            <Typography>Analytics cookies</Typography>
                            <Switch
                                color="primary"
                                checked={prefs.analytics}
                                onChange={e => setPrefs(p => ({ ...p, analytics: e.target.checked }))}
                            />
                        </Stack>

                        <Stack direction="row" justifyContent="space-between">
                            <Typography>Marketing cookies</Typography>
                            <Switch
                                color="primary"
                                checked={prefs.marketing}
                                onChange={e => setPrefs(p => ({ ...p, marketing: e.target.checked }))}
                            />
                        </Stack>

                        <Stack direction="row" spacing={2} pt={1}>
                            <Button variant="contained" onClick={handleSave}>Save preferences</Button>
                            <Button color="inherit" onClick={() => setShowPrefs(false)}>Cancel</Button>
                        </Stack>
                    </Stack>
                )}
            </Box>
        </Slide>
    );
}