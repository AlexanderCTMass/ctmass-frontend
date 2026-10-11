import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CoinIcon, ShopIcon } from "@/components/icons";
import { BackButton } from "@/components/ui/back-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { analyticsEvents } from "@/lib/analytics-events";
import {
  DEFAULT_SHOP_ITEMS,
  formatCoins,
  getFeatureImages,
  type ShopFeature,
  type ShopOrder,
} from "@/lib/shop";
import { useShopFeatures, useUserOrders } from "@/queries/use-shop";
import { useAuthStore } from "@/store/use-auth-store";

const STATUS_LABELS: Record<string, string> = {
  active: "Order received",
  processing: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
  expired: "Expired",
  refunded: "Refunded",
};

const CLOSED_STATUSES = new Set(["cancelled", "expired", "refunded"]);

function statusLabel(status: string): string {
  if (STATUS_LABELS[status]) return STATUS_LABELS[status];
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : "Order received";
}

function formatOrderDate(date: Date | null): string {
  if (!date) return "Just now";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function orderDetails(order: ShopOrder, feature: ShopFeature | undefined): string {
  const sized = order.items.filter((item) => item.size);
  if (sized.length > 0) {
    return sized.map((item) => `${item.size} × ${item.quantity}`).join(", ");
  }
  const selected = feature?.pricing.packages?.find(
    (item) => item.id === order.packageId,
  );
  if (selected) return selected.displayName;
  return `Quantity: ${order.totalQuantity}`;
}

export default function ShopOrdersScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const uid = useAuthStore((state) => state.user?.uid);
  const orders = useUserOrders(uid);
  const { data: features } = useShopFeatures();

  const featureByKey = useMemo(() => {
    const map = new Map<string, ShopFeature>();
    DEFAULT_SHOP_ITEMS.forEach((feature) => map.set(feature.featureKey, feature));
    (features ?? []).forEach((feature) => map.set(feature.featureKey, feature));
    return map;
  }, [features]);

  const count = orders.data?.length;
  const viewedRef = useRef(false);
  useEffect(() => {
    if (viewedRef.current || count === undefined) return;
    viewedRef.current = true;
    analyticsEvents.shopOrdersViewed({ count });
  }, [count]);

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <View style={styles.headerText}>
            <Text style={styles.title}>My orders</Text>
            <Text style={styles.subtitle}>
              Everything you redeemed with CTMASS Coins.
            </Text>
          </View>
        </View>

        {orders.isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : (
          <FlatList
            data={orders.data ?? []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            showsVerticalScrollIndicator={false}
            refreshing={orders.isRefetching}
            onRefresh={() => void orders.refetch()}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>
                  {orders.isError ? "Couldn't load your orders" : "No orders yet"}
                </Text>
                <Text style={styles.emptyText}>
                  {orders.isError
                    ? "Check your connection and pull down to try again."
                    : "Rewards you redeem in the Shop will show up here with their ticket number."}
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const feature = featureByKey.get(item.featureKey);
              const image = feature ? getFeatureImages(feature)[0] : undefined;
              const closed = CLOSED_STATUSES.has(item.status);
              return (
                <View style={styles.card}>
                  {image ? (
                    <Image
                      source={{ uri: image }}
                      style={styles.thumb}
                      contentFit="cover"
                      transition={150}
                    />
                  ) : (
                    <View style={[styles.thumb, styles.thumbFallback]}>
                      <ShopIcon size={24} color={colors.textMuted} />
                    </View>
                  )}
                  <View style={styles.body}>
                    <Text style={styles.name} numberOfLines={2}>
                      {feature?.displayName ?? item.featureKey}
                    </Text>
                    <Text style={styles.details} numberOfLines={2}>
                      {orderDetails(item, feature)}
                    </Text>
                    <Text style={styles.meta}>
                      {formatOrderDate(item.purchasedAt)}
                      {item.ticketNumber ? ` · Ticket #${item.ticketNumber}` : ""}
                    </Text>
                    <View style={styles.footer}>
                      <View
                        style={[styles.badge, closed && styles.badgeClosed]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            closed && styles.badgeTextClosed,
                          ]}
                        >
                          {statusLabel(item.status)}
                        </Text>
                      </View>
                      <View style={styles.price}>
                        <CoinIcon size={16} />
                        <Text style={styles.priceText}>
                          {item.price > 0 ? formatCoins(item.price) : "Free"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            }}
          />
        )}
      </SafeAreaView>
    </ScreenBackground>
  );
}

const useStyles = makeStyles((t) => ({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: t.colors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  subtitle: {
    color: t.colors.textMuted,
    fontSize: 12.5,
    marginTop: 2,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    flexGrow: 1,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  separator: {
    height: Spacing.md,
  },
  card: {
    flexDirection: "row",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  thumb: {
    width: 76,
    height: 76,
    borderRadius: Radius.sm,
    backgroundColor: t.colors.surfaceStrong,
  },
  thumbFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    gap: 3,
  },
  name: {
    color: t.colors.text,
    fontSize: 15.5,
    fontWeight: "700",
  },
  details: {
    color: t.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  meta: {
    color: t.colors.textMuted,
    fontSize: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: t.isDark ? "rgba(22,179,100,0.16)" : "rgba(22,179,100,0.12)",
  },
  badgeClosed: {
    backgroundColor: t.colors.surfaceStrong,
  },
  badgeText: {
    color: t.colors.accent,
    fontSize: 11.5,
    fontWeight: "700",
  },
  badgeTextClosed: {
    color: t.colors.textSecondary,
  },
  price: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priceText: {
    color: t.colors.coin,
    fontSize: 14.5,
    fontWeight: "800",
  },
  empty: {
    alignItems: "center",
    paddingTop: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  emptyTitle: {
    color: t.colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  emptyText: {
    color: t.colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
}));
