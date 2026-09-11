import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { type ReactNode, useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import {
  Brand,
  Radius,
  Spacing,
  makeStyles,
  useTheme,
} from "@/constants/theme";
import { analyticsEvents, locationProps } from "@/lib/analytics-events";
import { findObjectionable } from "@/lib/content-filter";
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
  const styles = useStyles();
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
  const styles = useStyles();
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
      {children}
    </View>
  );
}

export default function ContractorSetupTradeScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
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
  const [filterError, setFilterError] = useState<string | null>(null);

  useEffect(() => {
    analyticsEvents.tradeSetupViewed();
  }, []);

  const trackField = (field: string, value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    analyticsEvents.tradeSetupFieldCompleted({
      field,
      value: trimmed,
      value_length: trimmed.length,
    });
  };

  const onSubmit = (values: FormValues) => {
    if (findObjectionable(values.title, values.about, values.customSpecialty)) {
      analyticsEvents.contentFilterBlocked({
        screen: "trade_setup",
        fields: [
          findObjectionable(values.title) ? "title" : null,
          findObjectionable(values.about) ? "about" : null,
          findObjectionable(values.customSpecialty) ? "custom_specialty" : null,
        ].filter((field): field is string => field !== null),
      });
      setFilterError(
        "Please remove inappropriate language from your trade details.",
      );
      return;
    }
    setFilterError(null);
    patch({
      title: values.title.trim(),
      specialty: isOther ? values.customSpecialty.trim() : values.specialty,
      location: values.location,
      commuteDuration: values.commuteDuration,
      about: values.about.trim(),
      priceType: values.priceType,
      price: values.price.trim(),
    });
    analyticsEvents.tradeSetupSubmitted({
      title: values.title.trim(),
      specialty: isOther ? values.customSpecialty.trim() : values.specialty,
      is_custom_specialty: isOther,
      commute_minutes: values.commuteDuration,
      price_type: values.priceType,
      price: values.price.trim(),
      about: values.about.trim(),
      ...locationProps(values.location),
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
                    onBlur={() => {
                      onBlur();
                      trackField("title", value);
                    }}
                    placeholder="e.g. Mike's Plumbing"
                    placeholderTextColor={colors.textMuted}
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
                          analyticsEvents.tradeSetupOptionSelected({
                            field: "specialty",
                            value: option,
                          });
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
                      onBlur={() => {
                        onBlur();
                        trackField("custom_specialty", value);
                      }}
                      placeholder="Describe your specialty"
                      placeholderTextColor={colors.textMuted}
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
                  <LocationPicker
                    value={value}
                    onChange={onChange}
                    analyticsContext="trade_setup"
                  />
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
                          analyticsEvents.tradeSetupOptionSelected({
                            field: "commute_minutes",
                            value: String(duration),
                          });
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
                    onBlur={() => {
                      onBlur();
                      trackField("about", value);
                    }}
                    placeholder="What you do, experience, what makes you great…"
                    placeholderTextColor={colors.textMuted}
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
                          const next =
                            value === option.value ? "" : option.value;
                          analyticsEvents.tradeSetupOptionSelected({
                            field: "price_type",
                            value: next || "none",
                          });
                          onChange(next);
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
                      onBlur={() => {
                        onBlur();
                        trackField("price", value);
                      }}
                      placeholder="Amount, e.g. 75"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="number-pad"
                      style={[styles.input, styles.inputSpaced]}
                    />
                  )}
                />
              ) : null}
            </Section>
          </ScrollView>

          <View style={styles.footer}>
            {filterError ? (
              <Text style={styles.filterError}>{filterError}</Text>
            ) : null}
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
    paddingBottom: Spacing.xxl,
  },
  eyebrow: {
    color: t.colors.accent,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2.4,
    textTransform: "uppercase",
  },
  title: {
    color: t.colors.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginTop: Spacing.sm,
  },
  subtitle: {
    color: t.colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: Spacing.sm,
  },
  section: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  sectionLabel: {
    color: t.colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  sectionHint: {
    color: t.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  error: {
    color: t.colors.coin,
    fontSize: 12.5,
    fontWeight: "600",
  },
  input: {
    height: 54,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    color: t.colors.text,
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
    backgroundColor: t.colors.surface,
    borderWidth: 1.5,
    borderColor: t.colors.border,
  },
  chipSelected: {
    borderColor: Brand.primary,
    backgroundColor: "rgba(22,179,100,0.12)",
  },
  chipText: {
    color: t.colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  chipTextSelected: {
    color: t.colors.textStrong,
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  filterError: {
    color: t.colors.danger,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
}));
