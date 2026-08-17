import { router } from "expo-router";
import { type ReactElement, useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  CoinIcon,
  HomeIcon,
  type IconProps,
  ResponsesIcon,
  ReviewIcon,
  ShieldCheckIcon,
  ToolsIcon,
} from "@/components/icons";
import { BackButton } from "@/components/ui/back-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Brand, Colors, Radius, Spacing } from "@/constants/theme";
import {
  coinsForRole,
  isRuleEnabledForRole,
  LOYALTY_CATEGORY_COLORS,
  loyaltyRoleKey,
  type LoyaltyRule,
} from "@/lib/loyalty-config";
import { formatCoins } from "@/lib/shop";
import { useLoyaltyRules } from "@/queries/use-loyalty-config";
import { useAuthStore } from "@/store/use-auth-store";
import { useLoyaltyStore } from "@/store/use-loyalty-store";

type ActionIcon = (props: IconProps) => ReactElement;

const CATEGORY_ICON: Record<string, ActionIcon> = {
  onboarding: ShieldCheckIcon,
  project: HomeIcon,
  engagement: ReviewIcon,
  referral: ResponsesIcon,
  review: ReviewIcon,
  admin: ToolsIcon,
};

export default function EarnCoinsScreen() {
  const role = useAuthStore((state) => state.user?.role ?? null);
  const balance = useLoyaltyStore((state) => state.balance);
  const minShopPrice = useLoyaltyStore((state) => state.minShopPrice);
  const { data: rules, isLoading } = useLoyaltyRules();

  const roleKey = loyaltyRoleKey(role);
  const gap = minShopPrice > 0 ? Math.max(0, minShopPrice - balance) : 0;

  const actions = useMemo(() => {
    return (rules ?? [])
      .filter((rule) => isRuleEnabledForRole(rule, roleKey))
      .map((rule) => ({ rule, coins: coinsForRole(rule, roleKey) }))
      .filter((entry) => entry.coins > 0);
  }, [rules, roleKey]);

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.headerTitle}>How to Earn Coins</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Your balance</Text>
            <View style={styles.balanceRow}>
              <CoinIcon size={32} />
              <Text style={styles.balanceValue}>{formatCoins(balance)}</Text>
            </View>
            <Text style={styles.balanceGap}>
              {gap > 0
                ? `Earn ${formatCoins(gap)} more coins to unlock your first shop reward.`
                : minShopPrice > 0
                  ? "You have enough coins for your first shop reward! 🎉"
                  : "Complete actions below to earn CTMASS Coins."}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Ways to earn</Text>
          <Text style={styles.sectionSubtitle}>
            Complete these actions to earn coins and unlock rewards.
          </Text>

          {isLoading && actions.length === 0 ? (
            <View style={styles.loading}>
              <Text style={styles.loadingText}>Loading…</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {actions.map(({ rule, coins }) => (
                <ActionRow key={rule.actionType} rule={rule} coins={coins} />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

function ActionRow({ rule, coins }: { rule: LoyaltyRule; coins: number }) {
  const color = LOYALTY_CATEGORY_COLORS[rule.category] ?? Brand.info;
  const Icon = CATEGORY_ICON[rule.category] ?? ShieldCheckIcon;
  return (
    <View style={styles.actionCard}>
      <View style={[styles.iconCircle, { backgroundColor: `${color}22` }]}>
        <Icon size={22} color={color} />
      </View>
      <View style={styles.actionBody}>
        <View style={styles.actionTopRow}>
          <Text style={styles.actionTitle} numberOfLines={2}>
            {rule.displayName}
          </Text>
          <View style={styles.coinPill}>
            <CoinIcon size={15} />
            <Text style={styles.coinPillText}>+{formatCoins(coins)}</Text>
          </View>
        </View>
        {rule.description ? (
          <Text style={styles.actionDescription}>{rule.description}</Text>
        ) : null}
        {rule.maxPerUser === 1 ? (
          <View style={styles.onceChip}>
            <Text style={styles.onceChipText}>Once only</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    color: Colors.text,
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xxl,
    gap: Spacing.base,
  },
  balanceCard: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    backgroundColor: "rgba(255,193,7,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,193,7,0.28)",
    gap: Spacing.xs,
  },
  balanceLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  balanceValue: {
    color: Brand.coin,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  balanceGap: {
    color: Colors.textSecondary,
    fontSize: 13.5,
    lineHeight: 19,
    marginTop: 2,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  sectionSubtitle: {
    color: Colors.textSecondary,
    fontSize: 13.5,
    lineHeight: 19,
    marginTop: -Spacing.sm - 2,
  },
  loading: {
    paddingVertical: Spacing.xl,
    alignItems: "center",
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  list: {
    gap: Spacing.md,
  },
  actionCard: {
    flexDirection: "row",
    gap: Spacing.md,
    padding: Spacing.base,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBody: {
    flex: 1,
    gap: 5,
  },
  actionTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  actionTitle: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },
  coinPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(255,193,7,0.14)",
  },
  coinPillText: {
    color: Brand.coin,
    fontSize: 13,
    fontWeight: "800",
  },
  actionDescription: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  onceChip: {
    alignSelf: "flex-start",
    marginTop: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  onceChipText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
});
