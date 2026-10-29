import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { type ComponentType, useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import {
  CalendarIcon,
  CodeBadgeIcon,
  type IconProps,
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
import { useT } from "@/lib/i18n";

type Highlight = {
  id: "apps" | "ai" | "stores";
  Icon: ComponentType<IconProps>;
};

const highlights: Highlight[] = [
  {
    id: "apps",
    Icon: CodeBadgeIcon,
  },
  {
    id: "ai",
    Icon: ToolsIcon,
  },
  {
    id: "stores",
    Icon: ShopIcon,
  },
];

export default function ItSolutionsScreen() {
  const { colors, gradients } = useTheme();
  const styles = useStyles();
  const { t } = useT();
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
    analyticsEvents.onboardingItSolutionsBookTapped({ role });
    router.push(toHref("/it-inquiry?source=app-onboarding"));
  };

  return (
    <OnboardingShell
      step={5}
      total={6}
      centerContent={false}
      footer={
        <>
          <PrimaryButton label={t("common.next")} onPress={goNext} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("onboarding.it.bookA11y")}
            onPress={goInquiry}
          >
            <View style={styles.secondaryBtn}>
              <CalendarIcon size={18} color={colors.accent} />
              <Text style={styles.secondaryText}>
                {t("onboarding.it.bookCall")}
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
          eyebrow={t("onboarding.it.eyebrow")}
          title={t("onboarding.it.title")}
          body={t("onboarding.it.body")}
          delay={140}
        />
        <View style={styles.list}>
          {highlights.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeInDown.delay(360 + index * 110).duration(520)}
              style={styles.row}
            >
              <View style={styles.rowIcon}>
                <item.Icon size={20} color={colors.accent} />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowLabel}>
                  {t(`onboarding.it.items.${item.id}.label`)}
                </Text>
                <Text style={styles.rowHint}>
                  {t(`onboarding.it.items.${item.id}.hint`)}
                </Text>
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
            <Text style={styles.shopTitle}>
              {t("onboarding.it.twoWaysTitle")}
            </Text>
            <Text style={styles.shopText}>
              {t("onboarding.it.twoWaysText")}
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
