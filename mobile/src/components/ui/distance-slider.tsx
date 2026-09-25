import { useState } from "react";
import { Text, View } from "react-native";

import { Brand, Radius, Spacing, makeStyles } from "@/constants/theme";

type DistanceSliderProps = {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  label?: string;
};

const THUMB = 24;

export function DistanceSlider({
  value,
  min,
  max,
  step,
  onChange,
  label = "Distance from location (miles)",
}: DistanceSliderProps) {
  const styles = useStyles();
  const [trackWidth, setTrackWidth] = useState(0);

  const update = (x: number) => {
    if (trackWidth <= 0) return;
    const fraction = Math.max(0, Math.min(1, x / trackWidth));
    const raw = min + fraction * (max - min);
    const stepped = Math.round(raw / step) * step;
    onChange(Math.max(min, Math.min(max, stepped)));
  };

  const fraction = max > min ? (value - min) / (max - min) : 0;
  const clamped = Math.max(0, Math.min(1, fraction));
  const thumbLeft = clamped * trackWidth;

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{value} miles</Text>
        </View>
      </View>
      <View
        style={styles.track}
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onResponderGrant={(event) => update(event.nativeEvent.locationX)}
        onResponderMove={(event) => update(event.nativeEvent.locationX)}
      >
        <View style={styles.trackBase} />
        <View
          style={[styles.trackFill, { width: thumbLeft }]}
          pointerEvents="none"
        />
        <View
          style={[styles.thumb, { left: thumbLeft - THUMB / 2 }]}
          pointerEvents="none"
        />
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: {
    gap: Spacing.sm,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  label: {
    color: t.colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  bubble: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(22,179,100,0.14)",
  },
  bubbleText: {
    color: t.colors.accent,
    fontSize: 12.5,
    fontWeight: "800",
  },
  track: {
    height: THUMB + 12,
    justifyContent: "center",
  },
  trackBase: {
    height: 4,
    borderRadius: 2,
    backgroundColor: t.colors.border,
  },
  trackFill: {
    position: "absolute",
    left: 0,
    height: 4,
    borderRadius: 2,
    backgroundColor: Brand.primary,
  },
  thumb: {
    position: "absolute",
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: Brand.primary,
    borderWidth: 3,
    borderColor: t.colors.background,
  },
}));
