import { useQuery } from "@tanstack/react-query";

import { fetchLoyaltyRules } from "@/lib/loyalty-config";

export function useLoyaltyRules() {
  return useQuery({
    queryKey: ["loyalty-rules"],
    staleTime: 10 * 60 * 1000,
    queryFn: fetchLoyaltyRules,
  });
}
