import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
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
import { btn, EmptyState, fieldSx, focusRingSx, StatusPill } from 'src/components/ctmass-ui';
import { BRAND, FONT, RADIUS, SHADOW, displayTitleSx } from 'src/theme/ctmass-tokens';
import { COIN_GOLD } from './ShopHeader';

const FORM_CATEGORIES = new Set([
  SHOP_CATEGORIES.MERCHANDISE,
  SHOP_CATEGORIES.IT_SERVICES,
  SHOP_CATEGORIES.CONSTRUCTION,
  SHOP_CATEGORIES.SPECIAL_OFFER,
]);

const PRICE_SORT_OPTIONS = [
  { value: 'default', label: 'Recommended' },
  { value: 'asc', label: 'Price: low to high' },
  { value: 'desc', label: 'Price: high to low' },
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

const ShopImageSlider = memo(({ images, alt, height = 210 }) => {
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
        backgroundColor: BRAND.mist,
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
              backgroundColor: alpha('#FFFFFF', 0.9),
              color: BRAND.navy,
              boxShadow: SHADOW.sm,
              '&:hover': { backgroundColor: '#FFFFFF' },
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
              backgroundColor: alpha('#FFFFFF', 0.9),
              color: BRAND.navy,
              boxShadow: SHADOW.sm,
              '&:hover': { backgroundColor: '#FFFFFF' },
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
                  height: 8,
                  width: i === index ? 18 : 8,
                  borderRadius: RADIUS.pill,
                  backgroundColor: i === index ? '#FFFFFF' : alpha('#FFFFFF', 0.6),
                  boxShadow: `0 1px 3px ${alpha(BRAND.navyDeep, 0.4)}`,
                  cursor: 'pointer',
                  transition: 'width .3s ease, background-color .3s ease',
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
  const effectivePrice = getEffectivePrice(feature);
  const hasDiscount = effectivePrice < feature.pricing.basePrice;
  const isFree = effectivePrice === 0;
  const canAfford = isFree || userBalance >= effectivePrice;
  const images = useMemo(() => getFeatureImages(feature), [feature]);
  const isSpecialOffer = feature.category === SHOP_CATEGORIES.SPECIAL_OFFER;
  const missing = Math.max(0, effectivePrice - userBalance);

  return (
    <Box
      component="article"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: '#FFFFFF',
        borderRadius: RADIUS.card,
        border: `1px solid ${alpha(BRAND.navy, 0.08)}`,
        boxShadow: SHADOW.sm,
        transition: 'box-shadow .25s ease, border-color .25s ease',
        '&:hover': { boxShadow: SHADOW.md, borderColor: alpha(BRAND.navy, 0.16) }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <ShopImageSlider images={images} alt={feature.displayName} />
        <StatusPill tone="navy" sx={{ position: 'absolute', top: 12, left: 12, bgcolor: alpha('#FFFFFF', 0.92), boxShadow: SHADOW.sm, textTransform: 'capitalize' }}>
          {feature.category}
        </StatusPill>
        {hasDiscount && (
          <StatusPill sx={{ position: 'absolute', top: 12, right: 12, bgcolor: BRAND.green, color: '#FFFFFF' }}>
            Sale
          </StatusPill>
        )}
      </Box>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: { xs: 2.25, md: 2.5 } }}>
        <Typography component="h3" sx={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 18, lineHeight: 1.3, letterSpacing: '-0.01em', color: BRAND.navy }}>
          {feature.displayName}
        </Typography>
        <Typography sx={{ mt: 0.75, flex: 1, fontSize: 14, lineHeight: 1.6, color: BRAND.muted }}>
          {feature.description}
        </Typography>
        {feature.isOneTime && (
          <Typography sx={{ mt: 1.25, fontSize: 12, fontWeight: 600, color: BRAND.muted }}>
            One-time purchase
          </Typography>
        )}

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1.5}
          sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(BRAND.navy, 0.08)}` }}
        >
          {isFree ? (
            <Typography sx={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 22, color: BRAND.green }}>
              Free
            </Typography>
          ) : (
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
              <MonetizationOnIcon sx={{ color: COIN_GOLD, fontSize: 24 }} />
              <Typography sx={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 22, color: BRAND.navy, fontVariantNumeric: 'tabular-nums' }}>
                {effectivePrice.toLocaleString('en-US')}
              </Typography>
              {hasDiscount && (
                <Typography sx={{ textDecoration: 'line-through', color: BRAND.muted, fontSize: 14 }}>
                  {feature.pricing.basePrice.toLocaleString('en-US')}
                </Typography>
              )}
            </Stack>
          )}

          {isPurchased && !isSpecialOffer ? (
            <Button
              startIcon={<CheckCircleIcon sx={{ color: BRAND.green }} />}
              onClick={() => onBuy(feature)}
              sx={{ ...btn.outline, minHeight: 42 }}
            >
              {feature.isOneTime ? 'Manage' : 'Buy more'}
            </Button>
          ) : canAfford ? (
            <Button onClick={() => onBuy(feature)} sx={{ ...btn.green, minHeight: 42 }}>
              {isSpecialOffer ? 'Post offer' : 'Redeem'}
            </Button>
          ) : (
            <Button disabled startIcon={<LockIcon />} sx={{ ...btn.soft, minHeight: 42, '&.Mui-disabled': { color: BRAND.muted, bgcolor: alpha(BRAND.navy, 0.05) } }}>
              {missing.toLocaleString('en-US')} more
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
});

ShopItemCard.displayName = 'ShopItemCard';

const chipSx = (active) => ({
  flexShrink: 0,
  height: 40,
  px: 2,
  border: `1px solid ${active ? BRAND.navy : alpha(BRAND.navy, 0.12)}`,
  borderRadius: RADIUS.pill,
  bgcolor: active ? BRAND.navy : '#FFFFFF',
  color: active ? '#FFFFFF' : BRAND.navy,
  font: 'inherit',
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  textTransform: 'capitalize',
  cursor: 'pointer',
  transition: 'background-color .2s ease, color .2s ease, border-color .2s ease',
  '&:hover': { borderColor: BRAND.navy },
  ...focusRingSx
});

const ShopItems = memo(() => {
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
    <Box component="section" sx={{ bgcolor: BRAND.mist, py: { xs: 5, md: 8 }, pb: { xs: 14, md: 14 } }}>
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'stretch', md: 'flex-end' }}
          justifyContent="space-between"
          sx={{ gap: 2.5, mb: { xs: 3, md: 4 } }}
        >
          <Box>
            <Typography component="h2" sx={{ ...displayTitleSx, fontSize: { xs: 28, md: 36 } }}>
              Rewards
            </Typography>
            <Typography sx={{ mt: 0.75, color: BRAND.muted, fontSize: 15 }}>
              Spend your coins on merch and platform perks.
            </Typography>
          </Box>
          <FormControl size="small" sx={{ ...fieldSx, minWidth: { xs: '100%', md: 220 } }}>
            <InputLabel>Sort by</InputLabel>
            <Select
              label="Sort by"
              value={priceSort}
              onChange={(e) => setPriceSort(e.target.value)}
              input={<OutlinedInput label="Sort by" />}
            >
              {PRICE_SORT_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {availableCategories.length > 1 && (
          <Box
            role="group"
            aria-label="Filter by category"
            sx={{
              display: 'flex',
              gap: 1,
              overflowX: 'auto',
              mx: { xs: -2, sm: 0 },
              px: { xs: 2, sm: 0 },
              pb: 0.5,
              mb: { xs: 3, md: 4 },
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' }
            }}
          >
            <Box component="button" type="button" aria-pressed={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')} sx={chipSx(categoryFilter === 'all')}>
              All rewards
            </Box>
            {availableCategories.map((cat) => (
              <Box
                key={cat}
                component="button"
                type="button"
                aria-pressed={categoryFilter === cat}
                onClick={() => setCategoryFilter(cat)}
                sx={chipSx(categoryFilter === cat)}
              >
                {cat}
              </Box>
            ))}
          </Box>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
            gap: { xs: 2, md: 3 }
          }}
        >
          {loading
            ? [0, 1, 2].map((i) => (
              <Skeleton key={i} variant="rounded" height={420} sx={{ borderRadius: RADIUS.card }} />
            ))
            : visibleFeatures.map((feature) => (
              <ShopItemCard
                key={feature.id || feature.featureKey}
                feature={feature}
                userBalance={isAuthenticated ? balance : 0}
                isPurchased={purchasedKeys.has(feature.featureKey)}
                onBuy={handleBuy}
              />
            ))}
        </Box>
        {!loading && visibleFeatures.length === 0 && (
          <EmptyState
            title="Nothing here yet"
            text="No rewards match this filter. Try another category."
            action={<Button onClick={() => setCategoryFilter('all')} sx={btn.outline}>Show all rewards</Button>}
          />
        )}
      </Container>

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
    </Box>
  );
});

ShopItems.displayName = 'ShopItems';

export default ShopItems;
