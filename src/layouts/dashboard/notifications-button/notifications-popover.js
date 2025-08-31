import PropTypes from 'prop-types';
import { format } from 'date-fns';
import Mail01Icon from '@untitled-ui/icons-react/build/esm/Mail01';
import Mail04Icon from '@untitled-ui/icons-react/build/esm/Mail04';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import {
    Avatar,
    Box,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Popover,
    Stack,
    SvgIcon,
    Tooltip,
    Typography
} from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import { useAuth } from 'src/hooks/use-auth';
import { profileApi } from 'src/api/profile';
import { useEffect, useState } from 'react';

export const NotificationsPopover = (props) => {
    const {
        anchorEl,
        onClose,
        onMarkAllAsRead,
        onRemoveOne,
        onOpenFriendRequests,
        notifications = [],
        open = false,
        ...other
    } = props;

    const isEmpty = !notifications || notifications.length === 0;

    const { user } = useAuth();

    // useEffect(() => {
    //     const fetchProfile = async () => {
    //         if (!user?.id) return;
    //         const data = await profileApi.get(user.id);
    //         setProfile(data);
    //     };
    //     fetchProfile();
    // }, [user?.id]);

    const handleClickInNotification = (e, notification) => {
        const target = e.target;
        if (target?.tagName?.toLowerCase() === 'a') {
            const href = target.getAttribute('href') || '';
            if (href.startsWith('#open=friendRequests')) {
                e.preventDefault();
                onOpenFriendRequests?.();
            }
        }
    };

    const renderItem = (notification) => {
        const date = new Date(Number(notification.createdAt));
        const createdAt = format(date, 'MMM dd, h:mm a');

        return (
            <>
                <ListItemAvatar sx={{ mt: 0.5 }}>
                    <Avatar
                        sx={{
                            backgroundColor: 'primary.main',
                            mr: 2,
                            width: 40,
                            height: 40
                        }}
                    >
                        <SvgIcon>
                            <Mail01Icon />
                        </SvgIcon>
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    primary={(
                        <Box
                            sx={{
                                alignItems: 'left',
                                display: 'flex',
                                flexDirection: 'column',
                                mb: 1
                            }}
                        >
                            <Typography
                                sx={{ mr: 0.5, fontWeight: 'bold' }}
                                variant="body2"
                            >
                                {notification.title}
                            </Typography>
                            <Typography variant="caption">
                                <div
                                    onClick={(e) => handleClickInNotification(e, notification)}
                                    dangerouslySetInnerHTML={{ __html: notification.text }}
                                />
                            </Typography>
                        </Box>
                    )}
                    secondary={(
                        <Typography color="text.secondary" variant="caption">
                            {createdAt}
                        </Typography>
                    )}
                    sx={{ my: 0 }}
                />
            </>
        );
    };

    return (
        <Popover
            anchorEl={anchorEl}
            anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            disableScrollLock
            onClose={onClose}
            open={open}
            PaperProps={{ sx: { width: 380 } }}
            {...other}
        >
            <Stack
                alignItems="center"
                direction="row"
                justifyContent="space-between"
                spacing={2}
                sx={{ px: 3, py: 2 }}
            >
                <Typography color="inherit" variant="h6">
                    Notifications
                </Typography>
                <Tooltip title="Mark all as read">
                    <IconButton onClick={onMarkAllAsRead} size="small" color="inherit">
                        <SvgIcon>
                            <Mail04Icon />
                        </SvgIcon>
                    </IconButton>
                </Tooltip>
            </Stack>

            {isEmpty ? (
                <Box sx={{ p: 5 }}>
                    <Typography variant="subtitle2">
                        There are no notifications
                    </Typography>
                </Box>
            ) : (
                <Scrollbar sx={{ maxHeight: 400 }}>
                    <List disablePadding>
                        {notifications.map((notification) => (
                            <ListItem
                                divider
                                key={notification.id}
                                sx={{
                                    alignItems: 'flex-start',
                                    '&:hover': { backgroundColor: 'action.hover' },
                                    '& .MuiListItemSecondaryAction-root': { top: '24%' }
                                }}
                                secondaryAction={(
                                    <Tooltip title="Remove">
                                        <IconButton
                                            edge="end"
                                            onClick={() => onRemoveOne?.(notification.id)}
                                            size="small"
                                        >
                                            <SvgIcon>
                                                <XIcon />
                                            </SvgIcon>
                                        </IconButton>
                                    </Tooltip>
                                )}
                            >
                                {renderItem(notification)}
                            </ListItem>
                        ))}
                    </List>
                </Scrollbar>
            )}
        </Popover>
    );
};

NotificationsPopover.propTypes = {
    anchorEl: PropTypes.any,
    onClose: PropTypes.func,
    onMarkAllAsRead: PropTypes.func,
    onRemoveOne: PropTypes.func,
    onOpenFriendRequests: PropTypes.func,
    open: PropTypes.bool
};