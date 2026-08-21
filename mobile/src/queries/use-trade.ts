import { useQuery } from "@tanstack/react-query";

import { fetchTradeByOwner } from "@/lib/trades";

export function useTradeByOwner(ownerId: string | undefined) {
  return useQuery({
    queryKey: ["trade", ownerId ?? ""],
    enabled: Boolean(ownerId),
    staleTime: 60 * 1000,
    queryFn: () => fetchTradeByOwner(ownerId as string),
  });
}
