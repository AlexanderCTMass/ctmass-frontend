import {
    Box,
    Card,
    CardContent,
    Grid,
    Stack,
    Typography
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';

const StatCard = ({ icon, label, value, color = 'primary' }) => (
    <Card
        variant="outlined"
        sx={{
            height: '100%',
            borderRadius: 3,
            transition: 'all 0.2s',
            '&:hover': {
                boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette[color].main, 0.15)}`,
                borderColor: `${color}.main`
            }
        }}
    >
        <CardContent>
            <Stack spacing={2}>
                <Box
                    sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: (theme) => alpha(theme.palette[color].main, 0.1),
                        color: `${color}.main`
                    }}
                >
                    {icon}
                </Box>
                <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        {label}
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                        {value}
                    </Typography>
                </Box>
            </Stack>
        </CardContent>
    </Card>
);

function TradeStatistics({ requests, viewToday, viewsThisWeek, ratingRank }) {
    return (
        <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                Key Metrics
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        icon={<AssignmentOutlinedIcon fontSize="large" />}
                        label="Requests"
                        value={requests}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        icon={<TodayOutlinedIcon fontSize="large" />}
                        label="View today"
                        value={viewToday}
                        color="info"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        icon={<VisibilityOutlinedIcon fontSize="large" />}
                        label="Total views on week"
                        value={viewsThisWeek}
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        icon={<EmojiEventsOutlinedIcon fontSize="large" />}
                        label="Rating rank"
                        value={ratingRank}
                        color="warning"
                    />
                </Grid>
            </Grid>
        </Box>
    );
}

export default TradeStatistics;
