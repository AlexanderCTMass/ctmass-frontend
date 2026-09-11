import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { CodeBadgeIcon, CoinIcon, ShopIcon } from "@/components/icons";
import { Glow } from "@/components/onboarding/ambient-background";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { ScreenHeading } from "@/components/onboarding/screen-heading";
import { PrimaryButton } from "@/components/ui/primary-button";
import {
  Brand,
  Radius,
  Spacing,
  makeStyles,
  useTheme,
} from "@/constants/theme";
import { analyticsEvents } from "@/lib/analytics-events";
import { useAppStore } from "@/store/use-app-store";

const homeownerActions = [
  "Create your account",
  "Post your first project",
  "Complete your profile",
  "Invite a friend who joins",
];

const contractorActions = [
  "Create your account",
  "Add a portfolio item",
  "Complete your profile",
  "Invite a friend who joins",
];

function FloatingCoin() {
  const styles = useStyles();
  const spin = useSharedValue(0);
  const float = useSharedValue(0);

  useEffect(() => {
    spin.value = withRepeat(
      withTiming(1, { duration: 4600, easing: Easing.linear }),
      -1,
      false,
    );
    float.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [spin, float]);

  const coinStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { translateY: interpolate(float.value, [0, 1], [-6, 6]) },
      { rotateY: `${spin.value * 360}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(float.value, [0, 1], [0.45, 0.8]),
  }));

  return (
    <View style={styles.coinWrap}>
      <Animated.View style={[styles.coinGlow, glowStyle]}>
        <Glow id="coinGlow" size={190} color={Brand.coin} intensity={0.42} />
      </Animated.View>
      <Animated.View entering={FadeIn.duration(600)} style={coinStyle}>
        <CoinIcon size={88} />
      </Animated.View>
    </View>
  );
}

function EarnList({ actions }: { actions: string[] }) {
  const styles = useStyles();
  return (
    <Animated.View
      entering={FadeInDown.delay(420).duration(560)}
      style={styles.earnCard}
    >
      {actions.map((label, index) => (
        <View key={label}>
          {index > 0 ? <View style={styles.divider} /> : null}
          <View style={styles.earnRow}>
            <View style={styles.earnDot}>
              <CoinIcon size={18} />
            </View>
            <Text style={styles.earnLabel}>{label}</Text>
            <Text style={styles.earnPlus}>+ Coins</Text>
          </View>
        </View>
      ))}
    </Animated.View>
  );
}

export default function RewardsScreen() {
  const { gradients } = useTheme();
  const styles = useStyles();
  const role = useAppStore((state) => state.role);
  const actions = role === "contractor" ? contractorActions : homeownerActions;

  useEffect(() => {
    analyticsEvents.onboardingRewardsViewed({ role });
  }, [role]);

  return (
    <OnboardingShell
      step={4}
      total={5}
      centerContent={false}
      footer={
        <PrimaryButton
          label="Next"
          onPress={() => {
            analyticsEvents.onboardingRewardsContinueTapped({ role });
            router.push("/get-started");
          }}
        />
      }
    >
      <View>
        <FloatingCoin />
        <ScreenHeading
          eyebrow="CTMASS Rewards"
          title="Earn CTMASS Coins while you build"
          body="Every meaningful action on the platform earns you coins — no purchases, no subscriptions."
          delay={160}
        />
        <EarnList actions={actions} />
        <Animated.View entering={FadeInDown.delay(720).duration(600)}>
          <LinearGradient
            colors={gradients.shop}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.shopCard}
          >
            <View style={styles.shopHeader}>
              <View style={styles.shopIcon}>
                <ShopIcon size={24} color={Brand.coin} />
              </View>
              <Text style={styles.shopTitle}>CTMASS Shop</Text>
            </View>
            <Text style={styles.shopText}>
              Spend your coins on exclusive merch — and on our own IT services.
            </Text>
            <View style={styles.shopBadge}>
              <CodeBadgeIcon size={18} color={Brand.coin} />
              <Text style={styles.shopBadgeText}>
                IT services — up to 50% off
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </OnboardingShell>
  );
}

const useStyles = makeStyles((t) => ({
  coinWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  coinGlow: {
    position: "absolute",
  },
  earnCard: {
    marginTop: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    paddingHorizontal: Spacing.base,
  },
  divider: {
    height: 1,
    backgroundColor: t.colors.border,
  },
  earnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.base,
  },
  earnDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,193,7,0.12)",
  },
  earnLabel: {
    flex: 1,
    color: t.colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  earnPlus: {
    color: t.colors.coin,
    fontSize: 13,
    fontWeight: "800",
  },
  shopCard: {
    marginTop: Spacing.lg,
    padding: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,193,7,0.28)",
  },
  shopHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  shopIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,193,7,0.14)",
  },
  shopTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  shopText: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13.5,
    lineHeight: 20,
    marginTop: Spacing.md,
  },
  shopBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    alignSelf: "flex-start",
    marginTop: Spacing.base,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(255,193,7,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,193,7,0.4)",
  },
  shopBadgeText: {
    color: Brand.coin,
    fontSize: 13,
    fontWeight: "700",
  },
  shopBadgeStrong: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
}));
