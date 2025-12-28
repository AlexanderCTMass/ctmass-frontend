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
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';

const statusColorMap = {
    active: 'success',
    hidden: 'default',
    review: 'warning'
};

function TradeCard({ trade }) {
    const status = trade.status || 'active';
    const statusColor = statusColorMap[status] || 'default';

    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderColor: 'divider'
            }}
        >
            <CardContent sx={{ pt: 3.5, px: 3.5, pb: 2.5 }}>
                <Stack spacing={3}>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                    >
                        <Stack spacing={1.5} alignItems="center">
                            <Avatar
                                src={trade.avatarUrl || undefined}
                                variant="circular"
                                sx={{ width: 80, height: 80 }}
                            >
                                {trade.title ? trade.title.charAt(0) : 'T'}
                            </Avatar>
                        </Stack>
                        <Chip
                            label={status === 'review' ? 'On review' : status === 'hidden' ? 'Hidden' : 'Active'}
                            color={statusColor}
                            size="small"
                            sx={{
                                fontWeight: 600,
                                px: 1.5,
                                borderRadius: '12px'
                            }}
                        />
                    </Stack>

                    <Stack spacing={0.75}>
                        <Typography variant="h6" fontWeight={700}>
                            {trade.title || 'Untitled trade'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {trade.subtitle || 'Specialty'}
                        </Typography>
                        {trade.description && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 1 }}
                            >
                                {trade.description}
                            </Typography>
                        )}
                    </Stack>

                    <Divider />

                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <StatItem
                                icon={<StarBorderOutlinedIcon fontSize="small" />}
                                label="Rating"
                                value={Number(trade.rating || 0).toFixed(1)}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <StatItem
                                icon={<VisibilityOutlinedIcon fontSize="small" />}
                                label="Views"
                                value={trade.views ?? 0}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <StatItem
                                icon={<RateReviewOutlinedIcon fontSize="small" />}
                                label="Reviews"
                                value={trade.reviews ?? 0}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <StatItem
                                icon={<TaskAltOutlinedIcon fontSize="small" />}
                                label="Completed Projects"
                                value={trade.completedProjects ?? 0}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <StatItem
                                icon={<PendingActionsOutlinedIcon fontSize="small" />}
                                label="Projects in Progress"
                                value={trade.projectsInProgress ?? 0}
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
                    borderColor: 'divider'
                }}
            >
                <Button variant="contained" size="small">
                    View
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

function StatItem({ icon, label, value }) {
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
                {value}
            </Typography>
        </Stack>
    );
}

export default TradeCard;