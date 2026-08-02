import { type Href, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { BrandLogo } from "@/components/brand-logo";
import { CheckIcon, GoogleIcon } from "@/components/icons";
import { AmbientBackground } from "@/components/onboarding/ambient-background";
import { PrimaryButton } from "@/components/ui/primary-button";
import { PressableScale } from "@/components/ui/pressable-scale";
import { Brand, Colors, Gradients, Radius, Spacing } from "@/constants/theme";
import { successFeedback, tapFeedback } from "@/lib/haptics";
import { isValidEmail, sendLoginLink, signInWithGoogle } from "@/lib/auth";
import { useAppStore } from "@/store/use-app-store";
import { type AuthProvider, useAuthStore } from "@/store/use-auth-store";

const roleLabel: Record<string, string> = {
  homeowner: "Homeowner",
  contractor: "Contractor",
};

export default function AuthScreen() {
  const role = useAppStore((state) => state.role);
  const resetOnboarding = useAppStore((state) => state.resetOnboarding);
  const signIn = useAuthStore((state) => state.signIn);

  const params = useLocalSearchParams<{ next?: string }>();
  const nextTarget = typeof params.next === "string" ? params.next : null;

  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const emailValid = isValidEmail(email);

  const finishMockSignIn = (provider: AuthProvider, address: string) => {
    successFeedback();
    signIn({ email: address, provider });
    if (nextTarget) router.replace(nextTarget as Href);
  };

  const handleSendLink = async () => {
    if (!emailValid || sending) return;
    if (nextTarget) {
      finishMockSignIn("email", email.trim());
      return;
    }
    setNotice(null);
    setSending(true);
    try {
      await sendLoginLink(email);
      setLinkSent(true);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setSending(false);
    }
  };

  const handleGoogle = async () => {
    if (nextTarget) {
      finishMockSignIn("google", email.trim() || "google-user@ctmass.app");
      return;
    }
    setNotice(null);
    try {
      await signInWithGoogle();
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={Gradients.screen}
        style={StyleSheet.absoluteFill}
      />
      <AmbientBackground />
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              entering={FadeInDown.duration(520)}
              style={styles.header}
            >
              <BrandLogo size={76} />
              <Text style={styles.title}>Sign in to CTMASS</Text>
              <Text style={styles.subtitle}>
                One free account for projects, proposals and CTMASS Coins.
              </Text>
              {role ? (
                <View style={styles.roleChip}>
                  <Text style={styles.roleChipText}>{roleLabel[role]}</Text>
                </View>
              ) : null}
            </Animated.View>

            {linkSent ? (
              <Animated.View
                entering={FadeInDown.duration(420)}
                style={styles.sentCard}
              >
                <View style={styles.sentIcon}>
                  <CheckIcon size={22} color="#04170D" strokeWidth={3} />
                </View>
                <Text style={styles.sentTitle}>Check your inbox</Text>
                <Text style={styles.sentText}>
                  We sent a sign-in link to {email.trim()}. Open it on this
                  device to finish signing in.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  hitSlop={10}
                  onPress={() => {
                    tapFeedback();
                    setLinkSent(false);
                  }}
                >
                  <Text style={styles.linkAction}>Use a different email</Text>
                </Pressable>
              </Animated.View>
            ) : (
              <Animated.View
                entering={FadeInDown.delay(120).duration(520)}
                style={styles.form}
              >
                <View style={styles.field}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor={Colors.textMuted}
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    returnKeyType="send"
                    onSubmitEditing={() => void handleSendLink()}
                    style={styles.input}
                  />
                </View>

                <PrimaryButton
                  label={sending ? "Sending…" : "Send login link"}
                  disabled={!emailValid || sending}
                  onPress={() => void handleSendLink()}
                />

                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                <PressableScale
                  accessibilityLabel="Continue with Google"
                  onPress={() => void handleGoogle()}
                >
                  <View style={styles.googleButton}>
                    <GoogleIcon size={20} />
                    <Text style={styles.googleText}>Continue with Google</Text>
                  </View>
                </PressableScale>

                <Text style={styles.legal}>
                  We&apos;ll email you a secure sign-in link — no password
                  needed.
                </Text>
              </Animated.View>
            )}

            {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          </ScrollView>

          {__DEV__ ? (
            <Pressable
              accessibilityRole="button"
              hitSlop={10}
              onPress={() => {
                resetOnboarding();
                router.replace("/welcome");
              }}
              style={styles.devAction}
            >
              <Text style={styles.devActionText}>Restart onboarding (dev)</Text>
            </Pressable>
          ) : null}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  header: {
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  title: {
    color: Colors.text,
    fontSize: 27,
    fontWeight: "800",
    marginTop: Spacing.md,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  roleChip: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(22,179,100,0.14)",
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.35)",
  },
  roleChipText: {
    color: Brand.primaryLight,
    fontSize: 13,
    fontWeight: "700",
  },
  form: {
    gap: Spacing.base,
  },
  field: {
    gap: 6,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    height: 54,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 16,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginVertical: Spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  googleButton: {
    height: 56,
    borderRadius: Radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: "#FFFFFF",
  },
  googleText: {
    color: "#1F2328",
    fontSize: 16,
    fontWeight: "700",
  },
  legal: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginTop: Spacing.xs,
  },
  sentCard: {
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.3)",
  },
  sentIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.primary,
    marginBottom: Spacing.xs,
  },
  sentTitle: {
    color: Colors.text,
    fontSize: 19,
    fontWeight: "800",
  },
  sentText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  linkAction: {
    color: Brand.primaryLight,
    fontSize: 14,
    fontWeight: "700",
    marginTop: Spacing.sm,
  },
  notice: {
    color: Brand.coin,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginTop: Spacing.lg,
  },
  devAction: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  devActionText: {
    color: Colors.textMuted,
    fontSize: 12,
  },
});
