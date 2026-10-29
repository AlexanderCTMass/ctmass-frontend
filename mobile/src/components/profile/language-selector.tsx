import { useState } from "react";
import { useTranslation } from "react-i18next";
import { type LayoutChangeEvent, Pressable, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { Brand, Radius, Spacing, makeStyles } from "@/constants/theme";
import { setAnalyticsUserProperties } from "@/lib/analytics";
import { analyticsEvents } from "@/lib/analytics-events";
import { selectFeedback } from "@/lib/haptics";
import {
  type AppLanguage,
  SUPPORTED_LANGUAGES,
  currentLanguage,
  isAppLanguage,
} from "@/lib/i18n";
import { useLanguageStore } from "@/store/use-language-store";

const NATIVE_NAMES: Record<AppLanguage, string> = {
  en: "English",
  es: "Español",
};

const TRACK_PADDING = 4;
const SWIPE_THRESHOLD = 24;

export function LanguageSelector() {
  const styles = useStyles();
  const { t, i18n } = useTranslation();
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const [trackWidth, setTrackWidth] = useState(0);
  const active: AppLanguage = isAppLanguage(i18n.language)
    ? i18n.language
    : "en";
  const activeIndex = SUPPORTED_LANGUAGES.indexOf(active);
  const segmentWidth =
    trackWidth > 0
      ? (trackWidth - TRACK_PADDING * 2) / SUPPORTED_LANGUAGES.length
      : 0;

  const select = (next: AppLanguage) => {
    const from = currentLanguage();
    if (next === from) return;
    selectFeedback();
    void setLanguage(next).then(() => {
      analyticsEvents.languageChanged({
        from_language: from,
        to_language: next,
      });
      setAnalyticsUserProperties({
        app_language: next,
        app_language_source: "manual",
      });
    });
  };

  const selectByOffset = (offset: number) => {
    const index = SUPPORTED_LANGUAGES.indexOf(currentLanguage()) + offset;
    const next = SUPPORTED_LANGUAGES[index];
    if (next) select(next);
  };

  const swipe = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-12, 12])
    .onEnd((event) => {
      if (Math.abs(event.translationX) < SWIPE_THRESHOLD) return;
      scheduleOnRN(selectByOffset, event.translationX > 0 ? 1 : -1);
    });

  const thumbStyle = useAnimatedStyle(() => ({
    width: segmentWidth,
    transform: [
      { translateX: withTiming(activeIndex * segmentWidth, { duration: 220 }) },
    ],
  }));

  const onLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t("profile.language.title")}</Text>
      <GestureDetector gesture={swipe}>
        <View
          style={styles.track}
          onLayout={onLayout}
          accessibilityRole="radiogroup"
        >
          {segmentWidth > 0 ? (
            <Animated.View style={[styles.thumb, thumbStyle]} />
          ) : null}
          {SUPPORTED_LANGUAGES.map((language) => {
            const selected = language === active;
            return (
              <Pressable
                key={language}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={NATIVE_NAMES[language]}
                onPress={() => select(language)}
                style={styles.option}
              >
                <Text
                  style={[
                    styles.optionText,
                    selected && styles.optionTextActive,
                  ]}
                >
                  {NATIVE_NAMES[language]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </GestureDetector>
      <Text style={styles.hint}>{t("profile.language.hint")}</Text>
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
  track: {
    flexDirection: "row",
    height: 44,
    padding: TRACK_PADDING,
    borderRadius: Radius.pill,
    backgroundColor: t.colors.surfaceStrong,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  thumb: {
    position: "absolute",
    top: TRACK_PADDING,
    bottom: TRACK_PADDING,
    left: TRACK_PADDING,
    borderRadius: Radius.pill,
    backgroundColor: Brand.primary,
  },
  option: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
