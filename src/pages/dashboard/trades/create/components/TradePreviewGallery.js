import { useMemo, useState } from 'react';
import {
    Avatar,
    Box,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Divider,
    Rating,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';

const CARD_SIZE_OPTIONS = [
    { id: 'big', label: 'Big card' },
    { id: 'medium', label: 'Middle card' },
    { id: 'small', label: 'Small card' }
];

const FALLBACK_IMAGE = '/assets/gallery/plumbers/19191.jpg';

const PRICE_SUFFIX_MAP = {
    hourly: '/hr',
    project: ' per project',
    consultation: ' per consultation'
};

const formatSpecialty = (value) => {
    if (!value) {
        return '';
    }
    return value
        .split(/[-_]/)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' ');
};

const formatPrice = (price, priceType) => {
    if (!price) {
        return '$55/hr';
    }

    const trimmed = price.toString().trim();
    const withCurrency = trimmed.startsWith('$') ? trimmed : `$${trimmed}`;
    const suffix = PRICE_SUFFIX_MAP[priceType] || '/hr';

    if (withCurrency.includes('/') || withCurrency.toLowerCase().includes('per')) {
        return withCurrency;
    }

    return `${withCurrency}${suffix}`;
};

const extractPreviewData = (values) => {
    const image = values.avatarUrl || FALLBACK_IMAGE;
    const title = values.tradeTitle || 'Your trade title';
    const specialtyLabel =
        values.primarySpecialtyLabel ||
        formatSpecialty(values.primarySpecialty) ||
        'Seasoned specialist';
    const locationLabel =
        values.address ||
        values.addressLocation?.place_name ||
        'Serving Connecticut & Massachusetts';
    const priceLabel = formatPrice(values.price, values.priceType);
    const ratingNumber = Number(values.rating);
    const ratingValue = Number.isFinite(ratingNumber) && ratingNumber > 0 ? ratingNumber : 4.9;
    const reviewsCount = Number.isFinite(Number(values.reviews))
        ? Number(values.reviews)
        : 24;
    const jobsDone = Number.isFinite(Number(values.completedProjects))
        ? Number(values.completedProjects)
        : 82;
    const responseTime = 'Replies within 1h';
    const statusChipLabel =
        values.status && values.status.toLowerCase() === 'hidden'
            ? 'Hidden'
            : 'Available';
    const description = values.shortDescription || values.about || 'Describe your experience to inspire trust.';
    const avatarInitial = title.charAt(0).toUpperCase();

    return {
        image,
        title,
        specialtyLabel,
        locationLabel,
        priceLabel,
        ratingValue,
        ratingLabel: `${ratingValue.toFixed(1)} / 5`,
        reviewsCount,
        jobsDone,
        responseTime,
        statusChipLabel,
        description,
        avatarInitial
    };
};

const StatBadge = ({ icon, label, value }) => (
    <Stack spacing={0.5}>
        <Stack direction="row" spacing={1} alignItems="center">
            <Box
                sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: 'action.hover',
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

const QuotesIcon = () => (
    <svg
        fill="none"
        height="79"
        viewBox="0 0 105 79"
        width="105"
        xmlns="http://www.w3.org/2000/svg"
    >
        <g clipPath="url(#clip0_17690_94764)">
            <path
                d="M25.086 78.1818C20.265 78.1818 15.971 76.9768 12.204 74.5658C8.437 72.0048 5.424 68.4638 3.164 63.9438C1.054 59.4238 0 54.3008 0 48.5758C0 43.3028 0.904 38.1798 2.712 33.2078C4.671 28.2358 7.458 23.6408 11.074 19.4218C14.6576 15.0819 18.8433 11.2767 23.504 8.12177C28.325 4.80677 33.599 2.39677 39.324 0.889771L50.398 14.6758C43.919 17.2368 38.721 20.6268 34.804 24.8458C31.037 29.0648 29.154 32.6808 29.154 35.6938C29.154 37.0498 29.531 38.5568 30.284 40.2138C31.188 41.7208 32.921 43.3028 35.482 44.9598C39.249 47.3698 41.81 49.9318 43.166 52.6438C44.673 55.2048 45.426 58.1438 45.426 61.4578C45.426 66.5808 43.467 70.6478 39.55 73.6618C35.783 76.6748 30.962 78.1818 25.086 78.1818ZM79.326 78.1818C74.505 78.1818 70.211 76.9768 66.444 74.5658C62.677 72.0048 59.664 68.4638 57.404 63.9438C55.294 59.4238 54.24 54.3008 54.24 48.5758C54.24 43.3028 55.144 38.1798 56.952 33.2078C58.911 28.2358 61.698 23.6408 65.314 19.4218C68.8976 15.0819 73.0833 11.2767 77.744 8.12177C82.565 4.80677 87.839 2.39677 93.564 0.889771L104.638 14.6758C98.159 17.2368 92.961 20.6268 89.044 24.8458C85.277 29.0648 83.394 32.6808 83.394 35.6938C83.394 37.0498 83.771 38.5568 84.524 40.2138C85.428 41.7208 87.161 43.3028 89.722 44.9598C93.489 47.3698 96.05 49.9318 97.406 52.6438C98.913 55.2048 99.666 58.1438 99.666 61.4578C99.666 66.5808 97.707 70.6478 93.79 73.6618C90.023 76.6748 85.202 78.1818 79.326 78.1818V78.1818Z"
                fill="black"
                fillOpacity="0.04"
            />
        </g>
        <defs>
            <clipPath id="clip0_17690_94764">
                <rect
                    fill="white"
                    height="78.0005"
                    transform="translate(0 0.889771)"
                    width="105"
                />
            </clipPath>
        </defs>
    </svg>
);

const BigPreviewCard = ({ data }) => (
    <Card variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: 'none' }}>
        <Box sx={{ position: 'relative' }}>
            <CardMedia
                component="img"
                image={data.image}
                alt={data.title}
                sx={{
                    height: { xs: 220, md: 260 },
                    objectFit: 'cover'
                }}
            />
            <Chip
                label="PRO"
                color="primary"
                size="small"
                sx={{ position: 'absolute', top: 16, left: 16, borderRadius: 1.5 }}
            />
            <Chip
                label={data.priceLabel}
                color="warning"
                size="small"
                sx={{ position: 'absolute', bottom: 16, right: 16, fontWeight: 700 }}
            />
        </Box>

        <CardContent
            sx={{
                p: { xs: 3, md: 3.5 },
                display: 'flex',
                flexDirection: 'column',
                gap: 2
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                        On CTMASS for 1 month
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                        {data.title}
                    </Typography>
                </Stack>
                <Chip
                    label={data.statusChipLabel}
                    size="small"
                    sx={(theme) => ({
                        borderRadius: 1.5,
                        fontWeight: 600,
                        bgcolor: theme.palette.success.main,
                        color: theme.palette.success.contrastText
                    })}
                />
            </Stack>

            <Typography variant="body2" color="text.secondary">
                {data.specialtyLabel}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                <PlaceOutlinedIcon fontSize="small" />
                <Typography variant="body2">{data.locationLabel}</Typography>
            </Stack>

            <Typography variant="body2" color="text.secondary">
                {data.description}
            </Typography>

            <Divider />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap>
                <StatBadge
                    icon={<StarRoundedIcon color="warning" fontSize="small" />}
                    label="Rating"
                    value={data.ratingLabel}
                />
                <StatBadge
                    icon={<WorkOutlineRoundedIcon color="primary" fontSize="small" />}
                    label="Jobs done"
                    value={`${data.jobsDone}+`}
                />
                <StatBadge
                    icon={<AccessTimeRoundedIcon color="primary" fontSize="small" />}
                    label="Response"
                    value={data.responseTime}
                />
            </Stack>
        </CardContent>
    </Card>
);

const MediumPreviewCard = ({ data }) => (
    <Card variant="outlined" sx={{ borderRadius: 4, position: 'relative', overflow: 'hidden', boxShadow: 'none' }}>
        <Box sx={{ position: 'absolute', top: 12, right: 16, opacity: 0.08 }}>
            <QuotesIcon />
        </Box>

        <CardContent
            sx={{
                p: { xs: 3, md: 3.5 },
                display: 'flex',
                flexDirection: 'column',
                gap: 2
            }}
        >
            <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                    src={data.image}
                    alt={data.title}
                    sx={{
                        width: 64,
                        height: 64,
                        border: (theme) => `3px solid ${alpha(theme.palette.primary.main, 0.2)}`
                    }}
                >
                    {data.avatarInitial}
                </Avatar>

                <Stack spacing={0.25}>
                    <Typography variant="subtitle1" fontWeight={700}>
                        {data.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {data.specialtyLabel}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                        <PlaceOutlinedIcon fontSize="small" />
                        <Typography variant="body2">{data.locationLabel}</Typography>
                    </Stack>
                </Stack>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
                <Rating readOnly precision={0.5} value={data.ratingValue} size="small" />
                <Typography variant="body2" fontWeight={600}>
                    {data.ratingLabel}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {`${data.reviewsCount} reviews`}
                </Typography>
            </Stack>

            <Typography variant="body2">
                {data.description}
            </Typography>

            <Divider />

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                    label={data.statusChipLabel}
                    size="small"
                    sx={(theme) => ({
                        borderRadius: 1.5,
                        fontWeight: 600,
                        bgcolor: alpha(theme.palette.success.main, 0.15),
                        color: theme.palette.success.dark
                    })}
                />
                <Chip
                    label={data.priceLabel}
                    color="warning"
                    size="small"
                    sx={{ borderRadius: 1.5, fontWeight: 600 }}
                />
            </Stack>
        </CardContent>
    </Card>
);

const SmallPreviewCard = ({ data }) => (
    <Card variant="outlined" sx={{ borderRadius: 4, boxShadow: 'none' }}>
        <CardContent
            sx={{
                p: { xs: 2.5, md: 3 },
                display: 'flex',
                alignItems: 'center',
                gap: 2
            }}
        >
            <Avatar
                src={data.image}
                alt={data.title}
                sx={{ width: 56, height: 56 }}
            >
                {data.avatarInitial}
            </Avatar>

            <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                    {data.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {data.specialtyLabel}
                </Typography>
            </Box>
        </CardContent>
    </Card>
);

function TradePreviewGallery({ values }) {
    const [selectedSize, setSelectedSize] = useState('big');
    const theme = useTheme();
    const isLgUp = useMediaQuery(theme.breakpoints.up('lg'));

    const previewData = useMemo(() => extractPreviewData(values), [values]);


    const renderedCard = useMemo(() => {
        switch (selectedSize) {
            case 'medium':
                return <MediumPreviewCard data={previewData} />;
            case 'small':
                return <SmallPreviewCard data={previewData} />;
            case 'big':
            default:
                return <BigPreviewCard data={previewData} />;
        }
    }, [previewData, selectedSize]);

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

                    <Box sx={{ mx: 'auto', width: { xs: '100%', md: '80%', lg: isLgUp ? '50%' : '80%' } }}>
                        {renderedCard}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}

export default TradePreviewGallery;