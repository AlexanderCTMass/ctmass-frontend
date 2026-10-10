import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { z } from "zod";

import {
  ClockIcon,
  MailIcon,
  PhoneIcon,
  ResponsesIcon,
  TextMessageIcon,
} from "@/components/icons";
import { PrimaryButton } from "@/components/ui/primary-button";
import {
  CONTACT_BEST_TIMES,
  CONTACT_METHODS,
  type ContactBestTime,
  type ContactMethod,
  type ContactPreferences,
  PHONE_CONTACT_METHODS,
} from "@/constants/project-request";
import { Brand, Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { selectFeedback } from "@/lib/haptics";
import { isValidUSPhone } from "@/lib/shop-form";

const METHOD_VALUES = ["app", "phone", "sms", "email"] as const;
const TIME_VALUES = [
  "anytime",
  "morning",
  "afternoon",
  "evening",
  "weekends",
] as const;

const schema = z
  .object({
    methods: z.array(z.enum(METHOD_VALUES)).min(1),
    bestTime: z.enum(TIME_VALUES).nullable(),
    phone: z.string(),
  })
  .superRefine((values, ctx) => {
    if (!values.bestTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["bestTime"],
        message: "Choose the best time to reach you",
      });
    }
    const needsPhone = values.methods.some((method) =>
      PHONE_CONTACT_METHODS.includes(method),
    );
    if (needsPhone && !isValidUSPhone(values.phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message: "Enter a valid US phone number (+1 and 10 digits)",
      });
    }
  });

type FormValues = z.infer<typeof schema>;

function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  return `+1${digits.slice(-10)}`;
}

function MethodIcon({ method, color }: { method: ContactMethod; color: string }) {
  switch (method) {
    case "app":
      return <ResponsesIcon size={20} color={color} />;
    case "phone":
      return <PhoneIcon size={20} color={color} />;
    case "sms":
      return <TextMessageIcon size={20} color={color} />;
    default:
      return <MailIcon size={20} color={color} />;
  }
}

export function ContactPreferencesForm({
  initialPhone,
  onSubmit,
}: {
  initialPhone: string;
  onSubmit: (preferences: ContactPreferences, phone: string | null) => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const scrollRef = useRef<ScrollView>(null);
  const phoneY = useRef(0);

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { methods: [], bestTime: null, phone: initialPhone },
  });

  useEffect(() => {
    if (initialPhone && !getValues("phone")) {
      setValue("phone", initialPhone, { shouldValidate: true });
    }
  }, [initialPhone, getValues, setValue]);

  const methods = useWatch({ control, name: "methods" });
  const needsPhone = methods.some((method) =>
    PHONE_CONTACT_METHODS.includes(method),
  );

  const submit = (values: FormValues) => {
    onSubmit(
      {
        methods: values.methods,
        bestTime: values.bestTime as ContactBestTime,
      },
      needsPhone ? normalizePhone(values.phone) : null,
    );
  };

  return (
    <View style={styles.wrap}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Controller
          control={control}
          name="methods"
          render={({ field: { value, onChange } }) => (
            <View style={styles.methods}>
              {CONTACT_METHODS.map((item) => {
                const active = value.includes(item.value);
                const toggle = () => {
                  selectFeedback();
                  onChange(
                    active
                      ? value.filter((method) => method !== item.value)
                      : [...value, item.value],
                  );
                };
                return (
                  <Pressable
                    key={item.value}
                    accessibilityRole="switch"
                    accessibilityState={{ checked: active }}
                    accessibilityLabel={item.label}
                    onPress={toggle}
                    style={[styles.methodRow, active && styles.methodRowActive]}
                  >
                    <View
                      style={[
                        styles.methodIcon,
                        active && styles.methodIconActive,
                      ]}
                    >
                      <MethodIcon
                        method={item.value}
                        color={active ? colors.accent : colors.textSecondary}
                      />
                    </View>
                    <Text style={styles.methodLabel}>{item.label}</Text>
                    <Switch
                      value={active}
                      onValueChange={toggle}
                      trackColor={{
                        false: colors.switchTrack,
                        true: Brand.primary,
                      }}
                      thumbColor="#F6F9FC"
                      ios_backgroundColor={colors.switchTrack}
                    />
                  </Pressable>
                );
              })}
            </View>
          )}
        />

        {needsPhone ? (
          <View
            onLayout={(event) => {
              phoneY.current = event.nativeEvent.layout.y;
            }}
          >
            <Text style={styles.sectionLabel}>Phone number</Text>
            <Controller
              control={control}
              name="phone"
              render={({
                field: { value, onChange, onBlur },
                fieldState: { error, isDirty },
              }) => (
                <>
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onFocus={() => {
                      setTimeout(
                        () =>
                          scrollRef.current?.scrollTo({
                            y: Math.max(0, phoneY.current - Spacing.sm),
                            animated: true,
                          }),
                        250,
                      );
                    }}
                    placeholder="+1 (555) 123-4567"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                    style={[
                      styles.input,
                      error && (isDirty || value) ? styles.inputError : null,
                    ]}
                  />
                  {error && (isDirty || value) ? (
                    <Text style={styles.errorText}>{error.message}</Text>
                  ) : null}
                </>
              )}
            />
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <ClockIcon size={15} color={colors.textSecondary} />
          <Text style={styles.sectionLabel}>Best time to reach you</Text>
        </View>
        <Controller
          control={control}
          name="bestTime"
          render={({ field: { value, onChange } }) => (
            <View style={styles.chips}>
              {CONTACT_BEST_TIMES.map((item) => {
                const active = value === item.value;
                return (
                  <Pressable
                    key={item.value}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={item.label}
                    onPress={() => {
                      selectFeedback();
                      onChange(item.value);
                    }}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text
                      style={[styles.chipLabel, active && styles.chipLabelActive]}
                    >
                      {item.label}
                    </Text>
                    {item.hint ? (
                      <Text
                        style={[styles.chipHint, active && styles.chipHintActive]}
                      >
                        {item.hint}
                      </Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          )}
        />
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label="Confirm"
          withArrow={false}
          disabled={!isValid}
          onPress={() => {
            void handleSubmit(submit)();
          }}
        />
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: {
    flexShrink: 1,
    maxHeight: "72%",
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
    backgroundColor: t.colors.backgroundElevated,
  },
  scroll: {
    flexShrink: 1,
  },
  content: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  methods: {
    gap: Spacing.sm,
  },
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    minHeight: 54,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  methodRowActive: {
    borderColor: "rgba(22,179,100,0.45)",
    backgroundColor: t.isDark ? "rgba(22,179,100,0.10)" : "rgba(22,179,100,0.07)",
  },
  methodIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.colors.surfaceStrong,
  },
  methodIconActive: {
    backgroundColor: "rgba(22,179,100,0.16)",
  },
  methodLabel: {
    flex: 1,
    color: t.colors.text,
    fontSize: 15.5,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: Spacing.sm,
  },
  sectionLabel: {
    color: t.colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  input: {
    height: 52,
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.base,
    borderRadius: Radius.md,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    color: t.colors.text,
    fontSize: 16,
  },
  inputError: {
    borderColor: t.colors.danger,
  },
  errorText: {
    marginTop: 6,
    color: t.colors.danger,
    fontSize: 12.5,
    fontWeight: "600",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 9,
    borderRadius: Radius.pill,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  chipActive: {
    backgroundColor: Brand.primary,
    borderColor: Brand.primary,
  },
  chipLabel: {
    color: t.colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  chipLabelActive: {
    color: t.colors.onAccent,
  },
  chipHint: {
    color: t.colors.textMuted,
    fontSize: 12,
  },
  chipHintActive: {
    color: "rgba(4,23,13,0.72)",
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
}));
