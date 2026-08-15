import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MapPinIcon, ReviewIcon } from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { BackButton } from "@/components/ui/back-button";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Brand, Colors, Radius, Spacing } from "@/constants/theme";
import { startChat } from "@/lib/chat";
import { tapFeedback } from "@/lib/haptics";
import { toHref } from "@/lib/navigation";
import { useTradeByOwner } from "@/queries/use-trade";
import { useAuthStore } from "@/store/use-auth-store";

export default function TradeProfileScreen() {
  const params = useLocalSearchParams<{
    ownerId?: string;
    projectId?: string;
  }>();
  const ownerId =
    typeof params.ownerId === "string" ? params.ownerId : undefined;
  const projectId =
    typeof params.projectId === "string" ? params.projectId : undefined;
  const uid = useAuthStore((state) => state.user?.uid);

  const { data: trade, isLoading } = useTradeByOwner(ownerId);
  const [opening, setOpening] = useState(false);

  const handleMessage = async () => {
    if (!uid || !ownerId || opening) return;
    tapFeedback();
    setOpening(true);
    try {
      const threadId = await startChat(uid, ownerId, projectId);
      router.push(toHref(`/chat?threadId=${encodeURIComponent(threadId)}`));
    } finally {
      setOpening(false);
    }
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={Brand.primaryLight} />
          </View>
        ) : !trade ? (
          <View style={styles.center}>
            <Text style={styles.missing}>
              This specialist profile isn&apos;t available.
            </Text>
          </View>
        ) : (
          <>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.top}>
                <Avatar name={trade.name} url={trade.avatarUrl} size={64} />
                <View style={styles.topBody}>
                  <Text style={styles.name} numberOfLines={1}>
                    {trade.name}
                  </Text>
                  {trade.rating > 0 ? (
                    <View style={styles.ratingRow}>
                      <ReviewIcon size={14} color={Brand.coin} />
                      <Text style={styles.ratingText}>
                        {trade.rating.toFixed(1)} · {trade.reviews} reviews
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>

              {trade.specialtyLabel ? (
                <View style={styles.specialtyChip}>
                  <Text style={styles.specialtyText}>
                    {trade.specialtyLabel}
                  </Text>
                </View>
              ) : null}

              {trade.placeName ? (
                <View style={styles.placeRow}>
                  <MapPinIcon size={14} color={Colors.textSecondary} />
                  <Text style={styles.place}>{trade.placeName}</Text>
                </View>
              ) : null}

              {trade.about ? (
                <Text style={styles.about}>{trade.about}</Text>
              ) : null}

              {trade.gallery.length > 0 ? (
                <View style={styles.gallery}>
                  {trade.gallery.slice(0, 6).map((uri) => (
                    <Image
                      key={uri}
                      source={{ uri }}
                      style={styles.galleryImage}
                      contentFit="cover"
                      transition={150}
                    />
                  ))}
                </View>
              ) : null}

              <Text style={styles.webNote}>
                See the full profile and portfolio on ctmass.com
              </Text>
            </ScrollView>

            <View style={styles.footer}>
              <PrimaryButton
                label={opening ? "Opening…" : "Message"}
                onPress={() => void handleMessage()}
                disabled={opening}
              />
            </View>
          </>
        )}
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
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  missing: {
    color: Colors.textSecondary,
    fontSize: 15,
    textAlign: "center",
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.base,
  },
  topBody: {
    flex: 1,
  },
  name: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
  ratingText: {
    color: Colors.textSecondary,
    fontSize: 13.5,
    fontWeight: "600",
  },
  specialtyChip: {
    alignSelf: "flex-start",
    marginTop: Spacing.base,
    paddingHorizontal: Spacing.base,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(22,179,100,0.14)",
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.3)",
  },
  specialtyText: {
    color: Brand.primaryLight,
    fontSize: 13,
    fontWeight: "700",
  },
  placeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  place: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  about: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 22,
    marginTop: Spacing.base,
  },
  gallery: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.base,
  },
  galleryImage: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
  },
  webNote: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: Spacing.xl,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
});
