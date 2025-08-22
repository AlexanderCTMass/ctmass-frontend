import { useCallback, useRef, useState, useMemo } from 'react';
import ChevronDownIcon from '@untitled-ui/icons-react/build/esm/ChevronDown';
import {
    Box,
    Button,
    ClickAwayListener,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Grow,
    MenuItem,
    MenuList,
    Paper,
    Popper,
    Checkbox,
    Stack,
    SvgIcon,
    Tooltip,
    Typography,
    Chip
} from '@mui/material';
import { useAuth } from '../../../../../hooks/use-auth';
import { extendedProfileApi } from "../data/extendedProfileApi";
import { profileApi } from 'src/api/profile';
import toast from "react-hot-toast";
import RecommendIcon from '@mui/icons-material/Recommend';
import PlaceIcon from '@mui/icons-material/Place';
import HandshakeIcon from '@mui/icons-material/Handshake';
import VisibilityIcon from '@mui/icons-material/Visibility';

const CATEGORY_META = {
    trustedColleagues: { title: 'Trusted Colleagues', color: 'success', icon: <RecommendIcon fontSize="small" /> },
    localPros: { title: 'Local Pros', color: 'info', icon: <PlaceIcon fontSize="small" /> },
    pastClients: { title: 'Past Clients', color: 'warning', icon: <HandshakeIcon fontSize="small" /> },
    interestedHomeowners: { title: 'Interested Homeowners', color: 'secondary', icon: <VisibilityIcon fontSize="small" /> }
};

export const SomeoneProfileButtonsGroup = ({ profile, setProfile }) => {
    const anchorRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedCats, setSelectedCats] = useState([]);
    const [saving, setSaving] = useState(false);

    const { user } = useAuth();
    const viewedUserId = profile?.profile?.id;

    if (!user || !viewedUserId || user.id === viewedUserId) return null;

    // const friend = profile.friends?.find((friend) => friend.id === user.id);

    // const isConfirmedFriend = friend ? friend.type.includes('friend_confirmed') : false;
    // const hasRecommendation = friend ? friend.type.some(item => item.status === "recommendations" && item.initiatedBy === user.id) : false;

    // const isPendingFriend = friend ? friend.type?.some(item => item.status === "friend_pending") : false;
    // const isFriendRequestFromOtherUser = friend?.type?.some(item => item.status === "friend_pending" && item.initiatedBy !== user.id);

    //eslint-disable-next-line
    const openCategoriesDialog = useCallback((initial = []) => {
        setSelectedCats(initial);
        setDialogOpen(true);
    }, []);

    //eslint-disable-next-line
    const handleSaveCategories = useCallback(async () => {
        try {
            setSaving(true);
            const next = await profileApi.upsertConnectionWithCategories(user.id, viewedUserId, selectedCats);

            setProfile(prev => {
                const curr = prev?.profile || {};
                const updated = { ...curr, connections: next };
                return { ...prev, profile: updated };
            });

            toast.success('Connections updated');
            setDialogOpen(false);
        } catch (e) {
            toast.error('Failed to update connections');
            console.error(e);
        } finally {
            setSaving(false);
        }
    }, [selectedCats, setProfile, user?.id, viewedUserId]);

    //eslint-disable-next-line
    const handleAddOrEditClick = useCallback(async () => {
        const curr = await profileApi.getConnections(user.id);
        const initial = Object.keys(CATEGORY_META).filter((k) => (curr?.[k] || []).includes(viewedUserId));
        openCategoriesDialog(initial);
    }, [user?.id, viewedUserId, openCategoriesDialog]);

    // const handleChatClick = () => {
    //     navigate(`/dashboard/chat/${profile.profile.id}`);
    // };

    // const handleRemoveFriendClick = async () => {
    //     try {
    //         await extendedProfileApi.removeFriend(user.id, profile.profile.id);

    //         setProfile(prev => ({
    //             ...prev,
    //             friends: prev.friends.filter(friend => friend.id !== profile.profile.id),
    //         }));

    //         toast.success("Friend removed!");
    //     } catch (error) {
    //         console.error("Error removing friend:", error);
    //         toast.error("Failed to remove friend.");
    //     }
    // };

    // const handleAddFriendClick = () => {
    //     try {
    //         extendedProfileApi.addFriend(user.id, profile.profile.id);
    //         sendNotificationToUser(profile.profile.id, "Friend request", `User ${user.businessName} sent a friend request`);

    //         setProfile(prev => {
    //             const newFriend = {
    //                 id: user.id,
    //                 type: Array.isArray(prev.friends?.find(friend => friend.id === user.id)?.type)
    //                     ? [...prev.friends.find(friend => friend.id === user.id).type, {
    //                         status: "friend_pending",
    //                         initiatedBy: user.id
    //                     }]
    //                     : [{ status: "friend_pending", initiatedBy: user.id }],
    //             };

    //             if (!prev.friends || prev.friends.length === 0) {
    //                 return {
    //                     ...prev,
    //                     friends: [newFriend],
    //                 };
    //             }

    //             const isFriendAlreadyAdded = prev.friends.some(friend => friend.id === user.id);

    //             if (isFriendAlreadyAdded) {
    //                 return {
    //                     ...prev,
    //                     friends: prev.friends.map(friend =>
    //                         friend.id === user.id
    //                             ? {
    //                                 ...friend,
    //                                 type: Array.isArray(friend.type)
    //                                     ? [...friend.type, { status: "friend_pending", initiatedBy: user.id }]
    //                                     : [friend.type, { status: "friend_pending", initiatedBy: user.id }],
    //                             }
    //                             : friend
    //                     ),
    //                 };
    //             }

    //             return {
    //                 ...prev,
    //                 friends: [...prev.friends, newFriend],
    //             };
    //         });

    //         toast.success("Friend request sent!");

    //     } catch (error) {
    //         console.error("Error sending friend request: ", error);
    //         toast.error("Failed to send friend request.");
    //     }
    // };

    // const handleRecommendClick = async () => {
    //     try {
    //         await extendedProfileApi.addRecommendation(user.id, profile.profile.id);
    //         const newRecommendation = { status: "recommendations", initiatedBy: user.id };

    //         setProfile(prev => {
    //             const currentFriend = {
    //                 type: [newRecommendation],
    //             };

    //             if (!prev.friends || prev.friends.length === 0) {
    //                 return {
    //                     ...prev,
    //                     friends: [currentFriend],
    //                 };
    //             }

    //             return {
    //                 ...prev,
    //                 friends: prev.friends.map(friend =>
    //                     friend.id === user.id
    //                         ? {
    //                             ...friend,
    //                             type: Array.isArray(friend.type)
    //                                 ? [...friend.type, newRecommendation]
    //                                 : [friend.type, newRecommendation],
    //                         }
    //                         : friend
    //                 ),
    //             };
    //         });

    //         toast.success("Recommendation sent!");

    //     } catch (error) {
    //         console.error("Error sending recommendation: ", error);
    //         toast.error("Failed to send recommendation.");
    //     }
    // };

    // const handleRemoveRecommend = async () => {
    //     try {
    //         await extendedProfileApi.removeRecommendation(user.id, profile.profile.id);

    //         setProfile(prev => ({
    //             ...prev,
    //             friends: prev.friends.map(friend =>
    //                 friend.id === user.id
    //                     ? {
    //                         ...friend,
    //                         type: friend.type.filter(
    //                             item => !(item.status === "recommendations" && item.initiatedBy === user.id)
    //                         ),
    //                     }
    //                     : friend
    //             ),
    //         }));

    //         toast.success("Recommendation removed!");
    //     } catch (error) {
    //         console.error("Error removing recommendation:", error);
    //         toast.error("Failed to remove recommendation.");
    //     }
    // };

    // const handleConfirmFriendClick = async () => {
    //     try {
    //         await extendedProfileApi.confirmFriend(user.id, profile.profile.id);

    //         sendNotificationToUser(profile.profile.id, "Friend request accepted", `User ${user.businessName} accepted your friend request`);
    //         toast.success("Friend request accepted!");

    //         setProfile((prev) => ({
    //             ...prev,
    //             friends: prev.friends.map((friend) =>
    //                 friend.id === user.id
    //                     ? {
    //                         ...friend,
    //                         type: [
    //                             ...friend.type.filter(
    //                                 (item) => !(typeof item === "object" && item.status === "friend_pending")
    //                             ),
    //                             "friend_confirmed",
    //                         ],
    //                     }
    //                     : friend
    //             ),
    //         }));
    //     } catch (error) {
    //         console.error("Error confirming friend request:", error);
    //         toast.error("Failed to confirm friend request.");
    //     }
    // };

    // const options = [
    //     // {
    //     //     title: 'Offer an order',
    //     //     action: () => console.log('Offer an order clicked')
    //     // },
    //     // {
    //     //     title: 'Chat',
    //     //     action: handleChatClick,
    //     // },
    //     {
    //         title: 'Add Friend',
    //         action: handleAddFriendClick,
    //         hide: isConfirmedFriend || isPendingFriend,
    //         tooltip: 'A friend request will be sent. Once accepted, this user will appear in your friend list.',
    //     },
    //     {
    //         title: 'Confirm Friend',
    //         action: handleConfirmFriendClick,
    //         hide: !isFriendRequestFromOtherUser,
    //     },
    //     ...(profile.profile.role === 'WORKER' ? [
    //         {
    //             title: 'Recommend',
    //             action: handleRecommendClick,
    //             hide: hasRecommendation,
    //             tooltip: 'Recommend this user to others.',
    //         }
    //     ] : []),
    //     {
    //         title: 'Remove recommend',
    //         action: handleRemoveRecommend,
    //         hide: !hasRecommendation,
    //         tooltip: 'Remove a user from your recommendation list.',
    //     },
    //     {
    //         title: 'Unfriend',
    //         action: handleRemoveFriendClick,
    //         hide: !isConfirmedFriend,
    //         tooltip: 'This profile will be removed from friends.',
    //     },
    // ];

    const options = [
        // {
        //     title: 'Chat',
        //     action: () => navigate(`/dashboard/chat/${viewedUserId}`)
        // },
        {
            title: 'Add / Edit in connections',
            action: handleAddOrEditClick,
            tooltip: 'Choose one or more categories'
        }
    ];

    const filteredOptions = options.filter((option) => !option.hide);

    // eslint-disable-next-line
    const handleMenuItemClick = useCallback((index) => {
        setOpen(false);
        filteredOptions[index].action();
    }, [filteredOptions]);

    // eslint-disable-next-line
    const handleToggle = useCallback(() => {
        setOpen((prevOpen) => !prevOpen);
    }, []);

    // eslint-disable-next-line
    const handleClose = useCallback((event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }
        setOpen(false);
    }, []);

    return (
        <Box>
            <Button
                ref={anchorRef}
                variant="contained"
                color="success"
                endIcon={<SvgIcon><ChevronDownIcon /></SvgIcon>}
                onClick={handleToggle}
                sx={{
                    borderRadius: 1.5,
                    px: 2
                }}
            >
                Actions
            </Button>

            <Popper anchorEl={anchorRef.current} open={open} transition>
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin:
                                placement === 'bottom' ? 'center top' : 'center bottom',
                        }}
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList>
                                    {filteredOptions.map((option, index) => {
                                        const menuItem = (
                                            <MenuItem
                                                key={option.title}
                                                disabled={option.disabled}
                                                onClick={() => handleMenuItemClick(index)}
                                            >
                                                {option.title}
                                            </MenuItem>
                                        );

                                        if (option.tooltip) {
                                            return (
                                                <Tooltip key={option.title} title={option.tooltip}>
                                                    {menuItem}
                                                </Tooltip>
                                            );
                                        }

                                        return menuItem;
                                    })}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Select connection categories</DialogTitle>
                <DialogContent dividers sx={{ px: 1, py: 2 }}>
                    <Stack spacing={0} sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch'
                    }}>
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
                                    sx={{
                                        m: 0,
                                        px: 2,
                                        alignItems: 'center',
                                        '& .MuiFormControlLabel-label': { width: '100%' }
                                    }}
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
                    <Button onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
                    <Button onClick={handleSaveCategories} variant="contained" disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};