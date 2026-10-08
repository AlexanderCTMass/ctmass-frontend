import PropTypes from 'prop-types';
import { formatDistanceToNowStrict } from 'date-fns';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Box, Button, IconButton, Popover, Stack, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import ReplyRoundedIcon from '@mui/icons-material/ReplyRounded';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import { Scrollbar } from 'src/components/scrollbar';
import { markNotificationAsRead } from 'src/notificationApi';
import { openFeedbackDialog } from 'src/components/feedBack/feedback-button';
import { messengerActions } from 'src/slices/messenger';
import { btn, focusRingSx, IconTile } from 'src/components/ctmass-ui';
import { BRAND, FONT, RADIUS, SHADOW } from 'src/theme/ctmass-tokens';

const TYPE_ICONS = {
    new_message: { icon: <ChatBubbleOutlineRoundedIcon />, tone: 'navy' },
    new_project: { icon: <HandymanOutlinedIcon />, tone: 'green' },
    project_response: { icon: <ReplyRoundedIcon />, tone: 'green' },
    loyalty_coins_earned: { icon: <MonetizationOnOutlinedIcon />, tone: 'green' }
};

const extractLink = (html) => {
    if (!html) return null;
    const match = html.match(/href="([^"]+)"/);
    return match ? match[1] : null;
};

const timeAgo = (value) => {
    const date = new Date(Number(value));
    if (Number.isNaN(date.getTime())) return '';
    return `${formatDistanceToNowStrict(date)} ago`;
};

const TABS = [
    { value: 'unread', label: 'Unread' },
    { value: 'all', label: 'All' }
];

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

    const [tab, setTab] = useState('unread');
    const theme = useTheme();
    const downSm = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const unreadCount = notifications.filter((n) => !n.read).length;
    const filtered = tab === 'unread' ? notifications.filter((n) => !n.read) : notifications;

    const handleMarkOne = useCallback((id) => markNotificationAsRead(userId, id), [userId]);

    const handleOpenMessenger = useCallback((threadId) => {
        dispatch(messengerActions.open());
        if (threadId) {
            dispatch(messengerActions.selectThread(threadId));
        }
        onClose();
    }, [dispatch, onClose]);

    const followLink = useCallback((href, n) => {
        if (href === '#open-feedback') {
            openFeedbackDialog();
            onClose();
        } else if (href === '#open-messenger') {
            handleOpenMessenger(n.threadId);
        } else if (href.startsWith('http')) {
            window.open(href, '_blank');
        } else {
            navigate(href);
            onClose();
        }
    }, [handleOpenMessenger, navigate, onClose]);

    const handleNotificationClick = useCallback((n) => {
        if (!n.read) {
            handleMarkOne(n.id);
        }
        const link = extractLink(n.text);
        if (link) {
            followLink(link, n);
        } else if (n.type === 'new_message') {
            handleOpenMessenger(n.threadId);
        }
    }, [followLink, handleMarkOne, handleOpenMessenger]);

    const renderItem = (n) => {
        const kind = TYPE_ICONS[n.type] || { icon: <NotificationsNoneRoundedIcon />, tone: 'navy' };
        const clickable = !!extractLink(n.text) || n.type === 'new_message';

        return (
            <Box
                key={n.id}
                role={clickable ? 'button' : undefined}
                tabIndex={clickable ? 0 : undefined}
                onClick={() => handleNotificationClick(n)}
                onKeyDown={(event) => {
                    if (clickable && (event.key === 'Enter' || event.key === ' ')) {
                        event.preventDefault();
                        handleNotificationClick(n);
                    }
                }}
                sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: RADIUS.inner,
                    bgcolor: n.read ? 'transparent' : alpha(BRAND.green, 0.06),
                    cursor: clickable ? 'pointer' : 'default',
                    transition: 'background-color .2s ease',
                    '&:hover': { bgcolor: n.read ? alpha(BRAND.navy, 0.04) : alpha(BRAND.green, 0.1) },
                    '&:hover .mark-read': { opacity: 1 },
                    ...focusRingSx
                }}
            >
                <IconTile size={40} tone={kind.tone}>{kind.icon}</IconTile>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="baseline" spacing={1}>
                        <Typography sx={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: n.read ? 600 : 700, lineHeight: 1.35, color: BRAND.ink }}>
                            {n.title}
                        </Typography>
                        <Typography sx={{ flexShrink: 0, fontSize: 12, fontWeight: 500, color: BRAND.muted }}>
                            {timeAgo(n.createdAt)}
                        </Typography>
                    </Stack>
                    <Box
                        dangerouslySetInnerHTML={{ __html: n.text }}
                        onClick={(e) => {
                            const anchor = e.target.closest('a');
                            if (anchor) {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!n.read) handleMarkOne(n.id);
                                const href = anchor.getAttribute('href');
                                if (href) followLink(href, n);
                            }
                        }}
                        sx={{
                            mt: 0.5,
                            fontSize: 13,
                            lineHeight: 1.5,
                            color: BRAND.muted,
                            overflowWrap: 'anywhere',
                            '& a': { cursor: 'pointer', color: BRAND.navy, fontWeight: 600 }
                        }}
                    />
                </Box>
                {!n.read && (
                    <Tooltip title="Mark as read">
                        <IconButton
                            className="mark-read"
                            aria-label="Mark as read"
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleMarkOne(n.id);
                            }}
                            sx={{
                                flexShrink: 0,
                                width: 32,
                                height: 32,
                                opacity: { xs: 1, sm: 0.55 },
                                color: BRAND.green,
                                transition: 'opacity .2s ease',
                                '&:focus-visible': { opacity: 1 }
                            }}
                        >
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: BRAND.green }} />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
        );
    };

    return (
        <Popover
            open={open}
            onClose={onClose}
            {...(!downSm
                ? {
                    anchorEl,
                    anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
                    transformOrigin: { vertical: 'top', horizontal: 'right' }
                }
                : {
                    anchorReference: 'anchorPosition',
                    anchorPosition: { top: 0, left: 0 },
                    transformOrigin: { vertical: 'top', horizontal: 'left' }
                })}
            PaperProps={{
                sx: {
                    width: { xs: '100vw', sm: 420 },
                    height: { xs: '100dvh', sm: 'auto' },
                    maxWidth: { xs: '100vw', sm: 'calc(100vw - 24px)' },
                    maxHeight: { xs: '100dvh', sm: 560 },
                    mt: { xs: 0, sm: 1.25 },
                    borderRadius: { xs: 0, sm: RADIUS.card },
                    border: { xs: 0, sm: `1px solid ${alpha(BRAND.navy, 0.08)}` },
                    boxShadow: SHADOW.lg,
                    pt: { xs: 'env(safe-area-inset-top)', sm: 0 },
                    pb: { xs: 'env(safe-area-inset-bottom)', sm: 0 },
                    display: 'flex',
                    flexDirection: 'column'
                }
            }}
            {...other}
        >
            <Box sx={{ px: 2, pt: 2, pb: 1.5, flexShrink: 0, borderBottom: `1px solid ${alpha(BRAND.navy, 0.08)}` }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                    <Typography component="h2" sx={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em', color: BRAND.navy }}>
                        Notifications
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        {unreadCount > 0 && (
                            <Button
                                onClick={onMarkAllAsRead}
                                startIcon={<DoneAllRoundedIcon />}
                                sx={{ ...btn.text, minHeight: 36, fontSize: 13 }}
                            >
                                Mark all read
                            </Button>
                        )}
                        {downSm && (
                            <IconButton aria-label="Close" onClick={onClose} sx={{ color: BRAND.navy }}>
                                <CloseRoundedIcon />
                            </IconButton>
                        )}
                    </Stack>
                </Stack>

                <Box
                    role="tablist"
                    aria-label="Filter notifications"
                    sx={{
                        mt: 1.5,
                        p: 0.5,
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        borderRadius: RADIUS.pill,
                        bgcolor: alpha(BRAND.navy, 0.06)
                    }}
                >
                    {TABS.map((item) => {
                        const active = tab === item.value;
                        return (
                            <Box
                                key={item.value}
                                component="button"
                                type="button"
                                role="tab"
                                aria-selected={active}
                                onClick={() => setTab(item.value)}
                                sx={{
                                    height: 36,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 0.75,
                                    border: 0,
                                    borderRadius: RADIUS.pill,
                                    bgcolor: active ? BRAND.navy : 'transparent',
                                    color: active ? '#FFFFFF' : BRAND.navy,
                                    boxShadow: active ? SHADOW.sm : 'none',
                                    font: 'inherit',
                                    fontSize: 14,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'background-color .25s ease, color .25s ease',
                                    ...focusRingSx
                                }}
                            >
                                {item.label}
                                {item.value === 'unread' && unreadCount > 0 && (
                                    <Box
                                        component="span"
                                        sx={{
                                            minWidth: 20,
                                            height: 20,
                                            px: 0.75,
                                            borderRadius: RADIUS.pill,
                                            bgcolor: BRAND.green,
                                            color: '#FFFFFF',
                                            fontSize: 11,
                                            fontWeight: 800,
                                            lineHeight: '20px'
                                        }}
                                    >
                                        {unreadCount}
                                    </Box>
                                )}
                            </Box>
                        );
                    })}
                </Box>
            </Box>

            <Scrollbar sx={{ flex: 1, overflowY: 'auto' }}>
                <Stack spacing={0.5} sx={{ p: 1 }}>
                    {filtered.map(renderItem)}
                </Stack>

                {hasMore && filtered.length > 0 && (
                    <Box sx={{ px: 2, pb: 2, textAlign: 'center' }}>
                        <Button onClick={loadMore} sx={{ ...btn.soft, minHeight: 40 }}>Show more</Button>
                    </Box>
                )}

                {filtered.length === 0 && (
                    <Stack alignItems="center" sx={{ py: 7, px: 3, textAlign: 'center' }}>
                        <IconTile size={56} tone="navy"><NotificationsNoneRoundedIcon /></IconTile>
                        <Typography sx={{ mt: 2, fontFamily: FONT.display, fontWeight: 700, fontSize: 17, color: BRAND.navy }}>
                            {tab === 'unread' ? 'You are all caught up' : 'No notifications yet'}
                        </Typography>
                        <Typography sx={{ mt: 0.5, maxWidth: 280, fontSize: 14, color: BRAND.muted }}>
                            {tab === 'unread'
                                ? 'New messages, responses and project updates will show up here.'
                                : 'We will let you know when something happens on your projects.'}
                        </Typography>
                    </Stack>
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
