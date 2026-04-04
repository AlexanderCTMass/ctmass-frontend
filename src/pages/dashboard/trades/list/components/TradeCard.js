import { useCallback, useMemo, useState } from 'react';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    Divider,
    IconButton,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
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
                        'Activate your resume whenever you need it.'
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
                    defaultLines: ['Your resume has been rejected. See the moderation details below.'],
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
                alignSelf: { xs: 'stretch', sm: 'flex-end' },
                bgcolor: config.bg,
                color: config.color,
                borderRadius: 2,
                px: 2.5,
                py: 2,
                boxShadow: `0 18px 32px ${alpha(config.bg, 0.35)}`,
                maxWidth: { xs: '100%', sm: 300 }
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

const StatItem = ({ icon, label, value }) => (
    <Stack spacing={1} alignItems="center" sx={{ textAlign: 'center', width: '100%' }}>
        <Box
            sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: 'action.hover',
                color: 'text.primary',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            {icon}
        </Box>
        <Typography variant="subtitle2" fontWeight={600}>
            {label}
        </Typography>
        <Typography variant="body1" fontWeight={500}>
            {value}
        </Typography>
    </Stack>
);

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
    const visibilityTooltip = isHidden ? 'Show resume' : 'Hide resume';

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

    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: statusConfig.cardBg,
                borderColor: statusConfig.borderColor,
                boxShadow: 'none'
            }}
        >
            <CardContent sx={{ pt: 3.5, px: 3.5, pb: 2.5 }}>
                <Stack spacing={3}>
                    <Stack
                        direction="row"
                        justifyContent="center"
                        alignItems="flex-start"
                        position='relative'
                    >
                        <Stack spacing={1.5} alignItems="center">
                            <Avatar
                                src={safeTrade.avatarUrl || undefined}
                                variant="circular"
                                sx={{
                                    width: 80,
                                    height: 80,
                                    border: (themeArg) => `3px solid ${alpha(themeArg.palette.primary.main, 0.2)}`
                                }}
                            >
                                {avatarInitial}
                            </Avatar>
                        </Stack>
                        <Chip
                            label={statusConfig.label}
                            size="small"
                            sx={{
                                position: 'absolute',
                                top: 0,
                                right: -10,
                                fontWeight: 600,
                                textTransform: 'none',
                                borderRadius: '12px',
                                bgcolor: statusConfig.badgeBg,
                                color: statusConfig.badgeColor
                            }}
                        />
                    </Stack>

                    <Stack spacing={0.75} sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight={700}>
                            {safeTrade.title || 'Untitled trade'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {specialtyLabel}
                        </Typography>
                        {description && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.5 }}
                            >
                                {description}
                            </Typography>
                        )}
                    </Stack>

                    <StatusNotice
                        config={statusConfig.notice}
                        messages={statusMessages}
                        onAction={handleNoticeAction}
                        disabled={noticeActionDisabled}
                    />

                    <Divider />

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(2, minmax(0, 1fr))' },
                            columnGap: { xs: 2, sm: 3 },
                            rowGap: { xs: 2.5, sm: 3 },
                            justifyItems: 'center',
                            textAlign: 'center'
                        }}
                    >
                        <StatItem
                            icon={<StarBorderOutlinedIcon fontSize="small" />}
                            label="Rating"
                            value={formatStatValue(safeTrade.rating, { isRating: true })}
                        />
                        <StatItem
                            icon={<VisibilityOutlinedIcon fontSize="small" />}
                            label="Views"
                            value={formatStatValue(safeTrade.views ?? safeTrade.metrics?.totalViews ?? 0)}
                        />
                        <StatItem
                            icon={<RateReviewOutlinedIcon fontSize="small" />}
                            label="Reviews"
                            value={formatStatValue(safeTrade.reviews ?? 0)}
                        />
                        <StatItem
                            icon={<TaskAltOutlinedIcon fontSize="small" />}
                            label="Completed Projects"
                            value={formatStatValue(safeTrade.completedProjects ?? 0)}
                        />
                        <Box sx={{ gridColumn: '1 / -1', width: '100%', display: 'flex', justifyContent: 'center' }}>
                            <StatItem
                                icon={<PendingActionsOutlinedIcon fontSize="small" />}
                                label="Projects in Progress"
                                value={formatStatValue(safeTrade.projectsInProgress ?? 0)}
                            />
                        </Box>
                    </Box>
                </Stack>
            </CardContent>

            <CardActions
                sx={{
                    mt: 'auto',
                    px: 2.5,
                    py: 2,
                    justifyContent: 'space-between',
                    borderTop: 1,
                    borderColor: statusConfig.borderColor,
                    backgroundColor: statusConfig.actionBg
                }}
            >
                <Button
                    variant={statusConfig.primaryAction?.variant || 'contained'}
                    color={statusConfig.primaryAction?.color || 'primary'}
                    size="small"
                    onClick={handlePrimaryAction}
                    disabled={primaryActionDisabled}
                >
                    {statusConfig.primaryAction?.label ?? 'Edit'}
                </Button>

                {!statusConfig.hideSecondaryActions && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Tooltip title="Open public page">
                            <span>
                                <IconButton
                                    size="small"
                                    color="default"
                                    onClick={() => onView?.(safeTrade)}
                                    disabled={!onView}
                                >
                                    <LaunchOutlinedIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Share">
                            <IconButton size="small" color="default">
                                <ShareOutlinedIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Copy link">
                            <IconButton size="small" color="default">
                                <ContentCopyOutlinedIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        {showVisibilityIcon && (
                            <Tooltip title={visibilityTooltip}>
                                <span>
                                    <IconButton
                                        size="small"
                                        color="default"
                                        onClick={handleToggleVisibility}
                                        disabled={statusUpdating || !onToggleVisibility}
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
                    </Box>
                )}
            </CardActions>
        </Card>
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