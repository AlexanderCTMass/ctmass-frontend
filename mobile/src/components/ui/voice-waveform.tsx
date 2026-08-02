import { StyleSheet, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";

import { Brand } from "@/constants/theme";

const BAR_COUNT = 26;
const MIN_HEIGHT = 4;
const MAX_HEIGHT = 26;

function padStart(values: number[], length: number, fill: number): number[] {
  if (values.length >= length) return values.slice(values.length - length);
  return [...(Array(length - values.length).fill(fill) as number[]), ...values];
}

export function VoiceWaveform({
  samples,
  color = Brand.primaryLight,
}: {
  samples: number[];
  color?: string;
}) {
  const data = padStart(samples, BAR_COUNT, 0.04);

  return (
    <View style={styles.row}>
      {data.map((value, index) => (
        <Animated.View
          key={index}
          layout={LinearTransition.duration(120)}
          style={[
            styles.bar,
            {
              height: MIN_HEIGHT + value * (MAX_HEIGHT - MIN_HEIGHT),
              backgroundColor: color,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flex: 1,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bar: {
    width: 3,
    borderRadius: 2,
    opacity: 0.9,
  },
});
