import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";

import { ArrowDownIcon, ArrowUpIcon, CoinIcon } from "@/components/icons";
import { PressableScale } from "@/components/ui/pressable-scale";
import { ScreenBackground } from "@/components/ui/screen-background";
import { ShopCard } from "@/components/shop/shop-card";
import { PurchaseSheet } from "@/components/shop/purchase-sheet";
import {
  Brand,
  Radius,
  Spacing,
  makeStyles,
  useTheme,
} from "@/constants/theme";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { analyticsEvents } from "@/lib/analytics-events";
import { tapFeedback } from "@/lib/haptics";
import { toHref } from "@/lib/navigation";
import {
  formatCoins,
  getEffectivePrice,
  getFeatureImages,
  isRoleAllowed,
  SHOP_CATEGORIES,
  type ShopFeature,
} from "@/lib/shop";
import { useShopFeatures, useUserPurchases } from "@/queries/use-shop";
import { useAuthStore } from "@/store/use-auth-store";
import { useLoyaltyStore } from "@/store/use-loyalty-store";

type PriceSort = "default" | "asc" | "desc";

const SORT_OPTIONS: { value: PriceSort; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "asc", label: "Price" },
  { value: "desc", label: "Price" },
];

const CATEGORY_ORDER: string[] = [
  SHOP_CATEGORIES.MERCHANDISE,
  SHOP_CATEGORIES.IT_SERVICES,
  SHOP_CATEGORIES.CONSTRUCTION,
  SHOP_CATEGORIES.SPECIAL_OFFER,
];

function SkeletonCard() {
  const styles = useStyles();
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonBody}>
        <View style={[styles.skeletonLine, { width: "60%" }]} />
        <View style={[styles.skeletonLine, { width: "90%" }]} />
        <View style={[styles.skeletonLine, { width: "40%" }]} />
      </View>
    </View>
  );
}

export default function ShopTab() {
  const { colors } = useTheme();
  const styles = useStyles();
  const uid = useAuthStore((state) => state.user?.uid);
  const role = useAuthStore((state) => state.user?.role ?? null);
  const balance = useLoyaltyStore((state) => state.balance);
  const queryClient = useQueryClient();

  const requireAuth = useRequireAuth();
  const { data: features, isLoading } = useShopFeatures();
  const { data: purchases } = useUserPurchases(uid);

  const [selectedFeature, setSelectedFeature] = useState<ShopFeature | null>(
    null,
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priceSort, setPriceSort] = useState<PriceSort>("default");

  const allowed = useMemo(
    () => (features ?? []).filter((feature) => isRoleAllowed(role, feature)),
    [features, role],
  );

  const categories = useMemo(() => {
    const set = new Set<string>();
    allowed.forEach((feature) => {
      if (feature.category) set.add(feature.category);
    });
    const rank = (category: string) => {
      const index = CATEGORY_ORDER.indexOf(category);
      return index === -1 ? CATEGORY_ORDER.length : index;
    };
    return Array.from(set).sort((a, b) => rank(a) - rank(b));
  }, [allowed]);

  const visible = useMemo(() => {
    let list = allowed;
    if (categoryFilter !== "all") {
      list = list.filter((feature) => feature.category === categoryFilter);
    }
    if (priceSort === "asc") {
      list = [...list].sort(
        (a, b) => getEffectivePrice(a) - getEffectivePrice(b),
      );
    } else if (priceSort === "desc") {
      list = [...list].sort(
        (a, b) => getEffectivePrice(b) - getEffectivePrice(a),
      );
    }
    return list;
  }, [allowed, categoryFilter, priceSort]);

  const purchasedKeys = useMemo(
    () =>
      new Set(
        (purchases ?? [])
          .filter((purchase) => purchase.status === "active")
          .map((purchase) => purchase.featureKey),
      ),
    [purchases],
  );

  const isShopEmpty = !isLoading && visible.length === 0;

  useEffect(() => {
    if (isShopEmpty) {
      analyticsEvents.shopEmptyStateShown({
        category: categoryFilter,
        sort: priceSort,
      });
    }
  }, [isShopEmpty, categoryFilter, priceSort]);

  useEffect(() => {
    if (!features) return;
    const urls = features.flatMap((feature) => getFeatureImages(feature));
    if (urls.length > 0) void Image.prefetch(urls, { cachePolicy: "memory-disk" });
  }, [features]);

  const changeCategory = (category: string) => {
    if (category !== categoryFilter) {
      analyticsEvents.shopCategoryFilterChanged({
        category,
        previous: categoryFilter,
      });
    }
    setCategoryFilter(category);
  };

  const changeSort = (sort: PriceSort) => {
    if (sort !== priceSort) {
      analyticsEvents.shopSortChanged({ sort, previous: priceSort });
    }
    setPriceSort(sort);
  };

  const handleBuy = (feature: ShopFeature) => {
    if (!requireAuth()) return;
    setSelectedFeature(feature);
  };

  const handlePurchased = () => {
    void queryClient.invalidateQueries({
      queryKey: ["user-purchases", uid ?? ""],
    });
  };

  const listHeader = (
    <View style={styles.listHeader}>
      <Text style={styles.rewardsTitle}>Available rewards</Text>
      <Text style={styles.rewardsSubtitle}>
        Spend your earned CTMASS Coins on exclusive merch and platform perks.
      </Text>

      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          <FilterChip
            label="All"
            active={categoryFilter === "all"}
            onPress={() => changeCategory("all")}
          />
          {categories.map((category) => (
            <FilterChip
              key={category}
              label={category}
              active={categoryFilter === category}
              onPress={() => changeCategory(category)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.filterDivider} />

      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Sort by</Text>
        <View style={styles.sortRow}>
          {SORT_OPTIONS.map((option) => {
            const active = priceSort === option.value;
            const arrowColor = active ? colors.text : colors.textMuted;
            return (
              <PressableScale
                key={option.value}
                onPress={() => changeSort(option.value)}
              >
                <View
                  style={[styles.sortPill, active && styles.sortPillActive]}
                >
                  <Text
                    style={[styles.sortText, active && styles.sortTextActive]}
                  >
                    {option.label}
                  </Text>
                  {option.value === "asc" ? (
                    <ArrowUpIcon
                      size={14}
                      color={arrowColor}
                      strokeWidth={2.2}
                    />
                  ) : null}
                  {option.value === "desc" ? (
                    <ArrowDownIcon
                      size={14}
                      color={arrowColor}
                      strokeWidth={2.2}
                    />
                  ) : null}
                </View>
              </PressableScale>
            );
          })}
        </View>
      </View>
    </View>
  );

  const openEarnScreen = () => {
    tapFeedback();
    analyticsEvents.shopBalanceTapped({ balance });
    router.push(toHref("/earn-coins"));
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.heading}>Shop</Text>
          <PressableScale
            accessibilityLabel="View your coin balance and ways to earn"
            onPress={openEarnScreen}
          >
            <View style={styles.balancePill}>
              <CoinIcon size={20} />
              <Text style={styles.balanceText}>{formatCoins(balance)}</Text>
              <View style={styles.balancePlus}>
                <ArrowUpIcon size={12} color={colors.coin} strokeWidth={2.6} />
              </View>
            </View>
          </PressableScale>
        </View>

        <FlashList
          data={visible}
          keyExtractor={(item) => item.featureKey}
          ListHeaderComponent={listHeader}
          renderItem={({ item }) => (
            <ShopCard
              feature={item}
              balance={balance}
              isPurchased={purchasedKeys.has(item.featureKey)}
              onBuy={handleBuy}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            isLoading ? (
              <View style={styles.skeletonList}>
                <SkeletonCard />
                <SkeletonCard />
              </View>
            ) : (
              <Animated.View
                entering={FadeIn.duration(300)}
                style={styles.empty}
              >
                <Text style={styles.emptyText}>
                  No items match your filters.
                </Text>
              </Animated.View>
            )
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>

      <PurchaseSheet
        feature={selectedFeature}
        userId={uid}
        userRole={role}
        balance={balance}
        onClose={() => setSelectedFeature(null)}
        onPurchased={handlePurchased}
      />
    </ScreenBackground>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const styles = useStyles();
  return (
    <PressableScale onPress={onPress}>
      <View style={[styles.chip, active && styles.chipActive]}>
        <Text style={[styles.chipText, active && styles.chipTextActive]}>
          {label}
        </Text>
      </View>
    </PressableScale>
  );
}

const useStyles = makeStyles((t) => ({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  heading: {
    color: t.colors.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  balancePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(255,193,7,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,193,7,0.3)",
  },
  balanceText: {
    color: t.colors.coin,
    fontSize: 16,
    fontWeight: "800",
  },
  balancePlus: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,193,7,0.18)",
    marginLeft: 2,
  },
  listHeader: {
    gap: Spacing.md,
    paddingBottom: Spacing.md,
  },
  rewardsTitle: {
    color: t.colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  rewardsSubtitle: {
    color: t.colors.textSecondary,
    fontSize: 13.5,
    lineHeight: 19,
    marginTop: -6,
  },
  filterGroup: {
    gap: Spacing.sm,
  },
  filterLabel: {
    color: t.colors.textMuted,
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  filterDivider: {
    height: 1,
    backgroundColor: t.colors.border,
    marginVertical: Spacing.xs,
  },
  chipsRow: {
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  chipActive: {
    borderColor: Brand.primary,
    backgroundColor: "rgba(22,179,100,0.14)",
  },
  chipText: {
    color: t.colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  chipTextActive: {
    color: t.colors.text,
  },
  sortRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  sortPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  sortPillActive: {
    borderColor: t.colors.accent,
    backgroundColor: t.colors.surface,
  },
  sortText: {
    color: t.colors.textMuted,
    fontSize: 12.5,
    fontWeight: "600",
  },
  sortTextActive: {
    color: t.colors.text,
  },
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xxl,
  },
  separator: {
    height: Spacing.base,
  },
  skeletonList: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    gap: Spacing.base,
  },
  skeletonCard: {
    borderRadius: Radius.lg,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    overflow: "hidden",
  },
  skeletonImage: {
    height: 190,
    backgroundColor: t.colors.surfaceStrong,
  },
  skeletonBody: {
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: t.colors.surfaceStrong,
  },
  empty: {
    alignItems: "center",
    paddingTop: Spacing.xxl,
  },
  emptyText: {
    color: t.colors.textSecondary,
    fontSize: 14,
  },
}));
