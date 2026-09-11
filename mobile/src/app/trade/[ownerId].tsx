import Constants from "expo-constants";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MapPinIcon, ReviewIcon } from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { BackButton } from "@/components/ui/back-button";
import { PressableScale } from "@/components/ui/pressable-scale";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { analyticsEvents } from "@/lib/analytics-events";
import { startChat } from "@/lib/chat";
import { tapFeedback } from "@/lib/haptics";
import { chatHref } from "@/lib/navigation";
import { useTradeById, useTradeByOwner } from "@/queries/use-trade";
import { useAuthStore } from "@/store/use-auth-store";

export default function TradeProfileScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const params = useLocalSearchParams<{
    ownerId?: string;
    projectId?: string;
    tradeId?: string;
  }>();
  const ownerId =
    typeof params.ownerId === "string" ? params.ownerId : undefined;
  const projectId =
    typeof params.projectId === "string" ? params.projectId : undefined;
  const tradeId =
    typeof params.tradeId === "string" ? params.tradeId : undefined;
  const uid = useAuthStore((state) => state.user?.uid);
  const requireAuth = useRequireAuth();

  const byId = useTradeById(tradeId);
  const byOwner = useTradeByOwner(tradeId ? undefined : ownerId);
  const trade = tradeId ? byId.data : byOwner.data;
  const isLoading = tradeId ? byId.isLoading : byOwner.isLoading;
  const [opening, setOpening] = useState(false);

  const viewedRef = useRef(false);
  useEffect(() => {
    if (!trade || viewedRef.current) return;
    viewedRef.current = true;
    analyticsEvents.tradeProfileViewed({
      owner_id: ownerId ?? trade.ownerId,
      trade_id: trade.tradeId,
      specialty: trade.specialtyLabel,
      rating: trade.rating,
      reviews: trade.reviews,
      from_project: Boolean(projectId),
    });
  }, [trade, ownerId, projectId]);

  const handleMessage = async () => {
    if (ownerId) {
      analyticsEvents.tradeProfileMessageTapped({
        owner_id: ownerId,
        project_id: projectId ?? null,
      });
    }
    if (!requireAuth()) return;
    if (!uid || !ownerId || opening) return;
    tapFeedback();
    setOpening(true);
    try {
      const threadId = await startChat(uid, ownerId, projectId);
      router.push(chatHref(threadId, trade?.name, trade?.avatarUrl));
    } finally {
      setOpening(false);
    }
  };

  const openWebProfile = async () => {
    if (!ownerId) return;
    const base =
      (Constants.expoConfig?.extra?.webBaseUrl as string | undefined) ??
      "https://ctmasstest.web.app";
    tapFeedback();
    analyticsEvents.tradeProfileWebOpened({ owner_id: ownerId });
    const url = `${base}/contractors/first1000/${ownerId}`;
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch {
      await Linking.openURL(url).catch(() => undefined);
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
            <ActivityIndicator color={colors.accent} />
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
                      <ReviewIcon size={14} color={colors.coin} />
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
                  <MapPinIcon size={14} color={colors.textSecondary} />
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

              <PressableScale
                accessibilityLabel="Open full profile in browser"
                onPress={() => void openWebProfile()}
              >
                <Text style={styles.webNote}>
                  See the full profile and portfolio on ctmass.com ↗
                </Text>
              </PressableScale>
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

const useStyles = makeStyles((t) => ({
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
    color: t.colors.textSecondary,
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
    color: t.colors.text,
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
    color: t.colors.textSecondary,
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
    color: t.colors.accent,
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
    color: t.colors.textSecondary,
    fontSize: 14,
  },
  about: {
    color: t.colors.text,
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
    backgroundColor: t.colors.surface,
  },
  webNote: {
    color: t.colors.accent,
    fontSize: 14,
    fontWeight: "600",
    marginTop: Spacing.xl,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
}));
