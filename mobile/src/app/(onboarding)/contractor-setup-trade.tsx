import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
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
import { z } from "zod";

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

const schema = z
  .object({
    title: z.string().trim().min(2, "Enter a trade name."),
    specialty: z.string().min(1, "Pick a specialty."),
    customSpecialty: z.string(),
    location: z.custom<GeoPlace | null>(),
    commuteDuration: z.number(),
    about: z.string(),
    priceType: z.string(),
    price: z.string(),
  })
  .refine((value) => value.location != null, {
    message: "Add your service location.",
    path: ["location"],
  })
  .refine(
    (value) =>
      value.specialty !== OTHER_SPECIALTY ||
      value.customSpecialty.trim().length > 0,
    { message: "Describe your specialty.", path: ["customSpecialty"] },
  );

type FormValues = z.infer<typeof schema>;

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

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isValid, errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      title: "",
      specialty: "",
      customSpecialty: "",
      location: null,
      commuteDuration: 20,
      about: "",
      priceType: "",
      price: "",
    },
  });

  const specialty = useWatch({ control, name: "specialty" });
  const priceType = useWatch({ control, name: "priceType" });
  const isOther = specialty === OTHER_SPECIALTY;

  const onSubmit = (values: FormValues) => {
    patch({
      title: values.title.trim(),
      specialty: isOther ? values.customSpecialty.trim() : values.specialty,
      location: values.location,
      commuteDuration: values.commuteDuration,
      about: values.about.trim(),
      priceType: values.priceType,
      price: values.price.trim(),
    });
    router.push(toHref("/contractor-ready"));
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
            keyboardDismissMode="on-drag"
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
              <Controller
                control={control}
                name="title"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="e.g. Mike's Plumbing"
                    placeholderTextColor={Colors.textMuted}
                    style={styles.input}
                  />
                )}
              />
            </Section>

            <Section label="Primary specialty">
              <Controller
                control={control}
                name="specialty"
                render={({ field: { value, onChange } }) => (
                  <View style={styles.chipWrap}>
                    {specialtyOptions.map((option) => (
                      <Chip
                        key={option}
                        label={option}
                        selected={value === option}
                        onPress={() => {
                          selectFeedback();
                          onChange(option);
                          if (option !== OTHER_SPECIALTY) {
                            setValue("customSpecialty", "", {
                              shouldValidate: true,
                            });
                          }
                        }}
                      />
                    ))}
                  </View>
                )}
              />
              {isOther ? (
                <Controller
                  control={control}
                  name="customSpecialty"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Describe your specialty"
                      placeholderTextColor={Colors.textMuted}
                      style={[styles.input, styles.inputSpaced]}
                    />
                  )}
                />
              ) : null}
              {errors.customSpecialty ? (
                <Text style={styles.error}>
                  {errors.customSpecialty.message}
                </Text>
              ) : null}
            </Section>

            <Section
              label="Service location"
              hint="Where you're available to work — used to match you with nearby jobs."
            >
              <Controller
                control={control}
                name="location"
                render={({ field: { value, onChange } }) => (
                  <LocationPicker value={value} onChange={onChange} />
                )}
              />
              {errors.location ? (
                <Text style={styles.error}>{errors.location.message}</Text>
              ) : null}
            </Section>

            <Section label="Max travel time (minutes)">
              <Controller
                control={control}
                name="commuteDuration"
                render={({ field: { value, onChange } }) => (
                  <View style={styles.chipWrap}>
                    {commuteDurations.map((duration) => (
                      <Chip
                        key={duration}
                        label={`${duration}`}
                        selected={value === duration}
                        onPress={() => {
                          selectFeedback();
                          onChange(duration);
                        }}
                      />
                    ))}
                  </View>
                )}
              />
            </Section>

            <Section label="About your work" hint="Optional — a short pitch.">
              <Controller
                control={control}
                name="about"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="What you do, experience, what makes you great…"
                    placeholderTextColor={Colors.textMuted}
                    style={[styles.input, styles.textArea]}
                    multiline
                  />
                )}
              />
            </Section>

            <Section label="Pricing" hint="Optional.">
              <Controller
                control={control}
                name="priceType"
                render={({ field: { value, onChange } }) => (
                  <View style={styles.chipWrap}>
                    {priceTypes.map((option) => (
                      <Chip
                        key={option.value}
                        label={option.label}
                        selected={value === option.value}
                        onPress={() => {
                          selectFeedback();
                          onChange(value === option.value ? "" : option.value);
                        }}
                      />
                    ))}
                  </View>
                )}
              />
              {priceType ? (
                <Controller
                  control={control}
                  name="price"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Amount, e.g. 75"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="number-pad"
                      style={[styles.input, styles.inputSpaced]}
                    />
                  )}
                />
              ) : null}
            </Section>
          </ScrollView>

          <View style={styles.footer}>
            <PrimaryButton
              label="Continue"
              onPress={() => void handleSubmit(onSubmit)()}
              disabled={!isValid}
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
    paddingBottom: Spacing.xxl,
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
  error: {
    color: Brand.coin,
    fontSize: 12.5,
    fontWeight: "600",
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
