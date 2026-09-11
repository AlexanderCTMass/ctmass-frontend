import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

import { AmbientBackground } from "@/components/onboarding/ambient-background";
import { makeStyles, useTheme } from "@/constants/theme";

export function ScreenBackground({ children }: { children: React.ReactNode }) {
  const { gradients } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={gradients.screen}
        style={StyleSheet.absoluteFill}
      />
      <AmbientBackground />
      {children}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: {
    flex: 1,
    backgroundColor: t.colors.background,
  },
}));
