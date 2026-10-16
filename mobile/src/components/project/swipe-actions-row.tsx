import { useRef } from "react";
import { Pressable, Text, View } from "react-native";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  type SharedValue,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";

import { Radius, Spacing, makeStyles } from "@/constants/theme";
import { selectFeedback } from "@/lib/haptics";

export type SwipeAction = {
  key: string;
  label: string;
  hint?: string;
  icon: React.ReactNode;
  background: string;
  onPress: () => void;
};

const ACTION_WIDTH = 96;

function Actions({
  actions,
  progress,
  close,
}: {
  actions: SwipeAction[];
  progress: SharedValue<number>;
  close: () => void;
}) {
  const styles = useStyles();
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.6, 1], [0, 0.6, 1]),
    transform: [
      { scale: interpolate(progress.value, [0, 1], [0.85, 1], "clamp") },
    ],
  }));

  return (
    <Animated.View
      style={[styles.actions, { width: ACTION_WIDTH * actions.length }, style]}
    >
      {actions.map((action) => (
        <Pressable
          key={action.key}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          onPress={() => {
            close();
            action.onPress();
          }}
          style={[styles.action, { backgroundColor: action.background }]}
        >
          <View style={styles.actionIcon}>{action.icon}</View>
          <Text style={styles.actionLabel}>{action.label}</Text>
          {action.hint ? (
            <Text style={styles.actionHint} numberOfLines={2}>
              {action.hint}
            </Text>
          ) : null}
        </Pressable>
      ))}
    </Animated.View>
  );
}

export function SwipeActionsRow({
  actions,
  onOpen,
  children,
}: {
  actions: SwipeAction[];
  onOpen?: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<SwipeableMethods>(null);
  return (
    <ReanimatedSwipeable
      ref={ref}
      friction={2}
      rightThreshold={40}
      overshootRight={false}
      onSwipeableWillOpen={() => {
        selectFeedback();
        onOpen?.();
      }}
      renderRightActions={(progress) => (
        <Actions
          actions={actions}
          progress={progress}
          close={() => ref.current?.close()}
        />
      )}
    >
      <View>{children}</View>
    </ReanimatedSwipeable>
  );
}

const useStyles = makeStyles(() => ({
  actions: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingLeft: Spacing.sm,
  },
  action: {
    flex: 1,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: Spacing.sm,
  },
  actionIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    marginBottom: 2,
  },
  actionLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  actionHint: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11.5,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 15,
  },
}));
