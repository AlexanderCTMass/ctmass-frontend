import { useIsFocused } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  View,
} from "react-native";

import { AD_ASPECT_RATIO, AdBanner } from "@/components/ads/ad-banner";
import { Brand, Radius, Spacing, makeStyles } from "@/constants/theme";
import {
  type AdPlacement,
  DEFAULT_AD_PLACEMENT_SETTINGS,
} from "@/lib/ad-placements";
import { type PartnerAd, trackAdImpression } from "@/lib/partner-ads";
import { usePlacementAds } from "@/queries/use-partner-ads";

export function AdCarousel({ placement }: { placement: AdPlacement }) {
  const { ads, settings } = usePlacementAds(placement);
  if (ads.length === 0) return null;
  return (
    <AdCarouselTrack
      key={ads.map((ad) => ad.id).join("|")}
      ads={ads}
      placement={placement}
      autoplayMs={
        settings?.autoplayMs ??
        DEFAULT_AD_PLACEMENT_SETTINGS[placement].autoplayMs
      }
    />
  );
}

function AdCarouselTrack({
  ads,
  placement,
  autoplayMs,
}: {
  ads: PartnerAd[];
  placement: AdPlacement;
  autoplayMs: number;
}) {
  const styles = useStyles();
  const focused = useIsFocused();
  const count = ads.length;

  const scrollRef = useRef<ScrollView>(null);
  const widthRef = useRef(0);
  const indexRef = useRef(0);
  const draggingRef = useRef(false);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!focused || count <= 1 || width === 0 || autoplayMs <= 0) return;
    const id = setInterval(() => {
      if (draggingRef.current) return;
      const next = (indexRef.current + 1) % count;
      indexRef.current = next;
      setIndex(next);
      scrollRef.current?.scrollTo({
        x: next * widthRef.current,
        animated: true,
      });
    }, autoplayMs);
    return () => clearInterval(id);
  }, [focused, count, width, autoplayMs]);

  const active = ads[index];
  useEffect(() => {
    if (focused && active) trackAdImpression(active, placement, index);
  }, [focused, active, placement, index]);

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    draggingRef.current = false;
    const w = widthRef.current || 1;
    const next = Math.min(
      count - 1,
      Math.max(0, Math.round(e.nativeEvent.contentOffset.x / w)),
    );
    indexRef.current = next;
    setIndex(next);
  };

  return (
    <View style={styles.wrap}>
      <View
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          widthRef.current = w;
          setWidth(w);
        }}
      >
        {width > 0 ? (
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            bounces={false}
            scrollEnabled={count > 1}
            showsHorizontalScrollIndicator={false}
            onScrollBeginDrag={() => {
              draggingRef.current = true;
            }}
            onMomentumScrollEnd={handleMomentumEnd}
            style={{ height: width / AD_ASPECT_RATIO }}
          >
            {ads.map((ad, i) => (
              <View key={ad.id} style={{ width }}>
                <AdBanner
                  ad={ad}
                  placement={placement}
                  position={i}
                  framed={false}
                />
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={{ aspectRatio: AD_ASPECT_RATIO }} />
        )}

        {count > 1 ? (
          <View style={styles.dots} pointerEvents="none">
            {ads.map((ad, i) => (
              <View
                key={ad.id}
                style={[styles.dot, i === index && styles.dotActive]}
              />
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: {
    width: "100%",
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: t.colors.border,
    overflow: "hidden",
    backgroundColor: t.isDark ? t.colors.backgroundElevated : t.colors.surface,
    marginBottom: Spacing.lg,
  },
  dots: {
    position: "absolute",
    bottom: 7,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: t.isDark ? "rgba(255,255,255,0.35)" : "rgba(10,46,28,0.2)",
  },
  dotActive: {
    width: 16,
    backgroundColor: Brand.primary,
  },
}));
