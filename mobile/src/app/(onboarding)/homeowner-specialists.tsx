import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { CheckIcon, ReviewIcon } from "@/components/icons";
import { PressableScale } from "@/components/ui/pressable-scale";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Brand, Colors, Radius, Spacing } from "@/constants/theme";
import { tapFeedback } from "@/lib/haptics";
import { useAppStore } from "@/store/use-app-store";
import { useAuthStore } from "@/store/use-auth-store";
import { useProjectDraftStore } from "@/store/use-project-draft-store";

type Specialist = {
  name: string;
  rating: number;
  reviews: number;
};

const specialists: Specialist[] = [
  { name: "Apex Home Pros", rating: 4.9, reviews: 128 },
  { name: "Bay State Craftsmen", rating: 4.7, reviews: 63 },
  { name: "Riverside Repair Co.", rating: 5.0, reviews: 21 },
];

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function SearchingHint() {
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
    <Animated.Text style={[styles.searching, style]}>
      Still finding more specialists near you…
    </Animated.Text>
  );
}

function SpecialistCard({
  specialist,
  authed,
}: {
  specialist: Specialist;
  authed: boolean;
}) {
  return (
    <Animated.View entering={FadeInUp.duration(420)} style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials(specialist.name)}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardName}>{specialist.name}</Text>
        <View style={styles.ratingRow}>
          <ReviewIcon size={14} color={Brand.coin} />
          <Text style={styles.ratingText}>
            {specialist.rating.toFixed(1)} · {specialist.reviews} reviews
          </Text>
        </View>
      </View>
      {authed ? (
        <PressableScale
          accessibilityLabel={`Message ${specialist.name}`}
          onPress={() => {
            tapFeedback();
            router.push("/overview");
          }}
        >
          <View style={styles.messageChip}>
            <Text style={styles.messageChipText}>Message</Text>
          </View>
        </PressableScale>
      ) : null}
    </Animated.View>
  );
}

export default function SpecialistsScreen() {
  const specialty = useProjectDraftStore((state) => state.specialty);
  const location = useProjectDraftStore((state) => state.location);
  const requestId = useProjectDraftStore((state) => state.requestId);
  const ensureRequestId = useProjectDraftStore(
    (state) => state.ensureRequestId,
  );
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!requestId) ensureRequestId();
  }, [requestId, ensureRequestId]);

  useEffect(() => {
    const timers = specialists.map((_, index) =>
      setTimeout(
        () => setVisibleCount((count) => Math.max(count, index + 1)),
        650 * (index + 1),
      ),
    );
    return () => {
      for (const timer of timers) clearTimeout(timer);
    };
  }, []);

  const handleLogin = () => {
    completeOnboarding();
    router.push({
      pathname: "/auth",
      params: { next: "/homeowner-specialists" },
    });
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.requestId}>
              Request #{requestId ?? "CT-00000"}
            </Text>
            <Text style={styles.title}>{specialty ?? "Your project"}</Text>
            {location ? <Text style={styles.location}>{location}</Text> : null}
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

        <View style={styles.list}>
          {specialists.slice(0, visibleCount).map((specialist) => (
            <SpecialistCard
              key={specialist.name}
              specialist={specialist}
              authed={isAuthenticated}
            />
          ))}
          {visibleCount < specialists.length ? <SearchingHint /> : null}
        </View>

        <View style={styles.spacer} />

        {!isAuthenticated ? (
          <View style={styles.footer}>
            <PrimaryButton label="Log in to message" onPress={handleLogin} />
            <Text style={styles.footerNote}>
              Free account — no credit card required.
            </Text>
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
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.base,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerText: {
    flex: 1,
    paddingTop: 4,
  },
  requestId: {
    color: Colors.textSecondary,
    fontSize: 12.5,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  title: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: "800",
    marginTop: 3,
  },
  location: {
    color: Colors.textSecondary,
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
    color: Colors.text,
    fontSize: 13.5,
    fontWeight: "600",
  },
  list: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.base,
    padding: Spacing.base,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
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
  avatarText: {
    color: Brand.primaryLight,
    fontSize: 15,
    fontWeight: "800",
  },
  cardBody: {
    flex: 1,
  },
  cardName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 3,
  },
  ratingText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  messageChip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(22,179,100,0.16)",
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.4)",
  },
  messageChipText: {
    color: Brand.primaryLight,
    fontSize: 13,
    fontWeight: "700",
  },
  searching: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    paddingTop: Spacing.sm,
  },
  spacer: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  footerNote: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
  },
});
