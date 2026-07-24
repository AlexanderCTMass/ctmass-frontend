import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import {
  CheckIcon,
  HardHatIcon,
  HomeIcon,
  type IconProps,
} from "@/components/icons";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { ScreenHeading } from "@/components/onboarding/screen-heading";
import { PressableScale } from "@/components/ui/pressable-scale";
import { Brand, Colors, Duration, Radius, Spacing } from "@/constants/theme";
import { selectFeedback, successFeedback } from "@/lib/haptics";
import { type UserRole, useAppStore } from "@/store/use-app-store";

type RoleOption = {
  role: UserRole;
  title: string;
  subtitle: string;
  points: string[];
  Icon: (props: IconProps) => React.JSX.Element;
};

const options: RoleOption[] = [
  {
    role: "homeowner",
    title: "I'm a Homeowner",
    subtitle: "I need work done on my property",
    points: [
      "Post a project for free",
      "Get proposals from verified local pros",
    ],
    Icon: HomeIcon,
  },
  {
    role: "contractor",
    title: "I'm a Contractor",
    subtitle: "I provide construction services",
    points: ["Find real local projects", "Never pay for a lead"],
    Icon: HardHatIcon,
  },
];

function RoleCard({
  option,
  index,
  selected,
  onSelect,
}: {
  option: RoleOption;
  index: number;
  selected: boolean;
  onSelect: (role: UserRole) => void;
}) {
  const { Icon } = option;

  const cardStyle = useAnimatedStyle(() => ({
    borderColor: withTiming(selected ? Brand.primary : Colors.border, {
      duration: Duration.fast,
    }),
    backgroundColor: withTiming(
      selected ? "rgba(22,179,100,0.12)" : Colors.surface,
      { duration: Duration.fast },
    ),
  }));

  return (
    <Animated.View entering={FadeInDown.delay(320 + index * 140).duration(560)}>
      <PressableScale
        accessibilityLabel={option.title}
        onPress={() => onSelect(option.role)}
      >
        <Animated.View style={[styles.card, cardStyle]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Icon size={28} color={Brand.primaryLight} />
            </View>
            <View style={styles.cardHeading}>
              <Text style={styles.cardTitle}>{option.title}</Text>
              <Text style={styles.cardSubtitle}>{option.subtitle}</Text>
            </View>
            {selected ? (
              <View style={styles.check}>
                <CheckIcon size={16} color="#04170D" strokeWidth={3} />
              </View>
            ) : null}
          </View>
          <View style={styles.points}>
            {option.points.map((point) => (
              <View key={point} style={styles.pointRow}>
                <View style={styles.pointDot} />
                <Text style={styles.pointText}>{point}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </PressableScale>
    </Animated.View>
  );
}

export default function RoleScreen() {
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const [selected, setSelected] = useState<UserRole | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  const handleSelect = (role: UserRole) => {
    if (selected) return;
    setSelected(role);
    selectFeedback();

    timeout.current = setTimeout(() => {
      successFeedback();
      completeOnboarding(role);
      router.replace("/auth");
    }, 420);
  };

  return (
    <OnboardingShell
      step={4}
      total={4}
      centerContent={false}
      footer={
        <Text style={styles.footerNote}>
          No credit card required. Sign up in less than 2 minutes.
        </Text>
      }
    >
      <View>
        <ScreenHeading
          eyebrow="Almost there"
          title="How will you use CTMASS?"
          body="Pick the experience that fits you. You can change this later in your profile."
        />
        <View style={styles.cards}>
          {options.map((option, index) => (
            <RoleCard
              key={option.role}
              option={option}
              index={index}
              selected={selected === option.role}
              onSelect={handleSelect}
            />
          ))}
        </View>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  cards: {
    marginTop: Spacing.xl,
    gap: Spacing.base,
  },
  card: {
    padding: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.base,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(22,179,100,0.12)",
  },
  cardHeading: {
    flex: 1,
  },
  cardTitle: {
    color: Colors.text,
    fontSize: 19,
    fontWeight: "800",
  },
  cardSubtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.primary,
  },
  points: {
    marginTop: Spacing.base,
    gap: Spacing.sm,
  },
  pointRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  pointDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Brand.primaryLight,
  },
  pointText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  footerNote: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
  },
});
