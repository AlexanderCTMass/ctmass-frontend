import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Button,
    Divider,
    Paper,
    Stack,
    Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { format } from 'date-fns';
import { useNotifications } from 'src/layouts/dashboard/notifications-button/notifications';
import { markNotificationAsRead } from 'src/notificationApi';

const NotificationItem = ({ notification, userId }) => {
    const theme = useTheme();
    const created = notification.createdAt
        ? format(new Date(Number(notification.createdAt)), 'MMM dd, h:mm a')
        : '';

    const handleTextClick = (e) => {
        if (e.target.closest('a') && !notification.read) {
            markNotificationAsRead(userId, notification.id);
        }
    };

    return (
        <Box>
            <Box
                sx={{
                    px: 2,
                    py: 1.5,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                    borderLeft: notification.read ? '3px solid transparent' : `3px solid ${theme.palette.primary.main}`,
                    '&:hover': {
                        bgcolor: 'action.selected'
                    }
                }}
            >
                <Box
                    sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: notification.read ? 'transparent' : 'primary.main',
                        flexShrink: 0,
                        mt: 0.75
                    }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                        variant="body2"
                        fontWeight={notification.read ? 400 : 600}
                        sx={{ mb: 0.25 }}
                    >
                        {notification.title}
                    </Typography>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        component="div"
                        dangerouslySetInnerHTML={{ __html: notification.text }}
                        onClick={handleTextClick}
                        sx={{
                            lineHeight: 1.4,
                            '& a': { cursor: 'pointer' }
                        }}
                    />
                    <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{ mt: 0.5, display: 'block' }}
                    >
                        {created}
                    </Typography>
                </Box>
            </Box>
            <Divider />
        </Box>
    );
};

NotificationItem.propTypes = {
    notification: PropTypes.object.isRequired,
    userId: PropTypes.string.isRequired
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
                            <Stack spacing={0}>
                                {displayNotifications.map((notification) => (
                                    <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                        userId={userId}
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
