import { LinearGradient } from "expo-linear-gradient";
import { Platform, StyleSheet, Text, View } from "react-native";

import { ArrowRightIcon } from "@/components/icons";
import { PressableScale } from "@/components/ui/pressable-scale";
import { Colors, Gradients, Radius, Spacing } from "@/constants/theme";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  withArrow?: boolean;
  disabled?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  withArrow = true,
  disabled = false,
}: PrimaryButtonProps) {
  const showArrow = withArrow && !disabled;

  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={label}
      disabled={disabled}
    >
      <LinearGradient
        colors={disabled ? Gradients.disabled : Gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.button,
          !disabled && styles.buttonEnabled,
          disabled && styles.buttonDisabled,
        ]}
      >
        <View style={styles.content}>
          <Text style={[styles.label, disabled && styles.labelDisabled]}>
            {label}
          </Text>
          {showArrow ? <ArrowRightIcon size={20} color="#04170D" /> : null}
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
  },
  buttonEnabled: Platform.select({
    ios: {
      shadowColor: "#16B364",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 18,
    },
    default: {},
  }),
  buttonDisabled: {
    borderWidth: 1,
    borderColor: Colors.border,
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
  labelDisabled: {
    color: Colors.textMuted,
  },
});
