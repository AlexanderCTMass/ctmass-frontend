import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  CalendarIcon,
  EyeIcon,
  MapPinIcon,
  ReviewIcon,
  TrashIcon,
} from "@/components/icons";
import { BeforeAfterSlider } from "@/components/portfolio/before-after-slider";
import { BackButton } from "@/components/ui/back-button";
import { ImageViewerModal } from "@/components/ui/image-viewer-modal";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { analyticsEvents, errorMessage } from "@/lib/analytics-events";
import { tapFeedback } from "@/lib/haptics";
import { toHref } from "@/lib/navigation";
import {
  type PortfolioItem,
  deletePortfolioItem,
  setPortfolioFavorite,
  setPortfolioVisibility,
} from "@/lib/portfolio";
import { usePortfolioItem } from "@/queries/use-portfolio";
import { useAuthStore } from "@/store/use-auth-store";

function formatDate(date: Date | null): string {
  if (!date) return "";
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function PortfolioItemScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { width } = useWindowDimensions();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{
    id?: string;
    ownerId?: string;
    tradeId?: string;
  }>();
  const id = typeof params.id === "string" ? params.id : undefined;
  const ownerId =
    typeof params.ownerId === "string" ? params.ownerId : undefined;
  const uid = useAuthStore((state) => state.user?.uid);
  const { data: item, isLoading } = usePortfolioItem(ownerId, id);
  const [viewerUri, setViewerUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isOwner = Boolean(uid && ownerId && uid === ownerId);
  const mediaHeight = Math.round((width - Spacing.base * 2) * 0.78);

  const refresh = (next: PortfolioItem | null) => {
    if (!item) return;
    if (next) {
      queryClient.setQueryData(["portfolio-item", item.ownerId, item.id], next);
    }
    void queryClient.invalidateQueries({
      queryKey: ["portfolio", item.ownerId, item.tradeId],
    });
  };

  const toggleVisibility = async () => {
    if (!item || busy) return;
    tapFeedback();
    setBusy(true);
    const next = !item.isPublic;
    try {
      await setPortfolioVisibility(item, next);
      analyticsEvents.portfolioVisibilityChanged({
        portfolio_id: item.id,
        is_public: next,
      });
      refresh({ ...item, isPublic: next });
    } catch {
      Alert.alert("Couldn't update", "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const toggleFavorite = async () => {
    if (!item || busy) return;
    tapFeedback();
    setBusy(true);
    const next = !item.isFavorite;
    try {
      await setPortfolioFavorite(item, next);
      analyticsEvents.portfolioFavoriteChanged({
        portfolio_id: item.id,
        is_favorite: next,
      });
      refresh({ ...item, isFavorite: next });
    } catch {
      Alert.alert("Couldn't update", "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const runDelete = async () => {
    if (!item) return;
    setBusy(true);
    try {
      await deletePortfolioItem(item);
      analyticsEvents.portfolioItemDeleted({
        trade_id: item.tradeId,
        portfolio_id: item.id,
      });
      refresh(null);
      queryClient.removeQueries({
        queryKey: ["portfolio-item", item.ownerId, item.id],
      });
      router.back();
    } catch (error) {
      setBusy(false);
      Alert.alert("Couldn't delete", errorMessage(error) || "Please try again.");
    }
  };

  const confirmDelete = () => {
    if (!item || busy) return;
    tapFeedback();
    Alert.alert(
      "Delete this project?",
      "It will be removed from your portfolio. This can't be undone.",
      [
        { text: "Keep", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => void runDelete() },
      ],
    );
  };

  const openEdit = () => {
    if (!item) return;
    tapFeedback();
    router.push(
      toHref(
        `/portfolio-edit?tradeId=${encodeURIComponent(item.tradeId)}&portfolioId=${encodeURIComponent(item.id)}`,
      ),
    );
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.headerTitle} numberOfLines={1}>
            Portfolio
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : !item || (!item.isPublic && !isOwner) ? (
          <View style={styles.center}>
            <Text style={styles.missing}>This project isn&apos;t available.</Text>
          </View>
        ) : (
          <>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.media}>
                {item.beforeImage && item.afterImage ? (
                  <BeforeAfterSlider
                    before={item.beforeImage}
                    after={item.afterImage}
                    height={mediaHeight}
                  />
                ) : item.cover ? (
                  <Pressable
                    accessibilityRole="imagebutton"
                    accessibilityLabel="Open photo"
                    onPress={() => setViewerUri(item.cover)}
                  >
                    <Image
                      source={{ uri: item.cover }}
                      style={{ width: "100%", height: mediaHeight }}
                      contentFit="cover"
                      transition={150}
                    />
                  </Pressable>
                ) : null}
              </View>

              {item.beforeImage && item.afterImage ? (
                <View style={styles.thumbs}>
                  <Text style={styles.sliderHint}>
                    Drag the slider to compare. Tap a photo to zoom.
                  </Text>
                  <View style={styles.thumbRow}>
                    {[
                      { label: "Before", uri: item.beforeImage },
                      { label: "After", uri: item.afterImage },
                    ].map((photo) => (
                      <Pressable
                        key={photo.label}
                        accessibilityRole="imagebutton"
                        accessibilityLabel={`Open ${photo.label.toLowerCase()} photo`}
                        onPress={() => setViewerUri(photo.uri)}
                        style={styles.thumb}
                      >
                        <Image
                          source={{ uri: photo.uri }}
                          style={styles.thumbImage}
                          contentFit="cover"
                          transition={150}
                        />
                        <Text style={styles.thumbLabel}>{photo.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}

              <Text style={styles.title}>{item.title}</Text>

              {item.location || item.date ? (
                <View style={styles.metaList}>
                  {item.location ? (
                    <View style={styles.metaRow}>
                      <MapPinIcon size={15} color={colors.accent} />
                      <Text style={styles.metaText}>{item.location}</Text>
                    </View>
                  ) : null}
                  {item.date ? (
                    <View style={styles.metaRow}>
                      <CalendarIcon size={15} color={colors.textSecondary} />
                      <Text style={styles.metaText}>{formatDate(item.date)}</Text>
                    </View>
                  ) : null}
                </View>
              ) : null}

              {item.shortDescription ? (
                <Text style={styles.description}>{item.shortDescription}</Text>
              ) : null}

              {item.tags.length > 0 ? (
                <View style={styles.tags}>
                  {item.tags.map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {isOwner ? (
                <View style={styles.ownerPanel}>
                  <Pressable
                    accessibilityRole="switch"
                    accessibilityState={{ checked: item.isPublic }}
                    onPress={() => void toggleVisibility()}
                    style={styles.ownerRow}
                  >
                    <EyeIcon size={18} color={colors.textSecondary} />
                    <View style={styles.ownerRowBody}>
                      <Text style={styles.ownerRowTitle}>
                        {item.isPublic ? "Visible to everyone" : "Hidden"}
                      </Text>
                      <Text style={styles.ownerRowHint}>
                        {item.isPublic
                          ? "Tap to hide it from your public trade."
                          : "Only you can see it. Tap to show it."}
                      </Text>
                    </View>
                  </Pressable>
                  <View style={styles.divider} />
                  <Pressable
                    accessibilityRole="switch"
                    accessibilityState={{ checked: item.isFavorite }}
                    onPress={() => void toggleFavorite()}
                    style={styles.ownerRow}
                  >
                    <ReviewIcon
                      size={18}
                      color={item.isFavorite ? colors.coin : colors.textSecondary}
                    />
                    <View style={styles.ownerRowBody}>
                      <Text style={styles.ownerRowTitle}>
                        {item.isFavorite ? "Featured" : "Feature this project"}
                      </Text>
                      <Text style={styles.ownerRowHint}>
                        Featured projects are shown first.
                      </Text>
                    </View>
                  </Pressable>
                  <View style={styles.divider} />
                  <Pressable
                    accessibilityRole="button"
                    onPress={confirmDelete}
                    style={styles.ownerRow}
                  >
                    <TrashIcon size={18} color={colors.destructive} />
                    <Text style={styles.deleteText}>Delete project</Text>
                  </Pressable>
                </View>
              ) : null}
            </ScrollView>

            {isOwner ? (
              <View style={styles.footer}>
                <PrimaryButton
                  label="Edit project"
                  onPress={openEdit}
                  disabled={busy}
                />
              </View>
            ) : null}
          </>
        )}
      </SafeAreaView>
      <ImageViewerModal uri={viewerUri} onClose={() => setViewerUri(null)} />
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
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    color: t.colors.text,
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.3,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
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
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xl,
  },
  media: {
    borderRadius: Radius.lg,
    overflow: "hidden",
    backgroundColor: t.colors.surfaceStrong,
  },
  thumbs: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  sliderHint: {
    color: t.colors.textMuted,
    fontSize: 12.5,
    textAlign: "center",
  },
  thumbRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  thumb: {
    flex: 1,
    gap: 4,
  },
  thumbImage: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: Radius.sm,
    backgroundColor: t.colors.surfaceStrong,
  },
  thumbLabel: {
    color: t.colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  title: {
    color: t.colors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginTop: Spacing.lg,
  },
  metaList: {
    gap: 6,
    marginTop: Spacing.sm,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    flex: 1,
    color: t.colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  description: {
    color: t.colors.text,
    fontSize: 15,
    lineHeight: 22,
    marginTop: Spacing.base,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.base,
  },
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(22,179,100,0.12)",
  },
  tagText: {
    color: t.colors.accent,
    fontSize: 13,
    fontWeight: "700",
  },
  ownerPanel: {
    marginTop: Spacing.xl,
    borderRadius: Radius.md,
    backgroundColor: t.isDark ? t.colors.surface : t.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  ownerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.base,
  },
  ownerRowBody: {
    flex: 1,
    gap: 2,
  },
  ownerRowTitle: {
    color: t.colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  ownerRowHint: {
    color: t.colors.textSecondary,
    fontSize: 12.5,
  },
  divider: {
    height: 1,
    marginLeft: Spacing.base,
    backgroundColor: t.colors.border,
  },
  deleteText: {
    color: t.colors.destructive,
    fontSize: 15,
    fontWeight: "700",
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
}));
