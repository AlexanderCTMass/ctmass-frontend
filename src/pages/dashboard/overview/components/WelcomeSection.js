import { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
    Avatar,
    Box,
    Button,
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
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import DonationBadge from 'src/components/stripe/donation-badge';
import { useAuth } from 'src/hooks/use-auth';
import { paths } from 'src/paths';
import { profileService } from "src/service/profile-service";

const RatingBar = ({ label, value, hasRating }) => (
    <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Typography variant="body2" color="text.secondary" noWrap sx={{ mr: 1 }}>
                {label}
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center" flexShrink={0}>
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

const CONTRACTOR_ACTION_BUTTONS = [
    { label: 'Edit My Profile', icon: EditIcon, action: 'editProfile' },
    { label: 'View Public Page', icon: VisibilityIcon, action: 'viewPublicPage' },
    { label: 'View My Trades', icon: BuildIcon, action: 'editTrades' },
    { label: 'View My Certificates', icon: CardMembershipIcon, action: 'viewCertificates' },
    { label: 'View My Calendar', icon: CalendarMonthIcon, action: 'viewCalendar' },
    { label: 'Add New Post', icon: PostAddIcon, action: "addNewPost" },
    { label: 'Add New Listing', icon: AddBusinessIcon, action: "addNewListing" }
];

const HOMEOWNER_ACTION_BUTTONS = [
    { label: 'Edit My Profile', icon: EditIcon, action: 'editProfile' },
    { label: 'View Public Page', icon: VisibilityIcon, action: 'viewPublicPage' },
    { label: 'View My Calendar', icon: CalendarMonthIcon, action: 'viewCalendar' },
    { label: 'Add New Post', icon: PostAddIcon, action: "addNewPost" },
    { label: 'Add New Listing', icon: AddBusinessIcon, action: "addNewListing" }
];

const WelcomeSection = ({ profile, reviews, services, dictionaryServices, isHomeowner }) => {
    const navigate = useNavigate();
    const { user } = useAuth();

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

    const userName = profileService.getUserName(profile?.profile);

    const actionButtons = isHomeowner ? HOMEOWNER_ACTION_BUTTONS : CONTRACTOR_ACTION_BUTTONS;

    const handleButtonClick = useCallback((action) => {
        switch (action) {
            case 'addNewPost':
                navigate(paths.dashboard.blog.postCreate);
                break;
            case 'editProfile':
                navigate(paths.dashboard.profile.information);
                break;
            case 'viewPublicPage':
                if (user) {
                    const url = paths.specialist.publicPage.replace(':profileId', user.id);
                    window.open(url, '_blank', 'noopener,noreferrer');
                }
                break;
            case 'editTrades':
                navigate(paths.dashboard.trades.index);
                break;
            case 'viewCertificates':
                navigate(paths.dashboard.certificates.index);
                break;
            case 'viewCalendar':
                navigate(paths.cabinet.calendar);
                break;
            case 'addNewListing':
                navigate(paths.dashboard.listings.create)
                break;
            default:
                break;
        }
    }, [navigate, user]);

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
            <Stack spacing={2}>
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    alignItems={{ xs: 'stretch', md: 'center' }}
                    gap={{ xs: 2, md: 3 }}
                >
                    <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar
                                src={profile?.profile?.avatar}
                                alt={userName}
                                sx={{
                                    width: 56,
                                    height: 56,
                                    flexShrink: 0,
                                    border: '2px solid',
                                    borderColor: 'divider'
                                }}
                            />
                            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                                <Typography variant="h5" fontWeight={700} noWrap>
                                    Welcome, {userName}!
                                </Typography>
                                <Stack direction="row" alignItems="center" gap={0.75} flexWrap="wrap">
                                    <Typography variant="body1" fontWeight={700} lineHeight={1.2}>
                                        {averageRating.toFixed(1)}
                                    </Typography>
                                    <Rating
                                        value={averageRating}
                                        precision={0.5}
                                        readOnly
                                        size="small"
                                        sx={{ color: '#FFB400' }}
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                        {reviews?.length || 0}+ reviews
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Stack>

                        {displayCategories.length > 0 ? (
                            <Box
                                sx={{
                                    pt: 2,
                                    borderTop: '1px solid',
                                    borderColor: 'divider',
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                                    columnGap: 3,
                                    rowGap: 1.5
                                }}
                            >
                                {displayCategories.map((cat) => (
                                    <RatingBar
                                        key={cat.label}
                                        label={cat.label}
                                        value={cat.value}
                                        hasRating={cat.hasRating}
                                    />
                                ))}
                            </Box>
                        ) : !isHomeowner && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}
                            >
                                No services yet. Add your services to start receiving reviews!
                            </Typography>
                        )}
                    </Stack>

                    <Box
                        sx={{
                            flexShrink: 0,
                            width: { xs: '100%', md: 260 },
                            alignSelf: { md: 'stretch' },
                            borderLeft: { md: '1px solid' },
                            borderColor: { md: 'divider' },
                            pl: { md: 3 },
                            display: 'flex',
                            alignItems: 'center',
                            '& .MuiCard-root': {
                                width: '100%',
                                maxWidth: '100%',
                                mx: 0,
                                boxShadow: 'none',
                                border: '1px solid',
                                borderColor: 'divider'
                            }
                        }}
                    >
                        <DonationBadge donationAmount={profile?.profile?.totalDonations} />
                    </Box>
                </Stack>

                <Box
                    sx={{
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        pt: 2,
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(3, 1fr)',
                            lg: 'repeat(4, 1fr)'
                        },
                        gap: 1
                    }}
                >
                    {actionButtons.map((btn) => {
                        const Icon = btn.icon;
                        const isClickable = btn.action !== null;
                        return (
                            <Button
                                key={btn.label}
                                variant="outlined"
                                disabled={!isClickable}
                                onClick={isClickable ? () => handleButtonClick(btn.action) : undefined}
                                startIcon={<Icon fontSize="small" />}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    justifyContent: 'flex-start',
                                    py: 0.875,
                                    px: 1.5,
                                    borderColor: 'divider',
                                    color: isClickable ? 'primary.main' : 'text.secondary',
                                    '&:hover': isClickable ? {
                                        borderColor: 'primary.main',
                                        bgcolor: 'action.hover'
                                    } : {},
                                    '&.Mui-disabled': {
                                        color: 'text.secondary',
                                        borderColor: 'divider'
                                    }
                                }}
                            >
                                {btn.label}
                            </Button>
                        );
                    })}
                </Box>
            </Stack>
        </Paper>
    );
};

WelcomeSection.propTypes = {
    profile: PropTypes.object,
    reviews: PropTypes.array,
    services: PropTypes.array,
    dictionaryServices: PropTypes.object,
    isHomeowner: PropTypes.bool
};

export default WelcomeSection;
