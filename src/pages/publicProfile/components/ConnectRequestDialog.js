import { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogTitle,
    Divider,
    IconButton,
    Snackbar,
    Stack,
    Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { trackEvent } from 'src/libs/analytics/ga4';
import { useAuth } from 'src/hooks/use-auth';
import { sendFriendRequestWithCategories } from 'src/service/friend-service';
import { paths } from 'src/paths';
import { CATEGORY_META } from 'src/pages/cabinet/profiles/my/Connections/utils';

const PENDING_QR_CONNECT_KEY = 'qrConnect';

const RoleCard = ({ categoryKey, meta, selected, onToggle }) => {
    const theme = useTheme();
    return (
        <Box
            onClick={() => onToggle(categoryKey)}
            sx={{
                position: 'relative',
                flex: '1 1 calc(50% - 8px)',
                minWidth: 0,
                p: 1.5,
                borderRadius: 2,
                border: '2px solid',
                borderColor: selected ? theme.palette[meta.color]?.main || 'primary.main' : 'divider',
                bgcolor: selected ? `${meta.color}.lighter` : 'background.paper',
                cursor: 'pointer',
                transition: 'all 0.15s',
                '&:hover': {
                    borderColor: theme.palette[meta.color]?.main || 'primary.main',
                    bgcolor: `${meta.color}.lighter`
                }
            }}
        >
            {selected && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: `${meta.color}.main`,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <CheckIcon sx={{ fontSize: 14 }} />
                </Box>
            )}
            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                <Box sx={{ color: `${meta.color}.main` }}>{meta.icon}</Box>
                <Typography variant="body2" fontWeight={selected ? 700 : 500} noWrap>
                    {meta.title}
                </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.3 }}>
                {meta.description}
            </Typography>
        </Box>
    );
};

RoleCard.propTypes = {
    categoryKey: PropTypes.string.isRequired,
    meta: PropTypes.object.isRequired,
    selected: PropTypes.bool,
    onToggle: PropTypes.func.isRequired
};

export const ConnectRequestDialog = ({ open, onClose, ownerProfile, ownerId }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [selectedCategories, setSelectedCategories] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const ownerName = useMemo(
        () =>
            ownerProfile?.displayName ||
            ownerProfile?.businessName ||
            ownerProfile?.name ||
            'this member',
        [ownerProfile]
    );

    const isRealUser = !!user && !user.isAnonymous;
    const canSubmit = selectedCategories.length > 0 && !submitting && !!ownerId;

    const toggleCategory = useCallback((key) => {
        setSelectedCategories((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!canSubmit) {
            return;
        }

        if (isRealUser && user.id !== ownerId) {
            setSubmitting(true);
            try {
                await sendFriendRequestWithCategories(user, ownerId, selectedCategories);
                trackEvent('qr_connect_request', { categories: selectedCategories, logged_in: true });
                setSubmitted(true);
            } catch (error) {
                console.error('Error creating connection:', error);
                setSnackbar({ open: true, message: 'Something went wrong. Please try again.', severity: 'error' });
            } finally {
                setSubmitting(false);
            }
            return;
        }

        try {
            window.localStorage.setItem(
                PENDING_QR_CONNECT_KEY,
                JSON.stringify({ targetUserId: ownerId, cats: selectedCategories })
            );
        } catch (e) {
            console.error('Failed to persist pending connection:', e);
        }
        trackEvent('qr_connect_request', { categories: selectedCategories, logged_in: false });
        navigate(paths.register.index);
    }, [canSubmit, isRealUser, user, ownerId, selectedCategories, navigate]);

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="body">
                <DialogTitle sx={{ pr: 6 }}>
                    {submitted ? `Request sent to ${ownerName}` : `Add ${ownerName} to your friends on CTMASS`}
                    <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <Divider />

                {submitted ? (
                    <Box sx={{ p: 3 }}>
                        <Stack spacing={2} alignItems="center" textAlign="center">
                            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 56 }} />
                            <Typography variant="h6">Friend request sent</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {ownerName} will see your request in their connections and can accept it.
                            </Typography>
                            <Button variant="contained" onClick={onClose}>
                                Done
                            </Button>
                        </Stack>
                    </Box>
                ) : (
                    <Box sx={{ p: 3 }}>
                        <Stack spacing={2.5}>
                            <Typography variant="body2" color="text.secondary">
                                Send {ownerName} a friend request on CTMASS.com and choose which of your lists to add
                                them to. You can pick more than one.
                            </Typography>

                            <Box>
                                <Typography variant="body2" fontWeight={600} mb={1.5}>
                                    Add {ownerName} to
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {Object.entries(CATEGORY_META).map(([key, meta]) => (
                                        <RoleCard
                                            key={key}
                                            categoryKey={key}
                                            meta={meta}
                                            selected={selectedCategories.includes(key)}
                                            onToggle={toggleCategory}
                                        />
                                    ))}
                                </Box>
                            </Box>

                            {!isRealUser && (
                                <Typography variant="caption" color="text.secondary">
                                    You will be asked to sign in or create a profile — your request is sent
                                    automatically right after.
                                </Typography>
                            )}

                            <Box textAlign="right">
                                <Button variant="contained" disabled={!canSubmit} onClick={handleSubmit}>
                                    {submitting ? 'Sending...' : `Add ${ownerName}`}
                                </Button>
                            </Box>
                        </Stack>
                    </Box>
                )}
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

ConnectRequestDialog.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    ownerProfile: PropTypes.object,
    ownerId: PropTypes.string
};

ConnectRequestDialog.defaultProps = {
    open: false,
    ownerProfile: null,
    ownerId: ''
};

export default ConnectRequestDialog;
