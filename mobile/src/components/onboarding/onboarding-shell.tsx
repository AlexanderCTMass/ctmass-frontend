import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AmbientBackground } from "@/components/onboarding/ambient-background";
import { StepDots } from "@/components/onboarding/step-dots";
import { Colors, Gradients, Spacing } from "@/constants/theme";

type OnboardingShellProps = {
  step: number;
  total: number;
  children: React.ReactNode;
  footer: React.ReactNode;
  centerContent?: boolean;
};

export function OnboardingShell({
  step,
  total,
  children,
  footer,
  centerContent = true,
}: OnboardingShellProps) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={Gradients.screen}
        style={StyleSheet.absoluteFill}
      />
      <AmbientBackground />
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <StepDots total={total} current={step} />
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            centerContent ? styles.scrollCentered : styles.scrollTop,
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {children}
        </ScrollView>
        <View style={styles.footer}>{footer}</View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
  },
  scrollCentered: {
    justifyContent: "center",
  },
  scrollTop: {
    paddingTop: Spacing.xl,
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
    gap: Spacing.md,
  },
});
