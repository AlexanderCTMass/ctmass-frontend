import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { TradePicker } from "@/components/trade/trade-picker";
import { BackButton } from "@/components/ui/back-button";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import {
  Brand,
  Radius,
  Spacing,
  makeStyles,
  useTheme,
} from "@/constants/theme";
import { OTHER_TRADE_LABEL, TRADE_ITEMS } from "@/constants/trade-taxonomy";
import { analyticsEvents } from "@/lib/analytics-events";
import { selectFeedback } from "@/lib/haptics";
import { useT } from "@/lib/i18n";
import { useProjectDraftStore } from "@/store/use-project-draft-store";

export default function ChooseSpecialtyScreen() {
  const { colors } = useTheme();
  const { t } = useT();
  const styles = useStyles();
  const setSpecialty = useProjectDraftStore((state) => state.setSpecialty);
  const [selected, setSelected] = useState<string | null>(null);
  const [custom, setCustom] = useState("");

  const isOther = selected === OTHER_TRADE_LABEL;
  const canContinue =
    selected !== null && (!isOther || custom.trim().length > 0);

  useEffect(() => {
    analyticsEvents.projectSpecialtyViewed();
  }, []);

  const handleSelect = (label: string) => {
    selectFeedback();
    analyticsEvents.projectSpecialtySelected({
      specialty: label,
      is_other: label === OTHER_TRADE_LABEL,
      position: TRADE_ITEMS.findIndex((item) => item.label === label),
    });
    setSelected(label);
    if (label !== OTHER_TRADE_LABEL) setCustom("");
  };

  const handleContinue = () => {
    if (!canContinue || selected === null) return;
    const value = isOther ? custom.trim() : selected;
    analyticsEvents.projectSpecialtyContinueTapped({
      specialty: value,
      is_other: isOther,
      custom_specialty: isOther ? value : null,
    });
    setSpecialty(value);
    router.push("/homeowner-brief");
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 12}
        >
          <View style={styles.header}>
            <BackButton onPress={() => router.back()} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.Text
              entering={FadeIn.duration(460)}
              style={styles.eyebrow}
            >
              {t("chooseSpecialty.eyebrow")}
            </Animated.Text>
            <Animated.Text
              entering={FadeIn.delay(80).duration(500)}
              style={styles.title}
            >
              {t("chooseSpecialty.title")}
            </Animated.Text>
            <Animated.Text
              entering={FadeIn.delay(150).duration(500)}
              style={styles.subtitle}
            >
              {t("chooseSpecialty.subtitle")}
            </Animated.Text>

            <View style={styles.picker}>
              <TradePicker value={selected} onChange={handleSelect} />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            {isOther ? (
              <Animated.View entering={FadeIn.duration(240)}>
                <TextInput
                  value={custom}
                  onChangeText={setCustom}
                  placeholder={t("chooseSpecialty.otherPlaceholder")}
                  placeholderTextColor={colors.textMuted}
                  autoFocus
                  returnKeyType="done"
                  style={styles.input}
                />
              </Animated.View>
            ) : null}
            <PrimaryButton
              label={t("common.continue")}
              onPress={handleContinue}
              disabled={!canContinue}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const useStyles = makeStyles((t) => ({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  eyebrow: {
    color: t.colors.accent,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2.4,
    textTransform: "uppercase",
    textAlign: "center",
  },
  title: {
    color: t.colors.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    textAlign: "center",
    marginTop: Spacing.base,
  },
  subtitle: {
    color: t.colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  picker: {
    marginTop: Spacing.xl,
  },
  input: {
    height: 54,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: Brand.primary,
    color: t.colors.text,
    fontSize: 16,
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
}));
