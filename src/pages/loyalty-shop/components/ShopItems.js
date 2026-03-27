import { memo, useMemo } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Grid,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import LockIcon from '@mui/icons-material/Lock';
import { useAuth } from 'src/hooks/use-auth';

const SHOP_ITEMS = [
    {
        id: 1,
        title: 'CTMASS Hoodie',
        description: 'Premium quality hoodie with the CTMASS logo. Stay cozy while repping the brand.',
        price: 500,
        category: 'Merch',
        image: 'https://placehold.co/400x260/1a237e/FFC107?text=CTMASS+Hoodie',
        available: true,
    },
    {
        id: 2,
        title: 'CTMASS T-Shirt',
        description: 'Soft cotton tee with embroidered CTMASS branding. Perfect for everyday wear.',
        price: 250,
        category: 'Merch',
        image: 'https://placehold.co/400x260/283593/FFC107?text=CTMASS+T-Shirt',
        available: true,
    },
    {
        id: 3,
        title: 'CTMASS Cap',
        description: 'Adjustable snapback cap with the CTMASS logo. Look sharp on the job site.',
        price: 150,
        category: 'Merch',
        image: 'https://placehold.co/400x260/1565c0/FFC107?text=CTMASS+Cap',
        available: true,
    },
    {
        id: 4,
        title: 'Priority Listing',
        description: 'Get your contractor profile featured at the top of search results for 30 days.',
        price: 300,
        category: 'Platform Benefit',
        image: 'https://placehold.co/400x260/0f3460/FFC107?text=Priority+Listing',
        available: true,
    },
    {
        id: 5,
        title: 'Featured Profile Badge',
        description: 'Display a special "Featured" badge on your public profile for 60 days.',
        price: 400,
        category: 'Platform Benefit',
        image: 'https://placehold.co/400x260/1a237e/FFC107?text=Featured+Badge',
        available: true,
    },
    {
        id: 6,
        title: 'Premium Support',
        description: 'Get priority access to our support team with a 8-hour response guarantee for 30 days.',
        price: 200,
        category: 'Platform Benefit',
        image: 'https://placehold.co/400x260/283593/FFC107?text=Premium+Support',
        available: true,
    },
];

const ShopItemCard = memo(({ item, userBalance }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const canAfford = userBalance >= item.price;

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: isDark
                        ? '0 8px 32px rgba(0,0,0,0.4)'
                        : '0 8px 32px rgba(0,0,0,0.12)',
                },
            }}
            elevation={0}
        >
            <Box
                component="img"
                src={item.image}
                alt={item.title}
                sx={{
                    width: '100%',
                    height: 180,
                    objectFit: 'cover',
                    borderRadius: '12px 12px 0 0',
                }}
            />
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                        {item.title}
                    </Typography>
                    <Chip
                        label={item.category}
                        size="small"
                        sx={{
                            ml: 1,
                            flexShrink: 0,
                            backgroundColor: isDark ? 'rgba(255,193,7,0.15)' : 'rgba(255,193,7,0.12)',
                            color: '#E65100',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                        }}
                    />
                </Stack>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.6, flex: 1, mb: 2 }}
                >
                    {item.description}
                </Typography>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <MonetizationOnIcon sx={{ color: '#FFC107', fontSize: 22 }} />
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFC107' }}>
                            {item.price.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                            coins
                        </Typography>
                    </Stack>
                    <Button
                        variant={canAfford ? 'contained' : 'outlined'}
                        size="small"
                        startIcon={canAfford ? null : <LockIcon sx={{ fontSize: '16px !important' }} />}
                        disabled={!canAfford}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 2,
                            ...(canAfford && {
                                backgroundColor: '#FFC107',
                                color: '#1a237e',
                                '&:hover': { backgroundColor: '#FFB300' },
                            }),
                        }}
                    >
                        {canAfford ? 'Redeem' : 'Not enough'}
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
});

ShopItemCard.displayName = 'ShopItemCard';

const ShopItems = memo(() => {
    const theme = useTheme();
    const { user, isAuthenticated } = useAuth();
    const balance = user?.loyaltyBalance ?? 0;

    const comingSoonBanner = useMemo(() => (
        <Box
            sx={{
                textAlign: 'center',
                py: 2,
                px: 3,
                mb: 4,
                borderRadius: 2,
                backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(255,193,7,0.08)'
                    : 'rgba(255,193,7,0.1)',
                border: '1px dashed rgba(255,193,7,0.4)',
            }}
        >
            <Typography variant="body2" sx={{ color: '#E65100', fontWeight: 600 }}>
                The shop is coming soon — preview items shown below. Redemptions will be enabled shortly!
            </Typography>
        </Box>
    ), [theme.palette.mode]);

    return (
        <Container maxWidth="lg" sx={{ py: 6, pb: 16 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Available Rewards
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Spend your earned CTMASS Coins on exclusive merch and platform benefits.
                </Typography>
            </Box>
            {comingSoonBanner}
            <Grid container spacing={3}>
                {SHOP_ITEMS.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                        <ShopItemCard item={item} userBalance={isAuthenticated ? balance : 0} />
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
});

ShopItems.displayName = 'ShopItems';

export default ShopItems;
