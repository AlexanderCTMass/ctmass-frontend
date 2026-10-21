import { Box, Typography } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import { BRAND, FONT, RADIUS } from 'src/theme/ctmass-tokens';
import { IconTile, cardTitleSx } from 'src/components/ctmass-ui';

const StatCard = ({ icon, label, value, tone }) => (
    <Box
        sx={{
            minWidth: 0,
            p: { xs: 2, md: 2.5 },
            borderRadius: RADIUS.inner,
            bgcolor: BRAND.mist
        }}
    >
        <IconTile tone={tone}>{icon}</IconTile>
        <Typography sx={{ mt: 2, fontFamily: FONT.display, fontWeight: 800, fontSize: { xs: 24, md: 32 }, lineHeight: 1.1, letterSpacing: '-0.02em', color: BRAND.navy, fontVariantNumeric: 'tabular-nums', overflowWrap: 'anywhere' }}>
            {value}
        </Typography>
        <Typography sx={{ mt: 0.5, fontSize: 14, fontWeight: 600, color: BRAND.muted }}>
            {label}
        </Typography>
    </Box>
);

function TradeStatistics({ requests, viewToday, viewsThisWeek, ratingRank }) {
    return (
        <Box>
            <Typography component="h2" sx={{ ...cardTitleSx, mb: { xs: 2, md: 2.5 } }}>
                Key metrics
            </Typography>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
                    gap: { xs: 1.5, md: 2.5 }
                }}
            >
                <StatCard icon={<AssignmentOutlinedIcon />} label="Requests" value={requests} tone="navy" />
                <StatCard icon={<TodayOutlinedIcon />} label="Views today" value={viewToday} tone="green" />
                <StatCard icon={<VisibilityOutlinedIcon />} label="Views this week" value={viewsThisWeek} tone="green" />
                <StatCard icon={<EmojiEventsOutlinedIcon />} label="Rating rank" value={ratingRank} tone="lavender" />
            </Box>
        </Box>
    );
}

export default TradeStatistics;
