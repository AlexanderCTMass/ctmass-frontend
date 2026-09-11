import { View } from "react-native";

import { ChevronLeftIcon } from "@/components/icons";
import { PressableScale } from "@/components/ui/pressable-scale";
import { makeStyles, useTheme } from "@/constants/theme";
import { analyticsEvents, currentScreen } from "@/lib/analytics-events";

export function BackButton({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <PressableScale
      accessibilityLabel="Go back"
      onPress={() => {
        analyticsEvents.backButtonTapped({ screen: currentScreen() });
        onPress();
      }}
    >
      <View style={styles.button}>
        <ChevronLeftIcon size={22} color={colors.text} />
      </View>
    </PressableScale>
  );
}

const useStyles = makeStyles((t) => ({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
}));
