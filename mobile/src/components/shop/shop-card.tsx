import { memo } from "react";
import { Text, View } from "react-native";

import { CoinIcon, LockIcon } from "@/components/icons";
import { PressableScale } from "@/components/ui/pressable-scale";
import { analyticsEvents } from "@/lib/analytics-events";
import { ShopImageSlider } from "@/components/shop/shop-image-slider";
import {
  Brand,
  Radius,
  Spacing,
  makeStyles,
  useTheme,
} from "@/constants/theme";
import { useT } from "@/lib/i18n";
import {
  CATEGORY_COLORS,
  CATEGORY_COLORS_LIGHT,
  getEffectivePrice,
  getFeatureImages,
  SHOP_CATEGORIES,
  formatCoins,
  type ShopFeature,
} from "@/lib/shop";

type ShopCardProps = {
  feature: ShopFeature;
  balance: number;
  isPurchased: boolean;
  onBuy: (feature: ShopFeature) => void;
};

export const ShopCard = memo(function ShopCard({
  feature,
  balance,
  isPurchased,
  onBuy,
}: ShopCardProps) {
  const { colors, isDark } = useTheme();
  const styles = useStyles();
  const { t, tx } = useT();
  const effectivePrice = getEffectivePrice(feature);
  const hasDiscount = effectivePrice < feature.pricing.basePrice;
  const isFree = effectivePrice === 0;
  const canAfford = isFree || balance >= effectivePrice;
  const categoryColor =
    (isDark ? CATEGORY_COLORS : CATEGORY_COLORS_LIGHT)[feature.category] ??
    colors.info;
  const images = getFeatureImages(feature);
  const isSpecialOffer = feature.category === SHOP_CATEGORIES.SPECIAL_OFFER;

  const showManage = isPurchased && !isSpecialOffer;
  const actionEnabled = showManage || isSpecialOffer || canAfford;

  let actionKey:
    | "redeem"
    | "manage"
    | "buy_more"
    | "post_offer"
    | "not_enough" = "redeem";
  if (showManage) actionKey = feature.isOneTime ? "manage" : "buy_more";
  else if (isSpecialOffer) actionKey = "post_offer";
  else if (!canAfford) actionKey = "not_enough";
  const actionLabel = t(`shop.card.actions.${actionKey}`);

  const isPrimaryAction = !showManage && (isSpecialOffer || canAfford);

  return (
    <View style={styles.card}>
      <ShopImageSlider key={feature.featureKey} images={images} height={190} />

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {tx(feature.displayName)}
          </Text>
          <View
            style={[styles.chip, { backgroundColor: `${categoryColor}22` }]}
          >
            <Text
              style={[styles.chipText, { color: categoryColor }]}
              numberOfLines={1}
            >
              {feature.category}
            </Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={3}>
          {tx(feature.description)}
        </Text>

        {feature.isOneTime ? (
          <View style={styles.oneTime}>
            <Text style={styles.oneTimeText}>{t("shop.card.oneTime")}</Text>
          </View>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.priceBlock}>
            {isFree ? (
              <Text style={styles.freeText}>{t("shop.free")}</Text>
            ) : (
              <>
                <CoinIcon size={20} />
                <Text style={styles.priceText}>
                  {formatCoins(effectivePrice)}
                </Text>
                {hasDiscount ? (
                  <Text style={styles.priceStrike}>
                    {formatCoins(feature.pricing.basePrice)}
                  </Text>
                ) : null}
                <Text style={styles.priceUnit}>{t("shop.coins")}</Text>
              </>
            )}
          </View>

          <PressableScale
            accessibilityLabel={`${actionLabel} ${tx(feature.displayName)}`}
            disabled={!actionEnabled}
            onPress={() => {
              analyticsEvents.shopItemActionTapped({
                feature_key: feature.featureKey,
                name: feature.displayName,
                category: feature.category,
                price: effectivePrice,
                action: actionKey,
                can_afford: canAfford,
                is_purchased: isPurchased,
                balance,
              });
              onBuy(feature);
            }}
          >
            <View
              style={[
                styles.action,
                isPrimaryAction && styles.actionPrimary,
                showManage && styles.actionManage,
                !actionEnabled && styles.actionDisabled,
              ]}
            >
              {!actionEnabled ? (
                <LockIcon
                  size={14}
                  color={colors.textMuted}
                  strokeWidth={1.9}
                />
              ) : null}
              <Text
                style={[
                  styles.actionText,
                  isPrimaryAction && styles.actionTextPrimary,
                  !actionEnabled && styles.actionTextDisabled,
                ]}
              >
                {actionLabel}
              </Text>
            </View>
          </PressableScale>
        </View>
      </View>
    </View>
  );
});

const useStyles = makeStyles((t) => ({
  card: {
    borderRadius: Radius.lg,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    overflow: "hidden",
  },
  body: {
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
    color: t.colors.text,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  chip: {
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    maxWidth: 140,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "700",
  },
  description: {
    color: t.colors.textSecondary,
    fontSize: 13.5,
    lineHeight: 19,
  },
  oneTime: {
    alignSelf: "flex-start",
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: t.colors.borderStrong,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  oneTimeText: {
    color: t.colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.xs,
    gap: Spacing.sm,
  },
  priceBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexShrink: 1,
  },
  freeText: {
    color: t.colors.accent,
    fontSize: 20,
    fontWeight: "800",
  },
  priceText: {
    color: t.colors.coin,
    fontSize: 20,
    fontWeight: "800",
  },
  priceStrike: {
    color: t.colors.textMuted,
    fontSize: 13,
    textDecorationLine: "line-through",
  },
  priceUnit: {
    color: t.colors.textSecondary,
    fontSize: 13,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 40,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.base,
    borderWidth: 1,
    borderColor: t.colors.borderStrong,
  },
  actionPrimary: {
    backgroundColor: Brand.coin,
    borderColor: Brand.coin,
  },
  actionManage: {
    borderColor: Brand.primary,
  },
  actionDisabled: {
    borderColor: t.colors.border,
    opacity: 0.7,
  },
  actionText: {
    color: t.colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  actionTextPrimary: {
    color: "#20160B",
  },
  actionTextDisabled: {
    color: t.colors.textMuted,
  },
}));
