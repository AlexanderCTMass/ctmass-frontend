import { Image } from "expo-image";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { ArrowRightIcon } from "@/components/icons";
import { useT } from "@/lib/i18n";

const MIN = 0.04;
const MAX = 0.96;

export function BeforeAfterSlider({
  before,
  after,
  height,
  interactive = true,
}: {
  before: string;
  after: string;
  height: number;
  interactive?: boolean;
}) {
  const { t } = useT();
  const [width, setWidth] = useState(0);
  const position = useSharedValue(0.5);

  const pan = Gesture.Pan()
    .enabled(interactive && width > 0)
    .activeOffsetX([-6, 6])
    .failOffsetY([-14, 14])
    .onStart((event) => {
      position.set(Math.min(MAX, Math.max(MIN, event.x / width)));
    })
    .onUpdate((event) => {
      position.set(Math.min(MAX, Math.max(MIN, event.x / width)));
    });

  const clipStyle = useAnimatedStyle(
    () => ({ width: position.get() * width }),
    [width],
  );
  const handleStyle = useAnimatedStyle(
    () => ({ transform: [{ translateX: position.get() * width - 1.5 }] }),
    [width],
  );

  return (
    <GestureDetector gesture={pan}>
      <View
        style={[styles.root, { height }]}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      >
        <Image
          source={{ uri: after }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={150}
        />
        <Animated.View style={[styles.clip, clipStyle]}>
          <Image
            source={{ uri: before }}
            style={[styles.beforeImage, { width: width || 1 }]}
            contentFit="cover"
            transition={150}
          />
        </Animated.View>
        <View style={[styles.label, styles.labelLeft]}>
          <Text style={styles.labelText}>{t("portfolio.before")}</Text>
        </View>
        <View style={[styles.label, styles.labelRight]}>
          <Text style={styles.labelText}>{t("portfolio.after")}</Text>
        </View>
        {width > 0 ? (
          <Animated.View style={[styles.handleLine, handleStyle]}>
            <View style={styles.knob}>
              <View style={styles.knobLeft}>
                <ArrowRightIcon size={13} color="#04170D" strokeWidth={2.4} />
              </View>
              <ArrowRightIcon size={13} color="#04170D" strokeWidth={2.4} />
            </View>
          </Animated.View>
        ) : null}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#0B1220",
  },
  clip: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    overflow: "hidden",
  },
  beforeImage: {
    height: "100%",
  },
  handleLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  knob: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  knobLeft: {
    transform: [{ rotate: "180deg" }],
  },
  label: {
    position: "absolute",
    bottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(5,7,12,0.62)",
  },
  labelLeft: {
    left: 10,
  },
  labelRight: {
    right: 10,
  },
  labelText: {
    color: "#FFFFFF",
    fontSize: 11.5,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
});
