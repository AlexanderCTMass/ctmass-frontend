import { router } from "expo-router";
import { type ReactElement, useEffect, useMemo, useRef } from "react";
import { ScrollView, Text, View } from "react-native";
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
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import {
  coinsForRole,
  isRuleEnabledForRole,
  LOYALTY_CATEGORY_COLORS,
  LOYALTY_CATEGORY_COLORS_LIGHT,
  loyaltyRoleKey,
  type LoyaltyRule,
} from "@/lib/loyalty-config";
import { analyticsEvents } from "@/lib/analytics-events";
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
  const styles = useStyles();
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

  const viewedRef = useRef(false);
  useEffect(() => {
    if (isLoading || viewedRef.current) return;
    viewedRef.current = true;
    analyticsEvents.earnCoinsViewed({
      balance,
      gap,
      actions_count: actions.length,
    });
  }, [isLoading, balance, gap, actions.length]);

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
            <View style={styles.list}>
              {[0, 1, 2, 3, 4].map((key) => (
                <SkeletonActionCard key={key} />
              ))}
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

function SkeletonActionCard() {
  const styles = useStyles();
  return (
    <View style={styles.actionCard}>
      <View style={styles.skelIcon} />
      <View style={styles.actionBody}>
        <View style={[styles.skelLine, { width: "55%" }]} />
        <View style={[styles.skelLine, { width: "90%", height: 10 }]} />
        <View style={[styles.skelLine, { width: "70%", height: 10 }]} />
      </View>
    </View>
  );
}

function ActionRow({ rule, coins }: { rule: LoyaltyRule; coins: number }) {
  const { colors, isDark } = useTheme();
  const styles = useStyles();
  const color =
    (isDark ? LOYALTY_CATEGORY_COLORS : LOYALTY_CATEGORY_COLORS_LIGHT)[
      rule.category
    ] ?? colors.info;
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
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    color: t.colors.text,
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
    color: t.colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  balanceValue: {
    color: t.colors.coin,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  balanceGap: {
    color: t.colors.textSecondary,
    fontSize: 13.5,
    lineHeight: 19,
    marginTop: 2,
  },
  sectionTitle: {
    color: t.colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  sectionSubtitle: {
    color: t.colors.textSecondary,
    fontSize: 13.5,
    lineHeight: 19,
    marginTop: -Spacing.sm - 2,
  },
  list: {
    gap: Spacing.md,
  },
  skelIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: t.colors.surfaceStrong,
  },
  skelLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: t.colors.surfaceStrong,
  },
  actionCard: {
    flexDirection: "row",
    gap: Spacing.md,
    padding: Spacing.base,
    borderRadius: Radius.md,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
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
    color: t.colors.text,
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
    color: t.colors.coin,
    fontSize: 13,
    fontWeight: "800",
  },
  actionDescription: {
    color: t.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  onceChip: {
    alignSelf: "flex-start",
    marginTop: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: t.colors.borderStrong,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  onceChipText: {
    color: t.colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
}));
