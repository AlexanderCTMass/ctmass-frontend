import PropTypes from 'prop-types';
import { format } from 'date-fns';
import XIcon from "@untitled-ui/icons-react/build/esm/X";
import Mail04Icon from "@untitled-ui/icons-react/build/esm/Mail04";
import {
    Box,
    Button,
    Divider,
    IconButton,
    List,
    ListItemButton,
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
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const extractLink = (html) => {
    if (!html) return null;
    const match = html.match(/href="([^"]+)"/);
    return match ? match[1] : null;
};

export const NotificationsPopover = (props) => {
    const {
        anchorEl,
        onClose,
        onMarkAllAsRead,
        userId,
        notifications = [],
        hasMore,
        loadMore,
        open,
        ...other
    } = props;

    const [tab, setTab] = useState("unread");
    const theme = useTheme();
    const downSm = useMediaQuery(theme.breakpoints.down("sm"));
    const navigate = useNavigate();

    const filtered =
        tab === "unread" ? notifications.filter((n) => !n.read) : notifications;

    const handleMarkOne = useCallback((id) => markNotificationAsRead(userId, id), [userId]);

    const handleNotificationClick = useCallback((n) => {
        if (!n.read) {
            handleMarkOne(n.id);
        }
        const link = extractLink(n.text);
        if (link) {
            if (link.startsWith('http')) {
                window.open(link, '_blank');
            } else {
                navigate(link);
                onClose();
            }
        }
    }, [handleMarkOne, navigate, onClose]);

    const renderItem = (n) => {
        const created = format(new Date(Number(n.createdAt)), "MMM dd, h:mm a");
        const link = extractLink(n.text);

        return (
            <ListItemButton
                component="div"
                onClick={() => handleNotificationClick(n)}
                sx={{
                    px: 2,
                    py: 1.5,
                    alignItems: 'flex-start',
                    gap: 1.5,
                    bgcolor: n.read ? 'transparent' : 'action.hover',
                    borderLeft: n.read ? '3px solid transparent' : `3px solid ${theme.palette.primary.main}`,
                    cursor: link ? 'pointer' : 'default',
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
                        bgcolor: n.read ? 'transparent' : 'primary.main',
                        flexShrink: 0,
                        mt: 0.75
                    }}
                />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                        variant="body2"
                        fontWeight={n.read ? 400 : 600}
                        sx={{ mb: 0.25 }}
                    >
                        {n.title}
                    </Typography>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        component="div"
                        dangerouslySetInnerHTML={{ __html: n.text }}
                        onClick={(e) => {
                            const anchor = e.target.closest('a');
                            if (anchor) {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!n.read) handleMarkOne(n.id);
                                const href = anchor.getAttribute('href');
                                if (href) {
                                    if (href.startsWith('http')) window.open(href, '_blank');
                                    else { navigate(href); onClose(); }
                                }
                            }
                        }}
                        sx={{
                            lineHeight: 1.4,
                            '& a': { cursor: 'pointer', color: 'primary.main' }
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

                {!n.read && (
                    <Tooltip title="Mark as read">
                        <IconButton
                            edge="end"
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleMarkOne(n.id);
                            }}
                            sx={{ flexShrink: 0, mt: 0.25 }}
                        >
                            <Mail04Icon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </ListItemButton>
        );
    };

    const unreadCount = notifications.filter(n => !n.read).length;

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
                    width: { xs: "100vw", sm: 420 },
                    height: { xs: "100dvh", sm: "auto" },
                    maxHeight: { xs: "100vh", sm: 540 },
                    borderRadius: { xs: 0, sm: 2 },
                    p: 0,
                    ml: { xs: 0, sm: -6 },
                    pt: { xs: 'env(safe-area-inset-top)', sm: 0 },
                    pb: { xs: 'env(safe-area-inset-bottom)', sm: 0 },
                    display: 'flex',
                    flexDirection: 'column'
                }
            }}
            {...other}
        >
            {/* Header */}
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ px: 2, py: 1.5, flexShrink: 0 }}
            >
                <Typography variant="h6">Notifications</Typography>

                <Stack direction="row" alignItems="center" spacing={0.5}>
                    {unreadCount > 0 && (
                        <Tooltip title="Mark all as read">
                            <IconButton size="small" onClick={onMarkAllAsRead}>
                                <SvgIcon fontSize="small">
                                    <Mail04Icon />
                                </SvgIcon>
                            </IconButton>
                        </Tooltip>
                    )}
                    {downSm && (
                        <IconButton size="small" onClick={onClose}>
                            <SvgIcon fontSize="small">
                                <XIcon />
                            </SvgIcon>
                        </IconButton>
                    )}
                </Stack>
            </Stack>

            <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                textColor="primary"
                indicatorColor="primary"
                variant="fullWidth"
                sx={{ flexShrink: 0, borderBottom: '1px solid', borderColor: 'divider' }}
            >
                <Tab
                    label={
                        <Stack direction="row" spacing={0.75} alignItems="center">
                            <span>Unread</span>
                            {unreadCount > 0 && (
                                <Box sx={{ px: 0.75, py: 0.1, bgcolor: 'primary.main', borderRadius: 999 }}>
                                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 700, lineHeight: 1.4 }}>
                                        {unreadCount}
                                    </Typography>
                                </Box>
                            )}
                        </Stack>
                    }
                    value="unread"
                />
                <Tab label="All" value="all" />
            </Tabs>

            <Scrollbar sx={{ flex: 1, overflowY: 'auto' }}>
                <List disablePadding>
                    {filtered.map((n) => (
                        <Box key={n.id}>
                            {renderItem(n)}
                            <Divider />
                        </Box>
                    ))}
                </List>

                {hasMore && filtered.length > 0 && (
                    <Box sx={{ p: 2, textAlign: "center" }}>
                        <Button size="small" onClick={loadMore}>Show more</Button>
                    </Box>
                )}

                {filtered.length === 0 && (
                    <Box sx={{ py: 6, px: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            {tab === 'unread' ? 'All caught up! No unread notifications.' : 'No notifications yet.'}
                        </Typography>
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
