import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Platform, Text, View } from "react-native";

import { ArrowRightIcon } from "@/components/icons";
import { PressableScale } from "@/components/ui/pressable-scale";
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  withArrow?: boolean;
  disabled?: boolean;
  loading?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  withArrow = true,
  disabled = false,
  loading = false,
}: PrimaryButtonProps) {
  const { gradients } = useTheme();
  const styles = useStyles();
  const faded = disabled && !loading;
  const showArrow = withArrow && !faded && !loading;

  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={label}
      disabled={disabled || loading}
    >
      <LinearGradient
        colors={faded ? gradients.disabled : gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.button, !faded && styles.buttonEnabled]}
      >
        {loading ? (
          <ActivityIndicator color="#04170D" />
        ) : (
          <View style={styles.content}>
            <Text style={[styles.label, faded && styles.labelDisabled]}>
              {label}
            </Text>
            {showArrow ? <ArrowRightIcon size={20} color="#04170D" /> : null}
          </View>
        )}
      </LinearGradient>
    </PressableScale>
  );
}

const useStyles = makeStyles((t) => ({
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
    color: t.colors.textMuted,
  },
}));
