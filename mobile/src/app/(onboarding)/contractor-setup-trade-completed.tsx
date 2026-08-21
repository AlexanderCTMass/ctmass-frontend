import { Redirect, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { CheckIcon } from "@/components/icons";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Brand, Colors, Radius, Spacing } from "@/constants/theme";
import { successFeedback } from "@/lib/haptics";
import { toHref } from "@/lib/navigation";
import { createTrade } from "@/lib/trades";
import { useAppStore } from "@/store/use-app-store";
import { useAuthStore } from "@/store/use-auth-store";
import { useTradeDraftStore } from "@/store/use-trade-draft-store";

const perks = [
  "Multiple specialties on one profile",
  "Portfolio and reviews for each trade",
  "More leads with a complete profile",
];

function specialtyId(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function ContractorTradeCompletedScreen() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const uid = useAuthStore((state) => state.user?.uid);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);

  const draft = useTradeDraftStore();
  const setCreatedTradeId = useTradeDraftStore(
    (state) => state.setCreatedTradeId,
  );

  const canCreate = Boolean(draft.title && draft.specialty && draft.location);
  const [creating, setCreating] = useState(!draft.createdTradeId && canCreate);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!uid || startedRef.current) return;
    if (draft.createdTradeId || !canCreate) return;
    startedRef.current = true;
    const specialty = draft.specialty;
    const location = draft.location;
    if (!specialty || !location) return;

    void createTrade(uid, {
      title: draft.title,
      primarySpecialtyId: specialtyId(specialty),
      primarySpecialtyLabel: specialty,
      about: draft.about,
      priceType: draft.priceType,
      price: draft.price,
      phone: "",
      location: {
        address: location.place_name,
        addressLocation: location,
        commuteMode: "driving",
        commuteDuration: draft.commuteDuration,
      },
    })
      .then((tradeId) => {
        setCreatedTradeId(tradeId);
        successFeedback();
        setCreating(false);
      })
      .catch(() => {
        setCreating(false);
      });
  }, [
    uid,
    draft.createdTradeId,
    draft.title,
    draft.specialty,
    draft.location,
    draft.about,
    draft.priceType,
    draft.price,
    draft.commuteDuration,
    canCreate,
    setCreatedTradeId,
  ]);

  if (!isAuthenticated) {
    return <Redirect href="/auth" />;
  }

  const handleGoHome = () => {
    completeOnboarding();
    router.replace(toHref("/home"));
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
              <ActivityIndicator size="large" color={Brand.primaryLight} />
              <Text style={styles.creatingText}>Publishing your trade…</Text>
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
                You can already respond to nearby jobs.
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
                      color={Brand.primaryLight}
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
            <PrimaryButton label="Go to my dashboard" onPress={handleGoHome} />
          </View>
        ) : null}
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
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
  creatingText: {
    color: Colors.textSecondary,
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
    color: Colors.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  card: {
    marginTop: Spacing.xl,
    padding: Spacing.base,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  cardTitle: {
    color: Colors.text,
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
    color: Colors.textSecondary,
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
});
