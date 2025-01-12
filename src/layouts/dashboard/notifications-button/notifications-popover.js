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

const renderContent = (notification) => {
    switch (notification.type) {
        case 'job_add': {
            const date = new Date(Number(notification.createdAt));
            const createdAt = format(date, 'MMM dd, h:mm a');

            return (
                <>
                    <ListItemAvatar sx={{mt: 0.5}}>
                        <Avatar src={notification.avatar}>
                            <SvgIcon>
                                <User01Icon/>
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
                                    New job
                                </Typography>
                                <Typography
                                    href="#"
                                    underline="always"
                                    variant="body2"
                                >
                                    {notification.job}
                                </Typography>
                                <Link
                                    href={notification.author}
                                    underline="always"
                                    variant="body2"
                                >
                                    {notification.author}
                                </Link>
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
        case 'new_feature': {
            const date = new Date(Number(notification.createdAt));
            const createdAt = format(date, 'MMM dd, h:mm a');

            return (
                <>
                    <ListItemAvatar sx={{mt: 0.5}}>
                        <Avatar>
                            <SvgIcon>
                                <MessageChatSquareIcon/>
                            </SvgIcon>
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        primary={(
                            <Box
                                sx={{
                                    alignItems: 'center',
                                    display: 'flex',
                                    flexWrap: 'wrap'
                                }}
                            >
                                <Typography
                                    variant="subtitle2"
                                    sx={{mr: 0.5}}
                                >
                                    New feature!
                                </Typography>
                                <Typography variant="body2">
                                    {notification.description}
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
        case 'company_created': {
            const date = new Date(Number(notification.createdAt));
            const createdAt = format(date, 'MMM dd, h:mm a');

            return (
                <>
                    <ListItemAvatar sx={{mt: 0.5}}>
                        <Avatar src={notification.avatar}>
                            <SvgIcon>
                                <User01Icon/>
                            </SvgIcon>
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        primary={(
                            <Box
                                sx={{
                                    alignItems: 'center',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    m: 0
                                }}
                            >
                                <Typography
                                    sx={{mr: 0.5}}
                                    variant="subtitle2"
                                >
                                    {notification.author}
                                </Typography>
                                <Link
                                    href="#"
                                    underline="always"
                                    variant="body2"
                                >
                                    {notification.company}
                                </Link>
                            </Box>
                        )}
                        secondary={(
                            <Typography
                                color="text.secondary"
                                variant="caption"
                            >
                                {createdAt ? createdAt : null}
                            </Typography>
                        )}
                        sx={{my: 0}}
                    />
                </>
            );
        }
        default:
            return null;
    }
};


export const NotificationsPopover = (props) => {
    const notifications = useNotifications();
    const {anchorEl, onClose, onMarkAllAsRead, onRemoveOne, open = false, ...other} = props;


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
                    <Box sx={{p: 2}}>
                        <Typography variant="subtitle2">
                            There are no notifications
                        </Typography>
                        {/*<IconButton*/}
                        {/*    edge="end"*/}
                        {/*    onClick={async () => {*/}
                        {/*        const recipientId = 'zzvuQxppTdQFHgLteln6n8lhPN83';*/}
                        {/*        const notification = {*/}
                        {/*            author: "Gena",*/}
                        {/*            avatar: '../../../favicon-32x32.png',*/}
                        {/*            job: 'Zdarova',*/}
                        {/*            type: 'job_add'*/}
                        {/*        }*/}

                        {/*        await sendNotificationToUser(recipientId, notification);*/}
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
                                    {renderContent(notification)}
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
