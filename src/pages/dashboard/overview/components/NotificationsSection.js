import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
    Avatar,
    Box,
    Button,
    Paper,
    Stack,
    Typography
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from 'src/layouts/dashboard/notifications-button/notifications';

const NotificationItem = ({ notification }) => {
    const getNotificationDate = () => {
        if (!notification.createdAt) return null;
        try {
            const date = notification.createdAt.toDate
                ? notification.createdAt.toDate()
                : new Date(notification.createdAt);
            return date;
        } catch {
            return null;
        }
    };

    const notificationDate = getNotificationDate();
    const timeAgo = notificationDate
        ? formatDistanceToNow(notificationDate, { addSuffix: true })
        : '';

    return (
        <Box
            sx={{
                display: 'flex',
                gap: 2,
                p: 2,
                borderRadius: 2,
                cursor: 'pointer',
                backgroundColor: notification.read ? 'transparent' : 'action.hover',
                '&:hover': {
                    backgroundColor: 'action.selected'
                },
                borderBottom: '1px solid',
                borderColor: 'divider'
            }}
        >
            <Avatar
                sx={{
                    width: 40,
                    height: 40,
                    bgcolor: 'primary.main'
                }}
            >
                <NotificationsIcon fontSize="small" />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                    variant="body2"
                    fontWeight={notification.read ? 400 : 600}
                    sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                    }}
                >
                    {notification.title || 'New notification'}
                </Typography>
                {notification.description && (
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical'
                        }}
                    >
                        {notification.description}
                    </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                    {timeAgo}
                </Typography>
            </Box>
        </Box>
    );
};

NotificationItem.propTypes = {
    notification: PropTypes.object.isRequired
};

const NotificationsSection = ({ userId }) => {
    const { notifications, hasMore, loadMore } = useNotifications(userId);
    const [showAll, setShowAll] = useState(false);

    const displayNotifications = useMemo(() => {
        return showAll ? notifications : notifications.slice(0, 5);
    }, [notifications, showAll]);

    const handleViewAll = () => {
        setShowAll(true);
        if (hasMore) {
            loadMore();
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                p: { xs: 3, md: 4 },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                width: '100%'
            }}
        >
            <Stack spacing={3} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <NotificationsIcon color="primary" />
                        <Typography variant="h6" fontWeight={700}>
                            Notifications
                        </Typography>
                    </Stack>
                </Stack>

                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    {displayNotifications.length > 0 ? (
                        <Box
                            sx={{
                                maxHeight: showAll ? 500 : 'auto',
                                overflowY: showAll ? 'auto' : 'visible',
                                overflowX: 'hidden',
                                flex: 1
                            }}
                        >
                            <Stack spacing={1}>
                                {displayNotifications.map((notification) => (
                                    <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                    />
                                ))}
                            </Stack>
                        </Box>
                    ) : (
                        <Stack alignItems="center" justifyContent="center" sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                No notifications yet
                            </Typography>
                        </Stack>
                    )}
                </Box>

                {!showAll && notifications.length > 5 && (
                    <Box sx={{ textAlign: 'center' }}>
                        <Button
                            variant="text"
                            color="primary"
                            onClick={handleViewAll}
                            size="small"
                        >
                            View All Notifications
                        </Button>
                    </Box>
                )}
            </Stack>
        </Paper>
    );
};

NotificationsSection.propTypes = {
    userId: PropTypes.string.isRequired
};

export default NotificationsSection;
