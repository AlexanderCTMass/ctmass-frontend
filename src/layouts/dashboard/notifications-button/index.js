import { useCallback, useState, useMemo } from 'react';
import Bell01Icon from '@untitled-ui/icons-react/build/esm/Bell01';
import { Badge, IconButton, SvgIcon, Tooltip } from '@mui/material';
import { usePopover } from 'src/hooks/use-popover';
import { NotificationsPopover } from './notifications-popover';
import { useAuth } from "../../../hooks/use-auth";
import { markAllAsReadNotifications, removeNotification, clearAllNotifications } from "../../../notificationApi";
import { useNotifications } from "./notifications";
import useNotificationSound from "src/hooks/use-notification-sound2";
import { FriendRequestsDialog } from 'src/components/friends/friend-requests-dialog';
import { extendedProfileApi } from 'src/pages/cabinet/profiles/my/data/extendedProfileApi';

export const NotificationsButton = () => {
    const popover = usePopover();
    const { user } = useAuth();
    const notifications = useNotifications(user.id);

    const [optimisticRemoved, setOptimisticRemoved] = useState(new Set());
    const [optimisticReadAll, setOptimisticReadAll] = useState(false);

    const visibleNotifications = useMemo(() => {
        if (!notifications) return [];
        const base = notifications.filter(n => !optimisticRemoved.has(n.id));
        if (optimisticReadAll) {
            return base.map(n => ({ ...n, read: true }));
        }
        return base;
    }, [notifications, optimisticRemoved, optimisticReadAll]);

    const unread = useMemo(() => {
        return (notifications || []).reduce((acc, notification) => acc + (notification.read ? 0 : 1), 0);
    }, [notifications]);

    useNotificationSound(user.id, unread > 0);

    const [friendDialogOpen, setFriendDialogOpen] = useState(false);

    const handleRemoveOne = useCallback((notificationId) => {
        setOptimisticRemoved(prev => new Set(prev).add(notificationId)); // оптимистично
        removeNotification(user.id, notificationId).catch(() => {
            setOptimisticRemoved(prev => {
                const next = new Set(prev);
                next.delete(notificationId);
                return next;
            });
        });
    }, [user.id]);


    const handleMarkAllAsRead = useCallback(() => {
        clearAllNotifications(user.id)
    }, [user.id]);

    const handleNotificationClick = useCallback((htmlClickEvent) => {
        setFriendDialogOpen(true);
        popover.handleClose();
    }, [popover]);

    return (
        <>
            <Tooltip title="Notifications">
                <IconButton
                    ref={popover.anchorRef}
                    onClick={popover.handleOpen}
                >
                    <Badge
                        color="error"
                        badgeContent={unread}
                    >
                        <SvgIcon>
                            <Bell01Icon />
                        </SvgIcon>
                    </Badge>
                </IconButton>
            </Tooltip>
            <NotificationsPopover
                anchorEl={popover.anchorRef.current}
                notifications={visibleNotifications}
                onClose={popover.handleClose}
                onMarkAllAsRead={handleMarkAllAsRead}
                onRemoveOne={handleRemoveOne}
                onOpenFriendRequests={handleNotificationClick}
                open={popover.open}
            />
            <FriendRequestsDialog
                open={friendDialogOpen}
                onClose={() => setFriendDialogOpen(false)}
                currentUser={user}
                extendedProfileApiRef={{ current: extendedProfileApi }}
            />
        </>
    );
};
