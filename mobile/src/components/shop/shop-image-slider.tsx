import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Colors } from "@/constants/theme";

const PLACEHOLDER = "https://placehold.co/600x400/0C1420/FFC107?text=CTMASS";

export function ShopImageSlider({
  images,
  height = 200,
}: {
  images: string[];
  height?: number;
}) {
  const safe = images.length > 0 ? images : [PLACEHOLDER];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (safe.length <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % safe.length);
    }, 3800);
    return () => clearInterval(id);
  }, [safe.length]);

  return (
    <View style={[styles.wrap, { height }]}>
      <Animated.Image
        key={`${safe[index]}-${index}`}
        entering={FadeIn.duration(450)}
        source={{ uri: safe[index] }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      {safe.length > 1 ? (
        <View style={styles.dots}>
          {safe.map((src, i) => (
            <View
              key={`${src}-${i}`}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    backgroundColor: Colors.backgroundElevated,
    overflow: "hidden",
  },
  dots: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  dotActive: {
    backgroundColor: "#FFC107",
    width: 18,
  },
});
