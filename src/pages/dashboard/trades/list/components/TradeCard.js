import { useCallback, useMemo, useState } from 'react';
import {
    Avatar,
    Box,
    Button,
    Chip,
    IconButton,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { BRAND, FONT, RADIUS, SHADOW } from 'src/theme/ctmass-tokens';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';

const STATUS_KEYS = {
    ACTIVE: 'active',
    HIDDEN: 'hidden',
    ON_REVIEW: 'on_review',
    FIX_IT: 'fix_it',
    NOT_ACTIVE: 'not_active',
    REJECTED: 'rejected'
};

const normalizeStatus = (status) => {
    if (!status) {
        return STATUS_KEYS.ACTIVE;
    }

    const normalized = status.toString().trim().toLowerCase();

    if (normalized.includes('on') && normalized.includes('review')) {
        return STATUS_KEYS.ON_REVIEW;
    }

    if (normalized.includes('fix')) {
        return STATUS_KEYS.FIX_IT;
    }

    if (normalized.includes('not') && normalized.includes('active')) {
        return STATUS_KEYS.NOT_ACTIVE;
    }

    if (normalized.includes('hidden')) {
        return STATUS_KEYS.HIDDEN;
    }

    if (normalized.includes('reject') || normalized.includes('ban')) {
        return STATUS_KEYS.REJECTED;
    }

    return STATUS_KEYS.ACTIVE;
};

const collectStatusMessages = (trade) => {
    const candidates = [
        trade?.statusDetails,
        trade?.statusNote,
        trade?.statusMessage,
        trade?.statusReason,
        trade?.statusReasons,
        trade?.moderationNotes
    ];

    const messages = [];

    candidates.forEach((candidate) => {
        if (!candidate) {
            return;
        }

        if (Array.isArray(candidate)) {
            candidate
                .filter((item) => typeof item === 'string' && item.trim().length)
                .forEach((item) => messages.push(item.trim()));
            return;
        }

        if (typeof candidate === 'string') {
            candidate
                .split(/\r?\n/)
                .map((line) => line.trim())
                .filter((line) => line.length)
                .forEach((line) => messages.push(line));
        }
    });

    return Array.from(new Set(messages));
};

const formatStatValue = (value, options = {}) => {
    if (options.isRating) {
        const rating = Number(value);
        return Number.isFinite(rating) && rating > 0 ? rating.toFixed(1) : '—';
    }

    if (value === 0) {
        return '0';
    }

    if (Number.isFinite(Number(value))) {
        return Number(value).toString();
    }

    if (value === undefined || value === null || value === '') {
        return '—';
    }

    return value;
};

const buildStatusConfig = (theme, statusKey) => {
    switch (statusKey) {
        case STATUS_KEYS.HIDDEN:
            return {
                label: 'Hidden',
                badgeBg: alpha(theme.palette.grey[500], 0.2),
                badgeColor: theme.palette.text.secondary,
                cardBg: theme.palette.common.white,
                borderColor: alpha(theme.palette.grey[400], 0.5),
                actionBg: alpha(theme.palette.common.white, 0.7),
                primaryAction: { type: 'view', label: 'View', variant: 'contained', color: 'primary' }
            };
        case STATUS_KEYS.ON_REVIEW:
            return {
                label: 'On review',
                badgeBg: alpha(theme.palette.warning.main, 0.3),
                badgeColor: theme.palette.warning.dark,
                cardBg: alpha(theme.palette.warning.main, 0.08),
                borderColor: alpha(theme.palette.warning.main, 0.35),
                actionBg: alpha(theme.palette.common.white, 0.7),
                primaryAction: { type: 'edit', label: 'Edit', variant: 'contained', color: 'primary' }
            };
        case STATUS_KEYS.FIX_IT:
            return {
                label: 'Fix it',
                badgeBg: theme.palette.warning.main,
                badgeColor: theme.palette.common.white,
                cardBg: alpha(theme.palette.warning.main, 0.12),
                borderColor: alpha(theme.palette.warning.main, 0.35),
                actionBg: alpha(theme.palette.common.white, 0.75),
                primaryAction: { type: 'edit', label: 'Edit', variant: 'contained', color: 'primary' },
                notice: {
                    bg: theme.palette.warning.main,
                    color: theme.palette.common.white,
                    defaultLines: ['Update the trade according to moderator feedback.'],
                    action: { type: 'edit', label: 'Edit', variant: 'contained', color: 'inherit' }
                }
            };
        case STATUS_KEYS.NOT_ACTIVE:
            return {
                label: 'Not active',
                badgeBg: alpha(theme.palette.success.main, 0.28),
                badgeColor: theme.palette.success.dark,
                cardBg: alpha(theme.palette.success.main, 0.12),
                borderColor: alpha(theme.palette.success.main, 0.32),
                actionBg: alpha(theme.palette.common.white, 0.8),
                primaryAction: { type: 'activate', label: 'Activate', variant: 'contained', color: 'success' },
                notice: {
                    bg: alpha(theme.palette.success.main, 0.95),
                    color: theme.palette.common.white,
                    defaultLines: [
                        'Congratulations, you have successfully passed moderation!',
                        'Activate your trade whenever you need it.'
                    ]
                }
            };
        case STATUS_KEYS.REJECTED:
            return {
                label: 'Rejected',
                badgeBg: theme.palette.error.main,
                badgeColor: theme.palette.common.white,
                cardBg: alpha(theme.palette.error.main, 0.12),
                borderColor: alpha(theme.palette.error.main, 0.4),
                actionBg: alpha(theme.palette.common.white, 0.85),
                primaryAction: { type: 'remove', label: 'Remove', variant: 'outlined', color: 'error' },
                notice: {
                    bg: theme.palette.error.main,
                    color: theme.palette.common.white,
                    defaultLines: ['Your trade has been rejected. See the moderation details below.'],
                    action: { type: 'remove', label: 'Remove', variant: 'outlined', color: 'inherit' }
                },
                hideSecondaryActions: true
            };
        case STATUS_KEYS.ACTIVE:
        default:
            return {
                label: 'Active',
                badgeBg: theme.palette.success.main,
                badgeColor: theme.palette.common.white,
                cardBg: theme.palette.common.white,
                borderColor: alpha(theme.palette.primary.main, 0.25),
                actionBg: alpha(theme.palette.common.white, 0.7),
                primaryAction: { type: 'view', label: 'View', variant: 'contained', color: 'primary' }
            };
    }
};

const StatusNotice = ({ config, messages, onAction, disabled }) => {
    if (!config) {
        return null;
    }

    const lines = messages.length ? messages : config.defaultLines || [];

    if (!lines.length && !config.action) {
        return null;
    }

    return (
        <Box
            sx={{
                                bgcolor: config.bg,
                color: config.color,
                borderRadius: RADIUS.inner,
                px: 2,
                py: 1.75
            }}
        >
            <Stack spacing={1.5}>
                {lines.map((line, index) => (
                    <Typography key={index} variant="body2" sx={{ color: config.color }}>
                        {line}
                    </Typography>
                ))}
                {config.action && config.action.label ? (
                    <Button
                        size="small"
                        variant={config.action.variant || 'contained'}
                        color={config.action.color || 'inherit'}
                        onClick={onAction}
                        disabled={disabled}
                        sx={{
                            alignSelf: 'flex-start',
                            color: config.action.variant === 'outlined' ? config.color : undefined,
                            borderColor: config.action.variant === 'outlined'
                                ? alpha(config.color, 0.6)
                                : undefined
                        }}
                    >
                        {config.action.label}
                    </Button>
                ) : null}
            </Stack>
        </Box>
    );
};

function TradeCard({ trade, onView, onEdit, onActivate, onToggleVisibility, onRemove }) {
    const safeTrade = trade ?? {};
    const theme = useTheme();
    const statusKey = normalizeStatus(safeTrade.status);
    const statusConfig = useMemo(() => buildStatusConfig(theme, statusKey), [theme, statusKey]);
    const statusMessages = useMemo(() => collectStatusMessages(safeTrade), [safeTrade]);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [primaryActionLoading, setPrimaryActionLoading] = useState(false);
    const [noticeActionLoading, setNoticeActionLoading] = useState(false);

    const avatarInitial = (safeTrade.title || 'T').charAt(0).toUpperCase();
    const specialtyLabel = safeTrade.primarySpecialtyLabel || safeTrade.subtitle || 'Specialty';
    const description = safeTrade.description || safeTrade.story?.shortDescription || '';

    const isHidden = statusKey === STATUS_KEYS.HIDDEN;
    const showVisibilityIcon = statusKey !== STATUS_KEYS.REJECTED;
    const visibilityTooltip = isHidden ? 'Show trade' : 'Hide trade';

    const executeAsyncAction = useCallback(
        async (type, setLoading) => {
            if (type === 'view') {
                onView?.(safeTrade);
                return;
            }

            if (type === 'edit') {
                onEdit?.(safeTrade);
                return;
            }

            if (type === 'activate') {
                if (!onActivate) return;
                setLoading?.(true);
                try {
                    await onActivate(safeTrade);
                } finally {
                    setLoading?.(false);
                }
                return;
            }

            if (type === 'remove') {
                if (!onRemove) return;
                setLoading?.(true);
                try {
                    await onRemove(safeTrade);
                } finally {
                    setLoading?.(false);
                }
            }
        },
        [onActivate, onEdit, onRemove, onView, safeTrade]
    );

    const handlePrimaryAction = useCallback(async () => {
        if (!statusConfig.primaryAction) {
            return;
        }

        await executeAsyncAction(statusConfig.primaryAction.type, setPrimaryActionLoading);
    }, [executeAsyncAction, statusConfig.primaryAction]);

    const noticeAction = statusConfig.notice?.action;

    const handleNoticeAction = useCallback(async () => {
        if (!noticeAction) {
            return;
        }

        await executeAsyncAction(noticeAction.type, setNoticeActionLoading);
    }, [executeAsyncAction, noticeAction]);

    const handleToggleVisibility = useCallback(async () => {
        if (!onToggleVisibility || statusKey === STATUS_KEYS.REJECTED) {
            return;
        }

        try {
            setStatusUpdating(true);
            await onToggleVisibility(safeTrade);
        } finally {
            setStatusUpdating(false);
        }
    }, [onToggleVisibility, safeTrade, statusKey]);

    const disableActions = statusUpdating || primaryActionLoading || noticeActionLoading;

    const primaryActionDisabled =
        disableActions ||
        !statusConfig.primaryAction ||
        (statusConfig.primaryAction.type === 'view' && !onView) ||
        (statusConfig.primaryAction.type === 'edit' && !onEdit) ||
        (statusConfig.primaryAction.type === 'activate' && !onActivate) ||
        (statusConfig.primaryAction.type === 'remove' && !onRemove);

    const noticeActionDisabled =
        disableActions ||
        !noticeAction ||
        (noticeAction?.type === 'edit' && !onEdit) ||
        (noticeAction?.type === 'activate' && !onActivate) ||
        (noticeAction?.type === 'remove' && !onRemove);

    const completed = Number(safeTrade.completedProjects ?? 0) || 0;
    const inProgress = Number(safeTrade.projectsInProgress ?? 0) || 0;
    const stats = [
        { label: 'Rating', icon: <StarBorderOutlinedIcon />, value: formatStatValue(safeTrade.rating, { isRating: true }) },
        { label: 'Views', icon: <VisibilityOutlinedIcon />, value: formatStatValue(safeTrade.views ?? safeTrade.metrics?.totalViews ?? 0) },
        { label: 'Reviews', icon: <RateReviewOutlinedIcon />, value: formatStatValue(safeTrade.reviews ?? 0) }
    ];

    const iconButtonSx = {
        width: 40,
        height: 40,
        borderRadius: '12px',
        color: BRAND.navy,
        bgcolor: alpha(BRAND.navy, 0.06),
        '&:hover': { bgcolor: alpha(BRAND.navy, 0.12) }
    };

    return (
        <Box
            component="article"
            sx={{
                height: '100%',
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#FFFFFF',
                borderRadius: RADIUS.card,
                border: `1px solid ${alpha(BRAND.navy, 0.08)}`,
                boxShadow: SHADOW.sm,
                overflow: 'hidden',
                transition: 'box-shadow .25s ease, border-color .25s ease',
                '&:hover': { boxShadow: SHADOW.md, borderColor: alpha(BRAND.navy, 0.16) }
            }}
        >
            <Box sx={{ p: { xs: 2.5, md: 3 }, flexGrow: 1 }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar
                        src={safeTrade.avatarUrl || undefined}
                        variant="rounded"
                        sx={{
                            width: 64,
                            height: 64,
                            flexShrink: 0,
                            borderRadius: '20px',
                            bgcolor: BRAND.navy,
                            color: '#FFFFFF',
                            fontFamily: FONT.display,
                            fontWeight: 800,
                            fontSize: 26
                        }}
                    >
                        {avatarInitial}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Chip
                            label={statusConfig.label}
                            size="small"
                            sx={{
                                height: 24,
                                mb: 0.75,
                                fontSize: 12,
                                fontWeight: 700,
                                borderRadius: '999px',
                                bgcolor: statusConfig.badgeBg,
                                color: statusConfig.badgeColor
                            }}
                        />
                        <Typography
                            component="h3"
                            title={safeTrade.title || 'Untitled trade'}
                            sx={{
                                fontFamily: FONT.display,
                                fontWeight: 700,
                                fontSize: 19,
                                lineHeight: 1.25,
                                letterSpacing: '-0.015em',
                                color: BRAND.navy,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                overflowWrap: 'anywhere'
                            }}
                        >
                            {safeTrade.title || 'Untitled trade'}
                        </Typography>
                        <Typography noWrap sx={{ mt: 0.25, fontSize: 14, fontWeight: 600, color: BRAND.muted }}>
                            {specialtyLabel}
                        </Typography>
                    </Box>
                </Stack>

                {description && (
                    <Typography
                        sx={{
                            mt: 2,
                            fontSize: 14,
                            lineHeight: 1.55,
                            color: BRAND.muted,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            overflowWrap: 'anywhere'
                        }}
                    >
                        {description}
                    </Typography>
                )}

                <Box sx={{ mt: statusConfig.notice ? 2 : 0 }}>
                    <StatusNotice
                        config={statusConfig.notice}
                        messages={statusMessages}
                        onAction={handleNoticeAction}
                        disabled={noticeActionDisabled}
                    />
                </Box>

                <Box
                    sx={{
                        mt: 2.5,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                        borderRadius: RADIUS.inner,
                        bgcolor: BRAND.mist
                    }}
                >
                    {stats.map((stat, index) => (
                        <Box
                            key={stat.label}
                            sx={{
                                minWidth: 0,
                                px: 1.5,
                                py: 1.5,
                                borderLeft: index === 0 ? 0 : `1px solid ${alpha(BRAND.navy, 0.08)}`
                            }}
                        >
                            <Typography sx={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 22, lineHeight: 1.1, color: BRAND.navy, fontVariantNumeric: 'tabular-nums' }}>
                                {stat.value}
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5, color: BRAND.muted, '& svg': { fontSize: 15 } }}>
                                {stat.icon}
                                <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{stat.label}</Typography>
                            </Stack>
                        </Box>
                    ))}
                </Box>

                <Stack direction="row" flexWrap="wrap" sx={{ mt: 1.75, columnGap: 2.5, rowGap: 0.5, color: BRAND.muted, fontSize: 13, fontWeight: 500 }}>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                        <TaskAltOutlinedIcon sx={{ fontSize: 16, color: BRAND.green }} />
                        <span>{completed} completed</span>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                        <PendingActionsOutlinedIcon sx={{ fontSize: 16, color: BRAND.navy }} />
                        <span>{inProgress} in progress</span>
                    </Stack>
                </Stack>
            </Box>

            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1.5}
                sx={{ px: { xs: 2.5, md: 3 }, py: 2, borderTop: `1px solid ${alpha(BRAND.navy, 0.08)}` }}
            >
                <Button
                    variant={statusConfig.primaryAction?.variant || 'contained'}
                    color={statusConfig.primaryAction?.color || 'primary'}
                    onClick={handlePrimaryAction}
                    disabled={primaryActionDisabled}
                    sx={{ minHeight: 42, px: 3, borderRadius: RADIUS.tile, fontWeight: 700 }}
                >
                    {statusConfig.primaryAction?.label ?? 'Edit'}
                </Button>

                {!statusConfig.hideSecondaryActions && (
                    <Stack direction="row" spacing={1}>
                        <Tooltip title="Open trade page">
                            <span>
                                <IconButton
                                    aria-label="Open trade page"
                                    onClick={() => onView?.(safeTrade)}
                                    disabled={!onView}
                                    sx={iconButtonSx}
                                >
                                    <LaunchOutlinedIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                        {showVisibilityIcon && (
                            <Tooltip title={visibilityTooltip}>
                                <span>
                                    <IconButton
                                        aria-label={visibilityTooltip}
                                        onClick={handleToggleVisibility}
                                        disabled={statusUpdating || !onToggleVisibility}
                                        sx={iconButtonSx}
                                    >
                                        {isHidden ? (
                                            <VisibilityIcon fontSize="small" />
                                        ) : (
                                            <VisibilityOffIcon fontSize="small" />
                                        )}
                                    </IconButton>
                                </span>
                            </Tooltip>
                        )}
                    </Stack>
                )}
            </Stack>
        </Box>
    );
}

TradeCard.defaultProps = {
    onView: undefined,
    onEdit: undefined,
    onActivate: undefined,
    onToggleVisibility: undefined,
    onRemove: undefined
};

export default TradeCard;
