import { Text, TextInput, View } from "react-native";

import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";

export type TextFieldProps = {
  label: string;
  value: string | undefined;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words";
  hint?: string;
};

export function TextField({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  placeholder,
  multiline,
  keyboardType,
  autoCapitalize,
  hint,
}: TextFieldProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value ?? ""}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          error ? styles.inputError : null,
        ]}
      />
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: {
    gap: 6,
  },
  label: {
    color: t.colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    minHeight: 48,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    color: t.colors.text,
    fontSize: 15,
  },
  inputMultiline: {
    minHeight: 92,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: t.colors.danger,
  },
  errorText: {
    color: t.colors.danger,
    fontSize: 12.5,
  },
  hint: {
    color: t.colors.textMuted,
    fontSize: 12.5,
  },
}));
