import {useCallback, useMemo} from 'react';
import Bell01Icon from '@untitled-ui/icons-react/build/esm/Bell01';
import {Badge, IconButton, SvgIcon, Tooltip} from '@mui/material';
import {usePopover} from 'src/hooks/use-popover';
import {NotificationsPopover} from './notifications-popover';
import {useAuth} from "../../../hooks/use-auth";
import {markAllAsReadNotifications, removeNotification} from "../../../notificationApi";
import {useNotifications} from "./notifications";

export const NotificationsButton = () => {
    const popover = usePopover();
    const {user} = useAuth();
    const notifications= useNotifications(user.id);
    const unread = useMemo(() => {
        return (notifications || []).reduce((acc, notification) => acc + (notification.read ? 0 : 1), 0);
    }, [notifications]);

    const handleRemoveOne = useCallback((notificationId) => {
        removeNotification(user.id, notificationId);
    }, [user.id]);


    const handleMarkAllAsRead = useCallback(() => {
        markAllAsReadNotifications(user.id);
    }, [user.id]);

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
                            <Bell01Icon/>
                        </SvgIcon>
                    </Badge>
                </IconButton>
            </Tooltip>
            <NotificationsPopover
                anchorEl={popover.anchorRef.current}
                notifications={notifications}
                onClose={popover.handleClose}
                onMarkAllAsRead={handleMarkAllAsRead}
                onRemoveOne={handleRemoveOne}
                open={popover.open}
            />
        </>
    );
};
