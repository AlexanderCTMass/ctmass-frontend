import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import {
    Box,
    Paper,
    Stack,
    Typography
} from '@mui/material';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import ReviewsIcon from '@mui/icons-material/Reviews';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import ScheduleIcon from '@mui/icons-material/Schedule';

const PLAN_STYLES = {
    premium: {
        label: 'Premium',
        iconColor: '#B45309',
        background: (theme) => alpha(theme.palette.warning.main, 0.14),
        borderColor: (theme) => alpha(theme.palette.warning.main, 0.3)
    },
    pro: {
        label: 'Pro',
        iconColor: '#0F766E',
        background: (theme) => alpha(theme.palette.success.main, 0.12),
        borderColor: (theme) => alpha(theme.palette.success.main, 0.3)
    },
    base: {
        label: 'Basic',
        iconColor: '#6B7280',
        background: (theme) => alpha(theme.palette.grey[500], 0.08),
        borderColor: (theme) => alpha(theme.palette.grey[500], 0.2)
    }
};

const PlanTile = ({ config }) => (
    <Paper
        elevation={0}
        sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: config.borderColor,
            p: { xs: 2.5, md: 3 },
            backgroundColor: config.background,
            textAlign: 'center',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}
    >
        <Stack spacing={1} alignItems="center">
            <Box
                sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: (theme) => alpha(config.iconColor, 0.15)
                }}
            >
                <WorkspacePremiumIcon sx={{ fontSize: 24, color: config.iconColor }} />
            </Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                {config.label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
                Account
            </Typography>
        </Stack>
    </Paper>
);

const StatTile = ({ icon, label, value }) => (
    <Paper
        elevation={0}
        sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            p: { xs: 2.5, md: 3 },
            textAlign: 'center',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'box-shadow 0.2s',
            '&:hover': { boxShadow: 2 }
        }}
    >
        <Stack spacing={1} alignItems="center">
            <Box
                sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08)
                }}
            >
                {icon}
            </Box>
            <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1 }}>
                {value}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                {label}
            </Typography>
        </Stack>
    </Paper>
);

const StatsSection = ({
    plan,
    rating,
    reviewsCount,
    completedProjects,
    responseTime
}) => {
    const planKey = (plan || 'base').toLowerCase();
    const planConfig = PLAN_STYLES[planKey] || PLAN_STYLES.base;

    return (
        <Box
            sx={{
                display: 'grid',
                gap: { xs: 1.5, md: 2 },
                gridTemplateColumns: {
                    xs: 'repeat(2, minmax(0, 1fr))',
                    sm: 'repeat(3, minmax(0, 1fr))',
                    md: 'repeat(5, minmax(0, 1fr))'
                }
            }}
        >
            <PlanTile config={planConfig} />

            <StatTile
                icon={<StarRoundedIcon sx={{ fontSize: 22, color: 'warning.main' }} />}
                label="Rating"
                value={rating ?? '—'}
            />

            <StatTile
                icon={<ReviewsIcon sx={{ fontSize: 22, color: 'primary.main' }} />}
                label="Reviews"
                value={reviewsCount ?? '—'}
            />

            <StatTile
                icon={<WorkHistoryIcon sx={{ fontSize: 22, color: 'success.main' }} />}
                label="Completed projects"
                value={
                    typeof completedProjects === 'number'
                        ? `${completedProjects}${completedProjects >= 500 ? '+' : ''}`
                        : '—'
                }
            />

            <StatTile
                icon={<ScheduleIcon sx={{ fontSize: 22, color: 'info.main' }} />}
                label="Response time"
                value={responseTime ?? '—'}
            />
        </Box>
    );
};

PlanTile.propTypes = {
    config: PropTypes.shape({
        label: PropTypes.string.isRequired,
        iconColor: PropTypes.string.isRequired,
        background: PropTypes.func.isRequired,
        borderColor: PropTypes.func.isRequired
    }).isRequired
};

StatTile.propTypes = {
    icon: PropTypes.node.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

StatsSection.propTypes = {
    plan: PropTypes.string,
    rating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    reviewsCount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    completedProjects: PropTypes.number,
    responseTime: PropTypes.string
};

StatsSection.defaultProps = {
    plan: 'base',
    rating: '—',
    reviewsCount: '—',
    completedProjects: undefined,
    responseTime: '—'
};

export default StatsSection;
