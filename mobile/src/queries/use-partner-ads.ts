import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { AppState } from "react-native";

import type { AdPlacement } from "@/lib/ad-placements";
import { cacheAssets } from "@/lib/asset-cache";
import {
  adAssetUrls,
  adsForPlacement,
  fetchPartnerAdsConfig,
  type PartnerAdsConfig,
} from "@/lib/partner-ads";
import { readPersisted, writePersisted } from "@/lib/persisted-query";

const PERSIST_KEY = "partner-ads.v1";
const QUERY_KEY = ["partner-ads"];
const REFRESH_MS = 10 * 60 * 1000;
const ASSET_WAIT_MS = 15_000;
const CLOCK_TICK_MS = 60_000;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadPartnerAds(): Promise<PartnerAdsConfig> {
  const config = await fetchPartnerAdsConfig();
  await Promise.race([
    cacheAssets("ads", adAssetUrls(config), { prune: true }),
    wait(ASSET_WAIT_MS),
  ]);
  writePersisted(PERSIST_KEY, config);
  return config;
}

export function usePartnerAds() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: loadPartnerAds,
    staleTime: REFRESH_MS,
    refetchInterval: REFRESH_MS,
    gcTime: Infinity,
    initialData: () => readPersisted<PartnerAdsConfig>(PERSIST_KEY)?.data,
    initialDataUpdatedAt: () =>
      readPersisted<PartnerAdsConfig>(PERSIST_KEY)?.savedAt,
  });
}

export function usePartnerAdsSync() {
  const queryClient = useQueryClient();
  usePartnerAds();
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") return;
      const query = queryClient.getQueryState(QUERY_KEY);
      const age = Date.now() - (query?.dataUpdatedAt ?? 0);
      if (age > REFRESH_MS) {
        void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      }
    });
    return () => subscription.remove();
  }, [queryClient]);
}

function useClockTick(): number {
  const [tick, setTick] = useState(() =>
    Math.floor(Date.now() / CLOCK_TICK_MS),
  );
  useEffect(() => {
    const id = setInterval(
      () => setTick(Math.floor(Date.now() / CLOCK_TICK_MS)),
      CLOCK_TICK_MS,
    );
    return () => clearInterval(id);
  }, []);
  return tick;
}

export function usePlacementAds(placement: AdPlacement) {
  const { data } = usePartnerAds();
  const tick = useClockTick();
  const liveIds = adsForPlacement(data, placement, tick * CLOCK_TICK_MS)
    .map((ad) => ad.id)
    .join("|");
  return useMemo(() => {
    const ids = liveIds ? liveIds.split("|") : [];
    const byId = new Map((data?.banners ?? []).map((ad) => [ad.id, ad]));
    const ads = ids.flatMap((id) => {
      const ad = byId.get(id);
      return ad ? [ad] : [];
    });
    return { ads, settings: data?.settings[placement] };
  }, [data, placement, liveIds]);
}
