import { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
    Avatar,
    Box,
    Button,
    Grid,
    LinearProgress,
    Paper,
    Rating,
    Stack,
    Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BuildIcon from '@mui/icons-material/Build';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PostAddIcon from '@mui/icons-material/PostAdd';
import DonationBadge from 'src/components/stripe/donation-badge';

const RatingBar = ({ label, value, hasRating }) => (
    <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Typography variant="body2" color="text.secondary">
                {label}
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography variant="body2" fontWeight={600} color={hasRating ? 'text.primary' : 'text.disabled'}>
                    {hasRating ? value.toFixed(1) : 'N/A'}
                </Typography>
                <Rating
                    value={hasRating ? value : 0}
                    precision={0.5}
                    size="small"
                    readOnly
                    sx={{ color: hasRating ? '#FFB400' : 'action.disabled' }}
                />
            </Stack>
        </Stack>
        <LinearProgress
            variant="determinate"
            value={hasRating ? (value / 5) * 100 : 0}
            sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    backgroundColor: hasRating ? '#3366FF' : 'grey.400'
                }
            }}
        />
    </Box>
);

RatingBar.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    hasRating: PropTypes.bool.isRequired
};

const ACTION_BUTTONS = [
    { label: 'Edit My Profile', icon: EditIcon },
    { label: 'View Public Page', icon: VisibilityIcon },
    { label: 'Edit My Trades', icon: BuildIcon },
    { label: 'View My Certificates', icon: CardMembershipIcon },
    { label: 'View My Calendar', icon: CalendarMonthIcon },
    { label: 'Add New Post', icon: PostAddIcon }
];

const WelcomeSection = ({ profile, reviews, services, dictionaryServices }) => {
    const averageRating = useMemo(() => {
        if (!reviews || !reviews.length) return 0;
        const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
        return sum / reviews.length;
    }, [reviews]);

    const serviceRatings = useMemo(() => {
        if (!reviews || !reviews.length || !services || !services.length) {
            return {};
        }

        const ratings = {};

        reviews.forEach((review) => {
            if (review.serviceId) {
                if (!ratings[review.serviceId]) {
                    ratings[review.serviceId] = { sum: 0, count: 0 };
                }
                ratings[review.serviceId].sum += review.rating || 0;
                ratings[review.serviceId].count += 1;
            }
        });

        return ratings;
    }, [reviews, services]);

    const displayCategories = useMemo(() => {
        if (!services || services.length === 0) {
            return [];
        }

        const servicesToDisplay = services.slice(0, 4);

        return servicesToDisplay.map((service) => {
            const serviceId = service.id || service.serviceId || service.service;
            const label = service.label || service.name ||
                dictionaryServices?.byId?.[serviceId]?.label ||
                serviceId;

            const rating = serviceRatings[serviceId];
            const hasRating = rating && rating.count > 0;
            const value = hasRating ? rating.sum / rating.count : averageRating || 0;

            return {
                label,
                value,
                hasRating
            };
        });
    }, [services, serviceRatings, averageRating, dictionaryServices]);

    const userName = profile?.profile?.businessName
        || profile?.profile?.name
        || profile?.profile?.displayName
        || '';

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                p: { xs: 3, md: 4 }
            }}
        >
            <Stack spacing={3}>
                <Typography variant="h4" fontWeight={700}>
                    Welcome, {userName}!
                </Typography>

                <Grid container spacing={3} alignItems="flex-start">
                    <Grid item xs={12} sm={3} md={2}>
                        <Avatar
                            src={profile?.profile?.avatar}
                            alt={userName}
                            sx={{
                                width: { xs: 100, md: 120 },
                                height: { xs: 100, md: 120 },
                                border: '3px solid',
                                borderColor: 'divider'
                            }}
                        />
                    </Grid>

                    {displayCategories.length > 0 ? (
                        <>
                            <Grid item xs={12} sm={4} md={3}>
                                <Stack spacing={0.5} alignItems="center">
                                    <Typography variant="h3" fontWeight={700}>
                                        {averageRating.toFixed(1)}
                                    </Typography>
                                    <Rating
                                        value={averageRating}
                                        precision={0.5}
                                        readOnly
                                        sx={{ color: '#FFB400' }}
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                        Based on {reviews?.length || 0}+ reviews
                                    </Typography>
                                </Stack>
                            </Grid>

                            <Grid item xs={12} sm={5} md={4}>
                                <Stack spacing={1.5}>
                                    {displayCategories.map((cat) => (
                                        <RatingBar
                                            key={cat.label}
                                            label={cat.label}
                                            value={cat.value}
                                            hasRating={cat.hasRating}
                                        />
                                    ))}
                                </Stack>
                            </Grid>

                            <Grid item xs={12} sm={12} md={3}>
                                <DonationBadge donationAmount={profile?.profile?.totalDonations} />
                            </Grid>
                        </>
                    ) : (
                        <>
                            <Grid item xs={12} sm={9} md={7}>
                                <Stack spacing={2} justifyContent="center" sx={{ height: '100%' }}>
                                    <Typography variant="body1" color="text.secondary">
                                        No services yet. Add your services to start receiving reviews!
                                    </Typography>
                                </Stack>
                            </Grid>

                            <Grid item xs={12} sm={12} md={3} pr={2}>
                                <DonationBadge donationAmount={profile?.profile?.totalDonations} />
                            </Grid>
                        </>
                    )}
                </Grid>

                <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                    sx={{
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        pt: 2
                    }}
                >
                    {ACTION_BUTTONS.map((btn) => {
                        const Icon = btn.icon;
                        return (
                            <Button
                                key={btn.label}
                                variant="text"
                                disabled
                                startIcon={<Icon />}
                                sx={{
                                    textTransform: 'none',
                                    color: 'text.secondary',
                                    '&.Mui-disabled': {
                                        color: 'text.secondary'
                                    }
                                }}
                            >
                                {btn.label}
                            </Button>
                        );
                    })}
                </Stack>
            </Stack>
        </Paper>
    );
};

WelcomeSection.propTypes = {
    profile: PropTypes.object,
    reviews: PropTypes.array,
    services: PropTypes.array,
    dictionaryServices: PropTypes.object
};

export default WelcomeSection;
