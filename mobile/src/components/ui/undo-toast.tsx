import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";

import { ArchiveIcon, HeartIcon } from "@/components/icons";
import { Radius, Spacing, makeStyles } from "@/constants/theme";
import { useT } from "@/lib/i18n";

type ToastIcon = "archive" | "like";

type Toast = {
  id: number;
  message: string;
  onUndo: () => void;
  icon: ToastIcon;
};

const DURATION = 4500;

export function useUndoToast() {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setToast(null);
  }, []);

  const show = useCallback(
    (message: string, onUndo: () => void, icon: ToastIcon = "archive") => {
      if (timer.current) clearTimeout(timer.current);
      setToast({ id: Date.now(), message, onUndo, icon });
      timer.current = setTimeout(() => {
        timer.current = null;
        setToast(null);
      }, DURATION);
    },
    [],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return { toast, show, hide };
}

export function UndoToast({
  toast,
  onHide,
}: {
  toast: Toast | null;
  onHide: () => void;
}) {
  const styles = useStyles();
  const { t } = useT();
  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      {toast ? (
        <Animated.View
          key={toast.id}
          entering={FadeInDown.springify().damping(18).stiffness(220)}
          exiting={FadeOutDown.duration(160)}
          style={styles.toast}
          accessibilityLiveRegion="polite"
        >
          {toast.icon === "like" ? (
            <HeartIcon size={18} color="#FFFFFF" filled />
          ) : (
            <ArchiveIcon size={18} color="#FFFFFF" />
          )}
          <Text style={styles.message} numberOfLines={2}>
            {toast.message}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("common.undo")}
            hitSlop={10}
            onPress={() => {
              toast.onUndo();
              onHide();
            }}
            style={({ pressed }) => [
              styles.undo,
              pressed && styles.undoPressed,
            ]}
          >
            <Text style={styles.undoText}>{t("common.undo")}</Text>
          </Pressable>
        </Animated.View>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: {
    position: "absolute",
    left: Spacing.base,
    right: Spacing.base,
    bottom: Spacing.md,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingLeft: Spacing.base,
    paddingRight: Spacing.sm,
    paddingVertical: Spacing.sm,
    minHeight: 52,
    borderRadius: Radius.lg,
    backgroundColor: t.isDark ? "#1A2433" : "#0B1F14",
    borderWidth: 1,
    borderColor: t.colors.borderStrong,
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  message: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  undo: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(63,199,154,0.18)",
  },
  undoPressed: {
    opacity: 0.7,
  },
  undoText: {
    color: "#3FC79A",
    fontSize: 14,
    fontWeight: "800",
  },
}));
