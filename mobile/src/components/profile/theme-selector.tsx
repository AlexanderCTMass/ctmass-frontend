import { useTranslation } from "react-i18next";
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

const OPTIONS: ThemePreference[] = ["system", "light", "dark"];

export function ThemeSelector() {
  const styles = useStyles();
  const { t } = useTranslation();
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
      <Text style={styles.title}>{t("profile.theme.title")}</Text>
      <View style={styles.options}>
        {OPTIONS.map((option) => {
          const selected = option === preference;
          const label = t(`profile.theme.options.${option}`);
          return (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={t("profile.theme.optionA11y", { label })}
              onPress={() => select(option)}
              style={[styles.option, selected && styles.optionActive]}
            >
              <Text
                style={[styles.optionText, selected && styles.optionTextActive]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.hint}>
        {preference === "system"
          ? t("profile.theme.systemHint")
          : t(`profile.theme.fixedHint.${preference}`)}
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
