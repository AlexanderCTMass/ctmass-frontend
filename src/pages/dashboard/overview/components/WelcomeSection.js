import { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
    Avatar,
    Box,
    Button,
    Divider,
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
            <Stack spacing={3}>
                <Typography variant="h4" fontWeight={700}>
                    Welcome, {userName}!
                </Typography>

                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    alignItems={{ xs: 'stretch', md: 'center' }}
                    spacing={0}
                >
                    {/* Секция 1: Аватарка + средний рейтинг */}
                    <Stack
                        direction="row"
                        spacing={2.5}
                        alignItems="center"
                        sx={{
                            pr: { md: 3 },
                            pb: { xs: 2.5, md: 0 },
                            flex: '0 0 auto'
                        }}
                    >
                        <Avatar
                            src={profile?.profile?.avatar}
                            alt={userName}
                            sx={{
                                width: { xs: 80, md: 96 },
                                height: { xs: 80, md: 96 },
                                flexShrink: 0,
                                border: '3px solid',
                                borderColor: 'divider'
                            }}
                        />
                        <Stack spacing={0.25} alignItems="flex-start">
                            <Typography variant="h3" fontWeight={700} lineHeight={1}>
                                {averageRating.toFixed(1)}
                            </Typography>
                            <Rating
                                value={averageRating}
                                precision={0.5}
                                readOnly
                                size="small"
                                sx={{ color: '#FFB400' }}
                            />
                            <Typography variant="caption" color="text.secondary">
                                Based on {reviews?.length || 0}+ reviews
                            </Typography>
                        </Stack>
                    </Stack>

                    {/* Разделитель */}
                    <Divider
                        orientation="vertical"
                        flexItem
                        sx={{ display: { xs: 'none', md: 'block' } }}
                    />
                    <Divider sx={{ display: { xs: 'block', md: 'none' } }} />

                    {/* Секция 2: Рейтинги по сервисам или сообщение */}
                    <Box
                        sx={{
                            flex: 1,
                            minWidth: 0,
                            px: { md: 3 },
                            py: { xs: 2.5, md: 0 }
                        }}
                    >
                        {displayCategories.length > 0 ? (
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
                        ) : (
                            <Stack justifyContent="center" sx={{ height: '100%', minHeight: 48 }}>
                                <Typography variant="body2" color="text.secondary">
                                    No services yet. Add your services to start receiving reviews!
                                </Typography>
                            </Stack>
                        )}
                    </Box>

                    {/* Разделитель */}
                    <Divider
                        orientation="vertical"
                        flexItem
                        sx={{ display: { xs: 'none', md: 'block' } }}
                    />
                    <Divider sx={{ display: { xs: 'block', md: 'none' } }} />

                    {/* Секция 3: Donation badge */}
                    <Box
                        sx={{
                            flex: '0 0 auto',
                            pl: { md: 3 },
                            pt: { xs: 2.5, md: 0 },
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <DonationBadge donationAmount={profile?.profile?.totalDonations} />
                    </Box>
                </Stack>

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
                    {actionButtons.map((btn) => {
                        const Icon = btn.icon;
                        const isClickable = btn.action !== null;
                        return (
                            <Button
                                key={btn.label}
                                variant="text"
                                disabled={!isClickable}
                                onClick={isClickable ? () => handleButtonClick(btn.action) : undefined}
                                startIcon={<Icon />}
                                sx={{
                                    textTransform: 'none',
                                    color: isClickable ? 'primary.main' : 'text.secondary',
                                    '&.Mui-disabled': {
                                        color: 'text.secondary'
                                    },
                                    '&:hover': isClickable ? {
                                        backgroundColor: 'action.hover'
                                    } : {}
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
    dictionaryServices: PropTypes.object,
    isHomeowner: PropTypes.bool
};

export default WelcomeSection;
