import { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
    Avatar,
    Box,
    ButtonBase,
    LinearProgress,
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
import { alpha } from '@mui/material/styles';
import { BRAND, FONT, RADIUS, SHADOW } from 'src/theme/ctmass-tokens';

const RatingBar = ({ label, value, hasRating }) => (
    <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} mb={0.75}>
            <Typography noWrap title={label} sx={{ fontSize: 14, fontWeight: 600, color: alpha('#FFFFFF', 0.8) }}>
                {label}
            </Typography>
            <Typography sx={{ flexShrink: 0, fontSize: 14, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: hasRating ? '#FFFFFF' : alpha('#FFFFFF', 0.5) }}>
                {hasRating ? value.toFixed(1) : 'No ratings'}
            </Typography>
        </Stack>
        <LinearProgress
            variant="determinate"
            value={hasRating ? (value / 5) * 100 : 0}
            sx={{
                height: 6,
                borderRadius: 999,
                backgroundColor: alpha('#FFFFFF', 0.14),
                '& .MuiLinearProgress-bar': {
                    borderRadius: 999,
                    backgroundColor: BRAND.green
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
    { label: 'Edit profile', icon: EditIcon, action: 'editProfile' },
    { label: 'Public page', icon: VisibilityIcon, action: 'viewPublicPage' },
    { label: 'My trades', icon: BuildIcon, action: 'editTrades' },
    { label: 'Certificates', icon: CardMembershipIcon, action: 'viewCertificates' },
    { label: 'Calendar', icon: CalendarMonthIcon, action: 'viewCalendar' },
    { label: 'New post', icon: PostAddIcon, action: "addNewPost" },
    { label: 'New listing', icon: AddBusinessIcon, action: "addNewListing" }
];

const HOMEOWNER_ACTION_BUTTONS = [
    { label: 'Edit profile', icon: EditIcon, action: 'editProfile' },
    { label: 'Public page', icon: VisibilityIcon, action: 'viewPublicPage' },
    { label: 'Calendar', icon: CalendarMonthIcon, action: 'viewCalendar' },
    { label: 'New post', icon: PostAddIcon, action: "addNewPost" },
    { label: 'New listing', icon: AddBusinessIcon, action: "addNewListing" }
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

    const firstName = (userName || '').includes('@') ? '' : (userName || '').split(' ')[0];
    const reviewsCount = reviews?.length || 0;

    return (
        <Box>
            <Box
                sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: { xs: RADIUS.card, md: RADIUS.panel },
                    color: '#FFFFFF',
                    boxShadow: SHADOW.lg,
                    p: { xs: 2.5, sm: 4, md: 5 },
                    background: `radial-gradient(60% 90% at 100% 100%, ${alpha(BRAND.green, 0.3)} 0%, ${alpha(BRAND.green, 0)} 60%), linear-gradient(150deg, ${BRAND.navy} 0%, ${BRAND.navyDeep} 100%)`,
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        backgroundImage: `linear-gradient(${alpha('#FFFFFF', 0.06)} 1px, transparent 1px), linear-gradient(90deg, ${alpha('#FFFFFF', 0.06)} 1px, transparent 1px)`,
                        backgroundSize: '48px 48px',
                        WebkitMaskImage: 'linear-gradient(90deg, transparent 10%, #000 80%)',
                        maskImage: 'linear-gradient(90deg, transparent 10%, #000 80%)'
                    }
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        display: 'grid',
                        gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) 300px' },
                        alignItems: 'center',
                        gap: { xs: 3, lg: 5 }
                    }}
                >
                    <Box sx={{ minWidth: 0 }}>
                        <Stack direction="row" spacing={{ xs: 2, md: 2.5 }} alignItems="center">
                            <Avatar
                                src={profile?.profile?.avatar}
                                alt={userName}
                                sx={{
                                    width: { xs: 64, md: 84 },
                                    height: { xs: 64, md: 84 },
                                    flexShrink: 0,
                                    borderRadius: { xs: '20px', md: '26px' },
                                    bgcolor: alpha('#FFFFFF', 0.14),
                                    border: `2px solid ${alpha('#FFFFFF', 0.3)}`
                                }}
                            />
                            <Box sx={{ minWidth: 0 }}>
                                <Typography
                                    component="h1"
                                    sx={{
                                        fontFamily: FONT.display,
                                        fontWeight: 800,
                                        fontSize: { xs: 26, sm: 32, md: 40 },
                                        letterSpacing: '-0.025em',
                                        lineHeight: 1.1,
                                        color: '#FFFFFF',
                                        overflowWrap: 'anywhere'
                                    }}
                                >
                                    {firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
                                </Typography>
                                <Stack direction="row" alignItems="center" flexWrap="wrap" sx={{ mt: 1, columnGap: 1, rowGap: 0.5 }}>
                                    {reviewsCount > 0 ? (
                                        <>
                                            <Typography sx={{ fontWeight: 800, fontSize: 16, fontVariantNumeric: 'tabular-nums' }}>
                                                {averageRating.toFixed(1)}
                                            </Typography>
                                            <Rating value={averageRating} precision={0.5} readOnly size="small" sx={{ color: '#FFB400', '& .MuiRating-iconEmpty': { color: alpha('#FFFFFF', 0.35) } }} />
                                            <Typography sx={{ fontSize: 14, color: alpha('#FFFFFF', 0.72) }}>
                                                {reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'}
                                            </Typography>
                                        </>
                                    ) : (
                                        <Typography sx={{ fontSize: { xs: 14, md: 16 }, lineHeight: 1.5, color: alpha('#FFFFFF', 0.78), overflowWrap: 'anywhere' }}>
                                            {isHomeowner
                                                ? 'Post a project or pick up where you left off.'
                                                : 'No reviews yet. Finish a job and ask your client for one.'}
                                        </Typography>
                                    )}
                                </Stack>
                            </Box>
                        </Stack>

                        {displayCategories.length > 0 && (
                            <Box
                                sx={{
                                    mt: 3,
                                    pt: 3,
                                    borderTop: `1px solid ${alpha('#FFFFFF', 0.14)}`,
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                                    columnGap: 4,
                                    rowGap: 2
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
                        )}
                    </Box>

                    <Box
                        sx={{
                            minWidth: 0,
                            '& .MuiCard-root': {
                                width: '100%',
                                maxWidth: '100%',
                                mx: 0,
                                borderRadius: RADIUS.card,
                                border: 0,
                                boxShadow: `0 20px 40px ${alpha(BRAND.navyDeep, 0.4)}`
                            }
                        }}
                    >
                        <DonationBadge donationAmount={profile?.profile?.totalDonations} />
                    </Box>
                </Box>
            </Box>

            <Box
                component="nav"
                aria-label="Quick actions"
                sx={{
                    mt: { xs: 2, md: 2.5 },
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: 'repeat(2, minmax(0, 1fr))',
                        sm: 'repeat(3, minmax(0, 1fr))',
                        lg: `repeat(${actionButtons.length}, minmax(0, 1fr))`
                    },
                    gap: { xs: 1.25, md: 1.5 }
                }}
            >
                {actionButtons.map((action) => {
                    const Icon = action.icon;

                    return (
                        <ButtonBase
                            key={action.label}
                            onClick={() => handleButtonClick(action.action)}
                            sx={{
                                flexDirection: { xs: 'row', lg: 'column' },
                                alignItems: { xs: 'center', lg: 'flex-start' },
                                justifyContent: 'flex-start',
                                gap: 1.25,
                                p: { xs: 1.5, lg: 2 },
                                minHeight: { xs: 60, lg: 104 },
                                textAlign: 'left',
                                borderRadius: RADIUS.inner,
                                bgcolor: '#FFFFFF',
                                border: `1px solid ${alpha(BRAND.navy, 0.08)}`,
                                boxShadow: SHADOW.sm,
                                transition: 'border-color .2s ease, box-shadow .2s ease, background-color .2s ease',
                                '& .tile': { transition: 'background-color .2s ease, color .2s ease' },
                                '&:hover': { borderColor: BRAND.green, boxShadow: SHADOW.md },
                                '&:hover .tile': { bgcolor: BRAND.green, color: '#FFFFFF' },
                                '&:active': { transform: 'scale(0.98)' },
                                '&:focus-visible': { outline: `2px solid ${BRAND.green}`, outlineOffset: 2 }
                            }}
                        >
                            <Box
                                className="tile"
                                sx={{
                                    width: 36,
                                    height: 36,
                                    flexShrink: 0,
                                    borderRadius: '11px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: alpha(BRAND.green, 0.12),
                                    color: BRAND.green
                                }}
                            >
                                <Icon sx={{ fontSize: 19 }} />
                            </Box>
                            <Box component="span" sx={{ fontSize: { xs: 13, md: 14 }, fontWeight: 700, lineHeight: 1.3, color: BRAND.navy }}>
                                {action.label}
                            </Box>
                        </ButtonBase>
                    );
                })}
            </Box>
        </Box>
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
