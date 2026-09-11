import { useEffect } from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { Duration, Radius, makeStyles, useTheme } from "@/constants/theme";

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

export function ProgressBar({ progress }: { progress: number }) {
  const { gradients } = useTheme();
  const styles = useStyles();
  const value = useSharedValue(0);

  useEffect(() => {
    value.value = withTiming(Math.min(Math.max(progress, 0), 1), {
      duration: Duration.base,
    });
  }, [progress, value]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${value.value * 100}%`,
  }));

  return (
    <View style={styles.track}>
      <AnimatedGradient
        colors={gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.fill, fillStyle]}
      />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  track: {
    height: 8,
    borderRadius: Radius.pill,
    backgroundColor: t.colors.track,
    borderWidth: 1,
    borderColor: t.isDark ? "rgba(255,255,255,0.14)" : t.colors.border,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: Radius.pill,
  },
}));
