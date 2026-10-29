import { router } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import {
  BrowseJobsIcon,
  CheckIcon,
  HardHatIcon,
  type IconProps,
  ResponsesIcon,
  ReviewIcon,
  SelectSpecialistIcon,
  SendIcon,
  SubmitRequestIcon,
} from "@/components/icons";
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
import { useT } from "@/lib/i18n";

type Step = {
  id: "step1" | "step2" | "step3" | "step4";
  Icon: (props: IconProps) => React.JSX.Element;
};

const homeownerSteps: Step[] = [
  { id: "step1", Icon: SubmitRequestIcon },
  { id: "step2", Icon: ResponsesIcon },
  { id: "step3", Icon: SelectSpecialistIcon },
  { id: "step4", Icon: CheckIcon },
];

const contractorSteps: Step[] = [
  { id: "step1", Icon: HardHatIcon },
  { id: "step2", Icon: BrowseJobsIcon },
  { id: "step3", Icon: SendIcon },
  { id: "step4", Icon: ReviewIcon },
];

function StepRow({
  step,
  audience,
  index,
  isLast,
}: {
  step: Step;
  audience: "homeowner" | "contractor";
  index: number;
  isLast: boolean;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useT();
  const { Icon } = step;

  return (
    <Animated.View
      entering={FadeInDown.delay(320 + index * 130).duration(560)}
      style={styles.row}
    >
      <View style={styles.leftColumn}>
        <View style={styles.iconWrap}>
          <Icon size={24} color={colors.accent} />
        </View>
        {isLast ? null : <View style={styles.connector} />}
      </View>
      <View style={styles.content}>
        <View style={styles.titleLine}>
          <Text style={styles.stepNumber}>
            {String(index + 1).padStart(2, "0")}
          </Text>
          <Text style={styles.title}>
            {t(`onboarding.howItWorks.${audience}.${step.id}.title`)}
          </Text>
        </View>
        <Text style={styles.description}>
          {t(`onboarding.howItWorks.${audience}.${step.id}.description`)}
        </Text>
      </View>
    </Animated.View>
  );
}

export default function HowItWorksScreen() {
  const styles = useStyles();
  const { t } = useT();
  const role = useAppStore((state) => state.role);
  const isContractor = role === "contractor";
  const steps = isContractor ? contractorSteps : homeownerSteps;
  const audience = isContractor ? "contractor" : "homeowner";

  useEffect(() => {
    analyticsEvents.onboardingHowItWorksViewed({ role });
  }, [role]);

  return (
    <OnboardingShell
      step={3}
      total={6}
      centerContent={false}
      footer={
        <PrimaryButton
          label={t("common.next")}
          onPress={() => {
            analyticsEvents.onboardingHowItWorksContinueTapped({ role });
            router.push("/rewards");
          }}
        />
      }
    >
      <View>
        <ScreenHeading
          eyebrow={t("onboarding.howItWorks.eyebrow")}
          title={t(`onboarding.howItWorks.${audience}.title`)}
          body={t(`onboarding.howItWorks.${audience}.body`)}
        />
        <View style={styles.steps}>
          {steps.map((step, index) => (
            <StepRow
              key={step.id}
              step={step}
              audience={audience}
              index={index}
              isLast={index === steps.length - 1}
            />
          ))}
        </View>
      </View>
    </OnboardingShell>
  );
}

const useStyles = makeStyles((t) => ({
  steps: {
    marginTop: Spacing.xl,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.base,
  },
  leftColumn: {
    width: 56,
    alignItems: "center",
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  connector: {
    width: 2,
    flex: 1,
    marginVertical: 6,
    borderRadius: 1,
    backgroundColor: t.colors.border,
  },
  content: {
    flex: 1,
    paddingBottom: Spacing.lg,
  },
  titleLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  stepNumber: {
    color: t.isDark ? Brand.primary : t.colors.accent,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  title: {
    color: t.colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  description: {
    color: t.colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 4,
  },
}));
