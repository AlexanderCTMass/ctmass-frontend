import PropTypes from 'prop-types';
import {format} from 'date-fns';
import User01Icon from '@untitled-ui/icons-react/build/esm/User01';
import Mail04Icon from '@untitled-ui/icons-react/build/esm/Mail04';
import MessageChatSquareIcon from '@untitled-ui/icons-react/build/esm/MessageChatSquare';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import {
    Avatar,
    Box, Button,
    IconButton,
    Link,
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
import {Scrollbar} from 'src/components/scrollbar';
import {sendNotificationToUser} from "../../../notificationApi";
import {useNotifications} from "./notifications";
import {useAuth} from "../../../hooks/use-auth";
import {profileApi} from "../../../api/profile";
import {useEffect, useState} from "react";
import Mail01Icon from "@untitled-ui/icons-react/build/esm/Mail01";

const renderContent = (notification) => {
    const date = new Date(Number(notification.createdAt));

    const createdAt = format(date, 'MMM dd, h:mm a');

    return (
        <>
            <ListItemAvatar sx={{mt: 0.5}}>
                <Avatar
                    sx={{
                        backgroundColor: 'primary.main',
                        mr: 2,
                        width: 40,
                        height: 40,
                    }}
                >
                    <SvgIcon>
                        <Mail01Icon/>
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
                            mb: 1,
                        }}
                    >

                        <Typography
                            sx={{
                                mr: 0.5,
                                fontWeight: 'bold'
                            }}
                            variant="body2"
                        >
                            {notification.title}
                        </Typography>
                        <Typography
                            href="#"
                            underline="always"
                            variant="body2"
                        >
                            {notification.text}
                        </Typography>
                    </Box>
                )}
                secondary={(
                    <Typography
                        color="text.secondary"
                        variant="caption"
                    >
                        {createdAt}
                    </Typography>
                )}
                sx={{my: 0}}
            />
        </>
    );
}

export const NotificationsPopover = (props) => {
    const notifications = useNotifications();
    const {anchorEl, onClose, onMarkAllAsRead, onRemoveOne, open = false, ...other} = props;
    const {user} = useAuth();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const data = await profileApi.get(user.id); // Загружаем профиль
            setProfile(data);
        };

        fetchProfile();
    }, [user.id]); // Загружаем профиль, если user.id изменится

    const isEmpty = (notifications && notifications.length === 0) || !notifications;

    return (
        <Popover
            anchorEl={anchorEl}
            anchorOrigin={{
                horizontal: 'left',
                vertical: 'bottom'
            }}
            disableScrollLock
            onClose={onClose}
            open={open}
            PaperProps={{sx: {width: 380}}}
            {...other}>
            <Stack
                alignItems="center"
                direction="row"
                justifyContent="space-between"
                spacing={2}
                sx={{
                    px: 3,
                    py: 2
                }}
            >
                <Typography
                    color="inherit"
                    variant="h6"
                >
                    Notifications
                </Typography>
                <Tooltip title="Mark all as read">
                    <IconButton
                        onClick={onMarkAllAsRead}
                        size="small"
                        color="inherit"
                    >
                        <SvgIcon>
                            <Mail04Icon/>
                        </SvgIcon>
                    </IconButton>
                </Tooltip>
            </Stack>
            {isEmpty
                ? (
                    <Box sx={{p: 5}}>
                        <Typography variant="subtitle2">
                            There are no notifications
                        </Typography>
                        {/*<IconButton*/}
                        {/*    edge="end"*/}
                        {/*    onClick={async () => {*/}
                        {/*        await sendNotificationToUser(user.id, 'Welcome to CTMASS', 'Message');*/}
                        {/*    }}*/}
                        {/*    size="small"*/}
                        {/*>*/}
                        {/*    <SvgIcon>*/}
                        {/*        <XIcon/>*/}
                        {/*    </SvgIcon>*/}
                        {/*</IconButton>*/}
                    </Box>
                )
                : (
                    <Scrollbar sx={{maxHeight: 400}}>
                        <List disablePadding>
                            {notifications.map((notification) => (
                                <ListItem
                                    divider
                                    key={notification.id}
                                    sx={{
                                        alignItems: 'flex-start',
                                        '&:hover': {
                                            backgroundColor: 'action.hover'
                                        },
                                        '& .MuiListItemSecondaryAction-root': {
                                            top: '24%'
                                        }
                                    }}
                                    secondaryAction={(
                                        <Tooltip title="Remove">
                                            <IconButton
                                                edge="end"
                                                onClick={() => onRemoveOne?.(notification.id)}
                                                size="small"
                                            >
                                                <SvgIcon>
                                                    <XIcon/>
                                                </SvgIcon>
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                >
                                    {profile ? renderContent(notification) : null}
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
    notifications: PropTypes.array.isRequired,
    onClose: PropTypes.func,
    onMarkAllAsRead: PropTypes.func,
    onRemoveOne: PropTypes.func,
    open: PropTypes.bool
};
