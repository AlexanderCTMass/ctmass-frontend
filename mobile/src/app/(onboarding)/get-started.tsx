import { router } from "expo-router";
import { type ComponentType, useEffect, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { BrandLogo } from "@/components/brand-logo";
import {
  type IconProps,
  BrowseJobsIcon,
  MapPinIcon,
  ReviewIcon,
  ShieldCheckIcon,
  TagIcon,
} from "@/components/icons";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { ScreenHeading } from "@/components/onboarding/screen-heading";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { analyticsEvents } from "@/lib/analytics-events";
import { tapFeedback } from "@/lib/haptics";
import { toHref } from "@/lib/navigation";
import { requestNotificationPermission } from "@/lib/notifications";
import { useAppStore } from "@/store/use-app-store";
import { useAuthStore } from "@/store/use-auth-store";
import { useT } from "@/lib/i18n";

type Perk = { id: "perk1" | "perk2" | "perk3"; Icon: ComponentType<IconProps> };

const homeownerPerks: Perk[] = [
  { id: "perk1", Icon: TagIcon },
  { id: "perk2", Icon: ShieldCheckIcon },
  { id: "perk3", Icon: MapPinIcon },
];

const contractorPerks: Perk[] = [
  { id: "perk1", Icon: TagIcon },
  { id: "perk2", Icon: BrowseJobsIcon },
  { id: "perk3", Icon: ReviewIcon },
];

export default function GetStartedScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useT();
  const role = useAppStore((state) => state.role);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const isContractor = role === "contractor";
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loginStartedRef = useRef(false);

  const perks = isContractor ? contractorPerks : homeownerPerks;
  const audience = isContractor ? "contractor" : "homeowner";

  const eyebrow = t("onboarding.getStarted.eyebrow");
  const title = t(`onboarding.getStarted.${audience}.title`);
  const body = t(`onboarding.getStarted.${audience}.body`);

  useEffect(() => {
    analyticsEvents.onboardingGetStartedViewed({ role });
  }, [role]);

  useEffect(() => {
    if (!isAuthenticated || !loginStartedRef.current) return;
    loginStartedRef.current = false;
    if (!useAppStore.getState().hasCompletedOnboarding) {
      analyticsEvents.onboardingCompleted({ role, path: "log_in" });
    }
    completeOnboarding();
  }, [isAuthenticated, role, completeOnboarding]);

  const logIn = () => {
    tapFeedback();
    analyticsEvents.onboardingLogInTapped({ role });
    loginStartedRef.current = true;
    router.push({ pathname: "/auth", params: { next: "/home" } });
  };

  const askNotifications = () => {
    void requestNotificationPermission().then((result) => {
      analyticsEvents.notificationPermissionResult({
        granted: result === "granted",
        source: "onboarding",
      });
    });
  };

  const primaryLabel = t(`onboarding.getStarted.${audience}.cta`);
  const goPrimary = () => {
    analyticsEvents.onboardingPrimaryActionTapped({
      role,
      action: isContractor ? "create_trade" : "create_project",
    });
    askNotifications();
    router.push(
      toHref(
        isContractor
          ? "/contractor-setup-trade"
          : "/homeowner-choose-specialty",
      ),
    );
  };

  const exploreLater = () => {
    tapFeedback();
    analyticsEvents.onboardingExploreLaterTapped({ role });
    askNotifications();
    if (!useAppStore.getState().hasCompletedOnboarding) {
      analyticsEvents.onboardingCompleted({ role, path: "explore_later" });
    }
    completeOnboarding();
    router.replace("/home");
  };

  return (
    <OnboardingShell
      step={6}
      total={6}
      headerRight={
        isAuthenticated ? null : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("onboarding.getStarted.loginA11y")}
            hitSlop={10}
            onPress={logIn}
          >
            <Text style={styles.loginHint}>
              {t("onboarding.getStarted.haveAccount")}{" "}
              <Text style={styles.loginLink}>
                {t("onboarding.getStarted.logIn")}
              </Text>
            </Text>
          </Pressable>
        )
      }
      footer={
        <>
          <PrimaryButton label={primaryLabel} onPress={goPrimary} />
          <Pressable
            accessibilityRole="button"
            hitSlop={10}
            onPress={exploreLater}
          >
            <Text style={styles.secondary}>
              {t("onboarding.getStarted.later")}
            </Text>
          </Pressable>
        </>
      }
    >
      <View style={styles.body}>
        <Animated.View entering={FadeIn.duration(600)} style={styles.logoWrap}>
          <BrandLogo size={92} />
        </Animated.View>
        <ScreenHeading
          eyebrow={eyebrow}
          title={title}
          body={body}
          delay={160}
        />
        <View style={styles.perks}>
          {perks.map((perk, index) => (
            <Animated.View
              key={perk.id}
              entering={FadeInDown.delay(420 + index * 110).duration(520)}
              style={styles.perkRow}
            >
              <View style={styles.perkIcon}>
                <perk.Icon size={18} color={colors.accent} />
              </View>
              <Text style={styles.perkLabel}>
                {t(`onboarding.getStarted.${audience}.${perk.id}`)}
              </Text>
            </Animated.View>
          ))}
        </View>
      </View>
    </OnboardingShell>
  );
}

const useStyles = makeStyles((t) => ({
  body: {
    paddingBottom: Spacing.lg,
  },
  logoWrap: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  perks: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  perkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  perkIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(22,179,100,0.12)",
  },
  perkLabel: {
    color: t.colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  loginHint: {
    color: t.colors.textSecondary,
    fontSize: 13.5,
    fontWeight: "500",
  },
  loginLink: {
    color: t.colors.accent,
    fontWeight: "700",
  },
  secondary: {
    color: t.colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: Spacing.xs,
  },
}));
