import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { PressableScale } from "@/components/ui/pressable-scale";
import {
  Brand,
  Radius,
  Spacing,
  makeStyles,
  useTheme,
} from "@/constants/theme";
import type { AdPlacement } from "@/lib/ad-placements";
import { resolveAssetUri } from "@/lib/asset-cache";
import { openAd, type PartnerAd } from "@/lib/partner-ads";

export const AD_ASPECT_RATIO = 3;

type AdBannerProps = {
  ad: PartnerAd;
  placement: AdPlacement;
  position: number;
  framed?: boolean;
};

export const AdBanner = memo(function AdBanner({
  ad,
  placement,
  position,
  framed = true,
}: AdBannerProps) {
  const { isDark } = useTheme();
  const styles = useStyles();
  const remote = isDark && ad.imageDarkUrl ? ad.imageDarkUrl : ad.imageUrl;
  const source = resolveAssetUri("ads", remote) ?? remote;
  const isLocal = source !== remote;
  const hasText = ad.layout !== "image" && (ad.title || ad.subtitle);
  const hasCta = ad.layout !== "image" && ad.ctaLabel.length > 0;
  const fade = isDark
    ? (["#0C1420", "rgba(12,20,32,0.82)", "rgba(12,20,32,0)"] as const)
    : (["#FFFFFF", "rgba(255,255,255,0.82)", "rgba(255,255,255,0)"] as const);

  const label =
    [ad.title, ad.subtitle].filter(Boolean).join(". ") || ad.partnerName;

  return (
    <PressableScale
      accessibilityLabel={`Sponsored: ${label}`}
      onPress={() => void openAd(ad, placement, position)}
    >
      <View style={[styles.card, framed && styles.cardFramed]}>
        {ad.layout === "split" ? (
          <View style={styles.splitImageWrap}>
            <Image
              source={{ uri: source }}
              style={StyleSheet.absoluteFill}
              contentFit="contain"
              transition={isLocal ? 0 : 200}
              cachePolicy="memory-disk"
              recyclingKey={remote}
            />
          </View>
        ) : (
          <>
            <Image
              source={{ uri: source }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={isLocal ? 0 : 200}
              cachePolicy="memory-disk"
              recyclingKey={remote}
            />
            {ad.layout === "cover" && hasText ? (
              <LinearGradient
                colors={fade}
                locations={[0, 0.45, 0.85]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFill}
              />
            ) : null}
          </>
        )}

        {hasText || hasCta ? (
          <View style={styles.content}>
            {ad.title ? (
              <Text style={styles.title} numberOfLines={hasCta ? 1 : 2}>
                {ad.title}
              </Text>
            ) : null}
            {ad.subtitle ? (
              <Text style={styles.subtitle} numberOfLines={hasCta ? 1 : 2}>
                {ad.subtitle}
              </Text>
            ) : null}
            {hasCta ? (
              <View style={styles.cta}>
                <Text style={styles.ctaText} numberOfLines={1}>
                  {ad.ctaLabel}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.badge} pointerEvents="none">
          <Text style={styles.badgeText}>Sponsored</Text>
        </View>
      </View>
    </PressableScale>
  );
});

const useStyles = makeStyles((t) => ({
  card: {
    width: "100%",
    aspectRatio: AD_ASPECT_RATIO,
    overflow: "hidden",
    backgroundColor: t.isDark ? t.colors.backgroundElevated : t.colors.surface,
  },
  cardFramed: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  splitImageWrap: {
    position: "absolute",
    top: Spacing.md,
    bottom: Spacing.md,
    right: Spacing.md,
    width: "38%",
  },
  content: {
    flex: 1,
    width: "60%",
    justifyContent: "center",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: 3,
  },
  title: {
    color: t.colors.text,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  subtitle: {
    color: t.colors.textSecondary,
    fontSize: 13,
    lineHeight: 17,
  },
  cta: {
    alignSelf: "flex-start",
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.base,
    height: 30,
    borderRadius: Radius.sm - 2,
    justifyContent: "center",
    backgroundColor: t.isDark ? Brand.primary : Brand.primaryDark,
  },
  ctaText: {
    color: t.isDark ? "#04170D" : "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    backgroundColor: t.isDark ? "rgba(5,7,12,0.6)" : "rgba(255,255,255,0.85)",
  },
  badgeText: {
    color: t.colors.textMuted,
    fontSize: 9.5,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
}));
