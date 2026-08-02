import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { CheckIcon } from "@/components/icons";
import { BackButton } from "@/components/ui/back-button";
import { PressableScale } from "@/components/ui/pressable-scale";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Brand, Colors, Radius, Spacing } from "@/constants/theme";
import { OTHER_SPECIALTY, SPECIALTIES } from "@/constants/specialties";
import { selectFeedback } from "@/lib/haptics";
import { useProjectDraftStore } from "@/store/use-project-draft-store";

const options = [...SPECIALTIES, OTHER_SPECIALTY];

function SpecialtyCard({
  label,
  index,
  selected,
  onSelect,
}: {
  label: string;
  index: number;
  selected: boolean;
  onSelect: (label: string) => void;
}) {
  return (
    <Animated.View
      entering={FadeIn.delay(80 + index * 45).duration(360)}
      style={styles.cardWrap}
    >
      <PressableScale
        accessibilityLabel={label}
        onPress={() => onSelect(label)}
      >
        <View style={[styles.card, selected && styles.cardSelected]}>
          <Text
            style={[styles.cardLabel, selected && styles.cardLabelSelected]}
          >
            {label}
          </Text>
          <View style={styles.checkSlot}>
            {selected ? (
              <View style={styles.check}>
                <CheckIcon size={13} color="#04170D" strokeWidth={3} />
              </View>
            ) : null}
          </View>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

export default function ChooseSpecialtyScreen() {
  const setSpecialty = useProjectDraftStore((state) => state.setSpecialty);
  const [selected, setSelected] = useState<string | null>(null);
  const [custom, setCustom] = useState("");

  const isOther = selected === OTHER_SPECIALTY;
  const canContinue =
    selected !== null && (!isOther || custom.trim().length > 0);

  const handleSelect = (label: string) => {
    selectFeedback();
    setSelected(label);
    if (label !== OTHER_SPECIALTY) setCustom("");
  };

  const handleContinue = () => {
    if (!canContinue || selected === null) return;
    const value = isOther ? custom.trim() : selected;
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
              New project
            </Animated.Text>
            <Animated.Text
              entering={FadeIn.delay(80).duration(500)}
              style={styles.title}
            >
              What&apos;s your project?
            </Animated.Text>
            <Animated.Text
              entering={FadeIn.delay(150).duration(500)}
              style={styles.subtitle}
            >
              Pick the type of specialist you&apos;re looking for.
            </Animated.Text>

            <View style={styles.grid}>
              {options.map((label, index) => (
                <SpecialtyCard
                  key={label}
                  label={label}
                  index={index}
                  selected={selected === label}
                  onSelect={handleSelect}
                />
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            {isOther ? (
              <Animated.View entering={FadeIn.duration(240)}>
                <TextInput
                  value={custom}
                  onChangeText={setCustom}
                  placeholder="Describe the specialist you need"
                  placeholderTextColor={Colors.textMuted}
                  autoFocus
                  returnKeyType="done"
                  style={styles.input}
                />
              </Animated.View>
            ) : null}
            <PrimaryButton
              label="Continue"
              onPress={handleContinue}
              disabled={!canContinue}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
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
    color: Brand.primaryLight,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2.4,
    textTransform: "uppercase",
    textAlign: "center",
  },
  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    textAlign: "center",
    marginTop: Spacing.base,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: Spacing.xl,
    rowGap: Spacing.md,
  },
  cardWrap: {
    width: "48%",
  },
  card: {
    minHeight: 64,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  cardSelected: {
    borderColor: Brand.primary,
    backgroundColor: "rgba(22,179,100,0.12)",
  },
  cardLabel: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  cardLabelSelected: {
    color: "#FFFFFF",
  },
  checkSlot: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.primary,
  },
  input: {
    height: 54,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Brand.primary,
    color: Colors.text,
    fontSize: 16,
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
});
