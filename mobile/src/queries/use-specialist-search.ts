import { useQuery } from "@tanstack/react-query";

import { fetchSpecialistPool } from "@/lib/trades";

export function useSpecialistPool(excludeOwnerId: string | undefined) {
  return useQuery({
    queryKey: ["specialist-pool", excludeOwnerId ?? ""],
    staleTime: 5 * 60 * 1000,
    queryFn: () => fetchSpecialistPool(excludeOwnerId),
  });
}
