import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import {
    Box,
    Paper,
    Stack,
    Typography
} from '@mui/material';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import StarIcon from '@mui/icons-material/Star';
import ReviewsIcon from '@mui/icons-material/Reviews';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import ScheduleIcon from '@mui/icons-material/Schedule';

const PLAN_STYLES = {
    premium: {
        label: 'Premium',
        iconColor: '#B45309',
        background: (theme) => alpha(theme.palette.warning.main, 0.16)
    },
    pro: {
        label: 'Pro',
        iconColor: '#0F766E',
        background: (theme) => alpha(theme.palette.success.main, 0.18)
    },
    basic: {
        label: 'Basic',
        iconColor: '#1F2937',
        background: (theme) => alpha(theme.palette.grey[500], 0.12)
    }
};

const PlanTile = ({ config }) => (
    <Paper
        elevation={0}
        sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            p: 3,
            backgroundColor: config.background,
            textAlign: 'center',
            height: '100%'
        }}
    >
        <Stack spacing={1.5} alignItems="center">
            <WorkspacePremiumIcon sx={{ fontSize: 28, color: config.iconColor }} />
            <Typography variant="h6" fontWeight={700}>
                {config.label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
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
            p: 3,
            textAlign: 'center',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}
    >
        <Stack spacing={1.25} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
                {icon}
                <Typography variant="body2" fontWeight={500}>
                    {label}
                </Typography>
            </Stack>
            <Typography variant="h5" fontWeight={700}>
                {value}
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
    const planKey = (plan || 'basic').toLowerCase();
    const planConfig = PLAN_STYLES[planKey] || PLAN_STYLES.basic;

    return (
        <Box
            sx={{
                display: 'grid',
                gap: { xs: 2, md: 2.5 },
                gridTemplateColumns: {
                    xs: 'repeat(1, minmax(0, 1fr))',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    lg: 'repeat(5, minmax(0, 1fr))'
                }
            }}
        >
            <PlanTile config={planConfig} />

            <StatTile
                icon={<StarIcon fontSize="small" />}
                label="Rating"
                value={rating ?? '—'}
            />

            <StatTile
                icon={<ReviewsIcon fontSize="small" />}
                label="Reviews"
                value={reviewsCount ?? '—'}
            />

            <StatTile
                icon={<WorkHistoryIcon fontSize="small" />}
                label="Completed projects"
                value={
                    typeof completedProjects === 'number'
                        ? `${completedProjects}${completedProjects >= 500 ? '+' : ''}`
                        : '—'
                }
            />

            <StatTile
                icon={<ScheduleIcon fontSize="small" />}
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
        background: PropTypes.func.isRequired
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
    plan: 'basic',
    rating: '—',
    reviewsCount: '—',
    completedProjects: undefined,
    responseTime: '—'
};

export default StatsSection;