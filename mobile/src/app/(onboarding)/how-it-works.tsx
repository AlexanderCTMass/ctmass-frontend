import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import {
  CheckIcon,
  type IconProps,
  ResponsesIcon,
  SelectSpecialistIcon,
  SubmitRequestIcon,
} from "@/components/icons";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { ScreenHeading } from "@/components/onboarding/screen-heading";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Brand, Colors, Radius, Spacing } from "@/constants/theme";

type Step = {
  title: string;
  description: string;
  Icon: (props: IconProps) => React.JSX.Element;
};

const steps: Step[] = [
  {
    title: "Submit a request",
    description:
      "Describe your project and add photos so the right specialists can find it.",
    Icon: SubmitRequestIcon,
  },
  {
    title: "Receive responses",
    description:
      "Verified local specialists review your project and send their proposals.",
    Icon: ResponsesIcon,
  },
  {
    title: "Choose your specialist",
    description:
      "Compare proposals, ratings and reviews, then hire with confidence.",
    Icon: SelectSpecialistIcon,
  },
  {
    title: "Job done",
    description:
      "Your project gets completed — everyone's happy. Leave a review to help your neighbors too.",
    Icon: CheckIcon,
  },
];

function StepRow({ step, index }: { step: Step; index: number }) {
  const { Icon } = step;
  const isLast = index === steps.length - 1;

  return (
    <Animated.View
      entering={FadeInDown.delay(320 + index * 130).duration(560)}
      style={styles.row}
    >
      <View style={styles.leftColumn}>
        <View style={styles.iconWrap}>
          <Icon size={24} color={Brand.primaryLight} />
        </View>
        {isLast ? null : <View style={styles.connector} />}
      </View>
      <View style={styles.content}>
        <View style={styles.titleLine}>
          <Text style={styles.stepNumber}>
            {String(index + 1).padStart(2, "0")}
          </Text>
          <Text style={styles.title}>{step.title}</Text>
        </View>
        <Text style={styles.description}>{step.description}</Text>
      </View>
    </Animated.View>
  );
}

export default function HowItWorksScreen() {
  return (
    <OnboardingShell
      step={2}
      total={4}
      onSkip={() => router.push("/role")}
      centerContent={false}
      footer={
        <PrimaryButton label="Next" onPress={() => router.push("/rewards")} />
      }
    >
      <View>
        <ScreenHeading
          eyebrow="How it works"
          title="Post a request, get the work done"
          body="A simple, transparent process — from your first request to a finished project."
        />
        <View style={styles.steps}>
          {steps.map((step, index) => (
            <StepRow key={step.title} step={step} index={index} />
          ))}
        </View>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  connector: {
    width: 2,
    flex: 1,
    marginVertical: 6,
    borderRadius: 1,
    backgroundColor: Colors.border,
  },
  content: {
    flex: 1,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.lg,
  },
  titleLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  stepNumber: {
    color: Brand.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  title: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 4,
  },
});
