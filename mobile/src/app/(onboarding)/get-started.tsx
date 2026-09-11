import { router } from "expo-router";
import { type ComponentType, useEffect } from "react";
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

type Perk = { label: string; Icon: ComponentType<IconProps> };

const homeownerPerks: Perk[] = [
  { label: "Free to post — always", Icon: TagIcon },
  { label: "Verified local specialists", Icon: ShieldCheckIcon },
  { label: "Matched near your address", Icon: MapPinIcon },
];

const contractorPerks: Perk[] = [
  { label: "Free to list your trade", Icon: TagIcon },
  { label: "Get matched with local jobs", Icon: BrowseJobsIcon },
  { label: "Build your reputation with reviews", Icon: ReviewIcon },
];

export default function GetStartedScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const role = useAppStore((state) => state.role);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const isContractor = role === "contractor";

  const perks = isContractor ? contractorPerks : homeownerPerks;

  const eyebrow = "You're all set";
  const title = isContractor
    ? "Start getting local jobs"
    : "Find your specialist in about a minute";
  const body = isContractor
    ? "Create your trade so nearby homeowners can find and message you. It only takes about a minute."
    : "Tell us what you need and where you are — we'll match you with trusted pros nearby. No calls, no pressure.";

  useEffect(() => {
    analyticsEvents.onboardingGetStartedViewed({ role });
  }, [role]);

  const askNotifications = () => {
    void requestNotificationPermission().then((granted) => {
      analyticsEvents.notificationPermissionResult({
        granted,
        source: "onboarding",
      });
    });
  };

  const primaryLabel = isContractor ? "Create my trade" : "Create my project";
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
      step={5}
      total={5}
      footer={
        <>
          <PrimaryButton label={primaryLabel} onPress={goPrimary} />
          <Pressable
            accessibilityRole="button"
            hitSlop={10}
            onPress={exploreLater}
          >
            <Text style={styles.secondary}>
              I&apos;m just exploring — maybe later
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
              key={perk.label}
              entering={FadeInDown.delay(420 + index * 110).duration(520)}
              style={styles.perkRow}
            >
              <View style={styles.perkIcon}>
                <perk.Icon size={18} color={colors.accent} />
              </View>
              <Text style={styles.perkLabel}>{perk.label}</Text>
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
  secondary: {
    color: t.colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: Spacing.xs,
  },
}));
