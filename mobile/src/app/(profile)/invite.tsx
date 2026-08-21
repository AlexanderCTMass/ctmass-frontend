import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
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
import { Brand, Colors, Radius, Spacing } from "@/constants/theme";
import { sendFriendInvite } from "@/lib/friends";
import { useProfile } from "@/queries/use-profile";
import { useAuthStore } from "@/store/use-auth-store";

const schema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
});

type FormValues = z.infer<typeof schema>;

export default function InviteScreen() {
  const uid = useAuthStore((state) => state.user?.uid);
  const storeName = useAuthStore((state) => state.user?.name ?? "");
  const { data: profile } = useProfile(uid);
  const inviterName = profile?.name || storeName || "A friend";

  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [topError, setTopError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const submit = async (values: FormValues) => {
    if (!uid) return;
    setSending(true);
    setTopError(null);
    try {
      await sendFriendInvite(uid, inviterName, values.email);
      setSentTo(values.email.trim());
      reset({ email: "" });
    } catch {
      setTopError("Couldn't send the invite. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Invite a friend</Text>
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
                <UsersIcon size={26} color={Brand.primaryLight} />
              </View>
              <Text style={styles.heroTitle}>Bring a friend to CTMASS</Text>
              <Text style={styles.heroText}>
                Enter their email and we&apos;ll send them an invite. When they
                join, you&apos;ll automatically be connected as friends.
              </Text>
            </View>

            {sentTo ? (
              <View style={styles.successBanner}>
                <Text style={styles.successText}>
                  Invitation sent to {sentTo}. You&apos;ll be connected once they
                  join.
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
                  label="Friend's email"
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
                label={sending ? "Sending…" : "Send invite"}
                withArrow={false}
                loading={sending}
                disabled={sending}
                onPress={() => void handleSubmit(submit)()}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    color: Colors.text,
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
    color: Colors.text,
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.3,
    textAlign: "center",
  },
  heroText: {
    color: Colors.textSecondary,
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
    color: Brand.primaryLight,
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
    color: "#FCA5A5",
    fontSize: 13,
    fontWeight: "600",
  },
  submit: {
    marginTop: Spacing.sm,
  },
});
