import { useMemo } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Skeleton,
    Stack,
    Typography,
    Unstable_Grid2 as Grid
} from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import EmailIcon from '@mui/icons-material/Email';
import RedeemIcon from '@mui/icons-material/Redeem';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/paths';
import { SHOP_CATEGORIES, getFeatureImages } from 'src/api/paid-features';
import { usePaidFeaturesConfig } from 'src/hooks/use-paid-features-config';

const FALLBACK_IMAGE = 'https://placehold.co/600x400/0277BD/FFFFFF?text=CTMASS+IT';

const getPriceLabel = (feature) => {
    const basePrice = feature?.pricing?.basePrice;
    if (!basePrice) {
        return null;
    }
    return basePrice.toLocaleString();
};

const ServiceCard = ({ feature }) => {
    const image = getFeatureImages(feature)[0] || FALLBACK_IMAGE;
    const priceLabel = getPriceLabel(feature);

    return (
        <Card
            elevation={0}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                transition: 'transform 0.25s, box-shadow 0.25s',
                '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: (theme) => theme.shadows[10]
                }
            }}
        >
            <Box sx={{ position: 'relative', height: 200, backgroundColor: 'action.hover' }}>
                <Box
                    component="img"
                    src={image}
                    alt={feature.displayName}
                    loading="lazy"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                {priceLabel && (
                    <Chip
                        icon={<MonetizationOnIcon sx={{ color: '#FFC107 !important' }} />}
                        label={`50% off for ${priceLabel} coins`}
                        size="small"
                        sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            backgroundColor: 'rgba(0,0,0,0.72)',
                            color: '#fff',
                            fontWeight: 700
                        }}
                    />
                )}
            </Box>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {feature.displayName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.7 }}>
                    {feature.description}
                </Typography>
                <Button
                    component={RouterLink}
                    href={paths.contact}
                    variant="outlined"
                    startIcon={<EmailIcon />}
                    sx={{ mt: 3, alignSelf: 'flex-start' }}
                >
                    Get a Quote
                </Button>
            </CardContent>
        </Card>
    );
};

export const ItServices = () => {
    const { features, loading } = usePaidFeaturesConfig();

    const itServices = useMemo(
        () => features.filter((feature) => feature.category === SHOP_CATEGORIES.IT_SERVICES),
        [features]
    );

    return (
        <Box>
            <Stack spacing={1.5} alignItems="center" textAlign="center" sx={{ mb: 6 }}>
                <Typography variant="h3">Our IT Services</Typography>
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 760, fontWeight: 400 }}>
                    From a single landing page to a full platform with its own backend, mobile app and AI
                    automation — every service below is something our team ships in production.
                </Typography>
            </Stack>

            <Grid container spacing={4}>
                {loading
                    ? Array.from({ length: 6 }).map((_, index) => (
                        <Grid xs={12} sm={6} md={4} key={index}>
                            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                                <Skeleton variant="rectangular" height={200} />
                                <CardContent sx={{ p: 3 }}>
                                    <Skeleton width="60%" height={28} />
                                    <Skeleton width="100%" />
                                    <Skeleton width="85%" />
                                    <Skeleton width="40%" height={44} sx={{ mt: 2 }} />
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                    : itServices.map((feature) => (
                        <Grid xs={12} sm={6} md={4} key={feature.id || feature.featureKey}>
                            <ServiceCard feature={feature} />
                        </Grid>
                    ))}
            </Grid>

            {!loading && itServices.length > 0 && (
                <Box
                    sx={{
                        mt: 6,
                        p: { xs: 3, md: 4 },
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: 'background.paper'
                    }}
                >
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={2.5}
                        alignItems={{ xs: 'flex-start', md: 'center' }}
                        justifyContent="space-between"
                    >
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                Pay with CTMASS Coins
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Every service above can be redeemed with the coins you earn on the platform — or
                                paid for the usual way. Ask us for a quote and we will work out the best option.
                            </Typography>
                        </Box>
                        <Button
                            component={RouterLink}
                            href={paths.loyaltyShop}
                            variant="contained"
                            size="large"
                            startIcon={<RedeemIcon />}
                            sx={{ flexShrink: 0 }}
                        >
                            Open Loyalty Shop
                        </Button>
                    </Stack>
                </Box>
            )}
        </Box>
    );
};
