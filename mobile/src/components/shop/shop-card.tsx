import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { CoinIcon } from "@/components/icons";
import { PressableScale } from "@/components/ui/pressable-scale";
import { ShopImageSlider } from "@/components/shop/shop-image-slider";
import { Brand, Colors, Radius, Spacing } from "@/constants/theme";
import {
  CATEGORY_COLORS,
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

function LockGlyph() {
  return <Text style={styles.lockGlyph}>🔒</Text>;
}

export const ShopCard = memo(function ShopCard({
  feature,
  balance,
  isPurchased,
  onBuy,
}: ShopCardProps) {
  const effectivePrice = getEffectivePrice(feature);
  const hasDiscount = effectivePrice < feature.pricing.basePrice;
  const isFree = effectivePrice === 0;
  const canAfford = isFree || balance >= effectivePrice;
  const categoryColor = CATEGORY_COLORS[feature.category] ?? Brand.info;
  const images = getFeatureImages(feature);
  const isSpecialOffer = feature.category === SHOP_CATEGORIES.SPECIAL_OFFER;

  const showManage = isPurchased && !isSpecialOffer;
  const actionEnabled = showManage || isSpecialOffer || canAfford;

  let actionLabel = "Redeem";
  if (showManage) actionLabel = feature.isOneTime ? "Manage" : "Buy more";
  else if (isSpecialOffer) actionLabel = "Post Offer";
  else if (!canAfford) actionLabel = "Not enough";

  const isPrimaryAction = !showManage && (isSpecialOffer || canAfford);

  return (
    <View style={styles.card}>
      <ShopImageSlider images={images} height={190} />

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {feature.displayName}
          </Text>
          <View
            style={[styles.chip, { backgroundColor: `${categoryColor}22` }]}
          >
            <Text style={[styles.chipText, { color: categoryColor }]} numberOfLines={1}>
              {feature.category}
            </Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={3}>
          {feature.description}
        </Text>

        {feature.isOneTime ? (
          <View style={styles.oneTime}>
            <Text style={styles.oneTimeText}>One-time purchase</Text>
          </View>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.priceBlock}>
            {isFree ? (
              <Text style={styles.freeText}>Free</Text>
            ) : (
              <>
                <CoinIcon size={20} />
                <Text style={styles.priceText}>{formatCoins(effectivePrice)}</Text>
                {hasDiscount ? (
                  <Text style={styles.priceStrike}>
                    {formatCoins(feature.pricing.basePrice)}
                  </Text>
                ) : null}
                <Text style={styles.priceUnit}>coins</Text>
              </>
            )}
          </View>

          <PressableScale
            accessibilityLabel={`${actionLabel} ${feature.displayName}`}
            disabled={!actionEnabled}
            onPress={() => onBuy(feature)}
          >
            <View
              style={[
                styles.action,
                isPrimaryAction && styles.actionPrimary,
                showManage && styles.actionManage,
                !actionEnabled && styles.actionDisabled,
              ]}
            >
              {!actionEnabled ? <LockGlyph /> : null}
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

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.text,
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
    color: Colors.textSecondary,
    fontSize: 13.5,
    lineHeight: 19,
  },
  oneTime: {
    alignSelf: "flex-start",
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  oneTimeText: {
    color: Colors.textSecondary,
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
    color: Brand.primaryLight,
    fontSize: 20,
    fontWeight: "800",
  },
  priceText: {
    color: Brand.coin,
    fontSize: 20,
    fontWeight: "800",
  },
  priceStrike: {
    color: Colors.textMuted,
    fontSize: 13,
    textDecorationLine: "line-through",
  },
  priceUnit: {
    color: Colors.textSecondary,
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
    borderColor: Colors.borderStrong,
  },
  actionPrimary: {
    backgroundColor: Brand.coin,
    borderColor: Brand.coin,
  },
  actionManage: {
    borderColor: Brand.primary,
  },
  actionDisabled: {
    borderColor: Colors.border,
    opacity: 0.7,
  },
  actionText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  actionTextPrimary: {
    color: "#20160B",
  },
  actionTextDisabled: {
    color: Colors.textMuted,
  },
  lockGlyph: {
    fontSize: 12,
  },
});
