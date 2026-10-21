import { Pressable, ScrollView, Text, View } from "react-native";

import {
  Brand,
  Radius,
  Spacing,
  makeStyles,
  useTheme,
} from "@/constants/theme";
import { tickFeedback } from "@/lib/haptics";

export type FeedTab<K extends string> = {
  key: K;
  label: string;
  count?: number;
  icon?: (color: string) => React.ReactNode;
};

export function FeedTabs<K extends string>({
  tabs,
  value,
  onChange,
  trailing,
}: {
  tabs: FeedTab<K>[];
  value: K;
  onChange: (key: K) => void;
  trailing?: React.ReactNode;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.row}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
        style={styles.scroll}
      >
        {tabs.map((tab) => {
          const active = tab.key === value;
          const tint = active ? "#04170D" : colors.textSecondary;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => {
                if (active) return;
                tickFeedback();
                onChange(tab.key);
              }}
              style={({ pressed }) => [
                styles.tab,
                active && styles.tabActive,
                pressed && !active && styles.tabPressed,
              ]}
            >
              {tab.icon ? tab.icon(tint) : null}
              <Text style={[styles.tabText, { color: tint }]}>
                {tab.label}
                {tab.count ? ` · ${tab.count}` : ""}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {trailing}
    </View>
  );
}

export function SortChip({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Sort: ${label}`}
      hitSlop={6}
      onPress={() => {
        tickFeedback();
        onPress();
      }}
      style={({ pressed }) => [styles.sort, pressed && styles.tabPressed]}
    >
      <Text style={styles.sortText}>{label} ⇅</Text>
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  scroll: {
    flexGrow: 1,
    flexShrink: 1,
  },
  tabs: {
    gap: Spacing.sm,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.md,
    height: 34,
    borderRadius: Radius.pill,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  tabActive: {
    backgroundColor: Brand.primary,
    borderColor: Brand.primary,
  },
  tabPressed: {
    opacity: 0.7,
  },
  tabText: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  sort: {
    height: 34,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.45)",
  },
  sortText: {
    color: t.colors.accent,
    fontSize: 13,
    fontWeight: "700",
  },
}));
