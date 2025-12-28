import {
    Avatar,
    Box,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    Stack,
    Typography
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';

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
    const fallback = '$55/hr';
    if (!price) {
        return fallback;
    }

    const trimmed = price.toString().trim();
    const hasCurrency = trimmed.startsWith('$');
    const normalized = hasCurrency ? trimmed : `$${trimmed}`;

    if (normalized.includes('/') || normalized.toLowerCase().includes('per')) {
        return normalized;
    }

    const suffix = PRICE_SUFFIX_MAP[priceType] || '/hr';
    return `${normalized}${suffix}`;
};

const extractPreviewData = (values) => {
    const image = values.avatarUrl || FALLBACK_IMAGE;
    const specialtyLabel = formatSpecialty(values.primarySpecialty) || 'Seasoned specialist';
    const locationLabel = values.address || values.addressLocation?.place_name || 'Serving your area';
    const priceLabel = formatPrice(values.price, values.priceType);
    const ratingNumber = Number.isFinite(Number(values.rating)) ? Number(values.rating) : 4.9;
    const ratingLabel = `${ratingNumber.toFixed(1)} / 5`;
    const tagline =
        values.previewTagline ||
        values.shortDescription ||
        'Reliable professional ready to help with your next project.';

    return {
        image,
        specialtyLabel,
        locationLabel,
        priceLabel,
        ratingLabel,
        tagline
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

const renderBigCard = (values) => {
    const data = extractPreviewData(values);

    return (
        <Card variant="outlined" sx={{ borderRadius: 4, height: '100%' }}>
            <CardContent
                sx={{
                    p: { xs: 3, md: 3.5 },
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    height: '100%'
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        borderRadius: 3,
                        overflow: 'hidden',
                        height: { xs: 200, md: 220 }
                    }}
                >
                    <Box
                        component="img"
                        src={data.image}
                        alt="Trade preview hero"
                        sx={{
                            width: '100%',
                            height: '100%',
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
                        label="Available"
                        color="success"
                        size="small"
                        sx={{ position: 'absolute', top: 16, right: 16, borderRadius: 1.5 }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            left: 16,
                            bottom: 16,
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            px: 2,
                            py: 1,
                            boxShadow: (theme) => `0 10px 24px ${alpha(theme.palette.grey[900], 0.18)}`
                        }}
                    >
                        <Typography variant="subtitle2" fontWeight={700}>
                            {data.priceLabel}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            avg. rate
                        </Typography>
                    </Box>
                </Box>

                <Stack spacing={0.75} sx={{ flexGrow: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                        On Craftmate for 1 month
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                        {values.tradeTitle || 'Your trade title'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {data.specialtyLabel}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                        <PlaceOutlinedIcon fontSize="small" />
                        <Typography variant="body2">{data.locationLabel}</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                        {data.tagline}
                    </Typography>
                </Stack>

                <Divider />

                <Stack direction="row" spacing={2.5} flexWrap="wrap" useFlexGap>
                    <StatBadge
                        icon={<StarRoundedIcon color="warning" fontSize="small" />}
                        label="Rating"
                        value={data.ratingLabel}
                    />
                    <StatBadge
                        icon={<WorkOutlineRoundedIcon color="primary" fontSize="small" />}
                        label="Jobs done"
                        value={`${values.completedProjects || 82}+`}
                    />
                    <StatBadge
                        icon={<AccessTimeRoundedIcon color="primary" fontSize="small" />}
                        label="Response"
                        value="Replies within 1h"
                    />
                </Stack>
            </CardContent>
        </Card>
    );
};

const renderMediumCard = (values) => {
    const data = extractPreviewData(values);

    return (
        <Card variant="outlined" sx={{ borderRadius: 4, height: '100%' }}>
            <CardContent sx={{ p: { xs: 3, md: 3.5 } }}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2.5}
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                >
                    <Box
                        sx={{
                            position: 'relative',
                            borderRadius: 3,
                            overflow: 'hidden',
                            width: { xs: '100%', sm: 150 },
                            minHeight: 150,
                            flexShrink: 0
                        }}
                    >
                        <Box
                            component="img"
                            src={data.image}
                            alt="Trade preview medium"
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <Chip
                            label="PRO"
                            color="primary"
                            size="small"
                            sx={{ position: 'absolute', top: 12, left: 12, borderRadius: 1.5 }}
                        />
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 12,
                                left: 12,
                                bgcolor: 'background.paper',
                                borderRadius: 2,
                                px: 1.5,
                                py: 0.75,
                                boxShadow: (theme) => `0 8px 16px ${alpha(theme.palette.grey[900], 0.16)}`
                            }}
                        >
                            <Typography variant="subtitle2" fontWeight={700}>
                                {data.priceLabel}
                            </Typography>
                        </Box>
                    </Box>

                    <Stack spacing={1.25}>
                        <Typography variant="caption" color="text.secondary">
                            Featured specialist
                        </Typography>
                        <Typography variant="subtitle1" fontWeight={700}>
                            {values.tradeTitle || 'Your trade title'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {data.specialtyLabel}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                            <PlaceOutlinedIcon fontSize="small" />
                            <Typography variant="body2">{data.locationLabel}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <StarRoundedIcon fontSize="small" color="warning" />
                            <Typography variant="body2" fontWeight={600}>
                                {data.ratingLabel}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {`${values.reviews || 24} reviews`}
                            </Typography>
                        </Stack>
                        <Chip
                            label="Available"
                            color="success"
                            size="small"
                            sx={{ alignSelf: 'flex-start', borderRadius: 1.5 }}
                        />
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
};

const renderSmallCard = (values) => {
    const data = extractPreviewData(values);

    return (
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                        src={values.avatarUrl || FALLBACK_IMAGE}
                        alt="Trade preview small"
                        sx={{ width: 56, height: 56 }}
                    >
                        {(values.tradeTitle || 'T').charAt(0)}
                    </Avatar>
                    <Stack spacing={0.5} flexGrow={1}>
                        <Typography variant="subtitle1" fontWeight={700}>
                            {values.tradeTitle || 'Your trade title'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {data.specialtyLabel}
                        </Typography>
                    </Stack>
                    <Chip
                        label="Available"
                        color="success"
                        size="small"
                        sx={{ borderRadius: 1.5, flexShrink: 0 }}
                    />
                </Stack>
            </CardContent>
        </Card>
    );
};

function TradePreviewGallery({ values }) {
    const previews = [
        { id: 'big', label: 'Big card', render: renderBigCard },
        { id: 'medium', label: 'Middle card', render: renderMediumCard },
        { id: 'small', label: 'Small card', render: renderSmallCard }
    ];

    return (
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                <Stack spacing={1}>
                    <Typography variant="h6" fontWeight={700}>
                        Finally
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paddingBottom={2}>
                        Check how the public preview cards of your trade will look in different search locations on the platform.
                    </Typography>

                    <Grid container spacing={1}>
                        {previews.map((item) => (
                            <Grid item xs={12} md={4} key={item.id}>
                                <Stack spacing={1.5}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                        {item.label}
                                    </Typography>
                                    {item.render(values)}
                                </Stack>
                            </Grid>
                        ))}
                    </Grid>
                </Stack>
            </CardContent>
        </Card>
    );
}

export default TradePreviewGallery;