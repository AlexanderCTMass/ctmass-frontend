import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { type ReactNode, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { BackButton } from "@/components/ui/back-button";
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
import { analyticsEvents, errorMessage } from "@/lib/analytics-events";
import { findObjectionable } from "@/lib/content-filter";
import { selectFeedback, tapFeedback } from "@/lib/haptics";
import { type TradeProfile, updateTrade } from "@/lib/trades";
import { useTradeById } from "@/queries/use-trade";

const specialtyOptions = [...SPECIALTIES, OTHER_SPECIALTY];
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
    about: z.string(),
    priceType: z.string(),
    price: z.string(),
  })
  .refine(
    (value) =>
      value.specialty !== OTHER_SPECIALTY ||
      value.customSpecialty.trim().length > 0,
    { message: "Describe your specialty.", path: ["customSpecialty"] },
  );

type FormValues = z.infer<typeof schema>;

function specialtyId(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

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

function EditForm({ trade }: { trade: TradeProfile }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const queryClient = useQueryClient();

  const isKnownSpecialty = (SPECIALTIES as readonly string[]).includes(
    trade.specialtyLabel,
  );
  const {
    control,
    handleSubmit,
    setValue,
    formState: { isValid, errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      title: trade.name === "Specialist" ? "" : trade.name,
      specialty: trade.specialtyLabel
        ? isKnownSpecialty
          ? trade.specialtyLabel
          : OTHER_SPECIALTY
        : "",
      customSpecialty: isKnownSpecialty ? "" : trade.specialtyLabel,
      about: trade.about,
      priceType: trade.priceType,
      price: trade.price,
    },
  });

  const specialty = useWatch({ control, name: "specialty" });
  const priceType = useWatch({ control, name: "priceType" });
  const isOther = specialty === OTHER_SPECIALTY;
  const [filterError, setFilterError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (values: FormValues) => {
    if (findObjectionable(values.title, values.about, values.customSpecialty)) {
      analyticsEvents.contentFilterBlocked({
        screen: "trade_edit",
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
    if (saving) return;
    setSaving(true);
    const label = isOther ? values.customSpecialty.trim() : values.specialty;
    try {
      await updateTrade(trade.tradeId, {
        title: values.title.trim(),
        primarySpecialtyId: specialtyId(label),
        primarySpecialtyLabel: label,
        about: values.about.trim(),
        priceType: values.priceType,
        price: values.price.trim(),
      });
      analyticsEvents.tradeUpdated({ trade_id: trade.tradeId });
      void queryClient.invalidateQueries({
        queryKey: ["trade", "id", trade.tradeId],
      });
      void queryClient.invalidateQueries({ queryKey: ["trade", trade.ownerId] });
      tapFeedback();
      router.back();
    } catch (error) {
      analyticsEvents.tradeUpdateFailed({
        trade_id: trade.tradeId,
        error_message: errorMessage(error),
      });
      setSaving(false);
      setFilterError("Couldn't save your changes. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 12}
    >
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Edit trade</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
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
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
            )}
          />
          {errors.title ? (
            <Text style={styles.error}>{errors.title.message}</Text>
          ) : null}
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
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, styles.inputSpaced]}
                />
              )}
            />
          ) : null}
          {errors.customSpecialty ? (
            <Text style={styles.error}>{errors.customSpecialty.message}</Text>
          ) : null}
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
          label={saving ? "Saving…" : "Save changes"}
          onPress={() => void handleSubmit(onSubmit)()}
          disabled={!isValid || saving}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

export default function TradeEditScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const params = useLocalSearchParams<{ tradeId?: string }>();
  const tradeId =
    typeof params.tradeId === "string" ? params.tradeId : undefined;
  const { data: trade, isLoading } = useTradeById(tradeId);

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : !trade ? (
          <>
            <View style={styles.header}>
              <BackButton onPress={() => router.back()} />
              <View style={styles.headerSpacer} />
            </View>
            <View style={styles.center}>
              <Text style={styles.missing}>This trade isn&apos;t available.</Text>
            </View>
          </>
        ) : (
          <EditForm trade={trade} />
        )}
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
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  missing: {
    color: t.colors.textSecondary,
    fontSize: 15,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    color: t.colors.text,
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
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
