import { FlashList } from "@shopify/flash-list";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";

import { CoinIcon } from "@/components/icons";
import { PressableScale } from "@/components/ui/pressable-scale";
import { ScreenBackground } from "@/components/ui/screen-background";
import { ShopCard } from "@/components/shop/shop-card";
import { PurchaseSheet } from "@/components/shop/purchase-sheet";
import { Brand, Colors, Radius, Spacing } from "@/constants/theme";
import {
  formatCoins,
  getEffectivePrice,
  isRoleAllowed,
  type ShopFeature,
} from "@/lib/shop";
import { useShopFeatures, useUserPurchases } from "@/queries/use-shop";
import { useAuthStore } from "@/store/use-auth-store";
import { useLoyaltyStore } from "@/store/use-loyalty-store";

type PriceSort = "default" | "asc" | "desc";

const SORT_OPTIONS: { value: PriceSort; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "asc", label: "Price ↑" },
  { value: "desc", label: "Price ↓" },
];

function SkeletonCard() {
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
  const uid = useAuthStore((state) => state.user?.uid);
  const role = useAuthStore((state) => state.user?.role ?? null);
  const balance = useLoyaltyStore((state) => state.balance);
  const queryClient = useQueryClient();

  const { data: features, isLoading } = useShopFeatures();
  const { data: purchases } = useUserPurchases(uid);

  const [selectedFeature, setSelectedFeature] = useState<ShopFeature | null>(null);
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
    return Array.from(set);
  }, [allowed]);

  const visible = useMemo(() => {
    let list = allowed;
    if (categoryFilter !== "all") {
      list = list.filter((feature) => feature.category === categoryFilter);
    }
    if (priceSort === "asc") {
      list = [...list].sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
    } else if (priceSort === "desc") {
      list = [...list].sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
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

  const handlePurchased = () => {
    void queryClient.invalidateQueries({ queryKey: ["user-purchases", uid ?? ""] });
  };

  const listHeader = (
    <View style={styles.listHeader}>
      <Text style={styles.rewardsTitle}>Available rewards</Text>
      <Text style={styles.rewardsSubtitle}>
        Spend your earned CTMASS Coins on exclusive merch and platform perks.
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        <FilterChip
          label="All"
          active={categoryFilter === "all"}
          onPress={() => setCategoryFilter("all")}
        />
        {categories.map((category) => (
          <FilterChip
            key={category}
            label={category}
            active={categoryFilter === category}
            onPress={() => setCategoryFilter(category)}
          />
        ))}
      </ScrollView>

      <View style={styles.sortRow}>
        {SORT_OPTIONS.map((option) => {
          const active = priceSort === option.value;
          return (
            <PressableScale
              key={option.value}
              onPress={() => setPriceSort(option.value)}
            >
              <View style={[styles.sortPill, active && styles.sortPillActive]}>
                <Text style={[styles.sortText, active && styles.sortTextActive]}>
                  {option.label}
                </Text>
              </View>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.heading}>Shop</Text>
          <View style={styles.balancePill}>
            <CoinIcon size={20} />
            <Text style={styles.balanceText}>{formatCoins(balance)}</Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.skeletonList}>
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : (
          <FlashList
            data={visible}
            keyExtractor={(item) => item.featureKey}
            renderItem={({ item }) => (
              <ShopCard
                feature={item}
                balance={balance}
                isPurchased={purchasedKeys.has(item.featureKey)}
                onBuy={setSelectedFeature}
              />
            )}
            ListHeaderComponent={listHeader}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Animated.View entering={FadeIn.duration(300)} style={styles.empty}>
                <Text style={styles.emptyText}>No items match your filters.</Text>
              </Animated.View>
            }
            showsVerticalScrollIndicator={false}
          />
        )}
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
  return (
    <PressableScale onPress={onPress}>
      <View style={[styles.chip, active && styles.chipActive]}>
        <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
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
    color: Colors.text,
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
    color: Brand.coin,
    fontSize: 16,
    fontWeight: "800",
  },
  listHeader: {
    gap: Spacing.md,
    paddingBottom: Spacing.md,
  },
  rewardsTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  rewardsSubtitle: {
    color: Colors.textSecondary,
    fontSize: 13.5,
    lineHeight: 19,
    marginTop: -6,
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
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipActive: {
    borderColor: Brand.primary,
    backgroundColor: "rgba(22,179,100,0.14)",
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  chipTextActive: {
    color: Colors.text,
  },
  sortRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  sortPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortPillActive: {
    borderColor: Brand.primaryLight,
    backgroundColor: Colors.surface,
  },
  sortText: {
    color: Colors.textMuted,
    fontSize: 12.5,
    fontWeight: "600",
  },
  sortTextActive: {
    color: Colors.text,
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
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  skeletonImage: {
    height: 190,
    backgroundColor: Colors.surfaceStrong,
  },
  skeletonBody: {
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.surfaceStrong,
  },
  empty: {
    alignItems: "center",
    paddingTop: Spacing.xxl,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});
