import { useEffect, useRef, useState } from "react";
import { type LayoutChangeEvent, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  Extrapolation,
  type SharedValue,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { ArchiveIcon, HeartIcon, RestoreIcon } from "@/components/icons";
import { Brand, Radius, makeStyles, useTheme } from "@/constants/theme";
import { tickFeedback } from "@/lib/haptics";

export type SwipeSide = {
  label: string;
  icon: React.ReactNode;
  background: string;
  tint: string;
  dismiss?: boolean;
  onTrigger: () => void;
};

export function useSwipeSides() {
  const { isDark } = useTheme();
  return {
    like: (
      liked: boolean,
      onTrigger: () => void,
      dismissOnUnlike = false,
    ): SwipeSide =>
      liked
        ? {
            label: "Unlike",
            icon: <HeartIcon size={24} color="#FFFFFF" strokeWidth={2.2} />,
            background: isDark ? "#2A3646" : "#5E7166",
            tint: "#FFFFFF",
            dismiss: dismissOnUnlike,
            onTrigger,
          }
        : {
            label: "Like",
            icon: <HeartIcon size={24} color="#FFFFFF" filled />,
            background: Brand.primary,
            tint: "#FFFFFF",
            onTrigger,
          },
    archive: (onTrigger: () => void): SwipeSide => ({
      label: "Archive",
      icon: <ArchiveIcon size={24} color="#FFFFFF" strokeWidth={2} />,
      background: isDark ? "#2A3646" : "#3F5448",
      tint: "#FFFFFF",
      dismiss: true,
      onTrigger,
    }),
    restore: (onTrigger: () => void): SwipeSide => ({
      label: "Restore",
      icon: <RestoreIcon size={24} color="#FFFFFF" strokeWidth={2} />,
      background: Brand.primaryDark,
      tint: "#FFFFFF",
      dismiss: true,
      onTrigger,
    }),
  };
}

const SPRING = { damping: 18, stiffness: 220, mass: 0.7 };
const HINT_OFFSET = 64;
const PARTICLES = [0, 60, 120, 180, 240, 300];

function Particle({
  angle,
  progress,
}: {
  angle: number;
  progress: SharedValue<number>;
}) {
  const rad = (angle * Math.PI) / 180;
  const style = useAnimatedStyle(() => {
    const distance = interpolate(progress.value, [0, 1], [8, 74]);
    return {
      opacity: interpolate(
        progress.value,
        [0, 0.12, 0.7, 1],
        [0, 1, 0.8, 0],
        Extrapolation.CLAMP,
      ),
      transform: [
        { translateX: Math.cos(rad) * distance },
        { translateY: Math.sin(rad) * distance },
        {
          scale: interpolate(
            progress.value,
            [0, 0.3, 1],
            [0.4, 1, 0.5],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });
  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.center, style]}>
      <HeartIcon size={14} color={Brand.primaryLight} filled />
    </Animated.View>
  );
}

function LikeBurst({ progress }: { progress: SharedValue<number> }) {
  const heartStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 0.08, 0.65, 1],
      [0, 1, 1, 0],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        scale: interpolate(
          progress.value,
          [0, 0.28, 0.5, 1],
          [0.3, 1.3, 1, 1.08],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 0.1, 0.7],
      [0, 0.7, 0],
      Extrapolation.CLAMP,
    ),
    transform: [{ scale: interpolate(progress.value, [0, 0.7], [0.3, 2.2]) }],
  }));
  const wrapStyle = useAnimatedStyle(() => ({
    opacity: progress.value > 0 && progress.value < 1 ? 1 : 0,
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.center, wrapStyle]}
    >
      <Animated.View style={[styles.ring, ringStyle]} />
      {PARTICLES.map((angle) => (
        <Particle key={angle} angle={angle} progress={progress} />
      ))}
      <Animated.View style={[styles.burstHeart, heartStyle]}>
        <HeartIcon size={46} color="#FFFFFF" filled />
      </Animated.View>
    </Animated.View>
  );
}

function Underlay({
  side,
  direction,
  translateX,
  threshold,
}: {
  side: SwipeSide;
  direction: 1 | -1;
  translateX: SharedValue<number>;
  threshold: SharedValue<number>;
}) {
  const local = useStyles();
  const layerStyle = useAnimatedStyle(() => {
    const x = translateX.value * direction;
    return {
      opacity: interpolate(
        x,
        [0, 12, threshold.value * 0.6],
        [0, 0.55, 1],
        Extrapolation.CLAMP,
      ),
    };
  });
  const iconStyle = useAnimatedStyle(() => {
    const x = translateX.value * direction;
    const t = threshold.value;
    return {
      transform: [
        {
          scale: interpolate(
            x,
            [0, t, t + 1, t * 2],
            [0.55, 1, 1.22, 1.32],
            Extrapolation.CLAMP,
          ),
        },
        {
          rotate: `${interpolate(x, [0, t], [-14 * direction, 0], Extrapolation.CLAMP)}deg`,
        },
      ],
    };
  });
  const labelStyle = useAnimatedStyle(() => {
    const x = translateX.value * direction;
    return {
      opacity: interpolate(
        x,
        [threshold.value * 0.35, threshold.value * 0.8],
        [0, 1],
        Extrapolation.CLAMP,
      ),
    };
  });
  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        local.underlay,
        { backgroundColor: side.background },
        direction === 1 ? local.underlayStart : local.underlayEnd,
        layerStyle,
      ]}
    >
      <View style={local.underlayContent}>
        <Animated.View style={[local.underlayIcon, iconStyle]}>
          {side.icon}
        </Animated.View>
        <Animated.Text
          style={[local.underlayLabel, { color: side.tint }, labelStyle]}
        >
          {side.label}
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

export function SwipeCard({
  itemKey,
  right,
  left,
  liked = false,
  hint = false,
  onHintShown,
  style,
  children,
}: {
  itemKey: string;
  right?: SwipeSide;
  left?: SwipeSide;
  liked?: boolean;
  hint?: boolean;
  onHintShown?: () => void;
  style?: React.ComponentProps<typeof View>["style"];
  children: React.ReactNode;
}) {
  const local = useStyles();
  const translateX = useSharedValue(0);
  const width = useSharedValue(0);
  const threshold = useSharedValue(96);
  const measured = useSharedValue(0);
  const height = useSharedValue(0);
  const collapsing = useSharedValue(0);
  const armed = useSharedValue(0);
  const burst = useSharedValue(0);
  const hasRight = Boolean(right);
  const hasLeft = Boolean(left);
  const prev = useRef({ key: itemKey, liked });
  const [generation, setGeneration] = useState(0);
  const [settlingKey, setSettlingKey] = useState<string | null>(null);
  if (settlingKey !== null && settlingKey !== itemKey) {
    setSettlingKey(null);
    setGeneration((value) => value + 1);
  }

  useEffect(() => {
    if (settlingKey === null) return;
    const timer = setTimeout(() => {
      translateX.value = 0;
      collapsing.value = 0;
      setSettlingKey(null);
      setGeneration((value) => value + 1);
    }, 450);
    return () => clearTimeout(timer);
  }, [settlingKey, translateX, collapsing]);

  useEffect(() => {
    const was = prev.current;
    prev.current = { key: itemKey, liked };
    if (was.key !== itemKey) {
      collapsing.value = 0;
      translateX.value = 0;
      burst.value = 0;
      armed.value = 0;
      return;
    }
    if (liked && !was.liked) {
      burst.value = 0;
      burst.value = withTiming(1, {
        duration: 760,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [itemKey, liked, collapsing, translateX, burst, armed]);

  const canHint = hint && (hasRight || hasLeft);
  useEffect(() => {
    if (!canHint) return;
    onHintShown?.();
    translateX.value = withDelay(
      700,
      withSequence(
        withTiming(hasRight ? HINT_OFFSET : 0, { duration: 300 }),
        withSpring(0, SPRING),
        withDelay(
          120,
          withTiming(hasLeft ? -HINT_OFFSET : 0, { duration: 300 }),
        ),
        withSpring(0, SPRING),
      ),
    );
  }, [canHint, hasRight, hasLeft, onHintShown, translateX]);

  const fire = (direction: number) => {
    (direction > 0 ? right : left)?.onTrigger();
  };

  const tick = () => tickFeedback();

  const settle = () => setSettlingKey(itemKey);

  const dismissRight = Boolean(right?.dismiss);
  const dismissLeft = Boolean(left?.dismiss);

  const pan = Gesture.Pan()
    .enabled(hasRight || hasLeft)
    .activeOffsetX([-14, 14])
    .failOffsetY([-12, 12])
    .onUpdate((event) => {
      let x = event.translationX;
      if ((x > 0 && !hasRight) || (x < 0 && !hasLeft)) x *= 0.12;
      const t = threshold.value;
      if (Math.abs(x) > t) {
        const extra = Math.abs(x) - t;
        x = Math.sign(x) * (t + extra * 0.55);
      }
      translateX.value = x;
      const zone = x >= t && hasRight ? 1 : x <= -t && hasLeft ? -1 : 0;
      if (zone !== armed.value) {
        if (zone !== 0) scheduleOnRN(tick);
        armed.value = zone;
      }
    })
    .onEnd((event) => {
      const t = threshold.value;
      const x = translateX.value;
      const goRight =
        hasRight && (x >= t || (x > t * 0.45 && event.velocityX > 900));
      const goLeft =
        hasLeft && (x <= -t || (x < -t * 0.45 && event.velocityX < -900));
      armed.value = 0;
      if (!goRight && !goLeft) {
        translateX.value = withSpring(0, SPRING);
        return;
      }
      const direction = goRight ? 1 : -1;
      const dismiss = goRight ? dismissRight : dismissLeft;
      if (!dismiss) {
        translateX.value = withSpring(0, SPRING);
        scheduleOnRN(fire, direction);
        return;
      }
      translateX.value = withTiming(
        direction * (width.value + 40),
        { duration: 210, easing: Easing.in(Easing.quad) },
        (finished) => {
          if (!finished) return;
          height.value = measured.value;
          collapsing.value = 1;
          height.value = withTiming(
            0,
            { duration: 200, easing: Easing.out(Easing.quad) },
            (done) => {
              if (!done) return;
              scheduleOnRN(fire, direction);
              scheduleOnRN(settle);
            },
          );
        },
      );
    });

  const containerStyle = useAnimatedStyle(() =>
    collapsing.value === 1
      ? {
          height: height.value,
          opacity: measured.value > 0 ? height.value / measured.value : 0,
          overflow: "hidden",
        }
      : {},
  );

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      {
        rotate: `${interpolate(
          translateX.value,
          [-Math.max(width.value, 1), 0, Math.max(width.value, 1)],
          [-3, 0, 3],
          Extrapolation.CLAMP,
        )}deg`,
      },
    ],
  }));

  const onLayout = (event: LayoutChangeEvent) => {
    const layout = event.nativeEvent.layout;
    if (collapsing.value === 1) return;
    measured.value = layout.height;
    width.value = layout.width;
    threshold.value = Math.min(120, Math.max(80, layout.width * 0.28));
  };

  return (
    <Animated.View
      key={generation}
      style={[style, containerStyle]}
      onLayout={onLayout}
    >
      {right ? (
        <Underlay
          side={right}
          direction={1}
          translateX={translateX}
          threshold={threshold}
        />
      ) : null}
      {left ? (
        <Underlay
          side={left}
          direction={-1}
          translateX={translateX}
          threshold={threshold}
        />
      ) : null}
      <GestureDetector gesture={pan}>
        <Animated.View style={[local.card, cardStyle]}>
          {children}
          <LikeBurst progress={burst} />
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: Brand.primaryLight,
  },
  burstHeart: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.primary,
    shadowColor: Brand.primary,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});

const useStyles = makeStyles((t) => ({
  card: {
    borderRadius: Radius.lg,
    backgroundColor: t.colors.card,
  },
  underlay: {
    borderRadius: Radius.lg,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  underlayStart: {
    alignItems: "flex-start",
  },
  underlayEnd: {
    alignItems: "flex-end",
  },
  underlayContent: {
    alignItems: "center",
    gap: 6,
  },
  underlayIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  underlayLabel: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
}));
