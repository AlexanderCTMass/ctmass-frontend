import { router } from "expo-router";
import type { ReactNode } from "react";
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

import { BackButton } from "@/components/ui/back-button";
import { LocationPicker } from "@/components/ui/location-picker";
import { PressableScale } from "@/components/ui/pressable-scale";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { OTHER_SPECIALTY, SPECIALTIES } from "@/constants/specialties";
import { Brand, Colors, Radius, Spacing } from "@/constants/theme";
import { selectFeedback } from "@/lib/haptics";
import type { GeoPlace } from "@/lib/mapbox";
import { toHref } from "@/lib/navigation";
import { useTradeDraftStore } from "@/store/use-trade-draft-store";

const specialtyOptions = [...SPECIALTIES, OTHER_SPECIALTY];
const commuteDurations = [10, 20, 30, 40, 50];
const priceTypes = [
  { value: "hourly", label: "Hourly" },
  { value: "project", label: "Per project" },
  { value: "consultation", label: "Consultation" },
];

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <PressableScale accessibilityLabel={label} onPress={onPress}>
      <View style={[styles.chip, selected && styles.chipSelected]}>
        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
          {label}
        </Text>
      </View>
    </PressableScale>
  );
}

function Section({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
      {children}
    </View>
  );
}

export default function ContractorSetupTradeScreen() {
  const patch = useTradeDraftStore((state) => state.patch);

  const [title, setTitle] = useState("");
  const [specialty, setSpecialty] = useState<string | null>(null);
  const [customSpecialty, setCustomSpecialty] = useState("");
  const [place, setPlace] = useState<GeoPlace | null>(null);
  const [commuteDuration, setCommuteDuration] = useState(20);
  const [about, setAbout] = useState("");
  const [priceType, setPriceType] = useState("");
  const [price, setPrice] = useState("");

  const isOther = specialty === OTHER_SPECIALTY;
  const specialtyResolved = isOther ? customSpecialty.trim() : specialty;
  const canContinue = Boolean(title.trim() && specialtyResolved && place);

  const handleSpecialty = (label: string) => {
    selectFeedback();
    setSpecialty(label);
    if (label !== OTHER_SPECIALTY) setCustomSpecialty("");
  };

  const handleContinue = () => {
    if (!canContinue || !specialtyResolved) return;
    patch({
      title: title.trim(),
      specialty: specialtyResolved,
      location: place,
      commuteDuration,
      about: about.trim(),
      priceType,
      price: price.trim(),
    });
    router.push(toHref("/contractor-ready"));
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
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
              Your trade
            </Animated.Text>
            <Animated.Text
              entering={FadeIn.delay(80).duration(500)}
              style={styles.title}
            >
              Set up your trade
            </Animated.Text>
            <Animated.Text
              entering={FadeIn.delay(150).duration(500)}
              style={styles.subtitle}
            >
              A few quick details so local homeowners can find you.
            </Animated.Text>

            <Section label="Trade name">
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Mike's Plumbing"
                placeholderTextColor={Colors.textMuted}
                style={styles.input}
              />
            </Section>

            <Section label="Primary specialty">
              <View style={styles.chipWrap}>
                {specialtyOptions.map((option) => (
                  <Chip
                    key={option}
                    label={option}
                    selected={specialty === option}
                    onPress={() => handleSpecialty(option)}
                  />
                ))}
              </View>
              {isOther ? (
                <TextInput
                  value={customSpecialty}
                  onChangeText={setCustomSpecialty}
                  placeholder="Describe your specialty"
                  placeholderTextColor={Colors.textMuted}
                  style={[styles.input, styles.inputSpaced]}
                />
              ) : null}
            </Section>

            <Section
              label="Service location"
              hint="Where you're available to work — used to match you with nearby jobs."
            >
              <LocationPicker value={place} onChange={setPlace} />
            </Section>

            <Section label="Max travel time (minutes)">
              <View style={styles.chipWrap}>
                {commuteDurations.map((duration) => (
                  <Chip
                    key={duration}
                    label={`${duration}`}
                    selected={commuteDuration === duration}
                    onPress={() => {
                      selectFeedback();
                      setCommuteDuration(duration);
                    }}
                  />
                ))}
              </View>
            </Section>

            <Section label="About your work" hint="Optional — a short pitch.">
              <TextInput
                value={about}
                onChangeText={setAbout}
                placeholder="What you do, experience, what makes you great…"
                placeholderTextColor={Colors.textMuted}
                style={[styles.input, styles.textArea]}
                multiline
              />
            </Section>

            <Section label="Pricing" hint="Optional.">
              <View style={styles.chipWrap}>
                {priceTypes.map((option) => (
                  <Chip
                    key={option.value}
                    label={option.label}
                    selected={priceType === option.value}
                    onPress={() => {
                      selectFeedback();
                      setPriceType(
                        priceType === option.value ? "" : option.value,
                      );
                    }}
                  />
                ))}
              </View>
              {priceType ? (
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  placeholder="Amount, e.g. 75"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="number-pad"
                  style={[styles.input, styles.inputSpaced]}
                />
              ) : null}
            </Section>
          </ScrollView>

          <View style={styles.footer}>
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
  },
  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginTop: Spacing.sm,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: Spacing.sm,
  },
  section: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  sectionLabel: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  sectionHint: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  input: {
    height: 54,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 16,
  },
  inputSpaced: {
    marginTop: Spacing.sm,
  },
  textArea: {
    height: 108,
    paddingTop: Spacing.md,
    textAlignVertical: "top",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chipSelected: {
    borderColor: Brand.primary,
    backgroundColor: "rgba(22,179,100,0.12)",
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  chipTextSelected: {
    color: "#FFFFFF",
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
});
