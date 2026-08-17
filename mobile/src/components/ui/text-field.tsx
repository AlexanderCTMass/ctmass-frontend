import { StyleSheet, Text, TextInput, View } from "react-native";

import { Brand, Colors, Radius, Spacing } from "@/constants/theme";

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
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value ?? ""}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
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

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    minHeight: 48,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 15,
  },
  inputMultiline: {
    minHeight: 92,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: Brand.danger,
  },
  errorText: {
    color: Brand.danger,
    fontSize: 12.5,
  },
  hint: {
    color: Colors.textMuted,
    fontSize: 12.5,
  },
});
