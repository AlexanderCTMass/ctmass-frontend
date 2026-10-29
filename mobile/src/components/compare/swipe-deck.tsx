import { useEffect, useState } from "react";
import { type LayoutChangeEvent, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { Brand, Radius, makeStyles } from "@/constants/theme";
import { tickFeedback } from "@/lib/haptics";
import { useT } from "@/lib/i18n";

export type SwipeDirection = 1 | -1;

export type FlyCommand = { direction: SwipeDirection; nonce: number };

const SPRING = { damping: 18, stiffness: 220, mass: 0.7 };

function TopCard({
  fly,
  onDecide,
  children,
}: {
  fly: FlyCommand | null;
  onDecide: (direction: SwipeDirection) => void;
  children: React.ReactNode;
}) {
  const styles = useStyles();
  const { t } = useT();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const width = useSharedValue(360);
  const decided = useSharedValue(0);
  const armed = useSharedValue(0);
  const [mountNonce] = useState(() => fly?.nonce ?? null);

  const tick = () => tickFeedback();

  useEffect(() => {
    if (!fly || fly.nonce === mountNonce || decided.value === 1) return;
    decided.value = 1;
    translateY.value = withTiming(-20, { duration: 240 });
    translateX.value = withTiming(
      fly.direction * width.value * 1.4,
      { duration: 260, easing: Easing.in(Easing.quad) },
      (finished) => {
        if (finished) scheduleOnRN(onDecide, fly.direction);
      },
    );
  }, [fly, mountNonce, onDecide, decided, translateX, translateY, width]);

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .onUpdate((event) => {
      if (decided.value === 1) return;
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.25;
      const threshold = width.value * 0.28;
      const zone =
        event.translationX > threshold
          ? 1
          : event.translationX < -threshold
            ? -1
            : 0;
      if (zone !== armed.value) {
        if (zone !== 0) scheduleOnRN(tick);
        armed.value = zone;
      }
    })
    .onEnd((event) => {
      if (decided.value === 1) return;
      const threshold = width.value * 0.28;
      const x = translateX.value;
      const goRight =
        x > threshold || (x > threshold * 0.4 && event.velocityX > 900);
      const goLeft =
        x < -threshold || (x < -threshold * 0.4 && event.velocityX < -900);
      armed.value = 0;
      if (!goRight && !goLeft) {
        translateX.value = withSpring(0, SPRING);
        translateY.value = withSpring(0, SPRING);
        return;
      }
      const direction: SwipeDirection = goRight ? 1 : -1;
      decided.value = 1;
      translateX.value = withTiming(
        direction * width.value * 1.4,
        { duration: 220, easing: Easing.out(Easing.quad) },
        (finished) => {
          if (finished) scheduleOnRN(onDecide, direction);
        },
      );
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      {
        rotate: `${interpolate(
          translateX.value,
          [-width.value, 0, width.value],
          [-10, 0, 10],
          Extrapolation.CLAMP,
        )}deg`,
      },
    ],
  }));

  const keepStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [16, width.value * 0.28],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const dropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-width.value * 0.28, -16],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const onLayout = (event: LayoutChangeEvent) => {
    width.value = event.nativeEvent.layout.width;
  };

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[styles.layer, styles.top, cardStyle]}
        onLayout={onLayout}
      >
        {children}
        <Animated.View
          pointerEvents="none"
          style={[styles.stamp, styles.keep, keepStyle]}
        >
          <Text style={[styles.stampText, styles.keepText]}>
            {t("compare.keepStamp")}
          </Text>
        </Animated.View>
        <Animated.View
          pointerEvents="none"
          style={[styles.stamp, styles.drop, dropStyle]}
        >
          <Text style={[styles.stampText, styles.dropText]}>
            {t("compare.dropStamp")}
          </Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

export function SwipeDeck({
  topKey,
  top,
  next,
  fly,
  onDecide,
}: {
  topKey: string;
  top: React.ReactNode;
  next: React.ReactNode | null;
  fly: FlyCommand | null;
  onDecide: (direction: SwipeDirection) => void;
}) {
  const styles = useStyles();
  return (
    <View style={styles.deck}>
      {next ? (
        <View pointerEvents="none" style={[styles.layer, styles.back]}>
          {next}
        </View>
      ) : null}
      <TopCard key={topKey} fly={fly} onDecide={onDecide}>
        {top}
      </TopCard>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  deck: {
    flex: 1,
  },
  layer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  top: {
    borderRadius: Radius.xl,
    shadowColor: "#04170D",
    shadowOpacity: t.isDark ? 0 : 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: t.isDark ? 0 : 6,
  },
  back: {
    opacity: t.isDark ? 0.5 : 0.6,
    transform: [{ translateY: 14 }, { scale: 0.94 }],
  },
  stamp: {
    position: "absolute",
    top: 26,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 3,
    backgroundColor: t.colors.card,
  },
  keep: {
    left: 20,
    borderColor: Brand.primary,
    transform: [{ rotate: "-14deg" }],
  },
  drop: {
    right: 20,
    borderColor: t.colors.danger,
    transform: [{ rotate: "14deg" }],
  },
  stampText: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 2,
  },
  keepText: {
    color: Brand.primary,
  },
  dropText: {
    color: t.colors.danger,
  },
}));
