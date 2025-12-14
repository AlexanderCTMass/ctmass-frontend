import { useCallback, useEffect, useMemo, useState } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    FormControlLabel,
    Grid,
    LinearProgress,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Stack,
    Switch,
    TextField,
    Typography
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import GoogleIcon from '@mui/icons-material/Google';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import toast from 'react-hot-toast';
import zxcvbn from 'zxcvbn';

import { Seo } from 'src/components/seo';
import { useAuth } from 'src/hooks/use-auth';
import { cabinetApi } from 'src/api/cabinet';
import { usersApi } from 'src/api/users';

const strengthPalette = [
    { label: 'Too weak', color: 'error.main', background: 'error.light', percent: 5 },
    { label: 'Weak', color: 'error.main', background: 'error.light', percent: 25 },
    { label: 'Medium', color: 'warning.main', background: 'warning.light', percent: 55 },
    { label: 'Strong', color: 'success.main', background: 'success.light', percent: 80 },
    { label: 'Very strong', color: 'success.main', background: 'success.light', percent: 100 }
];

const buildGoogleAccount = (email) => ({
    id: 'google',
    provider: 'Google',
    email
});

const SecurityAccessPage = () => {
    const theme = useTheme();
    const auth = useAuth();
    const { user } = auth || {};
    const signOut = auth?.signOut ?? (async () => { });

    const [profileEmail, setProfileEmail] = useState('');
    const [connectedAccounts, setConnectedAccounts] = useState([]);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordSaving, setPasswordSaving] = useState(false);

    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [twoFactorSaving, setTwoFactorSaving] = useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            if (!user?.id) return;
            try {
                const profile = await cabinetApi.getProfileInformation(user.id);
                const email = profile?.primaryEmail || user?.email || '';
                setProfileEmail(email);
                setConnectedAccounts([buildGoogleAccount(email)]);
            } catch (error) {
                console.error('[SecurityAccess] Failed to load profile:', error);
                toast.error('Failed to load profile data');
            }
        };

        loadProfile();
    }, [user]);

    const passwordStrength = useMemo(() => {
        if (!newPassword) {
            return { score: 0, ...strengthPalette[0] };
        }
        const analysis = zxcvbn(newPassword);
        const score = Math.min(Math.max(analysis.score, 0), strengthPalette.length - 1);
        return { score, ...strengthPalette[score] };
    }, [newPassword]);

    const handleDisconnect = useCallback((accountId) => {
        setConnectedAccounts((prev) => prev.filter((item) => item.id !== accountId));
        toast.success('The account is temporarily disabled.');
    }, []);

    const handleReconnect = useCallback(() => {
        toast('The account connection feature will be available later 👷');
    }, []);

    const handlePasswordSubmit = useCallback(async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error('Please fill in all password fields.');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("The passwords don't match");
            return;
        }
        if (passwordStrength.score < 2) {
            toast.error('The password is too simple, make it stronger.');
            return;
        }

        try {
            setPasswordSaving(true);
            await new Promise((resolve) => setTimeout(resolve, 800));
            toast.success('Password updated');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('[SecurityAccess] Change password failed:', error);
            toast.error('Failed to update password');
        } finally {
            setPasswordSaving(false);
        }
    }, [confirmPassword, currentPassword, newPassword, passwordStrength.score]);

    const handleTwoFactorToggle = useCallback(async (event) => {
        const next = event.target.checked;
        try {
            setTwoFactorSaving(true);
            await new Promise((resolve) => setTimeout(resolve, 500));
            setTwoFactorEnabled(next);
            toast.success(next ? '2FA is enabled' : '2FA is disabled');
        } catch (error) {
            console.error('[SecurityAccess] Toggle 2FA failed:', error);
            toast.error('Unable to change 2FA settings');
        } finally {
            setTwoFactorSaving(false);
        }
    }, []);

    const handleSetupTwoFactor = useCallback(() => {
        toast('2FA setup will be available later.');
    }, []);

    const openDeleteDialog = useCallback(() => setDeleteDialogOpen(true), []);
    const closeDeleteDialog = useCallback(() => setDeleteDialogOpen(false), []);

    const handleConfirmDelete = useCallback(async () => {
        if (!user?.id) {
            toast.error('User not found');
            return;
        }

        try {
            setDeletingAccount(true);
            await usersApi.deleteUser(user.id);
            toast.success('The account has been deleted');
            await signOut();
            window.location.replace('/');
        } catch (error) {
            console.error('[SecurityAccess] Delete account failed:', error);
            toast.error('Failed to delete account');
        } finally {
            setDeletingAccount(false);
        }
    }, [signOut, user?.id]);

    return (
        <>
            <Seo title="Profile settings — Security & access" />

            <Box
                component="main"
                sx={{
                    px: { xs: 2, sm: 3, lg: 6 },
                    py: { xs: 7, sm: 8 },
                    pb: { xs: 14, md: 18 },
                    maxWidth: 1280
                }}
            >
                <Stack spacing={4}>
                    <Stack spacing={1}>
                        <Typography variant="h4" fontWeight={700}>
                            Profile settings
                        </Typography>
                    </Stack>

                    <Card variant="outlined">
                        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                            <Stack spacing={4}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <LockOutlinedIcon color="primary" />
                                    <Typography variant="h6">Security &amp; Access</Typography>
                                </Stack>

                                <Grid container>
                                    <Grid item xs={12} md={6}>
                                        <Stack spacing={2.5} mr={6}>
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                Change password
                                            </Typography>

                                            <TextField
                                                label="Current password"
                                                type="password"
                                                value={currentPassword}
                                                onChange={(event) => setCurrentPassword(event.target.value)}
                                                fullWidth
                                            />

                                            <TextField
                                                label="New password"
                                                type="password"
                                                value={newPassword}
                                                onChange={(event) => setNewPassword(event.target.value)}
                                                fullWidth
                                                helperText={
                                                    <Stack spacing={0.75} sx={{ mt: 1 }}>
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <Box
                                                                sx={{
                                                                    flexGrow: 1,
                                                                    borderRadius: 999,
                                                                    overflow: 'hidden',
                                                                    border: `1px solid ${alpha(theme.palette.divider, 0.6)}`
                                                                }}
                                                            >
                                                                <LinearProgress
                                                                    variant="determinate"
                                                                    value={passwordStrength.percent}
                                                                    sx={{
                                                                        height: 8,
                                                                        '& .MuiLinearProgress-bar': {
                                                                            backgroundColor: theme.palette[passwordStrength.color.split('.')[0]]?.main
                                                                                || theme.palette.primary.main
                                                                        },
                                                                        backgroundColor: alpha(theme.palette[passwordStrength.color.split('.')[0]]?.main || theme.palette.primary.main, 0.08)
                                                                    }}
                                                                />
                                                            </Box>
                                                            <Typography
                                                                variant="caption"
                                                                color={passwordStrength.color}
                                                                fontWeight={600}
                                                            >
                                                                Strength: {passwordStrength.label}
                                                            </Typography>
                                                        </Stack>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Use at least 8 characters, include letters, numbers and symbols.
                                                        </Typography>
                                                    </Stack>
                                                }
                                            />

                                            <TextField
                                                label="Confirm password"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(event) => setConfirmPassword(event.target.value)}
                                                fullWidth
                                            />

                                            <LoadingButton
                                                variant="contained"
                                                onClick={handlePasswordSubmit}
                                                loading={passwordSaving}
                                                sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, minWidth: 180 }}
                                            >
                                                Save password
                                            </LoadingButton>
                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Stack spacing={2.5}>
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                Two-Factor Authentication
                                            </Typography>

                                            <Typography variant="body2" color="text.secondary">
                                                Protect your account with an extra layer of security. You’ll need a mobile authenticator app for setup.
                                            </Typography>

                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={twoFactorEnabled}
                                                        onChange={handleTwoFactorToggle}
                                                        disabled={twoFactorSaving}
                                                        color="primary"
                                                    />
                                                }
                                                label={twoFactorEnabled ? '2FA enabled' : 'Enable 2FA'}
                                            />

                                            <Button
                                                variant="outlined"
                                                startIcon={<SecurityOutlinedIcon />}
                                                onClick={handleSetupTwoFactor}
                                                disabled={!twoFactorEnabled}
                                                sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, minWidth: 160 }}
                                            >
                                                Setup 2FA
                                            </Button>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Card variant="outlined">
                        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                            <Stack spacing={3}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <VerifiedUserOutlinedIcon color="primary" />
                                    <Typography variant="h6">Connected accounts</Typography>
                                </Stack>

                                <Typography variant="body2" color="text.secondary">
                                    Manage social login providers linked to your profile.
                                </Typography>

                                {connectedAccounts.length === 0 ? (
                                    <Box
                                        sx={{
                                            borderRadius: 2,
                                            border: '1px dashed',
                                            borderColor: 'divider',
                                            p: 3
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            There are no connected accounts. Use the button below to connect.
                                        </Typography>
                                    </Box>
                                ) : (
                                    <List
                                        disablePadding
                                        sx={{
                                            borderRadius: 2,
                                            border: 1,
                                            borderColor: 'divider',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {connectedAccounts.map((account) => (
                                            <ListItem
                                                key={account.id}
                                                secondaryAction={
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        onClick={() => handleDisconnect(account.id)}
                                                    >
                                                        Disconnect
                                                    </Button>
                                                }
                                                sx={{
                                                    '& + &': {
                                                        borderTop: 1,
                                                        borderColor: 'divider'
                                                    }
                                                }}
                                            >
                                                <ListItemAvatar>
                                                    <Avatar
                                                        sx={{
                                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                            color: theme.palette.primary.main
                                                        }}
                                                    >
                                                        <GoogleIcon />
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={account.provider}
                                                    secondary={account.email}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                )}

                                <Button
                                    variant="outlined"
                                    onClick={handleReconnect}
                                    sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, minWidth: 210 }}
                                >
                                    Connect new account
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Card
                        variant="outlined"
                        sx={{
                            borderColor: alpha(theme.palette.error.main, 0.4)
                        }}
                    >
                        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                            <Stack spacing={3}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <DeleteForeverOutlinedIcon color="error" />
                                    <Typography variant="h6" color="error">
                                        Dangerous actions
                                    </Typography>
                                </Stack>

                                <Divider />

                                <Stack spacing={2}>
                                    <Typography variant="body2" color="text.secondary">
                                        Deleting your account will permanently remove your profile, projects and messages. This action cannot be undone.
                                    </Typography>

                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={openDeleteDialog}
                                        startIcon={<DeleteForeverOutlinedIcon />}
                                        sx={{
                                            alignSelf: { xs: 'stretch', sm: 'flex-start' },
                                            minWidth: 190,
                                            boxShadow: 'none'
                                        }}
                                    >
                                        Delete account
                                    </Button>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                </Stack>
            </Box>

            <Dialog
                open={deleteDialogOpen}
                onClose={closeDeleteDialog}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Confirm account deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete your account? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteDialog} disabled={deletingAccount}>
                        Cancel
                    </Button>
                    <LoadingButton
                        loading={deletingAccount}
                        onClick={handleConfirmDelete}
                        color="error"
                        variant="contained"
                    >
                        Delete
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SecurityAccessPage;