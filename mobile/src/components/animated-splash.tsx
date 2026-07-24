import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import { BrandLogo } from "@/components/brand-logo";
import { AmbientBackground } from "@/components/onboarding/ambient-background";
import { Colors, Gradients } from "@/constants/theme";

export function AnimatedSplash({ onDone }: { onDone: () => void }) {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.92);

  useEffect(() => {
    scale.value = withTiming(1.04, {
      duration: 1100,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withDelay(
      950,
      withTiming(
        0,
        { duration: 520, easing: Easing.in(Easing.quad) },
        (done) => {
          if (done) runOnJS(onDone)();
        },
      ),
    );
  }, [opacity, scale, onDone]);

  const rootStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.root, rootStyle]}
    >
      <LinearGradient
        colors={Gradients.screen}
        style={StyleSheet.absoluteFill}
      />
      <AmbientBackground />
      <Animated.View style={logoStyle}>
        <BrandLogo size={132} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
    zIndex: 100,
  },
});
