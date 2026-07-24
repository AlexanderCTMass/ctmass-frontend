import { StyleSheet, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Brand, Colors, Spacing } from "@/constants/theme";

type ScreenHeadingProps = {
  eyebrow: string;
  title: string;
  body?: string;
  delay?: number;
};

export function ScreenHeading({
  eyebrow,
  title,
  body,
  delay = 0,
}: ScreenHeadingProps) {
  return (
    <>
      <Animated.View entering={FadeInDown.delay(delay).duration(500)}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(delay + 90).duration(560)}>
        <Text style={styles.title}>{title}</Text>
      </Animated.View>
      {body ? (
        <Animated.View entering={FadeInDown.delay(delay + 180).duration(560)}>
          <Text style={styles.body}>{body}</Text>
        </Animated.View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    color: Brand.primaryLight,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2.4,
    textTransform: "uppercase",
    marginBottom: Spacing.md,
  },
  title: {
    color: Colors.text,
    fontSize: 34,
    lineHeight: 41,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  body: {
    color: Colors.textSecondary,
    fontSize: 16,
    lineHeight: 25,
    marginTop: Spacing.md,
  },
});
