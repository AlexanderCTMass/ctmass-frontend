import { useIsFocused } from "expo-router";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { ViewToken } from "react-native";

import {
  type AdPlacement,
  DEFAULT_AD_PLACEMENT_SETTINGS,
} from "@/lib/ad-placements";
import { type PartnerAd, trackAdImpression } from "@/lib/partner-ads";
import { usePlacementAds } from "@/queries/use-partner-ads";

export type InlineAdRow = {
  kind: "ad";
  key: string;
  ad: PartnerAd;
  slot: number;
};

export type InlineItemRow<T> = {
  kind: "item";
  key: string;
  item: T;
  index: number;
};

export type InlineRow<T> = InlineItemRow<T> | InlineAdRow;

const VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 50,
  minimumViewTime: 300,
};

export function useInlineAds<T>(
  placement: AdPlacement,
  items: T[],
  keyOf: (item: T) => string,
) {
  const { ads, settings } = usePlacementAds(placement);
  const every = Math.max(
    1,
    settings?.every ?? DEFAULT_AD_PLACEMENT_SETTINGS[placement].every,
  );
  const focused = useIsFocused();
  const focusedRef = useRef(focused);
  const placementRef = useRef(placement);
  useEffect(() => {
    focusedRef.current = focused;
    placementRef.current = placement;
  }, [focused, placement]);

  const rows = useMemo<InlineRow<T>[]>(() => {
    const result: InlineRow<T>[] = [];
    let slot = 0;
    items.forEach((item, index) => {
      result.push({ kind: "item", key: keyOf(item), item, index });
      const isBetween = index + 1 < items.length;
      if (ads.length > 0 && isBetween && (index + 1) % every === 0) {
        const ad = ads[slot % ads.length];
        result.push({ kind: "ad", key: `ad-${slot}-${ad.id}`, ad, slot });
        slot += 1;
      }
    });
    return result;
  }, [items, ads, every, keyOf]);

  const onViewableItemsChanged = useCallback(
    ({ changed }: { changed: ViewToken<InlineRow<T>>[] }) => {
      if (!focusedRef.current) return;
      for (const token of changed) {
        const row = token.item;
        if (token.isViewable && row?.kind === "ad") {
          trackAdImpression(row.ad, placementRef.current, row.slot);
        }
      }
    },
    [],
  );

  return {
    rows,
    onViewableItemsChanged,
    viewabilityConfig: VIEWABILITY_CONFIG,
  };
}

export function inlineRowKey<T>(row: InlineRow<T>): string {
  return row.key;
}

export function inlineRowType<T>(row: InlineRow<T>): string {
  return row.kind;
}
