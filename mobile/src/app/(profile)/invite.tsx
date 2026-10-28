import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { UsersIcon } from "@/components/icons";
import { BackButton } from "@/components/ui/back-button";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { TextField } from "@/components/ui/text-field";
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { useSubmitErrorHaptic } from "@/hooks/use-submit-error-haptic";
import { analyticsEvents, errorMessage } from "@/lib/analytics-events";
import { sendFriendInvite } from "@/lib/friends";
import { useT } from "@/lib/i18n";
import { useQueryClient } from "@tanstack/react-query";
import { useProfile } from "@/queries/use-profile";
import { useAuthStore } from "@/store/use-auth-store";

const schema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "shop.validation.emailRequired")
    .email("shop.validation.emailInvalid"),
});

type FormValues = z.infer<typeof schema>;

export default function InviteScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useT();
  const uid = useAuthStore((state) => state.user?.uid);
  const storeName = useAuthStore((state) => state.user?.name ?? "");
  const { data: profile } = useProfile(uid);
  const inviterName = profile?.name || storeName || "A friend";

  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const queryClient = useQueryClient();
  const [topError, setTopError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, submitCount },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });
  useSubmitErrorHaptic(submitCount, errors);

  const submit = async (values: FormValues) => {
    if (!uid) return;
    analyticsEvents.friendInviteSubmitted({
      email_filled: values.email.trim().length > 0,
    });
    setSending(true);
    setTopError(null);
    try {
      const result = await sendFriendInvite(uid, inviterName, values.email);
      if (result === "self") {
        setTopError(t("invite.ownEmail"));
        return;
      }
      if (result === "connected") {
        analyticsEvents.friendAddedDirectly();
        void queryClient.invalidateQueries({ queryKey: ["friends"] });
      } else {
        analyticsEvents.friendInviteSent();
      }
      setConnected(result === "connected");
      setSentTo(values.email.trim());
      reset({ email: "" });
    } catch (error) {
      analyticsEvents.friendInviteFailed({
        error_message: errorMessage(error),
      });
      setTopError(t("invite.failed"));
    } finally {
      setSending(false);
    }
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.headerTitle}>{t("invite.title")}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 12}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.hero}>
              <View style={styles.heroIcon}>
                <UsersIcon size={26} color={colors.accent} />
              </View>
              <Text style={styles.heroTitle}>{t("invite.heroTitle")}</Text>
              <Text style={styles.heroText}>{t("invite.heroText")}</Text>
            </View>

            {sentTo ? (
              <View style={styles.successBanner}>
                <Text style={styles.successText}>
                  {connected
                    ? t("invite.alreadyFriends", { email: sentTo })
                    : t("invite.sent", { email: sentTo })}
                </Text>
              </View>
            ) : null}

            {topError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{topError}</Text>
              </View>
            ) : null}

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label={t("invite.email")}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  placeholder="friend@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />

            <View style={styles.submit}>
              <PrimaryButton
                label={sending ? t("invite.sending") : t("invite.send")}
                withArrow={false}
                loading={sending}
                disabled={sending}
                onPress={() =>
                  void handleSubmit(submit, (fieldErrors) =>
                    analyticsEvents.friendInviteValidationFailed({
                      fields: Object.keys(fieldErrors),
                    }),
                  )()
                }
              />
            </View>
          </ScrollView>
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
  content: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
    gap: Spacing.base,
  },
  hero: {
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.base,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(22,179,100,0.14)",
    marginBottom: Spacing.xs,
  },
  heroTitle: {
    color: t.colors.text,
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.3,
    textAlign: "center",
  },
  heroText: {
    color: t.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  successBanner: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    backgroundColor: "rgba(22,179,100,0.12)",
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.35)",
  },
  successText: {
    color: t.colors.accent,
    fontSize: 13.5,
    fontWeight: "600",
    lineHeight: 19,
  },
  errorBanner: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    backgroundColor: "rgba(240,68,56,0.12)",
    borderWidth: 1,
    borderColor: "rgba(240,68,56,0.4)",
  },
  errorBannerText: {
    color: t.colors.dangerText,
    fontSize: 13,
    fontWeight: "600",
  },
  submit: {
    marginTop: Spacing.sm,
  },
}));
