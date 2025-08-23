import { useCallback, useEffect, useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Checkbox,
    Stack,
    Typography,
    IconButton,
    Chip,
    CircularProgress
} from '@mui/material';
import RecommendIcon from '@mui/icons-material/Recommend';
import PlaceIcon from '@mui/icons-material/Place';
import HandshakeIcon from '@mui/icons-material/Handshake';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from 'src/hooks/use-auth';
import { sendNotificationToUser } from 'src/notificationApi';
import { profileApi } from 'src/api/profile';
import { extendedProfileApi } from "../data/extendedProfileApi";
import toast from "react-hot-toast";

const CATEGORY_META = {
    trustedColleagues: { title: 'Trusted Colleagues', color: 'success', icon: <RecommendIcon fontSize="small" /> },
    localPros: { title: 'Local Pros', color: 'info', icon: <PlaceIcon fontSize="small" /> },
    pastClients: { title: 'Past Clients', color: 'warning', icon: <HandshakeIcon fontSize="small" /> },
    interestedHomeowners: { title: 'Interested Homeowners', color: 'secondary', icon: <VisibilityIcon fontSize="small" /> }
};

export const SomeoneFriendshipControls = ({ profile, setProfile }) => {
    const { user } = useAuth();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedCats, setSelectedCats] = useState([]);
    const [saving, setSaving] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState(true);
    const [friendState, setFriendState] = useState(null);
    const viewedUserId = profile?.profile?.id;
    if (!user || !viewedUserId || user.id === viewedUserId) return null;

    // eslint-disable-next-line
    const loadFriendship = useCallback(async () => {
        try {
            setLoadingStatus(true);
            const status = await profileApi.getFriendshipStatus(user.id, viewedUserId);
            if (!status) {
                setFriendState('none');
            } else if (status.status === 'confirmed') {
                setFriendState('confirmed');
            } else if (status.status === 'pending') {
                setFriendState(status.initiatedBy === user.id ? 'pending_out' : 'pending_in');
            } else {
                setFriendState('none');
            }
        } catch (e) {
            setFriendState('none');
        } finally {
            setLoadingStatus(false);
        }
    }, [user?.id, viewedUserId]);

    // eslint-disable-next-line
    useEffect(() => {
        loadFriendship();
    }, [loadFriendship]);

    // eslint-disable-next-line
    const openCategoriesDialog = useCallback(async () => {
        try {
            const curr = await profileApi.getConnections(user.id);
            const initial = Object.keys(CATEGORY_META).filter((k) => (curr?.[k] || []).includes(viewedUserId));
            setSelectedCats(initial);
            setDialogOpen(true);
        } catch {
            setSelectedCats([]);
            setDialogOpen(true);
        }
    }, [user?.id, viewedUserId]);

    // eslint-disable-next-line
    const handleSaveCategories = useCallback(async () => {
        try {
            setSaving(true);

            if (friendState === 'none') {
                await extendedProfileApi.addFriend(user.id, viewedUserId);

                const openAnchor = '#open=friendRequests';
                const text = `You have a friend request from <b>${user.displayName || user.name || user.email}</b>. 
    <a href="${openAnchor}">Open friend requests</a>`;
                await sendNotificationToUser(viewedUserId, 'New friend request', text, undefined, { type: 'friend_request', initiatorId: user.id });
            }

            const next = await profileApi.upsertConnectionWithCategories(user.id, viewedUserId, selectedCats);
            setProfile(prev => {
                const curr = prev?.profile || {};
                const updated = { ...curr, connections: next };
                return { ...prev, profile: updated };
            });
            toast.success(friendState === 'none' ? 'Friend request sent and categories saved' : 'Categories updated');
            setDialogOpen(false);
            loadFriendship();
        } catch (e) {
            toast.error('Failed to save');
            console.error(e);
        } finally {
            setSaving(false);
        }
    }, [friendState, selectedCats, setProfile, user?.id, viewedUserId, loadFriendship]);

    // eslint-disable-next-line
    const handleAccept = useCallback(async () => {
        try {
            setSaving(true);
            await extendedProfileApi.confirmFriend(user.id, viewedUserId);
            toast.success('Friend request accepted');
            await loadFriendship();
            await openCategoriesDialog();
        } catch (e) {
            console.error(e);
            toast.error('Failed to accept');
        } finally {
            setSaving(false);
        }
    }, [user?.id, viewedUserId, loadFriendship, openCategoriesDialog]);

    // eslint-disable-next-line
    const handleUnfriend = useCallback(async () => {
        try {
            setSaving(true);
            await extendedProfileApi.removeFriend(user.id, viewedUserId);
            toast.success('Removed from friends');
            await loadFriendship();
            setDialogOpen(false);
        } catch (e) {
            console.error(e);
            toast.error('Failed to remove');
        } finally {
            setSaving(false);
        }
    }, [user?.id, viewedUserId, loadFriendship]);

    if (loadingStatus) {
        return <Button variant="outlined" disabled startIcon={<CircularProgress size={16} />}>Loading...</Button>;
    }

    if (friendState === 'pending_in') {
        return (
            <Stack direction="row" spacing={1}>
                <Button variant="contained" color="success" onClick={handleAccept}>
                    Accept request
                </Button>
            </Stack>
        );
    }

    if (friendState === 'pending_out') {
        return <Button variant="outlined" disabled>Request sent</Button>;
    }

    if (friendState === 'confirmed') {
        return (
            <>
                <Button variant="contained" color="success" onClick={openCategoriesDialog}>
                    Edit friend
                </Button>
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle sx={{ pr: 6 }}>
                        Edit friend categories
                        <IconButton
                            aria-label="close"
                            onClick={() => setDialogOpen(false)}
                            disabled={saving}
                            sx={{ position: 'absolute', right: 8, top: 8 }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent dividers sx={{ px: 1, py: 2 }}>
                        <Stack spacing={0}>
                            {Object.keys(CATEGORY_META).map((key) => {
                                const meta = CATEGORY_META[key];
                                return (
                                    <FormControlLabel
                                        key={key}
                                        control={
                                            <Checkbox
                                                checked={selectedCats.includes(key)}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setSelectedCats((prev) => checked
                                                        ? [...new Set([...prev, key])]
                                                        : prev.filter(k => k !== key));
                                                }}
                                            />
                                        }
                                        sx={{ m: 0, px: 2, alignItems: 'center', '& .MuiFormControlLabel-label': { width: '100%' } }}
                                        label={
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                {meta.icon}
                                                <Typography>{meta.title}</Typography>
                                                {selectedCats.includes(key) && (
                                                    <Chip size="small" color={meta.color} label="Selected" />
                                                )}
                                            </Stack>
                                        }
                                    />
                                );
                            })}
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button color="error" onClick={handleUnfriend} disabled={saving}>Unfriend</Button>
                        <Button onClick={handleSaveCategories} variant="contained" disabled={saving}>
                            {saving ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    }

    return (
        <>
            <Button variant="contained" color="success" onClick={openCategoriesDialog}>
                Add friend
            </Button>
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ pr: 6 }}>
                    Select connection categories
                    <IconButton
                        aria-label="close"
                        onClick={() => setDialogOpen(false)}
                        disabled={saving}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ px: 1, py: 2 }}>
                    <Stack spacing={0}>
                        {Object.keys(CATEGORY_META).map((key) => {
                            const meta = CATEGORY_META[key];
                            return (
                                <FormControlLabel
                                    key={key}
                                    control={
                                        <Checkbox
                                            checked={selectedCats.includes(key)}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                setSelectedCats((prev) => checked
                                                    ? [...new Set([...prev, key])]
                                                    : prev.filter(k => k !== key));
                                            }}
                                        />
                                    }
                                    sx={{ m: 0, px: 2, alignItems: 'center', '& .MuiFormControlLabel-label': { width: '100%' } }}
                                    label={
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            {meta.icon}
                                            <Typography>{meta.title}</Typography>
                                            {selectedCats.includes(key) && (
                                                <Chip size="small" color={meta.color} label="Selected" />
                                            )}
                                        </Stack>
                                    }
                                />
                            );
                        })}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSaveCategories} variant="contained" disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
export default SomeoneFriendshipControls;