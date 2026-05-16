import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useAuth } from 'src/hooks/use-auth';
import { usePaidFeaturesConfig } from 'src/hooks/use-paid-features-config';
import { SHOP_CATEGORIES, getFeatureImages } from 'src/api/paid-features';
import PurchaseConfirmDialog from 'src/sections/loyalty-shop/PurchaseConfirmDialog';
import ShopOrderFormDialog from 'src/sections/loyalty-shop/ShopOrderFormDialog';

const CATEGORY_COLORS = {
  [SHOP_CATEGORIES.MERCHANDISE]: '#E65100',
  [SHOP_CATEGORIES.IT_SERVICES]: '#0277BD',
  [SHOP_CATEGORIES.CONSTRUCTION]: '#5D4037',
  [SHOP_CATEGORIES.SPECIAL_OFFER]: '#558B2F',
  merch: '#E65100',
  service: '#0277BD',
  groupon: '#558B2F',
  construction: '#5D4037',
};

const FORM_CATEGORIES = new Set([
  SHOP_CATEGORIES.MERCHANDISE,
  SHOP_CATEGORIES.IT_SERVICES,
  SHOP_CATEGORIES.CONSTRUCTION,
  SHOP_CATEGORIES.SPECIAL_OFFER,
]);

const PRICE_SORT_OPTIONS = [
  { value: 'default', label: 'Default Order' },
  { value: 'asc', label: 'Price: Low to High' },
  { value: 'desc', label: 'Price: High to Low' },
];

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

const ShopImageSlider = memo(({ images, alt, height = 220 }) => {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const hoveringRef = useRef(false);

  const total = images.length;
  const safeImages = total > 0 ? images : ['https://placehold.co/400x260/1a237e/FFC107?text=Item'];

  useEffect(() => {
    if (total <= 1) return;
    const tick = () => {
      if (!hoveringRef.current) {
        setIndex((prev) => (prev + 1) % total);
      }
    };
    timerRef.current = setInterval(tick, 4000);
    return () => clearInterval(timerRef.current);
  }, [total]);

  const goPrev = useCallback((e) => {
    e?.stopPropagation();
    setIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goNext = useCallback((e) => {
    e?.stopPropagation();
    setIndex((prev) => (prev + 1) % total);
  }, [total]);

  return (
    <Box
      onMouseEnter={() => (hoveringRef.current = true)}
      onMouseLeave={() => (hoveringRef.current = false)}
      sx={{
        position: 'relative',
        width: '100%',
        height,
        overflow: 'hidden',
        borderRadius: '12px 12px 0 0',
        backgroundColor: 'action.hover',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          width: `${safeImages.length * 100}%`,
          height: '100%',
          transform: `translateX(-${(index * 100) / safeImages.length}%)`,
          transition: 'transform 0.6s cubic-bezier(0.45, 0, 0.15, 1)',
        }}
      >
        {safeImages.map((src, i) => (
          <Box
            key={`${src}-${i}`}
            component="img"
            src={src}
            alt={`${alt} ${i + 1}`}
            sx={{
              width: `${100 / safeImages.length}%`,
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              flexShrink: 0,
              display: 'block',
            }}
          />
        ))}
      </Box>

      {total > 1 && (
        <>
          <IconButton
            onClick={goPrev}
            size="small"
            sx={{
              position: 'absolute',
              top: '50%',
              left: 6,
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0,0,0,0.4)',
              color: '#fff',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.6)' },
            }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={goNext}
            size="small"
            sx={{
              position: 'absolute',
              top: '50%',
              right: 6,
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0,0,0,0.4)',
              color: '#fff',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.6)' },
            }}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
          <Stack
            direction="row"
            spacing={0.75}
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 0,
              right: 0,
              justifyContent: 'center',
            }}
          >
            {safeImages.map((_, i) => (
              <Box
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex(i);
                }}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: i === index ? '#FFC107' : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s',
                  border: '1px solid rgba(0,0,0,0.2)',
                }}
              />
            ))}
          </Stack>
        </>
      )}
    </Box>
  );
});

ShopImageSlider.displayName = 'ShopImageSlider';

const ShopItemCard = memo(({ feature, userBalance, isPurchased, onBuy }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const effectivePrice = getEffectivePrice(feature);
  const hasDiscount = effectivePrice < feature.pricing.basePrice;
  const isFree = effectivePrice === 0;
  const canAfford = isFree || userBalance >= effectivePrice;
  const categoryColor = CATEGORY_COLORS[feature.category] || '#E65100';
  const images = useMemo(() => getFeatureImages(feature), [feature]);
  const isSpecialOffer = feature.category === SHOP_CATEGORIES.SPECIAL_OFFER;

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
      <ShopImageSlider images={images} alt={feature.displayName} />
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
            {isFree ? (
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'success.main' }}>
                Free
              </Typography>
            ) : (
              <>
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
              </>
            )}
          </Stack>

          {isPurchased && !isSpecialOffer ? (
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
              {isSpecialOffer ? 'Post Offer' : canAfford ? 'Redeem' : 'Not enough'}
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

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceSort, setPriceSort] = useState('default');

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

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadPurchases();
    }
  }, [isAuthenticated, user?.id, loadPurchases]);

  const availableCategories = useMemo(() => {
    const set = new Set();
    features.forEach((f) => {
      if (f.category) set.add(f.category);
    });
    return Array.from(set);
  }, [features]);

  const visibleFeatures = useMemo(() => {
    let list = features.filter((f) => isRoleAllowed(userRole, f));
    if (categoryFilter !== 'all') {
      list = list.filter((f) => f.category === categoryFilter);
    }
    if (priceSort === 'asc') {
      list = [...list].sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
    } else if (priceSort === 'desc') {
      list = [...list].sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
    }
    return list;
  }, [features, userRole, categoryFilter, priceSort]);

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

  const useFormDialog = selectedFeature && FORM_CATEGORIES.has(selectedFeature.category);

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

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 3, mt: 8 }}
      >
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 260 } }}>
          <InputLabel>Filter by Category</InputLabel>
          <Select
            label="Filter by Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <MenuItem value="all">All Categories</MenuItem>
            {availableCategories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 240 } }}>
          <InputLabel>Sort by Price</InputLabel>
          <Select
            label="Sort by Price"
            value={priceSort}
            onChange={(e) => setPriceSort(e.target.value)}
          >
            {PRICE_SORT_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

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
                No items match your filters.
              </Typography>
            </Grid>
          )}
        </Grid>
      )}

      {useFormDialog ? (
        <ShopOrderFormDialog
          open={!!selectedFeature}
          onClose={handleDialogClose}
          feature={selectedFeature}
          userBalance={balance}
          userId={user?.id}
          userRole={userRole}
          user={user}
          onPurchased={handlePurchased}
        />
      ) : (
        <PurchaseConfirmDialog
          open={!!selectedFeature}
          onClose={handleDialogClose}
          feature={selectedFeature}
          userBalance={balance}
          userId={user?.id}
          userRole={userRole}
          user={user}
          onPurchased={handlePurchased}
        />
      )}
    </Container>
  );
});

ShopItems.displayName = 'ShopItems';

export default ShopItems;
