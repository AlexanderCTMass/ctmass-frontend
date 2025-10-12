import PropTypes from 'prop-types';
import { format } from 'date-fns';
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import Mail04Icon from "@untitled-ui/icons-react/build/esm/Mail04";
import XIcon from "@untitled-ui/icons-react/build/esm/X";
import {
    Avatar,
    Box,
    Button,
    Divider,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Popover,
    Stack,
    SvgIcon,
    Tab,
    Tabs,
    Tooltip,
    Typography,
    useMediaQuery
} from '@mui/material';
import { useTheme } from "@mui/material/styles";
import { Scrollbar } from 'src/components/scrollbar';
import { markNotificationAsRead } from "src/notificationApi";
import { useState } from 'react';

export const NotificationsPopover = (props) => {
    const {
        anchorEl,
        onClose,
        onMarkAllAsRead,
        userId,
        notifications = [],
        hasMore,
        loadMore,
        ...other
    } = props;

    const [tab, setTab] = useState("unread");
    const theme = useTheme();
    const downSm = useMediaQuery(theme.breakpoints.down("sm"));

    const filtered =
        tab === "unread" ? notifications.filter((n) => !n.read) : notifications;

    const handleMarkOne = (id) => markNotificationAsRead(userId, id);

    const renderItem = (n) => {
        const created = format(new Date(Number(n.createdAt)), "MMM dd, h:mm a");

        return (
            <>
                <ListItemAvatar sx={{ mt: 0.5 }}>
                    <Avatar
                        sx={{
                            bgcolor: n.read ? "transparent" : "success.main",
                            color: "text.primary",
                            width: 40,
                            height: 40,
                        }}
                    >
                        <SvgIcon fontSize="small">
                            {n.read ? <MailOutlineIcon /> : <MarkEmailUnreadIcon />}
                        </SvgIcon>
                    </Avatar>
                </ListItemAvatar>

                <ListItemText
                    primary={
                        <Box sx={{ display: "flex", flexDirection: "column", mb: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                                {n.title}
                            </Typography>
                            <Typography
                                variant="caption"
                                component="span"
                                dangerouslySetInnerHTML={{ __html: n.text }}
                            />
                        </Box>
                    }
                    secondary={
                        <Typography color="text.secondary" variant="caption">
                            {created}
                        </Typography>
                    }
                    sx={{ my: 0 }}
                />

                {!n.read && (
                    <Tooltip title="Mark as read">
                        <IconButton edge="end" onClick={() => handleMarkOne(n.id)} size="small">
                            <SvgIcon fontSize="small">
                                <MarkEmailReadIcon />
                            </SvgIcon>
                        </IconButton>
                    </Tooltip>
                )}
            </>
        );
    };

    return (
        <Popover
            open={open}
            onClose={onClose}
            {...(!downSm
                ? {
                    anchorEl,
                    anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                    transformOrigin: { vertical: 'top', horizontal: 'left' }
                }
                : {
                    anchorReference: 'anchorPosition',
                    anchorPosition: { top: 0, left: 0 },
                    transformOrigin: { vertical: 'top', horizontal: 'left' }
                })}
            PaperProps={{
                sx: {
                    width: { xs: "100vw", sm: 460 },
                    height: { xs: "100dvh", sm: "auto" },
                    maxHeight: { xs: "100vh", sm: 520 },
                    borderRadius: { xs: 0, sm: 1 },
                    p: 0,
                    ml: { xs: 0, sm: -6 },
                    pt: { xs: 'env(safe-area-inset-top)', sm: 0 },
                    pb: { xs: 'env(safe-area-inset-bottom)', sm: 0 }
                }
            }}
            {...other}
        >
            {downSm && (
                <>
                    <Stack direction="row" justifyContent="flex-end" sx={{ pt: 3, pr: 1, pb: 1 }}>
                        <IconButton size="small" onClick={onClose}>
                            <SvgIcon fontSize="medium">
                                <XIcon />
                            </SvgIcon>
                        </IconButton>
                    </Stack>
                    <Divider />
                </>
            )}

            <Box sx={{ px: 2, py: 1.5 }}>
                <Grid container alignItems="center">
                    <Grid item xs={4}>
                        <Typography variant="h6">Notifications</Typography>
                    </Grid>

                    <Grid
                        item
                        xs={4}
                        sx={{ display: "flex", justifyContent: "center" }}
                    >
                        <Tabs
                            value={tab}
                            onChange={(_, v) => setTab(v)}
                            textColor="primary"
                            indicatorColor="primary"
                        >
                            <Tab label="Not read" value="unread" />
                            <Tab label="All" value="all" />
                        </Tabs>
                    </Grid>

                    <Grid
                        item
                        xs={4}
                        sx={{ display: "flex", justifyContent: "flex-end" }}
                    >
                        <Tooltip title="Mark all as read">
                            <IconButton size="small" onClick={onMarkAllAsRead} sx={{ ml: 3 }}>
                                <SvgIcon fontSize="small">
                                    <Mail04Icon />
                                </SvgIcon>
                            </IconButton>
                        </Tooltip>
                    </Grid>
                </Grid>
            </Box>

            <Divider />

            <Scrollbar sx={{ flexGrow: 1 }}>
                <List disablePadding>
                    {filtered.map((n) => (
                        <ListItem key={n.id} divider alignItems="flex-start">
                            {renderItem(n)}
                        </ListItem>
                    ))}
                </List>

                {hasMore && filtered.length > 0 && (
                    <Box sx={{ p: 2, textAlign: "center" }}>
                        <Button onClick={loadMore}>Show more</Button>
                    </Box>
                )}

                {filtered.length === 0 && (
                    <Box sx={{ p: 5 }}>
                        <Typography align="center">There are no notifications</Typography>
                    </Box>
                )}
            </Scrollbar>
        </Popover>
    );
};

NotificationsPopover.propTypes = {
    anchorEl: PropTypes.any,
    open: PropTypes.bool,
    onClose: PropTypes.func,
    onMarkAllAsRead: PropTypes.func,
    userId: PropTypes.string,
    notifications: PropTypes.array,
    hasMore: PropTypes.bool,
    loadMore: PropTypes.func
};