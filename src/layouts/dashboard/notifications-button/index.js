import { useMemo, useState } from "react";
import Bell01Icon from "@untitled-ui/icons-react/build/esm/Bell01";
import { Badge, IconButton, SvgIcon, Tooltip } from "@mui/material";
import { usePopover } from "src/hooks/use-popover";
import { NotificationsPopover } from "./notifications-popover";
import { useAuth } from "../../../hooks/use-auth";
import {
    markAllAsReadNotifications
} from "../../../notificationApi";
import { useNotifications } from "./notifications";
import useNotificationSound from "src/hooks/use-notification-sound";
import { FriendRequestsDialog } from "src/components/friends/friend-requests-dialog";
import { extendedProfileApi } from "src/pages/cabinet/profiles/my/data/extendedProfileApi";

export const NotificationsButton = () => {
    const popover = usePopover();
    const { user } = useAuth();

    const { notifications, hasMore, loadMore, totalUnread } = useNotifications(user.id);

    useNotificationSound(user.id, totalUnread > 0);

    const [friendDialogOpen, setFriendDialogOpen] = useState(false);

    const handleMarkAllAsRead = () => markAllAsReadNotifications(user.id);

    return (
        <>
            <Tooltip title="Notifications">
                <IconButton ref={popover.anchorRef} onClick={popover.handleOpen}>
                    <Badge color="error" badgeContent={totalUnread}>
                        <SvgIcon>
                            <Bell01Icon />
                        </SvgIcon>
                    </Badge>
                </IconButton>
            </Tooltip>

            <NotificationsPopover
                anchorEl={popover.anchorRef.current}
                open={popover.open}
                onClose={popover.handleClose}
                onMarkAllAsRead={handleMarkAllAsRead}
                userId={user.id}
                notifications={notifications}
                hasMore={hasMore}
                loadMore={loadMore}
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