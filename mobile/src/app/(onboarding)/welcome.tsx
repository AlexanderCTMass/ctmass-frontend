import { router } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";
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
import {
  Brand,
  Radius,
  Spacing,
  makeStyles,
  useTheme,
} from "@/constants/theme";
import { analyticsEvents } from "@/lib/analytics-events";
import { useT } from "@/lib/i18n";

const highlights: {
  id: "free" | "trusted" | "local";
  Icon: (p: IconProps) => React.JSX.Element;
}[] = [
  { id: "free", Icon: TagIcon },
  { id: "trusted", Icon: ShieldCheckIcon },
  { id: "local", Icon: MapPinIcon },
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
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(520)}
      style={styles.pill}
    >
      <Icon size={16} color={colors.accent} strokeWidth={2} />
      <Text style={styles.pillLabel}>{label}</Text>
    </Animated.View>
  );
}

function LogoBadge() {
  const styles = useStyles();
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
  const styles = useStyles();
  const { t } = useT();

  useEffect(() => {
    analyticsEvents.onboardingWelcomeViewed();
  }, []);

  return (
    <OnboardingShell
      step={1}
      total={6}
      footer={
        <>
          <PrimaryButton
            label={t("onboarding.welcome.cta")}
            onPress={() => {
              analyticsEvents.onboardingWelcomeContinueTapped();
              router.push("/role");
            }}
          />
          <Text style={styles.footerNote}>
            {t("onboarding.welcome.footer")}
          </Text>
        </>
      }
    >
      <View style={styles.body}>
        <LogoBadge />
        <ScreenHeading
          eyebrow={t("onboarding.welcome.eyebrow")}
          title={t("onboarding.welcome.title")}
          body={t("onboarding.welcome.body")}
          delay={220}
        />
        <View style={styles.pills}>
          {highlights.map((item, index) => (
            <Pill
              key={item.id}
              label={t(`onboarding.welcome.pills.${item.id}`)}
              Icon={item.Icon}
              delay={520 + index * 90}
            />
          ))}
        </View>
        <Animated.View
          entering={FadeInDown.delay(820).duration(600)}
          style={styles.quote}
        >
          <Text style={styles.quoteText}>{t("onboarding.welcome.quote")}</Text>
          <Text style={styles.quoteAuthor}>
            {t("onboarding.welcome.quoteAuthor")}
          </Text>
        </Animated.View>
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
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  pillLabel: {
    color: t.colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  quote: {
    marginTop: Spacing.xl,
    padding: Spacing.base,
    borderRadius: Radius.md,
    backgroundColor: t.colors.surfaceStrong,
    borderLeftWidth: 3,
    borderLeftColor: Brand.primary,
  },
  quoteText: {
    color: t.isDark ? "#EEF3F1" : t.colors.text,
    fontSize: 14.5,
    lineHeight: 22,
    fontStyle: "italic",
  },
  quoteAuthor: {
    color: t.colors.textSecondary,
    fontSize: 12.5,
    fontWeight: "700",
    marginTop: Spacing.sm,
  },
  footerNote: {
    color: t.colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
  },
}));
