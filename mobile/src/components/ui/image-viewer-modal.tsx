import { Image } from "expo-image";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { CloseIcon } from "@/components/icons";
import { ModalSafeArea } from "@/components/ui/modal-safe-area";
import { Spacing } from "@/constants/theme";
import { useT } from "@/lib/i18n";

const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;

function ZoomableImage({ uri }: { uri: string }) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  const reset = () => {
    "worklet";
    scale.value = withTiming(1);
    savedScale.value = 1;
    offsetX.value = withTiming(0);
    offsetY.value = withTiming(0);
    savedX.value = 0;
    savedY.value = 0;
  };

  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.min(
        MAX_SCALE,
        Math.max(0.8, savedScale.value * event.scale),
      );
    })
    .onEnd(() => {
      if (scale.value <= 1) {
        reset();
        return;
      }
      savedScale.value = scale.value;
    });

  const pan = Gesture.Pan()
    .minPointers(1)
    .maxPointers(2)
    .onUpdate((event) => {
      if (scale.value <= 1) return;
      offsetX.value = savedX.value + event.translationX;
      offsetY.value = savedY.value + event.translationY;
    })
    .onEnd(() => {
      savedX.value = offsetX.value;
      savedY.value = offsetY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        reset();
        return;
      }
      scale.value = withTiming(DOUBLE_TAP_SCALE);
      savedScale.value = DOUBLE_TAP_SCALE;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={Gesture.Simultaneous(pinch, pan, doubleTap)}>
      <Animated.View style={[styles.fill, animatedStyle]}>
        <Image
          source={{ uri }}
          style={styles.fill}
          contentFit="contain"
          transition={150}
        />
      </Animated.View>
    </GestureDetector>
  );
}

export function ImageViewerModal({
  uri,
  onClose,
}: {
  uri: string | null;
  onClose: () => void;
}) {
  const { t } = useT();
  return (
    <Modal
      visible={uri !== null}
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      animationType="fade"
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={styles.root}>
        <ModalSafeArea style={styles.header} edges={["top"]}>
          <View style={styles.headerRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("common.close")}
              hitSlop={12}
              onPress={onClose}
              style={styles.close}
            >
              <CloseIcon size={26} color="#FFFFFF" />
            </Pressable>
          </View>
        </ModalSafeArea>
        {uri ? <ZoomableImage key={uri} uri={uri} /> : null}
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.94)",
  },
  fill: {
    flex: 1,
    width: "100%",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  close: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
});
