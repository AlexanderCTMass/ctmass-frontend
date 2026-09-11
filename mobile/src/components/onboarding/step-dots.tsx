import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import { Brand, Duration, useTheme } from "@/constants/theme";

type StepDotsProps = {
  total: number;
  current: number;
};

function Dot({ active }: { active: boolean }) {
  const { colors } = useTheme();
  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(active ? 28 : 8, { duration: Duration.fast }),
    backgroundColor: withTiming(active ? Brand.primary : colors.borderStrong, {
      duration: Duration.fast,
    }),
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

export function StepDots({ total, current }: StepDotsProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }, (_, index) => (
        <Dot key={index} active={index + 1 === current} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
