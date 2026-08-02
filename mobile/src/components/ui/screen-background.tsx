import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

import { AmbientBackground } from "@/components/onboarding/ambient-background";
import { Colors, Gradients } from "@/constants/theme";

export function ScreenBackground({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={Gradients.screen}
        style={StyleSheet.absoluteFill}
      />
      <AmbientBackground />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
