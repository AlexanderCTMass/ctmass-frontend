import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { MapPinIcon } from "@/components/icons";
import { BackButton } from "@/components/ui/back-button";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Brand, Colors, Radius, Spacing } from "@/constants/theme";
import { successFeedback } from "@/lib/haptics";
import { toHref } from "@/lib/navigation";
import { respondToProject } from "@/lib/projects";
import { useProject } from "@/queries/use-project";
import { useAuthStore } from "@/store/use-auth-store";

const schema = z.object({
  message: z.string().trim().min(2, "Write a short message."),
  price: z.string(),
});

type FormValues = z.infer<typeof schema>;

export default function RequestDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === "string" ? params.id : undefined;
  const uid = useAuthStore((state) => state.user?.uid);
  const userName = useAuthStore((state) => state.user?.name);

  const { data: project, isLoading } = useProject(id);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { message: "", price: "" },
  });

  const isOwnProject = Boolean(uid && project && project.userId === uid);
  const canRespond = Boolean(uid && project && !isOwnProject);

  const onSubmit = async (values: FormValues) => {
    if (!uid || !project || sending) return;
    setSending(true);
    setNotice(null);
    try {
      const text = values.price.trim()
        ? `${values.message.trim()}\n\nEstimated price: $${values.price.trim()}`
        : values.message.trim();
      const threadId = await respondToProject(
        { id: project.id, userId: project.userId },
        { uid, name: userName ?? "Specialist" },
        text,
      );
      successFeedback();
      router.replace(toHref(`/chat?threadId=${encodeURIComponent(threadId)}`));
    } catch {
      setNotice("Couldn't send your response. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const photo = project?.attach[0];

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={Brand.primaryLight} />
          </View>
        ) : !project ? (
          <View style={styles.center}>
            <Text style={styles.missing}>
              This request is no longer available.
            </Text>
          </View>
        ) : (
          <KeyboardAvoidingView
            style={styles.flex}
            behavior="padding"
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 12}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
            >
              {project.requestId ? (
                <Text style={styles.requestId}>
                  Request #{project.requestId}
                </Text>
              ) : null}
              <Text style={styles.title}>{project.title}</Text>
              {project.placeName ? (
                <View style={styles.placeRow}>
                  <MapPinIcon size={14} color={Colors.textSecondary} />
                  <Text style={styles.place}>{project.placeName}</Text>
                </View>
              ) : null}

              {photo ? (
                <Image
                  source={{ uri: photo }}
                  style={styles.photo}
                  contentFit="cover"
                  transition={200}
                />
              ) : null}

              {project.description ? (
                <Text style={styles.description}>{project.description}</Text>
              ) : (
                <Text style={styles.descriptionMuted}>
                  No description provided.
                </Text>
              )}

              {canRespond ? (
                <View style={styles.form}>
                  <Text style={styles.formLabel}>Your response</Text>
                  <Controller
                    control={control}
                    name="message"
                    render={({ field: { value, onChange, onBlur } }) => (
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Message to the homeowner"
                        placeholderTextColor={Colors.textMuted}
                        style={[styles.input, styles.textArea]}
                        multiline
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="price"
                    render={({ field: { value, onChange, onBlur } }) => (
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Estimated price, $"
                        placeholderTextColor={Colors.textMuted}
                        keyboardType="number-pad"
                        style={styles.input}
                      />
                    )}
                  />
                </View>
              ) : isOwnProject ? (
                <Text style={styles.ownNote}>This is your own request.</Text>
              ) : null}

              {notice ? <Text style={styles.notice}>{notice}</Text> : null}
            </ScrollView>

            {canRespond ? (
              <View style={styles.footer}>
                <PrimaryButton
                  label={sending ? "Sending…" : "Send response"}
                  onPress={() => void handleSubmit(onSubmit)()}
                  disabled={!isValid || sending}
                />
              </View>
            ) : null}
          </KeyboardAvoidingView>
        )}
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
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  missing: {
    color: Colors.textSecondary,
    fontSize: 15,
    textAlign: "center",
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  requestId: {
    color: Colors.textSecondary,
    fontSize: 12.5,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  title: {
    color: Colors.text,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginTop: 4,
  },
  placeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  place: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  photo: {
    width: "100%",
    height: 200,
    borderRadius: Radius.md,
    marginTop: Spacing.base,
    backgroundColor: Colors.surface,
  },
  description: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 22,
    marginTop: Spacing.base,
  },
  descriptionMuted: {
    color: Colors.textMuted,
    fontSize: 14,
    marginTop: Spacing.base,
  },
  form: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  formLabel: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  input: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    minHeight: 52,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 16,
  },
  textArea: {
    minHeight: 108,
    textAlignVertical: "top",
  },
  ownNote: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: Spacing.xl,
    textAlign: "center",
  },
  notice: {
    color: Brand.coin,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginTop: Spacing.base,
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
});
