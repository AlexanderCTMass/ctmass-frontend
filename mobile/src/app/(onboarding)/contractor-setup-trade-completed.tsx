import { useQueryClient } from "@tanstack/react-query";
import { Redirect, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { CheckIcon } from "@/components/icons";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import {
  Brand,
  Radius,
  Spacing,
  makeStyles,
  useTheme,
} from "@/constants/theme";
import { groupOfTrade } from "@/constants/trade-taxonomy";
import {
  analyticsEvents,
  errorMessage,
  locationProps,
} from "@/lib/analytics-events";
import { successFeedback } from "@/lib/haptics";
import { toHref } from "@/lib/navigation";
import { emptyDetailsInput } from "@/lib/trade-details";
import { createTrade } from "@/lib/trades";
import { useAppStore } from "@/store/use-app-store";
import { useAuthStore } from "@/store/use-auth-store";
import { useTradeDraftStore } from "@/store/use-trade-draft-store";

const perks = [
  "Multiple specialties on one profile",
  "Portfolio and reviews for each trade",
  "More leads with a complete profile",
];

export default function ContractorTradeCompletedScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const uid = useAuthStore((state) => state.user?.uid);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);

  const draft = useTradeDraftStore();
  const setCreatedTradeId = useTradeDraftStore(
    (state) => state.setCreatedTradeId,
  );

  const canCreate = Boolean(draft.title && draft.specialty && draft.location);
  const [creating, setCreating] = useState(!draft.createdTradeId && canCreate);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const startedRef = useRef(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!uid || startedRef.current) return;
    if (draft.createdTradeId || !canCreate) return;
    startedRef.current = true;
    const specialty = draft.specialty;
    const location = draft.location;
    if (!specialty || !location) return;

    const details = draft.details ?? emptyDetailsInput(groupOfTrade(specialty));

    void createTrade(uid, {
      title: draft.title,
      primarySpecialtyLabel: specialty,
      about: draft.about,
      location: {
        address: location.place_name,
        addressLocation: location,
        commuteMode: "driving",
        commuteDuration: 20,
      },
      details,
    })
      .then((tradeId) => {
        analyticsEvents.tradeCreated({
          trade_id: tradeId,
          specialty,
          trade_group: details.groupId,
          pricing_model: details.rates.model,
          experience_years: details.experienceYears,
          radius_miles: details.radiusMiles,
          ...locationProps(location),
        });
        setCreatedTradeId(tradeId);
        void queryClient.invalidateQueries({ queryKey: ["trade"] });
        void queryClient.invalidateQueries({ queryKey: ["specialists"] });
        void queryClient.invalidateQueries({ queryKey: ["specialist-pool"] });
        void queryClient.invalidateQueries({ queryKey: ["owner-trades"] });
        successFeedback();
        setCreating(false);
      })
      .catch((error: unknown) => {
        analyticsEvents.tradeCreationFailed({
          error_message: errorMessage(error),
        });
        startedRef.current = false;
        setFailed(true);
        setCreating(false);
      });
  }, [
    attempt,
    uid,
    draft.createdTradeId,
    draft.title,
    draft.specialty,
    draft.location,
    draft.about,
    draft.details,
    canCreate,
    setCreatedTradeId,
    queryClient,
  ]);

  if (!isAuthenticated) {
    return <Redirect href="/auth" />;
  }

  const handleRetry = () => {
    analyticsEvents.tradeCreationRetried();
    setFailed(false);
    setCreating(true);
    setAttempt((value) => value + 1);
  };

  const finishOnboarding = () => {
    const app = useAppStore.getState();
    if (!app.hasCompletedOnboarding) {
      analyticsEvents.onboardingCompleted({
        role: app.role,
        path: "contractor_trade_completed",
      });
    }
    completeOnboarding();
    router.replace(toHref("/home"));
  };

  const handleViewTrades = () => {
    analyticsEvents.tradeCompletedViewTradesTapped();
    finishOnboarding();
    if (uid) router.push(toHref(`/user/${uid}`));
  };

  const handleGoHome = () => {
    analyticsEvents.tradeCompletedDashboardTapped();
    finishOnboarding();
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.body}>
          {creating ? (
            <Animated.View
              entering={FadeIn.duration(300)}
              style={styles.center}
            >
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={styles.creatingText}>Publishing your trade…</Text>
            </Animated.View>
          ) : failed ? (
            <Animated.View
              entering={FadeIn.duration(300)}
              style={styles.center}
            >
              <Text style={styles.title}>Couldn&apos;t publish your trade</Text>
              <Text style={styles.subtitle}>
                Check your internet connection and try again. Everything you
                entered is saved.
              </Text>
            </Animated.View>
          ) : (
            <>
              <Animated.View
                entering={FadeIn.duration(500)}
                style={styles.iconWrap}
              >
                <View style={styles.iconCircle}>
                  <CheckIcon size={32} color="#04170D" strokeWidth={3} />
                </View>
              </Animated.View>

              <Animated.Text
                entering={FadeInDown.delay(120).duration(520)}
                style={styles.title}
              >
                Trade created
              </Animated.Text>
              <Animated.Text
                entering={FadeInDown.delay(180).duration(520)}
                style={styles.subtitle}
              >
                Your trade is live in the app right away — homeowners can
                find it in search, and you can already respond to nearby jobs.
              </Animated.Text>

              <Animated.View
                entering={FadeInDown.delay(260).duration(520)}
                style={styles.card}
              >
                <Text style={styles.cardTitle}>
                  More is available on the web
                </Text>
                {perks.map((perk) => (
                  <View key={perk} style={styles.perkRow}>
                    <CheckIcon
                      size={14}
                      color={colors.accent}
                      strokeWidth={3}
                    />
                    <Text style={styles.perkText}>{perk}</Text>
                  </View>
                ))}
              </Animated.View>
            </>
          )}
        </View>

        {!creating ? (
          <View style={styles.footer}>
            {failed ? (
              <PrimaryButton
                label="Try again"
                withArrow={false}
                onPress={handleRetry}
              />
            ) : (
              <>
                <PrimaryButton
                  label="Go to my dashboard"
                  onPress={handleGoHome}
                />
                <Pressable
                  accessibilityRole="button"
                  hitSlop={10}
                  onPress={handleViewTrades}
                >
                  <Text style={styles.secondaryLink}>View my trades</Text>
                </Pressable>
              </>
            )}
          </View>
        ) : null}
      </SafeAreaView>
    </ScreenBackground>
  );
}

const useStyles = makeStyles((t) => ({
  safe: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: "center",
  },
  center: {
    alignItems: "center",
    gap: Spacing.base,
  },
  secondaryLink: {
    color: t.colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: Spacing.xs,
  },
  creatingText: {
    color: t.colors.textSecondary,
    fontSize: 15,
    fontWeight: "600",
  },
  iconWrap: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.primary,
  },
  title: {
    color: t.colors.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    color: t.colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  card: {
    marginTop: Spacing.xl,
    padding: Spacing.base,
    borderRadius: Radius.lg,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    gap: Spacing.sm,
  },
  cardTitle: {
    color: t.colors.text,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  perkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  perkText: {
    flex: 1,
    color: t.colors.textSecondary,
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
}));
