import { useMemo, useState, useEffect } from 'react';
import {
    Avatar,
    Box,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Rating,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { getSiteDuration } from 'src/utils/date-locale';
import { profileApi } from 'src/api/profile'

const CARD_SIZE_OPTIONS = [
    { id: 'big', label: 'Big card' },
    { id: 'medium', label: 'Middle card' },
    { id: 'small', label: 'Small card' }
];

const FALLBACK_IMAGE = '/assets/avatars/defaultUser.jpg';

const STATUS_LABELS = {
    available: 'Available',
    busy: 'Busy',
    hidden: 'Hidden',
    on_review: 'On review',
    fix_it: 'Fix it'
};

const parseDateLike = (value) => {
    if (!value) {
        return null;
    }

    if (typeof value.toDate === 'function') {
        try {
            return value.toDate();
        } catch {
            return null;
        }
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeStatusKey = (status, busyUntil) => {
    const normalized = (status ?? '').toString().trim().toLowerCase();

    if (busyUntil) {
        return 'busy';
    }

    if (normalized.includes('busy')) {
        return 'busy';
    }

    if (normalized.includes('hidden')) {
        return 'hidden';
    }

    if (normalized.includes('review')) {
        return 'on_review';
    }

    if (normalized.includes('fix')) {
        return 'fix_it';
    }

    return 'available';
};

const formatPrice = (price, priceType) => {
    if (!price) {
        return '$55/hr';
    }

    const trimmed = price.toString().trim();
    const withCurrency = trimmed.startsWith('$') ? trimmed : `$${trimmed}`;

    if (withCurrency.includes('/') || withCurrency.toLowerCase().includes('per')) {
        return withCurrency;
    }

    switch (priceType) {
        case 'project':
            return `${withCurrency} per project`;
        case 'consultation':
            return `${withCurrency} per consultation`;
        default:
            return `${withCurrency}/hr`;
    }
};

const formatAddress = (address, location) => {
    const source = address || location?.place_name || '';
    if (!source) {
        return '';
    }

    const parts = source.split(',').map((part) => part.trim());
    if (parts.length >= 2) {
        return `${parts[0]}, ${parts[1]}`;
    }

    return source;
};

const buildStatusStyles = (theme, statusKey) => {
    switch (statusKey) {
        case 'busy':
            return {
                bgcolor: theme.palette.error.main,
                color: theme.palette.common.white
            };
        case 'hidden':
            return {
                bgcolor: alpha(theme.palette.grey[500], 0.25),
                color: theme.palette.text.secondary
            };
        case 'on_review':
            return {
                bgcolor: alpha(theme.palette.warning.main, 0.25),
                color: theme.palette.warning.dark
            };
        case 'fix_it':
            return {
                bgcolor: theme.palette.warning.main,
                color: theme.palette.common.white
            };
        case 'available':
        default:
            return {
                bgcolor: theme.palette.success.main,
                color: theme.palette.common.white
            };
    }
};

const extractPreviewData = (values, registrationDateOverride) => {
    const image = values.avatarUrl || FALLBACK_IMAGE;
    const title = values.tradeTitle || values.businessName || 'Your trade title';
    const specialtyLabel = values.primarySpecialtyLabel || 'Specialist';
    const locationLabel = formatAddress(values.address, values.addressLocation);
    const priceLabel = formatPrice(values.price, values.priceType);
    const ratingValue = Math.min(Math.max(Number(values.rating) || 0, 0), 5);
    const reviewsCount = Math.max(Number(values.reviewCount ?? values.reviews ?? 0), 0);
    const ratingDisplay = ratingValue.toFixed(1);
    const reviewSummary = `${reviewsCount} review${reviewsCount === 1 ? '' : 's'}`;
    const description = values.shortDescription || values.about || 'Describe your experience to inspire trust.';
    const avatarInitial = title.charAt(0).toUpperCase();
    const message = values.previewTagline || description;
    const author = values.businessName || title;
    const registrationDate = registrationDateOverride ?? parseDateLike(values.registrationAt ?? values.createdAt);
    const registrationDuration = registrationDate ? getSiteDuration(registrationDate) : null;
    const statusKey = normalizeStatusKey(values.status, values.busyUntil);
    const statusLabel = STATUS_LABELS[statusKey] || STATUS_LABELS.available;

    return {
        image,
        title,
        specialtyLabel,
        locationLabel,
        priceLabel,
        ratingValue,
        ratingDisplay,
        reviewsCount,
        reviewSummary,
        description,
        avatarInitial,
        message,
        author,
        registrationDuration,
        statusKey,
        statusLabel
    };
};

const BigPreviewCard = ({ data, theme }) => {
    const statusStyles = buildStatusStyles(theme, data.statusKey);

    return (
        <Card
            elevation={2}
            variant="outlined"
            sx={{
                borderRadius: 2,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxShadow: 'none'
            }}
        >
            <Box sx={{ position: 'relative' }}>
                <CardMedia
                    component="img"
                    image={data.image}
                    height={200}
                    alt={data.title}
                    sx={{ objectFit: 'cover' }}
                />
                <Chip
                    label={data.priceLabel}
                    color="warning"
                    size="small"
                    sx={{
                        position: 'absolute',
                        bottom: 16,
                        right: 16,
                        fontWeight: 700
                    }}
                />
            </Box>

            <CardContent sx={{ flexGrow: 1, pb: '52px !important' }}>
                {data.registrationDuration && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.2 }}>
                        {data.registrationDuration}
                    </Typography>
                )}

                <Box
                    sx={{
                        mt: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {data.title}
                    </Typography>

                    <Chip
                        size="small"
                        label={data.statusLabel}
                        sx={{
                            bgcolor: statusStyles.bgcolor,
                            color: statusStyles.color,
                            fontSize: 12,
                            textTransform: 'capitalize',
                            borderRadius: '12px'
                        }}
                    />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {data.specialtyLabel}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Rating size="small" value={data.ratingValue} readOnly precision={0.5} />
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            bgcolor: theme.palette.grey[200],
                            px: 1,
                            py: 0.25,
                            borderRadius: 10,
                            gap: 1
                        }}
                    >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {data.ratingDisplay}
                        </Typography>
                        <ChatBubbleOutlineIcon sx={{ fontSize: 16, color: '#828CA8' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {data.reviewsCount}
                        </Typography>
                    </Box>
                </Box>

                {data.locationLabel && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {data.locationLabel}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

const MediumPreviewCard = ({ data, theme }) => {
    const statusStyles = buildStatusStyles(theme, data.statusKey);

    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 3,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                overflow: 'hidden',
                boxShadow: 'none',
                backgroundColor: alpha(theme.palette.primary.main, 0.015)
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    width: { xs: '100%', sm: 220, md: 240 },
                    flexShrink: 0
                }}
            >
                <CardMedia
                    component="img"
                    image={data.image}
                    alt={data.title}
                    sx={{
                        width: '100%',
                        height: { xs: 200, sm: '100%' },
                        objectFit: 'cover'
                    }}
                />
                <Chip
                    label={data.priceLabel}
                    color="warning"
                    size="small"
                    sx={{
                        position: 'absolute',
                        bottom: 16,
                        right: 16,
                        fontWeight: 700
                    }}
                />
            </Box>

            <CardContent
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    p: { xs: 3, sm: 4 }
                }}
            >
                {data.registrationDuration && (
                    <Typography variant="caption" color="text.secondary">
                        {data.registrationDuration}
                    </Typography>
                )}

                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {data.title}
                    </Typography>
                    <Chip
                        size="small"
                        label={data.statusLabel}
                        sx={{
                            bgcolor: statusStyles.bgcolor,
                            color: statusStyles.color,
                            fontSize: 12,
                            textTransform: 'capitalize',
                            borderRadius: '12px'
                        }}
                    />
                </Stack>

                <Typography variant="body2" color="text.secondary">
                    {data.specialtyLabel}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating size="small" value={data.ratingValue} readOnly precision={0.5} />
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            bgcolor: theme.palette.grey[200],
                            px: 1,
                            py: 0.25,
                            borderRadius: 10,
                            gap: 1
                        }}
                    >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {data.ratingDisplay}
                        </Typography>
                        <ChatBubbleOutlineIcon sx={{ fontSize: 16, color: '#828CA8' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {data.reviewsCount}
                        </Typography>
                    </Box>
                </Box>

                {data.locationLabel && (
                    <Typography variant="body2" color="text.secondary">
                        {data.locationLabel}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

const SmallPreviewCard = ({ data }) => (
    <Card
        variant="outlined"
        sx={{
            borderRadius: 4,
            boxShadow: 'none'
        }}
    >
        <CardContent
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5
            }}
        >
            <Avatar
                src={data.image}
                alt={data.title}
                sx={{ width: 64, height: 64, border: (theme) => `3px solid ${alpha(theme.palette.primary.main, 0.2)}` }}
            >
                {data.avatarInitial}
            </Avatar>

            <Stack spacing={0.5} alignItems="center">
                <Typography variant="subtitle1" fontWeight={700} align="center">
                    {data.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                    {data.specialtyLabel}
                </Typography>
            </Stack>
        </CardContent>
    </Card>
);

function TradePreviewGallery({ values, ownerId }) {
    const [selectedSize, setSelectedSize] = useState('big');
    const [profileRegistrationDate, setProfileRegistrationDate] = useState(null);
    const theme = useTheme();
    const lgUp = useMediaQuery(theme.breakpoints.up('lg'));

    useEffect(() => {
        let active = true;

        if (!ownerId) {
            setProfileRegistrationDate(null);
            return undefined;
        }

        (async () => {
            try {
                const profile = await profileApi.getProfileById(ownerId);
                if (!active) {
                    return;
                }

                const registrationTimestamp = profile?.registrationAt ?? profile?.registeredAt ?? null;
                const parsedDate = parseDateLike(registrationTimestamp);
                setProfileRegistrationDate(parsedDate);
            } catch (error) {
                console.error('[TradePreviewGallery] Failed to load profile registration date', error);
                if (active) {
                    setProfileRegistrationDate(null);
                }
            }
        })();

        return () => {
            active = false;
        };
    }, [ownerId]);

    const previewData = useMemo(
        () => extractPreviewData(values, profileRegistrationDate),
        [values, profileRegistrationDate]
    );

    const renderedCard = useMemo(() => {
        switch (selectedSize) {
            case 'medium':
                return <MediumPreviewCard data={previewData} theme={theme} />;
            case 'small':
                return <SmallPreviewCard data={previewData} />;
            case 'big':
            default:
                return <BigPreviewCard data={previewData} theme={theme} />;
        }
    }, [previewData, selectedSize, theme]);

    return (
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                <Stack spacing={3}>
                    <Stack spacing={1}>
                        <Typography variant="h6" fontWeight={700}>
                            Finally
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Check how the public preview cards of your trade will look in different search locations on the platform.
                        </Typography>
                    </Stack>

                    <ToggleButtonGroup
                        exclusive
                        value={selectedSize}
                        onChange={(_, value) => value && setSelectedSize(value)}
                        sx={{
                            '& .MuiToggleButton-root': {
                                textTransform: 'none',
                                px: 3,
                                py: 1.1
                            }
                        }}
                    >
                        {CARD_SIZE_OPTIONS.map((option) => (
                            <ToggleButton key={option.id} value={option.id}>
                                {option.label}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>

                    <Box
                        sx={{
                            mx: 'auto',
                            width: { xs: '100%', sm: '100%', md: '100%', lg: '100%', xl: '100%' },
                            maxWidth: lgUp ? 540 : 620
                        }}
                    >
                        {renderedCard}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}

TradePreviewGallery.defaultProps = {
    ownerId: null
};

export default TradePreviewGallery;