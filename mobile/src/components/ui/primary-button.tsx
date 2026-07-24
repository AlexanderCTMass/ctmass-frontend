import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

import { ArrowRightIcon } from "@/components/icons";
import { PressableScale } from "@/components/ui/pressable-scale";
import { Gradients, Radius, Spacing } from "@/constants/theme";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  withArrow?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  withArrow = true,
}: PrimaryButtonProps) {
  return (
    <PressableScale onPress={onPress} accessibilityLabel={label}>
      <LinearGradient
        colors={Gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.button}
      >
        <View style={styles.content}>
          <Text style={styles.label}>{label}</Text>
          {withArrow ? <ArrowRightIcon size={20} color="#04170D" /> : null}
        </View>
      </LinearGradient>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 58,
    borderRadius: Radius.pill,
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    shadowColor: "#16B364",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  label: {
    color: "#04170D",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
