import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { CheckIcon, MapPinIcon, ToolsIcon } from "@/components/icons";
import { BackButton } from "@/components/ui/back-button";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Brand, Colors, Radius, Spacing } from "@/constants/theme";
import { useAppStore } from "@/store/use-app-store";
import { useTradeDraftStore } from "@/store/use-trade-draft-store";

export default function ContractorReadyScreen() {
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const title = useTradeDraftStore((state) => state.title);
  const specialty = useTradeDraftStore((state) => state.specialty);
  const location = useTradeDraftStore((state) => state.location);

  const handleContinue = () => {
    completeOnboarding();
    router.push({
      pathname: "/auth",
      params: { next: "/contractor-setup-trade-completed" },
    });
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
        </View>

        <View style={styles.body}>
          <Animated.View
            entering={FadeIn.duration(500)}
            style={styles.iconWrap}
          >
            <View style={styles.iconCircle}>
              <CheckIcon size={30} color="#04170D" strokeWidth={3} />
            </View>
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.delay(120).duration(520)}
            style={styles.eyebrow}
          >
            Almost there
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.delay(180).duration(520)}
            style={styles.title}
          >
            Sign in to publish your trade
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.delay(240).duration(520)}
            style={styles.subtitle}
          >
            We&apos;ve saved everything you entered. Create your free account
            and your trade goes live for nearby homeowners.
          </Animated.Text>

          <Animated.View
            entering={FadeInDown.delay(320).duration(520)}
            style={styles.card}
          >
            <View style={styles.cardRow}>
              <ToolsIcon size={17} color={Brand.primaryLight} />
              <Text style={styles.cardTitle} numberOfLines={1}>
                {title || "Your trade"}
              </Text>
            </View>
            {specialty ? (
              <Text style={styles.cardMeta}>{specialty}</Text>
            ) : null}
            {location?.place_name ? (
              <View style={styles.cardPlaceRow}>
                <MapPinIcon size={14} color={Colors.textMuted} />
                <Text style={styles.cardPlace} numberOfLines={1}>
                  {location.place_name}
                </Text>
              </View>
            ) : null}
          </Animated.View>
        </View>

        <View style={styles.footer}>
          <PrimaryButton label="Sign in to publish" onPress={handleContinue} />
        </View>
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
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  body: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: "center",
  },
  iconWrap: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.primary,
  },
  eyebrow: {
    color: Brand.primaryLight,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2.4,
    textTransform: "uppercase",
    textAlign: "center",
  },
  title: {
    color: Colors.text,
    fontSize: 27,
    fontWeight: "800",
    letterSpacing: -0.5,
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: Spacing.md,
  },
  card: {
    marginTop: Spacing.xl,
    padding: Spacing.base,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  cardTitle: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  cardMeta: {
    color: Colors.textSecondary,
    fontSize: 13.5,
    fontWeight: "600",
  },
  cardPlaceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: 2,
  },
  cardPlace: {
    flex: 1,
    color: Colors.textMuted,
    fontSize: 13,
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
});
