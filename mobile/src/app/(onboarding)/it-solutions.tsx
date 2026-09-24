import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { type ComponentType, useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import {
  CodeBadgeIcon,
  type IconProps,
  MailIcon,
  ShopIcon,
  ToolsIcon,
} from "@/components/icons";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { ScreenHeading } from "@/components/onboarding/screen-heading";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { analyticsEvents } from "@/lib/analytics-events";
import { tapFeedback } from "@/lib/haptics";
import { toHref } from "@/lib/navigation";
import { useAppStore } from "@/store/use-app-store";

type Highlight = { label: string; hint: string; Icon: ComponentType<IconProps> };

const highlights: Highlight[] = [
  {
    label: "Web & mobile apps",
    hint: "Custom sites, iOS/Android apps and web tools.",
    Icon: CodeBadgeIcon,
  },
  {
    label: "AI, CRM & automation",
    hint: "Chatbots, custom CRMs and backend integrations.",
    Icon: ToolsIcon,
  },
  {
    label: "Stores & ongoing support",
    hint: "E-commerce setup, tech support and maintenance.",
    Icon: ShopIcon,
  },
];

export default function ItSolutionsScreen() {
  const { colors, gradients } = useTheme();
  const styles = useStyles();
  const role = useAppStore((state) => state.role);

  useEffect(() => {
    analyticsEvents.onboardingItSolutionsViewed({ role });
  }, [role]);

  const goNext = () => {
    analyticsEvents.onboardingItSolutionsContinueTapped({ role });
    router.push(toHref("/get-started"));
  };

  const goInquiry = () => {
    tapFeedback();
    router.push(toHref("/it-inquiry"));
  };

  return (
    <OnboardingShell
      step={5}
      total={6}
      centerContent={false}
      footer={
        <>
          <PrimaryButton label="Next" onPress={goNext} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Email our team about a project"
            onPress={goInquiry}
          >
            <View style={styles.secondaryBtn}>
              <MailIcon size={18} color={colors.accent} />
              <Text style={styles.secondaryText}>
                Have a project? Email our team
              </Text>
            </View>
          </Pressable>
        </>
      }
    >
      <View>
        <Animated.View entering={FadeIn.duration(600)} style={styles.badgeWrap}>
          <View style={styles.badge}>
            <CodeBadgeIcon size={30} color={colors.accent} />
          </View>
        </Animated.View>
        <ScreenHeading
          eyebrow="CTMASS IT Solutions"
          title="We also build software for your business"
          body="Beyond home services, our own team ships custom web and mobile products to automate and grow your business."
          delay={140}
        />
        <View style={styles.list}>
          {highlights.map((item, index) => (
            <Animated.View
              key={item.label}
              entering={FadeInDown.delay(360 + index * 110).duration(520)}
              style={styles.row}
            >
              <View style={styles.rowIcon}>
                <item.Icon size={20} color={colors.accent} />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Text style={styles.rowHint}>{item.hint}</Text>
              </View>
            </Animated.View>
          ))}
        </View>
        <Animated.View entering={FadeInDown.delay(720).duration(560)}>
          <LinearGradient
            colors={gradients.shop}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.shopCard}
          >
            <Text style={styles.shopTitle}>Two ways to get started</Text>
            <Text style={styles.shopText}>
              Redeem these services with CTMASS Coins in the Shop — or message us
              directly and we&apos;ll email you back at support@ctmass.com.
            </Text>
          </LinearGradient>
        </Animated.View>
      </View>
    </OnboardingShell>
  );
}

const useStyles = makeStyles((t) => ({
  badgeWrap: {
    alignItems: "flex-start",
    marginBottom: Spacing.base,
  },
  badge: {
    width: 60,
    height: 60,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(22,179,100,0.12)",
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.28)",
  },
  list: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.base,
    padding: Spacing.base,
    borderRadius: Radius.md,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(22,179,100,0.12)",
  },
  rowBody: {
    flex: 1,
  },
  rowLabel: {
    color: t.colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  rowHint: {
    color: t.colors.textSecondary,
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 2,
  },
  shopCard: {
    marginTop: Spacing.lg,
    padding: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  shopTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  shopText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13.5,
    lineHeight: 20,
    marginTop: Spacing.sm,
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  secondaryText: {
    color: t.colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
}));
