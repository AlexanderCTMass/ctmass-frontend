import type { ReactNode } from "react";
import {
  type StyleProp,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from "react-native";

import { PressableScale } from "@/components/ui/pressable-scale";
import { Toggle } from "@/components/ui/toggle";
import {
  Brand,
  Radius,
  Spacing,
  makeStyles,
  useTheme,
} from "@/constants/theme";
import { selectFeedback } from "@/lib/haptics";
import { translateKey, useT } from "@/lib/i18n";

export function FormSection({
  label,
  hint,
  error,
  optional,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  const styles = useStyles();
  const { t } = useT();
  return (
    <View style={styles.section}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {optional ? (
          <Text style={styles.optional}>{t("form.optional")}</Text>
        ) : null}
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {children}
      {error ? (
        <Text style={styles.error}>{translateKey(t, error)}</Text>
      ) : null}
    </View>
  );
}

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const styles = useStyles();
  const { tx } = useT();
  return (
    <PressableScale
      accessibilityLabel={tx(label)}
      onPress={() => {
        selectFeedback();
        onPress();
      }}
    >
      <View style={[styles.chip, selected && styles.chipSelected]}>
        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
          {tx(label)}
        </Text>
      </View>
    </PressableScale>
  );
}

export function ChoiceChips<T extends string | number>({
  options,
  value,
  onChange,
  allowClear = false,
}: {
  options: { value: T; label: string }[];
  value: string | number | null;
  onChange: (next: T | "") => void;
  allowClear?: boolean;
}) {
  const styles = useStyles();
  return (
    <View style={styles.chipWrap}>
      {options.map((option) => (
        <Chip
          key={String(option.value)}
          label={option.label}
          selected={value === option.value}
          onPress={() =>
            onChange(allowClear && value === option.value ? "" : option.value)
          }
        />
      ))}
    </View>
  );
}

export function MultiChips({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const styles = useStyles();
  return (
    <View style={styles.chipWrap}>
      {options.map((option) => {
        const selected = value.includes(option.value);
        return (
          <Chip
            key={option.value}
            label={option.label}
            selected={selected}
            onPress={() =>
              onChange(
                selected
                  ? value.filter((item) => item !== option.value)
                  : [...value, option.value],
              )
            }
          />
        );
      })}
    </View>
  );
}

export function FormInput({
  prefix,
  suffix,
  containerStyle,
  multiline,
  ...props
}: Omit<TextInputProps, "style"> & {
  prefix?: string;
  suffix?: string;
  containerStyle?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View
      style={[
        styles.inputWrap,
        multiline && styles.inputWrapMultiline,
        containerStyle,
      ]}
    >
      {prefix ? <Text style={styles.affix}>{prefix}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, multiline && styles.inputMultiline]}
        multiline={multiline}
        {...props}
      />
      {suffix ? <Text style={styles.affix}>{suffix}</Text> : null}
    </View>
  );
}

export function ToggleRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  const styles = useStyles();
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleText}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <Toggle
        value={value}
        onValueChange={onChange}
        accessibilityLabel={label}
      />
    </View>
  );
}

export function digitsOnly(text: string, max = 7): string {
  return text.replace(/[^0-9]/g, "").slice(0, max);
}

export const useFormPartStyles = makeStyles((t) => ({
  row: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  flex: {
    flex: 1,
  },
  note: {
    color: t.colors.textMuted,
    fontSize: 12.5,
    lineHeight: 18,
  },
  noteSpaced: {
    marginTop: Spacing.base,
  },
}));

const useStyles = makeStyles((t) => ({
  section: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  label: {
    color: t.colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  optional: {
    color: t.colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  hint: {
    color: t.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  error: {
    color: t.colors.dangerText,
    fontSize: 12.5,
    fontWeight: "600",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  chip: {
    minHeight: 40,
    justifyContent: "center",
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
  inputWrap: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.base,
    borderRadius: Radius.md,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  inputWrapMultiline: {
    alignItems: "flex-start",
    paddingVertical: Spacing.md,
  },
  input: {
    flex: 1,
    color: t.colors.text,
    fontSize: 16,
    paddingVertical: Spacing.sm,
  },
  inputMultiline: {
    minHeight: 92,
    paddingVertical: 0,
    textAlignVertical: "top",
  },
  affix: {
    color: t.colors.textSecondary,
    fontSize: 15,
    fontWeight: "700",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  toggleText: {
    flex: 1,
    gap: 2,
  },
  toggleLabel: {
    color: t.colors.text,
    fontSize: 14.5,
    fontWeight: "600",
  },
}));
