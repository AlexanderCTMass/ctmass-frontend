import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { PrimaryButton } from "@/components/ui/primary-button";
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";

type Props = {
  visible: boolean;
  title: string;
  subtitle: string;
  submitting: boolean;
  onSubmit: (rating: number, message: string) => void;
  onClose: () => void;
};

function ReviewPanel({
  title,
  subtitle,
  submitting,
  onSubmit,
  onClose,
}: Omit<Props, "visible">) {
  const { colors } = useTheme();
  const styles = useStyles();
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");

  return (
    <KeyboardAvoidingView
      style={styles.backdrop}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Pressable
        style={styles.backdropTap}
        accessibilityLabel="Close"
        onPress={onClose}
      />
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityLabel={`${value} star${value === 1 ? "" : "s"}`}
              hitSlop={6}
              onPress={() => setRating(value)}
            >
              <Text
                style={[
                  styles.star,
                  { color: value <= rating ? colors.coin : colors.border },
                ]}
              >
                ★
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Add a comment (optional)"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          multiline
        />

        <PrimaryButton
          label={submitting ? "Submitting…" : "Submit review"}
          withArrow={false}
          loading={submitting}
          disabled={submitting || rating === 0}
          onPress={() => onSubmit(rating, message)}
        />
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={onClose}
          disabled={submitting}
        >
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

export function ReviewModal({ visible, ...rest }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={rest.onClose}
    >
      {visible ? <ReviewPanel {...rest} /> : null}
    </Modal>
  );
}

const useStyles = makeStyles((t) => ({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    padding: Spacing.base,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  backdropTap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    backgroundColor: t.colors.background,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  title: {
    color: t.colors.text,
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  subtitle: {
    color: t.colors.textSecondary,
    fontSize: 13.5,
    lineHeight: 19,
  },
  stars: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  star: {
    fontSize: 40,
  },
  input: {
    minHeight: 92,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    color: t.colors.text,
    fontSize: 15,
    textAlignVertical: "top",
  },
  cancel: {
    color: t.colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: Spacing.xs,
  },
}));
