import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect } from "react";
import { ScrollView, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { CheckIcon } from "@/components/icons";
import { TradeCard } from "@/components/trade/trade-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import {
  Brand,
  Radius,
  Spacing,
  makeStyles,
} from "@/constants/theme";
import { publicPhone, useTradeContact } from "@/hooks/use-trade-contact";
import {
  analyticsEvents,
  errorMessage,
  locationProps,
} from "@/lib/analytics-events";
import { startChat } from "@/lib/chat";
import { distanceMiles } from "@/lib/geo";
import { tapFeedback } from "@/lib/haptics";
import { toHref } from "@/lib/navigation";
import { createProject, requestDetailsFromDraft } from "@/lib/projects";
import { uploadImage } from "@/lib/storage-upload";
import type { Specialist } from "@/lib/trades";
import { useSpecialists } from "@/queries/use-specialists";
import { useAppStore } from "@/store/use-app-store";
import { useAuthStore } from "@/store/use-auth-store";
import { useProjectDraftStore } from "@/store/use-project-draft-store";

function SearchingHint({ label }: { label: string }) {
  const styles = useStyles();
  const value = useSharedValue(0);

  useEffect(() => {
    value.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [value]);

  const style = useAnimatedStyle(() => ({ opacity: 0.4 + value.value * 0.5 }));

  return (
    <Animated.Text style={[styles.searching, style]}>{label}</Animated.Text>
  );
}

function SkeletonCard() {
  const styles = useStyles();
  return (
    <View style={styles.card}>
      <View style={[styles.avatar, styles.skeletonBlock]} />
      <View style={styles.cardBody}>
        <View style={[styles.skeletonLine, { width: "62%" }]} />
        <View style={[styles.skeletonLine, { width: "40%", marginTop: 8 }]} />
      </View>
    </View>
  );
}

export default function SpecialistsScreen() {
  const styles = useStyles();
  const specialty = useProjectDraftStore((state) => state.specialty);
  const draftName = useProjectDraftStore((state) => state.name);
  const location = useProjectDraftStore((state) => state.location);
  const photoUri = useProjectDraftStore((state) => state.photoUri);
  const requestId = useProjectDraftStore((state) => state.requestId);
  const createdProjectId = useProjectDraftStore(
    (state) => state.createdProjectId,
  );
  const setCreatedProjectId = useProjectDraftStore(
    (state) => state.setCreatedProjectId,
  );
  const ensureRequestId = useProjectDraftStore(
    (state) => state.ensureRequestId,
  );
  const claimProjectCreation = useProjectDraftStore(
    (state) => state.claimProjectCreation,
  );
  const releaseProjectCreation = useProjectDraftStore(
    (state) => state.releaseProjectCreation,
  );
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const uid = useAuthStore((state) => state.user?.uid);
  const userName = useAuthStore((state) => state.user?.name);
  const userEmail = useAuthStore((state) => state.user?.email);
  const queryClient = useQueryClient();
  const contact = useTradeContact("card");

  const { data, isLoading } = useSpecialists(specialty, uid);
  const specialists = data?.items ?? [];
  const usedFallback = data?.usedFallback ?? false;

  useEffect(() => {
    if (!requestId) ensureRequestId();
  }, [requestId, ensureRequestId]);

  useEffect(() => {
    analyticsEvents.projectSpecialistsViewed({
      specialty,
      is_authenticated: isAuthenticated,
      request_id: useProjectDraftStore.getState().requestId,
    });
  }, [specialty, isAuthenticated]);

  useEffect(() => {
    if (isLoading) return;
    analyticsEvents.projectSpecialistsLoaded({
      specialty,
      count: specialists.length,
      used_fallback: usedFallback,
    });
  }, [isLoading, specialists.length, usedFallback, specialty]);

  useEffect(() => {
    if (!isAuthenticated || !uid || !specialty || createdProjectId) return;
    if (!claimProjectCreation()) return;
    const rid = ensureRequestId();
    const create = async () => {
      let attach: string[] = [];
      if (photoUri) {
        try {
          const url = await uploadImage(
            photoUri,
            `projects/${uid}/${Date.now()}.jpg`,
          );
          attach = [url];
        } catch {
          // proceed without the photo if upload fails
        }
      }
      const draft = useProjectDraftStore.getState();
      const details = requestDetailsFromDraft(draft, userEmail);
      const id = await createProject(uid, {
        title: specialty,
        specialtyLabel: specialty,
        description: draftName ?? "",
        ...details,
        requestId: rid,
        customerName: userName ?? "",
        customerMail: userEmail ?? "",
        attach,
      });
      setCreatedProjectId(id);
      analyticsEvents.projectCreated({
        project_id: id,
        request_id: rid,
        specialty,
        has_photo: attach.length > 0,
        ...locationProps(location),
        has_budget: details.budget !== null,
        start_option: details.startOptionKey ?? null,
        contact_methods: details.contactPreferences?.methods ?? [],
        description_length: (draftName ?? "").trim().length,
      });
      void queryClient.invalidateQueries({ queryKey: ["my-projects", uid] });
    };
    void create().catch((error: unknown) => {
      analyticsEvents.projectCreationFailed({
        specialty,
        error_message: errorMessage(error),
      });
      releaseProjectCreation();
    });
  }, [
    isAuthenticated,
    uid,
    specialty,
    createdProjectId,
    draftName,
    location,
    photoUri,
    userName,
    userEmail,
    ensureRequestId,
    setCreatedProjectId,
    queryClient,
    claimProjectCreation,
    releaseProjectCreation,
  ]);

  const trackOnboardingDone = (path: string) => {
    const app = useAppStore.getState();
    if (!app.hasCompletedOnboarding) {
      analyticsEvents.onboardingCompleted({ role: app.role, path });
    }
  };

  const handleLogin = () => {
    analyticsEvents.projectSpecialistsLoginTapped({ specialty });
    trackOnboardingDone("homeowner_specialists_login");
    completeOnboarding();
    router.push({
      pathname: "/auth",
      params: { next: "/homeowner-specialists" },
    });
  };

  const handleMessage = (specialist: Specialist) => {
    if (!uid) return;
    tapFeedback();
    analyticsEvents.specialistMessageTapped({
      screen: "project_specialists",
      specialist_owner_id: specialist.ownerId,
      trade_id: specialist.tradeId,
      specialty: specialist.specialtyLabel,
      rating: specialist.rating,
      reviews: specialist.reviews,
      position: specialists.indexOf(specialist),
      project_id: createdProjectId,
    });
    void startChat(uid, specialist.ownerId).then((threadId) => {
      router.push(toHref(`/chat?threadId=${encodeURIComponent(threadId)}`));
    });
  };

  const openTrade = (specialist: Specialist) => {
    tapFeedback();
    const project = createdProjectId
      ? `&projectId=${encodeURIComponent(createdProjectId)}`
      : "";
    router.push(
      toHref(
        `/trade/${encodeURIComponent(specialist.ownerId)}?tradeId=${encodeURIComponent(specialist.tradeId)}${project}`,
      ),
    );
  };

  const origin = location?.center ?? null;
  const distanceTo = (specialist: Specialist): number | null =>
    origin && specialist.lat != null && specialist.lng != null
      ? distanceMiles(origin[1], origin[0], specialist.lat, specialist.lng)
      : null;

  const goHome = () => {
    tapFeedback();
    analyticsEvents.projectSpecialistsGoHomeTapped({
      specialists_count: specialists.length,
    });
    trackOnboardingDone("homeowner_specialists_home");
    completeOnboarding();
    router.replace(toHref("/home"));
  };

  const showEmpty = !isLoading && specialists.length === 0;

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.requestId}>
              Request #{requestId ?? "CT-00000"}
            </Text>
            <Text style={styles.title}>{specialty ?? "Your project"}</Text>
            {location ? <Text style={styles.location}>{location.place_name}</Text> : null}
          </View>
        </View>

        {isAuthenticated ? (
          <Animated.View entering={FadeIn.duration(360)} style={styles.banner}>
            <View style={styles.bannerIcon}>
              <CheckIcon size={14} color="#04170D" strokeWidth={3} />
            </View>
            <Text style={styles.bannerText}>
              You&apos;re signed in — message any specialist below.
            </Text>
          </Animated.View>
        ) : null}

        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {usedFallback && !isLoading && specialists.length > 0 ? (
            <Text style={styles.fallbackNote}>
              No exact match yet — showing related specialists near you.
            </Text>
          ) : null}

          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : null}

          {specialists.map((specialist) => {
            const phone = publicPhone(specialist.owner);
            return (
              <Animated.View key={specialist.tradeId} entering={FadeIn.duration(360)}>
                <TradeCard
                  specialist={specialist}
                  distance={distanceTo(specialist)}
                  phone={phone}
                  onPress={() => openTrade(specialist)}
                  onMessage={
                    isAuthenticated ? () => handleMessage(specialist) : undefined
                  }
                  onCall={() => contact.call(specialist, phone)}
                />
              </Animated.View>
            );
          })}

          {isLoading ? (
            <SearchingHint label="Finding specialists near you…" />
          ) : null}

          {showEmpty ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No specialists yet</Text>
              <Text style={styles.emptyText}>
                {isAuthenticated
                  ? "We're still growing in your area — we'll notify you the moment a match appears."
                  : "We're still growing in your area. Sign in and we'll notify you the moment a match appears."}
              </Text>
            </View>
          ) : null}
        </ScrollView>

        {isAuthenticated ? (
          <View style={styles.footer}>
            <PrimaryButton label="Go to home" onPress={goHome} />
          </View>
        ) : (
          <View style={styles.footer}>
            <PrimaryButton label="Log in to message" onPress={handleLogin} />
            <Text style={styles.footerNote}>
              Free account — no credit card required.
            </Text>
          </View>
        )}
      </SafeAreaView>
    </ScreenBackground>
  );
}

const useStyles = makeStyles((t) => ({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.base,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.border,
  },
  headerText: {
    flex: 1,
    paddingTop: 4,
  },
  requestId: {
    color: t.colors.textSecondary,
    fontSize: 12.5,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  title: {
    color: t.colors.text,
    fontSize: 22,
    fontWeight: "800",
    marginTop: 3,
  },
  location: {
    color: t.colors.textSecondary,
    fontSize: 13.5,
    marginTop: 2,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.base,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: "rgba(22,179,100,0.12)",
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.3)",
  },
  bannerIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.primary,
  },
  bannerText: {
    flex: 1,
    color: t.colors.text,
    fontSize: 13.5,
    fontWeight: "600",
  },
  list: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  fallbackNote: {
    color: t.colors.textSecondary,
    fontSize: 13,
    marginBottom: Spacing.xs,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.base,
    padding: Spacing.base,
    borderRadius: Radius.lg,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(22,179,100,0.14)",
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.3)",
  },
  cardBody: {
    flex: 1,
  },
  skeletonBlock: {
    backgroundColor: t.colors.skeleton,
    borderColor: "transparent",
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: t.colors.skeleton,
  },
  searching: {
    color: t.colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    paddingTop: Spacing.sm,
  },
  empty: {
    alignItems: "center",
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  emptyTitle: {
    color: t.colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  emptyText: {
    color: t.colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  footerNote: {
    color: t.colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
  },
}));
