import { router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { BrandLogo } from "@/components/brand-logo";
import {
  type IconProps,
  MapPinIcon,
  ShieldCheckIcon,
  TagIcon,
} from "@/components/icons";
import { Glow } from "@/components/onboarding/ambient-background";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { ScreenHeading } from "@/components/onboarding/screen-heading";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Brand, Colors, Radius, Spacing } from "@/constants/theme";

const highlights: {
  label: string;
  Icon: (p: IconProps) => React.JSX.Element;
}[] = [
  { label: "Always free", Icon: TagIcon },
  { label: "Verified pros", Icon: ShieldCheckIcon },
  { label: "Local first", Icon: MapPinIcon },
];

function Pill({
  label,
  Icon,
  delay,
}: {
  label: string;
  Icon: (p: IconProps) => React.JSX.Element;
  delay: number;
}) {
  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(520)}
      style={styles.pill}
    >
      <Icon size={16} color={Brand.primaryLight} strokeWidth={2} />
      <Text style={styles.pillLabel}>{label}</Text>
    </Animated.View>
  );
}

function LogoBadge() {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [pulse]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + pulse.value * 0.5,
    transform: [{ scale: 0.9 + pulse.value * 0.16 }],
  }));

  return (
    <View style={styles.logoWrap}>
      <Animated.View style={[styles.logoGlow, glowStyle]}>
        <Glow id="logoGlow" size={260} color={Brand.primary} intensity={0.5} />
      </Animated.View>
      <Animated.View entering={FadeIn.duration(700)}>
        <BrandLogo size={104} />
      </Animated.View>
    </View>
  );
}

export default function WelcomeScreen() {
  return (
    <OnboardingShell
      step={1}
      total={4}
      onSkip={() => router.push("/role")}
      footer={
        <>
          <PrimaryButton
            label="See how it works"
            onPress={() => router.push("/how-it-works")}
          />
          <Text style={styles.footerNote}>
            Built by a licensed contractor, for our neighbors.
          </Text>
        </>
      }
    >
      <View style={styles.body}>
        <LogoBadge />
        <ScreenHeading
          eyebrow="Massachusetts & Connecticut"
          title="Home projects, done the local way"
          body="CTMASS connects homeowners with trusted, verified contractors nearby. No hidden fees, no paid leads — the platform is free for everyone."
          delay={220}
        />
        <View style={styles.pills}>
          {highlights.map((item, index) => (
            <Pill
              key={item.label}
              label={item.label}
              Icon={item.Icon}
              delay={520 + index * 90}
            />
          ))}
        </View>
        <Animated.View
          entering={FadeInDown.delay(820).duration(600)}
          style={styles.quote}
        >
          <Text style={styles.quoteText}>
            “I see their dedication, their skill, and their challenges — and I
            wanted to build something to support them and the homeowners they
            serve.”
          </Text>
          <Text style={styles.quoteAuthor}>
            Yakov · Founder, licensed Construction Supervisor & HVAC technician
          </Text>
        </Animated.View>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingBottom: Spacing.lg,
  },
  logoWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  logoGlow: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillLabel: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  quote: {
    marginTop: Spacing.xl,
    padding: Spacing.base,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceStrong,
    borderLeftWidth: 3,
    borderLeftColor: Brand.primary,
  },
  quoteText: {
    color: "#EEF3F1",
    fontSize: 14.5,
    lineHeight: 22,
    fontStyle: "italic",
  },
  quoteAuthor: {
    color: Colors.textSecondary,
    fontSize: 12.5,
    fontWeight: "700",
    marginTop: Spacing.sm,
  },
  footerNote: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
  },
});
