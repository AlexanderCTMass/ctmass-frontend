import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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

import { MapPinIcon } from "@/components/icons";
import { BackButton } from "@/components/ui/back-button";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { analyticsEvents, errorMessage } from "@/lib/analytics-events";
import { successFeedback } from "@/lib/haptics";
import { chatHref, toHref } from "@/lib/navigation";
import { respondToProject } from "@/lib/projects";
import { useProject } from "@/queries/use-project";
import { useTradeByOwner } from "@/queries/use-trade";
import { useAuthStore } from "@/store/use-auth-store";
import { useTradeDraftStore } from "@/store/use-trade-draft-store";

const schema = z.object({
  message: z.string().trim().min(2, "Write a short message."),
  price: z.string(),
});

type FormValues = z.infer<typeof schema>;

export default function RequestDetailScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === "string" ? params.id : undefined;
  const uid = useAuthStore((state) => state.user?.uid);
  const userName = useAuthStore((state) => state.user?.name);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const requireAuth = useRequireAuth();

  const queryClient = useQueryClient();
  const myTrade = useTradeByOwner(uid);
  const resetTradeDraft = useTradeDraftStore((state) => state.reset);

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
  const hasTrade = Boolean(myTrade.data);
  const needsAuth = Boolean(!isAuthenticated && project && !isOwnProject);
  const canRespond = Boolean(
    isAuthenticated && uid && project && !isOwnProject && hasTrade,
  );
  const needsTrade = Boolean(
    isAuthenticated &&
      uid &&
      project &&
      !isOwnProject &&
      !hasTrade &&
      !myTrade.isLoading,
  );

  const viewedRef = useRef(false);
  useEffect(() => {
    if (!project || viewedRef.current) return;
    if (isAuthenticated && myTrade.isLoading) return;
    viewedRef.current = true;
    analyticsEvents.requestViewed({
      project_id: project.id,
      specialty: project.specialtyLabel,
      state: project.state,
      has_photo: Boolean(project.attach[0]),
      can_respond: canRespond,
      needs_trade: needsTrade,
      needs_auth: needsAuth,
      is_own: isOwnProject,
    });
  }, [
    project,
    isAuthenticated,
    myTrade.isLoading,
    canRespond,
    needsTrade,
    needsAuth,
    isOwnProject,
  ]);

  const goCreateTrade = () => {
    if (project) {
      analyticsEvents.requestCreateTradeTapped({ project_id: project.id });
    }
    resetTradeDraft();
    router.push(toHref("/contractor-setup-trade"));
  };

  const onSubmit = async (values: FormValues) => {
    if (!uid || !project || sending) return;
    analyticsEvents.requestResponseSubmitted({
      project_id: project.id,
      message_length: values.message.trim().length,
      price: values.price.trim(),
      has_price: values.price.trim().length > 0,
    });
    setSending(true);
    setNotice(null);
    try {
      const text = values.price.trim()
        ? `${values.message.trim()}\n\nEstimated price: $${values.price.trim()}`
        : values.message.trim();
      const threadId = await respondToProject(
        { id: project.id, userId: project.userId, title: project.title },
        { uid, name: userName ?? "Specialist" },
        text,
      );
      void queryClient.invalidateQueries({ queryKey: ["nearby-projects"] });
      analyticsEvents.requestResponseSent({
        project_id: project.id,
        thread_id: threadId,
      });
      successFeedback();
      router.replace(chatHref(threadId, project.customerName));
    } catch (error) {
      analyticsEvents.requestResponseFailed({
        project_id: project.id,
        error_message: errorMessage(error),
      });
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
            <ActivityIndicator color={colors.accent} />
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
                  <MapPinIcon size={14} color={colors.textSecondary} />
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

              {needsAuth ? (
                <View style={styles.needsTrade}>
                  <Text style={styles.needsTradeTitle}>Sign in to respond</Text>
                  <Text style={styles.needsTradeText}>
                    Create a free account to send your response and message the
                    homeowner.
                  </Text>
                </View>
              ) : canRespond ? (
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
                        placeholderTextColor={colors.textMuted}
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
                        placeholderTextColor={colors.textMuted}
                        keyboardType="number-pad"
                        style={styles.input}
                      />
                    )}
                  />
                </View>
              ) : needsTrade ? (
                <View style={styles.needsTrade}>
                  <Text style={styles.needsTradeTitle}>
                    Create a trade to respond
                  </Text>
                  <Text style={styles.needsTradeText}>
                    Set up your trade so homeowners can see who they&apos;re
                    hiring. It only takes a minute — then you can respond.
                  </Text>
                </View>
              ) : isOwnProject ? (
                <Text style={styles.ownNote}>This is your own request.</Text>
              ) : null}

              {notice ? <Text style={styles.notice}>{notice}</Text> : null}
            </ScrollView>

            {needsAuth ? (
              <View style={styles.footer}>
                <PrimaryButton
                  label="Sign in to respond"
                  onPress={() => {
                    analyticsEvents.requestSignInTapped({
                      project_id: project.id,
                    });
                    requireAuth();
                  }}
                />
              </View>
            ) : canRespond ? (
              <View style={styles.footer}>
                <PrimaryButton
                  label="Send response"
                  onPress={() => void handleSubmit(onSubmit)()}
                  disabled={!isValid}
                  loading={sending}
                />
              </View>
            ) : needsTrade ? (
              <View style={styles.footer}>
                <PrimaryButton
                  label="Create my trade"
                  onPress={goCreateTrade}
                />
              </View>
            ) : null}
          </KeyboardAvoidingView>
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
    color: t.colors.textSecondary,
    fontSize: 15,
    textAlign: "center",
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  requestId: {
    color: t.colors.textSecondary,
    fontSize: 12.5,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  title: {
    color: t.colors.text,
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
    color: t.colors.textSecondary,
    fontSize: 14,
  },
  photo: {
    width: "100%",
    height: 200,
    borderRadius: Radius.md,
    marginTop: Spacing.base,
    backgroundColor: t.colors.surface,
  },
  description: {
    color: t.colors.text,
    fontSize: 15,
    lineHeight: 22,
    marginTop: Spacing.base,
  },
  descriptionMuted: {
    color: t.colors.textMuted,
    fontSize: 14,
    marginTop: Spacing.base,
  },
  form: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  formLabel: {
    color: t.colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  input: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    minHeight: 52,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    color: t.colors.text,
    fontSize: 16,
  },
  textArea: {
    minHeight: 108,
    textAlignVertical: "top",
  },
  ownNote: {
    color: t.colors.textSecondary,
    fontSize: 14,
    marginTop: Spacing.xl,
    textAlign: "center",
  },
  needsTrade: {
    marginTop: Spacing.xl,
    padding: Spacing.base,
    borderRadius: Radius.md,
    backgroundColor: "rgba(255,193,7,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,193,7,0.3)",
    gap: Spacing.xs,
  },
  needsTradeTitle: {
    color: t.colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  needsTradeText: {
    color: t.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  notice: {
    color: t.colors.coin,
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
}));
