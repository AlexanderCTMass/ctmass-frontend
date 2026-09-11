import { Pressable, Text, View } from "react-native";

import { Brand, Radius, Spacing, makeStyles } from "@/constants/theme";
import { setAnalyticsUserProperties } from "@/lib/analytics";
import { analyticsEvents } from "@/lib/analytics-events";
import { selectFeedback } from "@/lib/haptics";
import {
  resolveScheme,
  type ThemePreference,
  useThemeStore,
} from "@/store/use-theme-store";

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export function ThemeSelector() {
  const styles = useStyles();
  const preference = useThemeStore((state) => state.preference);
  const setPreference = useThemeStore((state) => state.setPreference);

  const select = (value: ThemePreference) => {
    if (value === preference && value !== "system") return;
    selectFeedback();
    const before = useThemeStore.getState();
    const fromTheme = resolveScheme(before);
    const fromPreference = before.preference;
    void setPreference(value).then(() => {
      const toTheme = resolveScheme(useThemeStore.getState());
      analyticsEvents.themeChanged({
        from_preference: fromPreference,
        to_preference: value,
        from_theme: fromTheme,
        to_theme: toTheme,
      });
      setAnalyticsUserProperties({ theme: toTheme, theme_preference: value });
    });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Appearance</Text>
      <View style={styles.options}>
        {OPTIONS.map((option) => {
          const selected = option.value === preference;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${option.label} theme`}
              onPress={() => select(option.value)}
              style={[styles.option, selected && styles.optionActive]}
            >
              <Text
                style={[styles.optionText, selected && styles.optionTextActive]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.hint}>
        {preference === "system"
          ? "System keeps the theme your phone used when you chose it. Tap System again to pick up a change."
          : `The app always uses the ${preference} theme.`}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  card: {
    padding: Spacing.base,
    borderRadius: Radius.md,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    gap: Spacing.md,
  },
  title: {
    color: t.colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  options: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  option: {
    flex: 1,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.colors.surfaceStrong,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  optionActive: {
    backgroundColor: Brand.primary,
    borderColor: Brand.primary,
  },
  optionText: {
    color: t.colors.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  optionTextActive: {
    color: t.colors.onAccent,
  },
  hint: {
    color: t.colors.textMuted,
    fontSize: 12.5,
    lineHeight: 17,
  },
}));
