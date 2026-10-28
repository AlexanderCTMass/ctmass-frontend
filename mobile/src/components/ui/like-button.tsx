import { useEffect, useRef } from "react";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { HeartIcon } from "@/components/icons";
import { Brand, makeStyles, useTheme } from "@/constants/theme";
import { useT } from "@/lib/i18n";

export function LikeButton({
  liked,
  onPress,
  size = 30,
}: {
  liked: boolean;
  onPress: () => void;
  size?: number;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useT();
  const scale = useSharedValue(1);
  const was = useRef(liked);

  useEffect(() => {
    if (liked && !was.current) {
      scale.value = withSequence(
        withTiming(1.35, { duration: 120 }),
        withSpring(1, { damping: 9, stiffness: 260 }),
      );
    }
    was.current = liked;
  }, [liked, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={liked ? t("ui.removeLike") : t("ui.like")}
      accessibilityState={{ selected: liked }}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { width: size, height: size, borderRadius: size / 2 },
        liked && styles.buttonActive,
        pressed && styles.pressed,
      ]}
    >
      <Animated.View style={style}>
        <HeartIcon
          size={Math.round(size * 0.56)}
          color={liked ? Brand.primary : colors.textSecondary}
          filled={liked}
        />
      </Animated.View>
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.colors.surfaceStrong,
  },
  buttonActive: {
    backgroundColor: "rgba(22,179,100,0.16)",
  },
  pressed: {
    opacity: 0.6,
  },
}));
