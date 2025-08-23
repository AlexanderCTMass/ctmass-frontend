import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
    IconButton, InputAdornment, List, ListItem, ListItemAvatar, ListItemText,
    Stack, TextField, Typography, CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ClearIcon from '@mui/icons-material/Clear';
import { profileApi } from 'src/api/profile';
import { removeFriendRequestNotification } from 'src/notificationApi';

export const FriendRequestsDialog = ({ open, onClose, currentUser, extendedProfileApiRef }) => {
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState([]);
    const [search, setSearch] = useState('');

    const load = useCallback(async () => {
        if (!currentUser?.id) return;
        setLoading(true);
        try {
            const incoming = await profileApi.getIncomingFriendRequests(currentUser.id);
            const ids = incoming.map(i => i.otherUserId);
            const profiles = ids.length ? await profileApi.getProfilesById(ids, 100) : [];
            const merged = incoming.map(i => ({
                ...i,
                profile: profiles.find(p => p.id === i.otherUserId)
            }));
            setRequests(merged);
        } finally {
            setLoading(false);
        }
    }, [currentUser?.id]);

    useEffect(() => {
        if (open) load();
    }, [open, load]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return requests;
        return requests.filter(r => {
            const p = r.profile || {};
            const name = (p.businessName || p.name || p.email || '').toLowerCase();
            return name.includes(q);
        });
    }, [requests, search]);

    const handleAccept = async (otherUserId) => {
        try {
            await extendedProfileApiRef.current.confirmFriend(currentUser.id, otherUserId);
            await removeFriendRequestNotification(currentUser.id, otherUserId);
            await load();
        } catch (e) {
            console.error(e);
        }
    };

    const handleDecline = async (otherUserId) => {
        try {
            await extendedProfileApiRef.current.removeFriend(currentUser.id, otherUserId);
            await removeFriendRequestNotification(currentUser.id, otherUserId);
            await load();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Friend requests</DialogTitle>
            <DialogContent dividers>
                <TextField
                    fullWidth
                    placeholder="Search by business name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                        sx: {
                            height: 44,
                            display: 'flex',
                            alignItems: 'center',
                            '& .MuiInputBase-input': {
                                display: 'flex',
                                alignItems: 'center',
                                lineHeight: 1,
                                py: 0,
                            },
                            '& .MuiInputAdornment-root': {
                                display: 'flex',
                                alignItems: 'center',
                                height: '100%',
                                maxHeight: '100%',
                            },
                            '& .MuiSvgIcon-root': {
                                fontSize: 22,
                            },
                        },
                        startAdornment: (
                            <InputAdornment position="start" style={{ marginBottom: 14 }}>
                                <SearchIcon />
                            </InputAdornment>
                        ),
                        endAdornment: !!search && (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setSearch('')}>
                                    <ClearIcon />
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                    sx={{ mb: 2 }}
                />
                {loading ? (
                    <Box display="flex" justifyContent="center" py={3}><CircularProgress /></Box>
                ) : filtered.length === 0 ? (
                    <Typography color="text.secondary">No incoming requests</Typography>
                ) : (
                    <List disablePadding>
                        {filtered.map((r) => {
                            const p = r.profile || {};
                            const title = p.businessName || p.name || p.email || 'Unknown user';
                            return (
                                <ListItem
                                    key={r.otherUserId}
                                    secondaryAction={
                                        <Stack direction="row" spacing={1}>
                                            <Button size="small" color="success" variant="contained" onClick={() => handleAccept(r.otherUserId)}>
                                                Accept
                                            </Button>
                                            <Button size="small" color="error" onClick={() => handleDecline(r.otherUserId)}>
                                                Decline
                                            </Button>
                                        </Stack>
                                    }
                                >
                                    <ListItemAvatar>
                                        <Avatar src={p.avatar} />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={title}
                                        secondary={p.email}
                                    />
                                </ListItem>
                            );
                        })}
                    </List>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};