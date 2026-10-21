import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    IconButton,
    InputAdornment,
    Stack,
    TextField,
    Typography,
    useMediaQuery
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import GoogleIcon from '@mui/icons-material/Google';
import AppleIcon from '@mui/icons-material/Apple';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PhonelinkLockOutlinedIcon from '@mui/icons-material/PhonelinkLockOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import toast from 'react-hot-toast';
import zxcvbn from 'zxcvbn';
import { EmailAuthProvider, getAuth, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { Seo } from 'src/components/seo';
import { useAuth } from 'src/hooks/use-auth';
import { usersApi } from 'src/api/users';
import { firebaseApp } from 'src/libs/firebase';
import { BackLink, btn, DashPage, IconTile, StatusPill, Surface, SurfaceHeader } from 'src/components/ctmass-ui';
import { paths } from 'src/paths';
import { BRAND, FONT, RADIUS, SHADOW } from 'src/theme/ctmass-tokens';

const STRENGTH = [
    { label: 'Too weak', color: BRAND.danger },
    { label: 'Weak', color: BRAND.danger },
    { label: 'Fair', color: '#B54708' },
    { label: 'Strong', color: BRAND.green },
    { label: 'Very strong', color: BRAND.green }
];

const PROVIDERS = {
    'google.com': { label: 'Google', icon: <GoogleIcon /> },
    'apple.com': { label: 'Apple', icon: <AppleIcon /> },
    password: { label: 'Email and password', icon: <MailOutlineRoundedIcon /> }
};

const PASSWORD_ERRORS = {
    'auth/wrong-password': 'The current password is incorrect.',
    'auth/invalid-credential': 'The current password is incorrect.',
    'auth/too-many-requests': 'Too many attempts. Wait a few minutes and try again.',
    'auth/weak-password': 'Choose a stronger password.',
    'auth/requires-recent-login': 'Please log out, log in again and retry.'
};

const PasswordField = ({ label, value, onChange, autoComplete, helperText, error }) => {
    const [visible, setVisible] = useState(false);

    return (
        <TextField
            fullWidth
            variant="outlined"
            label={label}
            type={visible ? 'text' : 'password'}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            autoComplete={autoComplete}
            helperText={helperText}
            error={error}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible((v) => !v)} edge="end">
                            {visible ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                        </IconButton>
                    </InputAdornment>
                )
            }}
        />
    );
};

const SecurityAccessPage = () => {
    const auth = useAuth();
    const { user } = auth || {};
    const signOut = auth?.signOut ?? (async () => { });
    const fullScreen = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    const [providers, setProviders] = useState([]);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [deletingAccount, setDeletingAccount] = useState(false);

    useEffect(() => {
        const current = getAuth(firebaseApp).currentUser;
        setProviders((current?.providerData || []).map((item) => ({
            id: item.providerId,
            email: item.email || current?.email || user?.email || ''
        })));
    }, [user]);

    const hasPasswordLogin = providers.some((item) => item.id === 'password');

    const strength = useMemo(() => {
        if (!newPassword) return null;
        const score = Math.min(Math.max(zxcvbn(newPassword).score, 0), STRENGTH.length - 1);
        return { score, ...STRENGTH[score] };
    }, [newPassword]);

    const mismatch = !!confirmPassword && confirmPassword !== newPassword;

    const handlePasswordSubmit = useCallback(async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error('Fill in all three password fields.');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("The new passwords don't match.");
            return;
        }
        if (newPassword.length < 8 || (strength?.score ?? 0) < 2) {
            toast.error('Choose a stronger password: at least 8 characters with letters and numbers.');
            return;
        }

        const current = getAuth(firebaseApp).currentUser;
        if (!current?.email) {
            toast.error('Please log in again and retry.');
            return;
        }

        try {
            setPasswordSaving(true);
            const credential = EmailAuthProvider.credential(current.email, currentPassword);
            await reauthenticateWithCredential(current, credential);
            await updatePassword(current, newPassword);
            toast.success('Password updated');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('[SecurityAccess] Change password failed:', error);
            toast.error(PASSWORD_ERRORS[error?.code] || "We couldn't update your password. Please try again.");
        } finally {
            setPasswordSaving(false);
        }
    }, [confirmPassword, currentPassword, newPassword, strength]);

    const closeDeleteDialog = useCallback(() => {
        setDeleteDialogOpen(false);
        setDeleteConfirm('');
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (!user?.id) {
            toast.error('User not found');
            return;
        }

        try {
            setDeletingAccount(true);
            await usersApi.deleteUser(user.id);
            toast.success('Your account was deleted');
            await signOut();
            window.location.replace('/');
        } catch (error) {
            console.error('[SecurityAccess] Delete account failed:', error);
            toast.error("We couldn't delete your account. Please contact support@ctmass.com.");
        } finally {
            setDeletingAccount(false);
        }
    }, [signOut, user?.id]);

    return (
        <>
            <Seo title="Security and access" />

            <DashPage
                title="Security and access"
                subtitle="Your password, sign-in methods and account deletion."
                back={<BackLink href={paths.dashboard.profile.information}>Profile settings</BackLink>}
                maxWidth="lg"
            >
                <Stack spacing={{ xs: 2.5, md: 3 }}>
                    <Surface>
                        <SurfaceHeader
                            icon={<LockOutlinedIcon />}
                            title="Password"
                            subtitle={hasPasswordLogin
                                ? 'Use at least 8 characters with letters, numbers and symbols.'
                                : 'You sign in with Google or Apple, so there is no CTMASS password to change.'}
                        />
                        {hasPasswordLogin ? (
                            <Box
                                component="form"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    handlePasswordSubmit();
                                }}
                                sx={{ maxWidth: 560 }}
                            >
                                <Stack spacing={2.5}>
                                    <PasswordField label="Current password" value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" />
                                    <Box>
                                        <PasswordField label="New password" value={newPassword} onChange={setNewPassword} autoComplete="new-password" />
                                        {strength && (
                                            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: 1.25 }}>
                                                <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.5 }}>
                                                    {[1, 2, 3, 4].map((step) => (
                                                        <Box
                                                            key={step}
                                                            sx={{
                                                                height: 6,
                                                                borderRadius: RADIUS.pill,
                                                                bgcolor: strength.score >= step ? strength.color : alpha(BRAND.navy, 0.1),
                                                                transition: 'background-color .2s ease'
                                                            }}
                                                        />
                                                    ))}
                                                </Box>
                                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: strength.color, minWidth: 84, textAlign: 'right' }}>
                                                    {strength.label}
                                                </Typography>
                                            </Stack>
                                        )}
                                    </Box>
                                    <PasswordField
                                        label="Confirm new password"
                                        value={confirmPassword}
                                        onChange={setConfirmPassword}
                                        autoComplete="new-password"
                                        error={mismatch}
                                        helperText={mismatch ? "The passwords don't match." : ' '}
                                    />
                                    <Button type="submit" disabled={passwordSaving} sx={{ ...btn.green, alignSelf: { xs: 'stretch', sm: 'flex-start' }, px: 3 }}>
                                        {passwordSaving ? 'Saving...' : 'Update password'}
                                    </Button>
                                </Stack>
                            </Box>
                        ) : null}
                    </Surface>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' }, gap: { xs: 2.5, md: 3 } }}>
                        <Surface>
                            <SurfaceHeader icon={<VerifiedUserOutlinedIcon />} title="Sign-in methods" subtitle="How you log in to CTMASS." />
                            <Stack spacing={1}>
                                {providers.length === 0 && (
                                    <Typography sx={{ color: BRAND.muted }}>No sign-in methods found.</Typography>
                                )}
                                {providers.map((item) => {
                                    const meta = PROVIDERS[item.id] || { label: item.id, icon: <VerifiedUserOutlinedIcon /> };
                                    return (
                                        <Stack
                                            key={item.id}
                                            direction="row"
                                            alignItems="center"
                                            spacing={1.5}
                                            sx={{ p: 1.5, borderRadius: RADIUS.inner, bgcolor: BRAND.mist }}
                                        >
                                            <IconTile size={40} tone="navy">{meta.icon}</IconTile>
                                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                                <Typography sx={{ fontWeight: 700, color: BRAND.ink }}>{meta.label}</Typography>
                                                <Typography noWrap title={item.email} sx={{ fontSize: 13, color: BRAND.muted }}>{item.email}</Typography>
                                            </Box>
                                            <StatusPill>Active</StatusPill>
                                        </Stack>
                                    );
                                })}
                            </Stack>
                        </Surface>

                        <Surface>
                            <SurfaceHeader
                                icon={<PhonelinkLockOutlinedIcon />}
                                title="Two-factor authentication"
                                action={<StatusPill tone="navy">Coming soon</StatusPill>}
                            />
                            <Typography sx={{ color: BRAND.muted, lineHeight: 1.6 }}>
                                Soon you will be able to add a second step with an authenticator app. We will let you know when it is ready.
                            </Typography>
                        </Surface>
                    </Box>

                    <Surface sx={{ borderColor: alpha(BRAND.danger, 0.3) }}>
                        <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between" sx={{ gap: 2.5 }}>
                            <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                <IconTile size={40} sx={{ bgcolor: alpha(BRAND.danger, 0.1), color: BRAND.danger }}><DeleteForeverOutlinedIcon /></IconTile>
                                <Box>
                                    <Typography component="h2" sx={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 20, color: BRAND.danger }}>Delete account</Typography>
                                    <Typography sx={{ mt: 0.5, maxWidth: 560, color: BRAND.muted, lineHeight: 1.6 }}>
                                        Permanently removes your profile, projects and messages. This cannot be undone.
                                    </Typography>
                                </Box>
                            </Stack>
                            <Button
                                onClick={() => setDeleteDialogOpen(true)}
                                sx={{ ...btn.outline, flexShrink: 0, color: BRAND.danger, borderColor: alpha(BRAND.danger, 0.4), '&:hover': { bgcolor: alpha(BRAND.danger, 0.06), borderColor: BRAND.danger } }}
                            >
                                Delete my account
                            </Button>
                        </Stack>
                    </Surface>
                </Stack>
            </DashPage>

            <Dialog
                open={deleteDialogOpen}
                onClose={deletingAccount ? undefined : closeDeleteDialog}
                maxWidth="xs"
                fullWidth
                fullScreen={fullScreen}
                PaperProps={{ sx: { borderRadius: { xs: 0, sm: RADIUS.card }, boxShadow: SHADOW.lg } }}
            >
                <DialogContent sx={{ p: { xs: 3, sm: 3.5 }, pt: { xs: 'calc(env(safe-area-inset-top) + 32px)', sm: 3.5 } }}>
                    <IconTile size={52} sx={{ bgcolor: alpha(BRAND.danger, 0.1), color: BRAND.danger }}><WarningAmberRoundedIcon /></IconTile>
                    <Typography component="h2" sx={{ mt: 2, fontFamily: FONT.display, fontWeight: 800, fontSize: 22, color: BRAND.navy }}>
                        Delete your account?
                    </Typography>
                    <Typography sx={{ mt: 1, color: BRAND.muted, lineHeight: 1.6 }}>
                        Your profile, projects and messages will be removed for good. Type DELETE to confirm.
                    </Typography>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="DELETE"
                        value={deleteConfirm}
                        onChange={(event) => setDeleteConfirm(event.target.value)}
                        sx={{ mt: 2.5 }}
                        inputProps={{ 'aria-label': 'Type DELETE to confirm' }}
                    />
                    <Stack direction={{ xs: 'column-reverse', sm: 'row' }} justifyContent="flex-end" spacing={1} sx={{ mt: 3 }}>
                        <Button onClick={closeDeleteDialog} disabled={deletingAccount} sx={btn.text}>Cancel</Button>
                        <Button
                            onClick={handleConfirmDelete}
                            disabled={deleteConfirm.trim().toUpperCase() !== 'DELETE' || deletingAccount}
                            sx={{ ...btn.green, bgcolor: BRAND.danger, boxShadow: 'none', '&:hover': { bgcolor: '#D92D20' } }}
                        >
                            {deletingAccount ? 'Deleting...' : 'Delete account'}
                        </Button>
                    </Stack>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default SecurityAccessPage;
