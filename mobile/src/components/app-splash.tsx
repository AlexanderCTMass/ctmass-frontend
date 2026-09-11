import { Image } from "expo-image";
import { StyleSheet } from "react-native";
import Animated, { FadeOut } from "react-native-reanimated";

import { useTheme } from "@/constants/theme";

const splashIcon = require("../../assets/images/splash-icon.png") as number;

export function AppSplash({ onLayout }: { onLayout?: () => void }) {
  const { colors } = useTheme();
  return (
    <Animated.View
      exiting={FadeOut.duration(260)}
      onLayout={onLayout}
      style={[styles.root, { backgroundColor: colors.splash }]}
    >
      <Image source={splashIcon} style={styles.icon} contentFit="contain" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  icon: {
    width: 150,
    height: 150,
  },
});
