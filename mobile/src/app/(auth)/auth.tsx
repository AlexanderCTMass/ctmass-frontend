import { zodResolver } from "@hookform/resolvers/zod";
import { type Href, router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
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
import { z } from "zod";

import { BrandLogo } from "@/components/brand-logo";
import { AppleIcon, GoogleIcon } from "@/components/icons";
import { AmbientBackground } from "@/components/onboarding/ambient-background";
import { PressableScale } from "@/components/ui/pressable-scale";
import { Brand, Colors, Gradients, Radius, Spacing } from "@/constants/theme";
import {
  AppleSignInCancelledError,
  isAppleSignInAvailable,
  signInWithApple,
  signInWithGoogle,
  signOutEverywhere,
} from "@/lib/auth";
import { GoogleSignInCancelledError } from "@/lib/firebase";
import { tapFeedback } from "@/lib/haptics";
import { useAppStore } from "@/store/use-app-store";
import { useAuthStore } from "@/store/use-auth-store";

const roleLabel: Record<string, string> = {
  homeowner: "Homeowner",
  contractor: "Contractor",
};

const emailSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

type EmailForm = z.infer<typeof emailSchema>;

type Pending = "google" | "apple" | null;

export default function AuthScreen() {
  const role = useAppStore((state) => state.role);
  const resetOnboarding = useAppStore((state) => state.resetOnboarding);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const params = useLocalSearchParams<{ next?: string }>();
  const nextTarget = typeof params.next === "string" ? params.next : null;

  const [pending, setPending] = useState<Pending>(null);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const navigatedRef = useRef(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  useEffect(() => {
    let active = true;
    void isAppleSignInAvailable().then((available) => {
      if (active) setAppleAvailable(available);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || navigatedRef.current) return;
    navigatedRef.current = true;
    router.replace((nextTarget ?? "/overview") as Href);
  }, [isAuthenticated, nextTarget]);

  const handleGoogle = async () => {
    if (pending) return;
    setNotice(null);
    setPending("google");
    try {
      await signInWithGoogle();
    } catch (error) {
      if (!(error instanceof GoogleSignInCancelledError)) {
        setNotice(
          error instanceof Error ? error.message : "Something went wrong.",
        );
      }
    } finally {
      setPending(null);
    }
  };

  const handleApple = async () => {
    if (pending) return;
    setNotice(null);
    setPending("apple");
    try {
      await signInWithApple();
    } catch (error) {
      if (!(error instanceof AppleSignInCancelledError)) {
        setNotice(
          error instanceof Error ? error.message : "Something went wrong.",
        );
      }
    } finally {
      setPending(null);
    }
  };

  const onEmailSubmit = () => {
    tapFeedback();
    setNotice("Email sign-in is coming soon — use Google or Apple for now.");
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

            <Animated.View
              entering={FadeInDown.delay(120).duration(520)}
              style={styles.form}
            >
              <PressableScale
                accessibilityLabel="Continue with Google"
                onPress={() => void handleGoogle()}
                disabled={pending !== null}
              >
                <View style={styles.googleButton}>
                  {pending === "google" ? (
                    <ActivityIndicator color="#1F2328" />
                  ) : (
                    <>
                      <GoogleIcon size={20} />
                      <Text style={styles.googleText}>
                        Continue with Google
                      </Text>
                    </>
                  )}
                </View>
              </PressableScale>

              {appleAvailable ? (
                <PressableScale
                  accessibilityLabel="Continue with Apple"
                  onPress={() => void handleApple()}
                  disabled={pending !== null}
                >
                  <View style={styles.appleButton}>
                    {pending === "apple" ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <AppleIcon size={19} color="#FFFFFF" />
                        <Text style={styles.appleText}>
                          Continue with Apple
                        </Text>
                      </>
                    )}
                  </View>
                </PressableScale>
              ) : null}

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="you@example.com"
                      placeholderTextColor={Colors.textMuted}
                      autoCapitalize="none"
                      autoComplete="email"
                      keyboardType="email-address"
                      returnKeyType="done"
                      onSubmitEditing={() => void handleSubmit(onEmailSubmit)()}
                      style={styles.input}
                    />
                  )}
                />
                {errors.email ? (
                  <Text style={styles.fieldError}>{errors.email.message}</Text>
                ) : null}
              </View>

              <PressableScale
                accessibilityLabel="Continue with email"
                onPress={() => void handleSubmit(onEmailSubmit)()}
                disabled={!isValid}
              >
                <View
                  style={[
                    styles.emailButton,
                    !isValid && styles.emailButtonDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.emailButtonText,
                      !isValid && styles.emailButtonTextDisabled,
                    ]}
                  >
                    Continue with email
                  </Text>
                  <Text style={styles.emailButtonHint}>Coming soon</Text>
                </View>
              </PressableScale>

              <Text style={styles.legal}>
                By continuing you agree to the CTMASS Terms and Privacy Policy.
              </Text>
            </Animated.View>

            {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          </ScrollView>

          {__DEV__ ? (
            <Pressable
              accessibilityRole="button"
              hitSlop={10}
              onPress={() => {
                void signOutEverywhere();
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
  appleButton: {
    height: 56,
    borderRadius: Radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  appleText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
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
  fieldError: {
    color: Brand.coin,
    fontSize: 12.5,
    fontWeight: "600",
  },
  emailButton: {
    height: 54,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surfaceStrong,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emailButtonDisabled: {
    opacity: 0.6,
  },
  emailButtonText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  emailButtonTextDisabled: {
    color: Colors.textMuted,
  },
  emailButtonHint: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 1,
  },
  legal: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginTop: Spacing.xs,
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
