import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { Colors } from "@/constants/theme";

const PLACEHOLDER = "https://placehold.co/600x400/0C1420/FFC107?text=CTMASS";
const AUTO_ADVANCE_MS = 4200;

export function ShopImageSlider({
  images,
  height = 200,
}: {
  images: string[];
  height?: number;
}) {
  const safe = images.length > 0 ? images : [PLACEHOLDER];
  const count = safe.length;

  const scrollRef = useRef<ScrollView>(null);
  const widthRef = useRef(0);
  const indexRef = useRef(0);
  const draggingRef = useRef(false);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (count <= 1 || width === 0) return;
    const id = setInterval(() => {
      if (draggingRef.current) return;
      const next = (indexRef.current + 1) % count;
      indexRef.current = next;
      setIndex(next);
      scrollRef.current?.scrollTo({ x: next * widthRef.current, animated: true });
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [count, width]);

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    draggingRef.current = false;
    const w = widthRef.current || 1;
    const next = Math.round(e.nativeEvent.contentOffset.x / w);
    indexRef.current = next;
    setIndex(next);
  };

  return (
    <View
      style={[styles.wrap, { height }]}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        widthRef.current = w;
        setWidth(w);
      }}
    >
      {width > 0 ? (
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          bounces={false}
          scrollEnabled={count > 1}
          showsHorizontalScrollIndicator={false}
          onScrollBeginDrag={() => {
            draggingRef.current = true;
          }}
          onMomentumScrollEnd={handleMomentumEnd}
        >
          {safe.map((uri, i) => (
            <Image
              key={`${uri}-${i}`}
              source={{ uri }}
              style={{ width, height }}
              contentFit="cover"
              transition={220}
              cachePolicy="memory-disk"
              recyclingKey={uri}
            />
          ))}
        </ScrollView>
      ) : null}

      {count > 1 ? (
        <View style={styles.dots} pointerEvents="none">
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
