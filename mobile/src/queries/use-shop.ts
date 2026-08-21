import { useQuery } from "@tanstack/react-query";

import { fetchShopFeatures, fetchUserPurchases } from "@/lib/shop";

export function useShopFeatures() {
  return useQuery({
    queryKey: ["shop-features"],
    staleTime: 5 * 60 * 1000,
    queryFn: fetchShopFeatures,
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
