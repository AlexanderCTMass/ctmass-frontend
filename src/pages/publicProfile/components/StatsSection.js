import PropTypes from 'prop-types';
import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import { BRAND, FONT, RADIUS, SHADOW } from 'src/theme/ctmass-tokens';

const PLAN_LABELS = {
    premium: 'Premium',
    pro: 'Pro',
    base: 'Basic'
};

const Stat = ({ icon, label, value, accent }) => (
    <Box sx={{ minWidth: 0, px: { xs: 2, md: 2.5 }, py: { xs: 2, md: 2.5 } }}>
        <Typography
            sx={{
                fontFamily: FONT.display,
                fontWeight: 800,
                fontSize: { xs: 22, md: 26 },
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                color: accent || BRAND.navy,
                fontVariantNumeric: 'tabular-nums',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
            }}
        >
            {value}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.6} sx={{ mt: 0.5, color: BRAND.muted, '& svg': { fontSize: 16 } }}>
            {icon}
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{label}</Typography>
        </Stack>
    </Box>
);

const StatsSection = ({ plan, rating, reviewsCount, completedProjects, responseTime }) => {
    const planKey = (plan || 'base').toLowerCase();
    const ratingValue = Number(rating);
    const hasRating = Number.isFinite(ratingValue) && ratingValue > 0;

    const stats = [
        { key: 'rating', icon: <StarRoundedIcon sx={{ color: '#F5A524' }} />, label: 'Rating', value: hasRating ? ratingValue.toFixed(1) : 'New' },
        { key: 'reviews', icon: <RateReviewOutlinedIcon />, label: 'Reviews', value: reviewsCount ?? '0' },
        {
            key: 'completed',
            icon: <TaskAltRoundedIcon />,
            label: 'Completed',
            value: typeof completedProjects === 'number' ? `${completedProjects}${completedProjects >= 500 ? '+' : ''}` : '0'
        },
        { key: 'response', icon: <ScheduleRoundedIcon />, label: 'Response time', value: responseTime || 'Not yet' },
        { key: 'plan', icon: <WorkspacePremiumOutlinedIcon />, label: 'Account', value: PLAN_LABELS[planKey] || PLAN_LABELS.base, accent: planKey === 'base' ? BRAND.navy : BRAND.green }
    ];

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))', md: 'repeat(5, minmax(0, 1fr))' },
                gap: '1px',
                bgcolor: alpha(BRAND.navy, 0.08),
                borderRadius: RADIUS.card,
                border: `1px solid ${alpha(BRAND.navy, 0.08)}`,
                boxShadow: SHADOW.sm,
                overflow: 'hidden',
                '& > *': { bgcolor: '#FFFFFF' },
                '& > *:last-of-type': { gridColumn: { xs: '1 / -1', sm: 'span 2', md: 'auto' } }
            }}
        >
            {stats.map((stat) => (
                <Stat key={stat.key} {...stat} />
            ))}
        </Box>
    );
};

Stat.propTypes = {
    icon: PropTypes.node.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    accent: PropTypes.string
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
    rating: undefined,
    reviewsCount: 0,
    completedProjects: undefined,
    responseTime: undefined
};

export default StatsSection;
