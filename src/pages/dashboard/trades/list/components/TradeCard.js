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
    Grid,
    IconButton,
    Stack,
    Typography
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import { tradesApi } from 'src/api/trades';

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

    if (normalized === 'on review' || normalized === 'on_review' || normalized === 'review') {
        return STATUS_KEYS.ON_REVIEW;
    }

    if (normalized === 'fix it' || normalized === 'fix_it' || normalized === 'fix-it' || normalized === 'needs_fix') {
        return STATUS_KEYS.FIX_IT;
    }

    if (normalized === 'not active' || normalized === 'not_active' || normalized === 'inactive') {
        return STATUS_KEYS.NOT_ACTIVE;
    }

    if (normalized === 'hidden') {
        return STATUS_KEYS.HIDDEN;
    }

    if (normalized === 'rejected' || normalized === 'banned') {
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

function StatItem({ icon, label, value }) {
    const displayValue = value === 0 || value ? value : '—';

    return (
        <Stack spacing={0.5}>
            <Stack direction="row" spacing={1} alignItems="center">
                <Box
                    sx={{
                        width: 32,
                        height: 32,
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
            </Stack>
            <Typography variant="body2" color="text.secondary">
                {displayValue}
            </Typography>
        </Stack>
    );
}

function TradeCard({ trade, onView, onEdit, onActivate, onRemove }) {
    const safeTrade = trade ?? {};
    const theme = useTheme();
    const statusKey = normalizeStatus(safeTrade.status);
    const statusMessages = useMemo(() => collectStatusMessages(safeTrade), [safeTrade]);
    const [activating, setActivating] = useState(false);

    const handleView = useCallback(() => {
        onView?.(safeTrade);
    }, [onView, safeTrade]);

    const handleEdit = useCallback(() => {
        onEdit?.(safeTrade);
    }, [onEdit, safeTrade]);

    const handleRemove = useCallback(() => {
        onRemove?.(safeTrade);
    }, [onRemove, safeTrade]);

    const handleActivateClick = useCallback(async () => {
        if (onActivate) {
            await onActivate(safeTrade);
            return;
        }

        if (!safeTrade?.id) {
            return;
        }

        try {
            setActivating(true);
            await tradesApi.updateTrade(safeTrade.id, { status: 'active', statusDetails: '' });
        } catch (error) {
            console.error('[TradeCard] Failed to activate trade', error);
        } finally {
            setActivating(false);
        }
    }, [onActivate, safeTrade]);

    const statusConfig = useMemo(() => {
        switch (statusKey) {
            case STATUS_KEYS.HIDDEN:
                return {
                    label: 'Hidden',
                    cardBg: alpha(theme.palette.grey[500], 0.08),
                    cardBorderColor: alpha(theme.palette.grey[400], 0.4),
                    chipBg: theme.palette.grey[300],
                    chipColor: theme.palette.text.secondary,
                    chipBorder: `1px solid ${theme.palette.grey[400]}`,
                    actionBg: alpha(theme.palette.common.white, 0.7),
                    primaryAction: {
                        label: 'View',
                        variant: 'outlined',
                        color: 'primary',
                        onClick: handleView,
                        disabled: false
                    }
                };
            case STATUS_KEYS.ON_REVIEW:
                return {
                    label: 'On review',
                    cardBg: alpha(theme.palette.warning.main, 0.08),
                    cardBorderColor: alpha(theme.palette.warning.main, 0.25),
                    chipBg: alpha(theme.palette.warning.main, 0.2),
                    chipColor: theme.palette.warning.dark,
                    actionBg: alpha(theme.palette.common.white, 0.75),
                    primaryAction: {
                        label: 'Edit',
                        variant: 'contained',
                        color: 'primary',
                        onClick: handleEdit,
                        disabled: !onEdit
                    }
                };
            case STATUS_KEYS.FIX_IT:
                return {
                    label: 'Fix it',
                    cardBg: alpha(theme.palette.warning.main, 0.12),
                    cardBorderColor: alpha(theme.palette.warning.main, 0.3),
                    chipBg: theme.palette.warning.main,
                    chipColor: theme.palette.common.white,
                    actionBg: alpha(theme.palette.common.white, 0.8),
                    primaryAction: {
                        label: 'Edit',
                        variant: 'contained',
                        color: 'primary',
                        onClick: handleEdit,
                        disabled: !onEdit
                    }
                };
            case STATUS_KEYS.NOT_ACTIVE:
                return {
                    label: 'Not active',
                    cardBg: alpha(theme.palette.success.main, 0.12),
                    cardBorderColor: alpha(theme.palette.success.main, 0.3),
                    chipBg: alpha(theme.palette.grey[900], 0.9),
                    chipColor: theme.palette.common.white,
                    actionBg: alpha(theme.palette.common.white, 0.8),
                    primaryAction: {
                        label: 'Activate',
                        variant: 'contained',
                        color: 'success',
                        onClick: handleActivateClick,
                        disabled: activating
                    }
                };
            case STATUS_KEYS.REJECTED:
                return {
                    label: 'Rejected',
                    cardBg: alpha(theme.palette.error.main, 0.12),
                    cardBorderColor: alpha(theme.palette.error.main, 0.3),
                    chipBg: theme.palette.error.main,
                    chipColor: theme.palette.common.white,
                    actionBg: alpha(theme.palette.common.white, 0.8),
                    primaryAction: {
                        label: 'Remove',
                        variant: 'outlined',
                        color: 'error',
                        onClick: handleRemove,
                        disabled: !onRemove
                    }
                };
            case STATUS_KEYS.ACTIVE:
            default:
                return {
                    label: 'Active',
                    cardBg: alpha(theme.palette.success.main, 0.08),
                    cardBorderColor: alpha(theme.palette.success.main, 0.24),
                    chipBg: theme.palette.success.main,
                    chipColor: theme.palette.common.white,
                    actionBg: alpha(theme.palette.common.white, 0.7),
                    primaryAction: {
                        label: 'View',
                        variant: 'contained',
                        color: 'primary',
                        onClick: handleView,
                        disabled: false
                    }
                };
        }
    }, [statusKey, theme, handleView, handleEdit, handleActivateClick, handleRemove, onEdit, onRemove, activating]);

    const messageConfig = useMemo(() => {
        switch (statusKey) {
            case STATUS_KEYS.FIX_IT:
                return {
                    backgroundColor: theme.palette.warning.main,
                    color: theme.palette.common.white,
                    defaultLines: ['Update the trade according to moderator feedback.'],
                    actionLabel: 'Edit',
                    actionVariant: 'contained',
                    actionColor: 'inherit',
                    actionOnClick: handleEdit,
                    actionDisabled: !onEdit
                };
            case STATUS_KEYS.NOT_ACTIVE:
                return {
                    backgroundColor: alpha(theme.palette.success.main, 0.2),
                    color: theme.palette.success.dark,
                    defaultLines: ['Congratulations, you have successfully passed moderation! Now activate your resume whenever you need it.'],
                    actionLabel: 'Activate',
                    actionVariant: 'contained',
                    actionColor: 'success',
                    actionOnClick: handleActivateClick,
                    actionDisabled: activating
                };
            case STATUS_KEYS.REJECTED:
                return {
                    backgroundColor: theme.palette.error.main,
                    color: theme.palette.common.white,
                    defaultLines: ['Your trade has been rejected. See the details below.'],
                    actionLabel: 'Remove',
                    actionVariant: 'outlined',
                    actionColor: 'inherit',
                    actionOnClick: handleRemove,
                    actionDisabled: !onRemove
                };
            default:
                return null;
        }
    }, [statusKey, theme, handleEdit, handleActivateClick, handleRemove, onEdit, onRemove, activating]);

    const messageLines = useMemo(() => {
        if (statusMessages.length) {
            return statusMessages;
        }

        return messageConfig?.defaultLines ?? [];
    }, [statusMessages, messageConfig]);

    const renderStatusMessage = () => {
        if (!messageConfig) {
            return null;
        }

        if (!messageLines.length && !messageConfig.actionLabel) {
            return null;
        }

        const bubbleShadow = alpha(theme.palette.grey[900], 0.15);

        return (
            <Box
                sx={{
                    alignSelf: { xs: 'stretch', sm: 'flex-end' },
                    bgcolor: messageConfig.backgroundColor,
                    color: messageConfig.color,
                    borderRadius: 2,
                    px: 2.5,
                    py: 2,
                    boxShadow: `0 14px 32px ${bubbleShadow}`,
                    maxWidth: { xs: '100%', sm: 280 }
                }}
            >
                <Stack spacing={1.5}>
                    {messageLines.map((line, index) => (
                        <Typography
                            key={index}
                            variant="body2"
                            sx={{ color: messageConfig.color }}
                        >
                            {line}
                        </Typography>
                    ))}
                    {messageConfig.actionLabel && (
                        <Button
                            variant={messageConfig.actionVariant}
                            color={messageConfig.actionColor}
                            onClick={messageConfig.actionOnClick}
                            disabled={messageConfig.actionDisabled}
                            size="small"
                            sx={{
                                alignSelf: 'flex-start',
                                color: messageConfig.actionVariant === 'outlined' ? messageConfig.color : undefined,
                                borderColor: messageConfig.actionVariant === 'outlined'
                                    ? alpha(messageConfig.color, 0.6)
                                    : undefined
                            }}
                        >
                            {messageConfig.actionLabel}
                        </Button>
                    )}
                </Stack>
            </Box>
        );
    };

    const title = safeTrade.title || 'Untitled trade';
    const specialtyLabel = safeTrade.primarySpecialtyLabel || safeTrade.subtitle || 'Specialty';
    const description = safeTrade.description;
    const avatarInitial = title.charAt(0);

    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'none',
                backgroundColor: statusConfig.cardBg,
                borderColor: statusConfig.cardBorderColor
            }}
        >
            <CardContent sx={{ pt: 3.5, px: 3.5, pb: 2.5, flexGrow: 1 }}>
                <Stack spacing={3}>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                    >
                        <Stack spacing={1.5} alignItems="center">
                            <Avatar
                                src={safeTrade.avatarUrl || undefined}
                                variant="circular"
                                sx={{ width: 80, height: 80 }}
                            >
                                {avatarInitial}
                            </Avatar>
                        </Stack>
                        <Chip
                            label={statusConfig.label}
                            size="small"
                            sx={{
                                fontWeight: 600,
                                textTransform: 'none',
                                borderRadius: '12px',
                                bgcolor: statusConfig.chipBg,
                                color: statusConfig.chipColor,
                                border: statusConfig.chipBorder
                            }}
                        />
                    </Stack>

                    <Stack spacing={0.75}>
                        <Typography variant="h6" fontWeight={700}>
                            {title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {specialtyLabel}
                        </Typography>
                        {description && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 1 }}
                            >
                                {description}
                            </Typography>
                        )}
                    </Stack>

                    {renderStatusMessage()}

                    <Divider />

                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <StatItem
                                icon={<StarBorderOutlinedIcon fontSize="small" />}
                                label="Rating"
                                value={
                                    Number.isFinite(Number(safeTrade.rating))
                                        ? Number(safeTrade.rating).toFixed(1)
                                        : '—'
                                }
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <StatItem
                                icon={<VisibilityOutlinedIcon fontSize="small" />}
                                label="Views"
                                value={safeTrade.views ?? safeTrade.metrics?.totalViews ?? 0}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <StatItem
                                icon={<RateReviewOutlinedIcon fontSize="small" />}
                                label="Reviews"
                                value={safeTrade.reviews ?? 0}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <StatItem
                                icon={<TaskAltOutlinedIcon fontSize="small" />}
                                label="Completed Projects"
                                value={safeTrade.completedProjects ?? 0}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <StatItem
                                icon={<PendingActionsOutlinedIcon fontSize="small" />}
                                label="Projects in Progress"
                                value={safeTrade.projectsInProgress ?? 0}
                            />
                        </Grid>
                    </Grid>
                </Stack>
            </CardContent>

            <CardActions
                sx={{
                    mt: 'auto',
                    px: 2.5,
                    py: 2,
                    justifyContent: 'space-between',
                    borderTop: 1,
                    borderColor: statusConfig.cardBorderColor,
                    backgroundColor: statusConfig.actionBg
                }}
            >
                <Button
                    variant={statusConfig.primaryAction.variant}
                    color={statusConfig.primaryAction.color}
                    size="small"
                    onClick={statusConfig.primaryAction.onClick}
                    disabled={statusConfig.primaryAction.disabled}
                >
                    {statusConfig.primaryAction.label}
                </Button>

                <Box>
                    <IconButton size="small" color="default">
                        <LaunchOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="default">
                        <ShareOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="default">
                        <ContentCopyOutlinedIcon fontSize="small" />
                    </IconButton>
                </Box>
            </CardActions>
        </Card>
    );
}

TradeCard.defaultProps = {
    onView: undefined,
    onEdit: undefined,
    onActivate: undefined,
    onRemove: undefined
};

export default TradeCard;