import { useQuery } from "@tanstack/react-query";

import { cacheAssets } from "@/lib/asset-cache";
import { readPersisted, writePersisted } from "@/lib/persisted-query";
import {
  fetchShopFeatures,
  fetchUserPurchases,
  getFeatureImages,
  type ShopFeature,
} from "@/lib/shop";

const PERSIST_KEY = "shop-features.v1";

async function loadShopFeatures(): Promise<ShopFeature[]> {
  const features = await fetchShopFeatures();
  writePersisted(PERSIST_KEY, features);
  void cacheAssets("shop", features.flatMap(getFeatureImages), { prune: true });
  return features;
}

export function useShopFeatures() {
  return useQuery({
    queryKey: ["shop-features"],
    staleTime: 5 * 60 * 1000,
    gcTime: Infinity,
    queryFn: loadShopFeatures,
    initialData: () => readPersisted<ShopFeature[]>(PERSIST_KEY)?.data,
    initialDataUpdatedAt: () =>
      readPersisted<ShopFeature[]>(PERSIST_KEY)?.savedAt,
  });
}

export function useUserPurchases(uid: string | undefined) {
  return useQuery({
    queryKey: ["user-purchases", uid ?? ""],
    enabled: Boolean(uid),
    staleTime: 60 * 1000,
    queryFn: () => fetchUserPurchases(uid as string),
  });
}
