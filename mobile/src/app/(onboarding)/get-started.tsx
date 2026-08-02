import { router } from "expo-router";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { BrandLogo } from "@/components/brand-logo";
import { MapPinIcon, ShieldCheckIcon, TagIcon } from "@/components/icons";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { ScreenHeading } from "@/components/onboarding/screen-heading";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Brand, Colors, Radius, Spacing } from "@/constants/theme";
import { tapFeedback } from "@/lib/haptics";
import { useAppStore } from "@/store/use-app-store";

const perks = [
  { label: "Free to post — always", Icon: TagIcon },
  { label: "Verified local specialists", Icon: ShieldCheckIcon },
  { label: "Matched near your address", Icon: MapPinIcon },
];

export default function GetStartedScreen() {
  const role = useAppStore((state) => state.role);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const isContractor = role === "contractor";

  useEffect(() => {
    if (isContractor) {
      completeOnboarding();
      router.replace("/auth");
    }
  }, [isContractor, completeOnboarding]);

  if (isContractor) {
    return <View style={styles.blank} />;
  }

  const exploreLater = () => {
    tapFeedback();
    completeOnboarding();
    router.replace("/auth");
  };

  return (
    <OnboardingShell
      step={5}
      total={5}
      footer={
        <>
          <PrimaryButton
            label="Create my project"
            onPress={() => router.push("/homeowner-choose-specialty")}
          />
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
          eyebrow="You're all set"
          title="Find your specialist in about a minute"
          body="Tell us what you need and where you are — we'll match you with trusted pros nearby. No calls, no pressure."
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
                <perk.Icon size={18} color={Brand.primaryLight} />
              </View>
              <Text style={styles.perkLabel}>{perk.label}</Text>
            </Animated.View>
          ))}
        </View>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  blank: {
    flex: 1,
    backgroundColor: Colors.background,
  },
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
    color: Colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  secondary: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: Spacing.xs,
  },
});
