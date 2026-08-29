import { useEffect, useState } from "react";
import {
  InteractionManager,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";

import { Brand } from "@/constants/theme";

type GlowProps = {
  id: string;
  size: number;
  color: string;
  intensity?: number;
};

export function Glow({ id, size, color, intensity = 0.55 }: GlowProps) {
  return (
    <Svg width={size} height={size}>
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={color} stopOpacity={intensity} />
          <Stop
            offset="0.42"
            stopColor={color}
            stopOpacity={intensity * 0.58}
          />
          <Stop
            offset="0.78"
            stopColor={color}
            stopOpacity={intensity * 0.14}
          />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
    </Svg>
  );
}

export function AmbientBackground() {
  const { width, height } = useWindowDimensions();
  const drift = useSharedValue(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => setReady(true));
    return () => task.cancel();
  }, []);

  useEffect(() => {
    if (!ready) return;
    drift.value = withRepeat(
      withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [ready, drift]);

  const topGlow = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(drift.value, [0, 1], [-10, 12]) },
      { translateX: interpolate(drift.value, [0, 1], [-12, 14]) },
      { scale: interpolate(drift.value, [0, 1], [1.02, 1.1]) },
    ],
  }));

  const bottomGlow = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(drift.value, [0, 1], [18, -16]) },
      { scale: interpolate(drift.value, [0, 1], [1.1, 0.95]) },
    ],
  }));

  const maxDim = Math.max(width, height);
  const topSize = maxDim * 1.45;
  const bottomSize = maxDim * 0.95;

  if (!ready) {
    return <View pointerEvents="none" style={StyleSheet.absoluteFill} />;
  }

  return (
    <Animated.View
      pointerEvents="none"
      entering={FadeIn.duration(450)}
      style={StyleSheet.absoluteFill}
    >
      <Animated.View
        style={[
          {
            position: "absolute",
            left: width / 2 - topSize / 2,
            top: height * 0.2 - topSize / 2,
          },
          topGlow,
        ]}
      >
        <Glow
          id="glowPrimary"
          size={topSize}
          color={Brand.primary}
          intensity={0.5}
        />
      </Animated.View>
      <Animated.View
        style={[
          {
            position: "absolute",
            right: -bottomSize * 0.25,
            bottom: -bottomSize * 0.35,
          },
          bottomGlow,
        ]}
      >
        <Glow
          id="glowInfo"
          size={bottomSize}
          color={Brand.info}
          intensity={0.3}
        />
      </Animated.View>
    </Animated.View>
  );
}
