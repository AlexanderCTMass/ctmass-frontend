import { useCallback, useRef, useState } from 'react';
import ChevronDownIcon from '@untitled-ui/icons-react/build/esm/ChevronDown';
import {
    Box,
    Button,
    ButtonGroup,
    ClickAwayListener,
    Grow,
    MenuItem,
    MenuList,
    Paper,
    Popper,
    SvgIcon,
    Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../../hooks/use-auth';
import { extendedProfileApi } from "../data/extendedProfileApi";
import { sendNotificationToUser } from "../../../../../notificationApi";
import toast from "react-hot-toast";
import { FriendStatus } from "../ProfileConst";

export const SomeoneProfileButtonsGroup = ({ profile, setProfile }) => {
    const anchorRef = useRef(null);
    const [open, setOpen] = useState(false);

    const { user } = useAuth();
    if (!user) return null;

    const friend = profile.friends?.find((friend) => friend.id === user.id);

    const isConfirmedFriend = friend ? friend.type.includes('friend_confirmed') : false;
    const hasRecommendation = friend ? friend.type.some(item => item.status === "recommendations" && item.initiatedBy === user.id) : false;

    const isPendingFriend = friend ? friend.type?.some(item => item.status === "friend_pending") : false;
    const isFriendRequestFromOtherUser = friend?.type?.some(item => item.status === "friend_pending" && item.initiatedBy !== user.id);

    //eslint-disable-next-line
    const navigate = useNavigate();

    const handleChatClick = () => {
        navigate(`/dashboard/chat/${profile.profile.id}`);
    };

    const handleRemoveFriendClick = async () => {
        try {
            await extendedProfileApi.removeFriend(user.id, profile.profile.id);

            setProfile(prev => ({
                ...prev,
                friends: prev.friends.filter(friend => friend.id !== profile.profile.id),
            }));

            toast.success("Friend removed!");
        } catch (error) {
            console.error("Error removing friend:", error);
            toast.error("Failed to remove friend.");
        }
    };

    const handleAddFriendClick = () => {
        try {
            extendedProfileApi.addFriend(user.id, profile.profile.id);
            sendNotificationToUser(profile.profile.id, "Friend request", `User ${user.businessName} sent a friend request`);

            setProfile(prev => {
                const newFriend = {
                    id: user.id,
                    type: Array.isArray(prev.friends?.find(friend => friend.id === user.id)?.type)
                        ? [...prev.friends.find(friend => friend.id === user.id).type, {
                            status: "friend_pending",
                            initiatedBy: user.id
                        }]
                        : [{ status: "friend_pending", initiatedBy: user.id }],
                };

                if (!prev.friends || prev.friends.length === 0) {
                    return {
                        ...prev,
                        friends: [newFriend],
                    };
                }

                const isFriendAlreadyAdded = prev.friends.some(friend => friend.id === user.id);

                if (isFriendAlreadyAdded) {
                    return {
                        ...prev,
                        friends: prev.friends.map(friend =>
                            friend.id === user.id
                                ? {
                                    ...friend,
                                    type: Array.isArray(friend.type)
                                        ? [...friend.type, { status: "friend_pending", initiatedBy: user.id }]
                                        : [friend.type, { status: "friend_pending", initiatedBy: user.id }],
                                }
                                : friend
                        ),
                    };
                }

                return {
                    ...prev,
                    friends: [...prev.friends, newFriend],
                };
            });

            toast.success("Friend request sent!");

        } catch (error) {
            console.error("Error sending friend request: ", error);
            toast.error("Failed to send friend request.");
        }
    };

    const handleRecommendClick = async () => {
        try {
            await extendedProfileApi.addRecommendation(user.id, profile.profile.id);
            const newRecommendation = { status: "recommendations", initiatedBy: user.id };

            setProfile(prev => {
                const currentFriend = {
                    type: [newRecommendation],
                };

                if (!prev.friends || prev.friends.length === 0) {
                    return {
                        ...prev,
                        friends: [currentFriend],
                    };
                }

                return {
                    ...prev,
                    friends: prev.friends.map(friend =>
                        friend.id === user.id
                            ? {
                                ...friend,
                                type: Array.isArray(friend.type)
                                    ? [...friend.type, newRecommendation]
                                    : [friend.type, newRecommendation],
                            }
                            : friend
                    ),
                };
            });

            toast.success("Recommendation sent!");

        } catch (error) {
            console.error("Error sending recommendation: ", error);
            toast.error("Failed to send recommendation.");
        }
    };

    const handleRemoveRecommend = async () => {
        try {
            await extendedProfileApi.removeRecommendation(user.id, profile.profile.id);

            setProfile(prev => ({
                ...prev,
                friends: prev.friends.map(friend =>
                    friend.id === user.id
                        ? {
                            ...friend,
                            type: friend.type.filter(
                                item => !(item.status === "recommendations" && item.initiatedBy === user.id)
                            ),
                        }
                        : friend
                ),
            }));

            toast.success("Recommendation removed!");
        } catch (error) {
            console.error("Error removing recommendation:", error);
            toast.error("Failed to remove recommendation.");
        }
    };

    const handleConfirmFriendClick = async () => {
        try {
            await extendedProfileApi.confirmFriend(user.id, profile.profile.id);

            sendNotificationToUser(profile.profile.id, "Friend request accepted", `User ${user.businessName} accepted your friend request`);
            toast.success("Friend request accepted!");

            setProfile((prev) => ({
                ...prev,
                friends: prev.friends.map((friend) =>
                    friend.id === user.id
                        ? {
                            ...friend,
                            type: [
                                ...friend.type.filter(
                                    (item) => !(typeof item === "object" && item.status === "friend_pending")
                                ),
                                "friend_confirmed",
                            ],
                        }
                        : friend
                ),
            }));
        } catch (error) {
            console.error("Error confirming friend request:", error);
            toast.error("Failed to confirm friend request.");
        }
    };

    const options = [
        // {
        //     title: 'Offer an order',
        //     action: () => console.log('Offer an order clicked')
        // },
        // {
        //     title: 'Chat',
        //     action: handleChatClick,
        // },
        {
            title: 'Add Friend',
            action: handleAddFriendClick,
            hide: isConfirmedFriend || isPendingFriend,
            tooltip: 'A friend request will be sent. Once accepted, this user will appear in your friend list.',
        },
        {
            title: 'Confirm Friend',
            action: handleConfirmFriendClick,
            hide: !isFriendRequestFromOtherUser,
        },
        ...(profile.profile.role === 'WORKER' ? [
            {
                title: 'Recommend',
                action: handleRecommendClick,
                hide: hasRecommendation,
                tooltip: 'Recommend this user to others.',
            }
        ] : []),
        {
            title: 'Remove recommend',
            action: handleRemoveRecommend,
            hide: !hasRecommendation,
            tooltip: 'Remove a user from your recommendation list.',
        },
        {
            title: 'Unfriend',
            action: handleRemoveFriendClick,
            hide: !isConfirmedFriend,
            tooltip: 'This profile will be removed from friends.',
        },
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
            <ButtonGroup ref={anchorRef} variant="contained">
                <Button onClick={handleToggle}>Actions</Button>
                <Button
                    onClick={handleToggle}
                    size="small"
                    sx={{ backgroundColor: 'primary.dark' }}
                >
                    <SvgIcon>
                        <ChevronDownIcon />
                    </SvgIcon>
                </Button>
            </ButtonGroup>
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
        </Box>
    );
};