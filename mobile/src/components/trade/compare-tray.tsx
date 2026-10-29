import { router } from "expo-router";
import { Pressable, Text } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";

import { ScaleIcon } from "@/components/icons";
import {
  Brand,
  Radius,
  Spacing,
  makeStyles,
  useTheme,
} from "@/constants/theme";
import { analyticsEvents } from "@/lib/analytics-events";
import { tapFeedback } from "@/lib/haptics";
import { useT } from "@/lib/i18n";
import { toHref } from "@/lib/navigation";
import { MAX_COMPARE, useCompareStore } from "@/store/use-compare-store";

export function CompareTray() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useT();
  const count = useCompareStore((state) => state.tradeIds.length);
  const clear = useCompareStore((state) => state.clear);
  if (count === 0) return null;
  return (
    <Animated.View
      entering={FadeInDown.duration(220)}
      exiting={FadeOutDown.duration(180)}
      style={styles.tray}
    >
      <ScaleIcon size={18} color={colors.accent} strokeWidth={2} />
      <Text style={styles.count} numberOfLines={1}>
        {t("trade.tray.selected", { count, max: MAX_COMPARE })}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("trade.tray.clearA11y")}
        hitSlop={8}
        onPress={() => {
          tapFeedback();
          analyticsEvents.compareCleared({ count });
          clear();
        }}
      >
        <Text style={styles.clear}>{t("trade.tray.clear")}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("trade.tray.openA11y")}
        onPress={() => {
          tapFeedback();
          router.push(toHref("/compare"));
        }}
        style={({ pressed }) => [styles.open, pressed && styles.pressed]}
      >
        <Text style={styles.openText}>{t("compare.title")}</Text>
      </Pressable>
    </Animated.View>
  );
}

const useStyles = makeStyles((t) => ({
  tray: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.base,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: t.colors.card,
    borderWidth: 1,
    borderColor: t.colors.borderStrong,
  },
  count: {
    flex: 1,
    color: t.colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  clear: {
    color: t.colors.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  open: {
    height: 40,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.primaryDark,
  },
  openText: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.75,
  },
}));
