import { memo, useCallback, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from 'src/hooks/use-auth';
import { usePaidFeaturesConfig } from 'src/hooks/use-paid-features-config';
import PurchaseConfirmDialog from 'src/sections/loyalty-shop/PurchaseConfirmDialog';

const CATEGORY_COLORS = {
  merch: '#E65100',
  service: '#0277BD',
  groupon: '#558B2F',
  construction: '#5D4037',
  promotion: '#1565c0',
  profile: '#2e7d32',
  ai: '#6a1b9a',
  analytics: '#00838f',
};

const getEffectivePrice = (feature) => {
  const { basePrice, discount } = feature.pricing;
  if (!discount) return basePrice;
  const now = new Date();
  const from = discount.validFrom?.toDate?.() || null;
  const until = discount.validUntil?.toDate?.() || null;
  if (from && now < from) return basePrice;
  if (until && now > until) return basePrice;
  if (discount.type === 'percentage') return Math.round(basePrice * (1 - discount.value / 100));
  if (discount.type === 'fixed') return Math.max(0, basePrice - discount.value);
  return basePrice;
};

const isRoleAllowed = (userRole, feature) => {
  const roleKey = userRole?.toLowerCase();
  if (roleKey === 'admin') return true;
  const roles = feature.availability?.roles || [];
  if (roles.length === 0) return true;
  if (roleKey === 'customer') return roles.includes('homeowner');
  if (roleKey === 'worker') return roles.includes('contractor');
  return roles.includes(roleKey);
};

const ShopItemCard = memo(({ feature, userBalance, isPurchased, onBuy }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const effectivePrice = getEffectivePrice(feature);
  const hasDiscount = effectivePrice < feature.pricing.basePrice;
  const canAfford = userBalance >= effectivePrice;
  const categoryColor = CATEGORY_COLORS[feature.category] || '#E65100';

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
          boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.12)',
        },
      }}
      elevation={0}
    >
      <Box
        component="img"
        src={feature.imageUrl || 'https://placehold.co/400x260/1a237e/FFC107?text=Item'}
        alt={feature.displayName}
        sx={{ width: '100%', height: 180, objectFit: 'contain', borderRadius: '12px 12px 0 0', backgroundColor: 'action.hover' }}
      />
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
            {feature.displayName}
          </Typography>
          <Chip
            label={feature.category}
            size="small"
            sx={{
              ml: 1,
              flexShrink: 0,
              backgroundColor: `${categoryColor}18`,
              color: categoryColor,
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          />
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, flex: 1, mb: 2 }}>
          {feature.description}
        </Typography>

        {feature.isOneTime && (
          <Chip
            label="One-time purchase"
            size="small"
            variant="outlined"
            sx={{ alignSelf: 'flex-start', mb: 1.5, fontSize: '0.7rem', height: 20 }}
          />
        )}

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <MonetizationOnIcon sx={{ color: '#FFC107', fontSize: 22 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFC107' }}>
              {effectivePrice.toLocaleString()}
            </Typography>
            {hasDiscount && (
              <Typography
                variant="body2"
                sx={{ textDecoration: 'line-through', color: 'text.disabled', ml: 0.5 }}
              >
                {feature.pricing.basePrice.toLocaleString()}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
              coins
            </Typography>
          </Stack>

          {isPurchased ? (
            <Button
              variant="outlined"
              size="small"
              startIcon={<CheckCircleIcon sx={{ fontSize: '16px !important', color: 'success.main' }} />}
              onClick={() => onBuy(feature)}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
            >
              {feature.isOneTime ? 'Manage' : 'Buy more'}
            </Button>
          ) : (
            <Button
              variant={canAfford ? 'contained' : 'outlined'}
              size="small"
              startIcon={canAfford ? null : <LockIcon sx={{ fontSize: '16px !important' }} />}
              disabled={!canAfford}
              onClick={() => onBuy(feature)}
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
          )}
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
  const userRole = user?.role;

  const { features, loading } = usePaidFeaturesConfig();
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [purchasesLoaded, setPurchasesLoaded] = useState(false);

  const loadPurchases = useCallback(async () => {
    if (!user?.id || purchasesLoaded) return;
    try {
      const { paidFeaturesApi } = await import('src/api/paid-features');
      const data = await paidFeaturesApi.getUserPurchases(user.id);
      setPurchases(data);
      setPurchasesLoaded(true);
    } catch {
      setPurchasesLoaded(true);
    }
  }, [user?.id, purchasesLoaded]);

  useMemo(() => {
    if (isAuthenticated && user?.id) {
      loadPurchases();
    }
  }, [isAuthenticated, user?.id, loadPurchases]);

  const visibleFeatures = useMemo(
    () => features.filter((f) => isRoleAllowed(userRole, f)),
    [features, userRole]
  );

  const purchasedKeys = useMemo(
    () => new Set(purchases.filter((p) => p.status === 'active').map((p) => p.featureKey)),
    [purchases]
  );

  const handleBuy = useCallback((feature) => {
    setSelectedFeature(feature);
  }, []);

  const handleDialogClose = useCallback(() => {
    setSelectedFeature(null);
  }, []);

  const handlePurchased = useCallback(() => {
    setPurchasesLoaded(false);
  }, []);

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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {visibleFeatures.map((feature) => (
            <Grid item xs={12} sm={6} md={4} key={feature.id || feature.featureKey}>
              <ShopItemCard
                feature={feature}
                userBalance={isAuthenticated ? balance : 0}
                isPurchased={purchasedKeys.has(feature.featureKey)}
                onBuy={handleBuy}
              />
            </Grid>
          ))}
          {visibleFeatures.length === 0 && (
            <Grid item xs={12}>
              <Typography color="text.secondary" textAlign="center" py={6}>
                No items available for your role.
              </Typography>
            </Grid>
          )}
        </Grid>
      )}

      <PurchaseConfirmDialog
        open={!!selectedFeature}
        onClose={handleDialogClose}
        feature={selectedFeature}
        userBalance={balance}
        userId={user?.id}
        userRole={userRole}
        onPurchased={handlePurchased}
      />
    </Container>
  );
});

ShopItems.displayName = 'ShopItems';

export default ShopItems;
