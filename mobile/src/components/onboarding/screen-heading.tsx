import { Text } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Spacing, makeStyles } from "@/constants/theme";

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
  const styles = useStyles();
  return (
    <>
      <Animated.View entering={FadeIn.delay(delay).duration(500)}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
      </Animated.View>
      <Animated.View entering={FadeIn.delay(delay + 90).duration(560)}>
        <Text style={styles.title}>{title}</Text>
      </Animated.View>
      {body ? (
        <Animated.View entering={FadeIn.delay(delay + 180).duration(560)}>
          <Text style={styles.body}>{body}</Text>
        </Animated.View>
      ) : null}
    </>
  );
}

const useStyles = makeStyles((t) => ({
  eyebrow: {
    color: t.colors.accent,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2.4,
    textTransform: "uppercase",
    marginBottom: Spacing.base,
  },
  title: {
    color: t.colors.text,
    fontSize: 34,
    lineHeight: 41,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  body: {
    color: t.colors.textSecondary,
    fontSize: 16,
    lineHeight: 25,
    marginTop: Spacing.md,
  },
}));
