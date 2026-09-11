import Constants from "expo-constants";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandLogo } from "@/components/brand-logo";
import { AppleIcon, GoogleIcon } from "@/components/icons";
import { AmbientBackground } from "@/components/onboarding/ambient-background";
import { BackButton } from "@/components/ui/back-button";
import { PressableScale } from "@/components/ui/pressable-scale";
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import {
  AppleSignInCancelledError,
  isAppleSignInAvailable,
  signInWithApple,
  signInWithGoogle,
  signOutEverywhere,
} from "@/lib/auth";
import {
  analyticsEvents,
  currentScreen,
  errorMessage,
} from "@/lib/analytics-events";
import { GoogleSignInCancelledError } from "@/lib/firebase";
import { tapFeedback } from "@/lib/haptics";
import { toHref } from "@/lib/navigation";
import { useAppStore } from "@/store/use-app-store";
import { useAuthStore } from "@/store/use-auth-store";

const roleLabel: Record<string, string> = {
  homeowner: "Homeowner",
  contractor: "Contractor",
};

type Pending = "google" | "apple" | null;

const WEB_BASE_URL =
  (Constants.expoConfig?.extra?.webBaseUrl as string | undefined) ??
  "https://ctmass.com";

export default function AuthScreen() {
  const { gradients } = useTheme();
  const styles = useStyles();
  const role = useAppStore((state) => state.role);
  const resetOnboarding = useAppStore((state) => state.resetOnboarding);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const params = useLocalSearchParams<{ next?: string }>();
  const nextTarget = typeof params.next === "string" ? params.next : null;

  const [pending, setPending] = useState<Pending>(null);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const navigatedRef = useRef(false);

  useEffect(() => {
    let active = true;
    void isAppleSignInAvailable().then((available) => {
      if (!active) return;
      setAppleAvailable(available);
      analyticsEvents.authScreenViewed({
        role,
        next: nextTarget,
        apple_available: available,
      });
    });
    return () => {
      active = false;
    };
  }, [role, nextTarget]);

  useEffect(() => {
    if (!isAuthenticated || navigatedRef.current) return;
    navigatedRef.current = true;
    if (nextTarget) {
      router.replace(toHref(nextTarget));
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(toHref("/home"));
    }
  }, [isAuthenticated, nextTarget]);

  const handleGoogle = async () => {
    if (pending) return;
    setNotice(null);
    setPending("google");
    const startedAt = Date.now();
    analyticsEvents.signInStarted({ method: "google" });
    try {
      await signInWithGoogle();
      analyticsEvents.signInSucceeded({
        method: "google",
        duration_ms: Date.now() - startedAt,
      });
    } catch (error) {
      if (error instanceof GoogleSignInCancelledError) {
        analyticsEvents.signInCancelled({ method: "google" });
      } else {
        analyticsEvents.signInFailed({
          method: "google",
          error_message: errorMessage(error),
        });
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
    const startedAt = Date.now();
    analyticsEvents.signInStarted({ method: "apple" });
    try {
      await signInWithApple();
      analyticsEvents.signInSucceeded({
        method: "apple",
        duration_ms: Date.now() - startedAt,
      });
    } catch (error) {
      if (error instanceof AppleSignInCancelledError) {
        analyticsEvents.signInCancelled({ method: "apple" });
      } else {
        analyticsEvents.signInFailed({
          method: "apple",
          error_message: errorMessage(error),
        });
        setNotice(
          error instanceof Error ? error.message : "Something went wrong.",
        );
      }
    } finally {
      setPending(null);
    }
  };

  const openLegal = (path: string, title: string) => {
    tapFeedback();
    analyticsEvents.legalDocumentOpened({
      document: title,
      screen: currentScreen(),
    });
    router.push(
      toHref(
        `/web-view?url=${encodeURIComponent(`${WEB_BASE_URL}${path}`)}&title=${encodeURIComponent(title)}`,
      ),
    );
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={gradients.screen}
        style={StyleSheet.absoluteFill}
      />
      <AmbientBackground />
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {router.canGoBack() ? (
            <View style={styles.topBar}>
              <BackButton onPress={() => router.back()} />
            </View>
          ) : null}
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

              <Text style={styles.legal}>
                By continuing you agree to CTMASS&apos;s Terms and Privacy
                Policy.
              </Text>
              <View style={styles.legalLinks}>
                <Pressable
                  accessibilityRole="link"
                  hitSlop={8}
                  onPress={() =>
                    openLegal("/terms-and-conditions", "Terms of Service")
                  }
                >
                  <Text style={styles.legalLink}>Terms of Service</Text>
                </Pressable>
                <Text style={styles.legalDot}>·</Text>
                <Pressable
                  accessibilityRole="link"
                  hitSlop={8}
                  onPress={() => openLegal("/privacy-policy", "Privacy Policy")}
                >
                  <Text style={styles.legalLink}>Privacy Policy</Text>
                </Pressable>
              </View>
            </Animated.View>

            {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          </ScrollView>

          {__DEV__ ? (
            <Pressable
              accessibilityRole="button"
              hitSlop={10}
              onPress={() => {
                analyticsEvents.devOnboardingRestarted();
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

const useStyles = makeStyles((t) => ({
  root: {
    flex: 1,
    backgroundColor: t.colors.background,
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
  },
  header: {
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  title: {
    color: t.colors.text,
    fontSize: 27,
    fontWeight: "800",
    marginTop: Spacing.md,
  },
  subtitle: {
    color: t.colors.textSecondary,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  roleChip: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(22,179,100,0.14)",
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.35)",
  },
  roleChipText: {
    color: t.colors.accent,
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
    backgroundColor: t.isDark ? "#EBEEF3" : "#FFFFFF",
    borderWidth: 1,
    borderColor: t.isDark ? "rgba(255,255,255,0.10)" : t.colors.borderStrong,
  },
  googleText: {
    color: "#22262B",
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
    borderColor: t.isDark ? "rgba(255,255,255,0.16)" : "#000000",
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
    backgroundColor: t.colors.border,
  },
  dividerText: {
    color: t.colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  field: {
    gap: 6,
  },
  label: {
    color: t.colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    height: 54,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    color: t.colors.text,
    fontSize: 16,
  },
  fieldError: {
    color: t.colors.coin,
    fontSize: 12.5,
    fontWeight: "600",
  },
  emailButton: {
    height: 54,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.colors.surfaceStrong,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  emailButtonDisabled: {
    opacity: 0.6,
  },
  emailButtonText: {
    color: t.colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  emailButtonTextDisabled: {
    color: t.colors.textMuted,
  },
  emailButtonHint: {
    color: t.colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 1,
  },
  legal: {
    color: t.colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginTop: Spacing.xs,
  },
  legalLinks: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginTop: 4,
  },
  legalLink: {
    color: t.colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  legalDot: {
    color: t.colors.textMuted,
    fontSize: 12,
  },
  notice: {
    color: t.colors.coin,
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
    color: t.colors.textMuted,
    fontSize: 12,
  },
}));
