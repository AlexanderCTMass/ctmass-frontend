import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
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
import { Brand, Colors, Radius, Spacing } from "@/constants/theme";
import { useAppStore } from "@/store/use-app-store";

type Step = {
  title: string;
  description: string;
  Icon: (props: IconProps) => React.JSX.Element;
};

const homeownerSteps: Step[] = [
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

const contractorSteps: Step[] = [
  {
    title: "Create your profile",
    description:
      "Set up your trade, service area and portfolio so local clients can find you.",
    Icon: HardHatIcon,
  },
  {
    title: "Browse local projects",
    description:
      "Explore active job requests from homeowners across Massachusetts and Connecticut.",
    Icon: BrowseJobsIcon,
  },
  {
    title: "Send your proposals",
    description:
      "Submit competitive quotes and message clients directly. Never pay for a lead.",
    Icon: SendIcon,
  },
  {
    title: "Complete work & earn reviews",
    description:
      "Finish the job, get paid, and build the platform rating that wins your next one.",
    Icon: ReviewIcon,
  },
];

function StepRow({
  step,
  index,
  isLast,
}: {
  step: Step;
  index: number;
  isLast: boolean;
}) {
  const { Icon } = step;

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
  const role = useAppStore((state) => state.role);
  const isContractor = role === "contractor";
  const steps = isContractor ? contractorSteps : homeownerSteps;

  return (
    <OnboardingShell
      step={3}
      total={5}
      onSkip={() => router.push("/rewards")}
      centerContent={false}
      footer={
        <PrimaryButton label="Next" onPress={() => router.push("/rewards")} />
      }
    >
      <View>
        <ScreenHeading
          eyebrow="How it works"
          title={
            isContractor
              ? "Find local work, grow your business"
              : "Post a request, get the work done"
          }
          body={
            isContractor
              ? "A clear path from your profile to paid, reviewed jobs — no lead fees, ever."
              : "A simple, transparent process — from your first request to a finished project."
          }
        />
        <View style={styles.steps}>
          {steps.map((step, index) => (
            <StepRow
              key={step.title}
              step={step}
              index={index}
              isLast={index === steps.length - 1}
            />
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
