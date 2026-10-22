import { useQuery } from "@tanstack/react-query";

import {
  fetchTradeById,
  fetchTradeByOwner,
  fetchTradesByOwner,
} from "@/lib/trades";

export function useTradeByOwner(ownerId: string | undefined) {
  return useQuery({
    queryKey: ["trade", ownerId ?? ""],
    enabled: Boolean(ownerId),
    staleTime: 60 * 1000,
    queryFn: () => fetchTradeByOwner(ownerId as string),
  });
}

export function useTradeById(tradeId: string | undefined) {
  return useQuery({
    queryKey: ["trade", "id", tradeId ?? ""],
    enabled: Boolean(tradeId),
    staleTime: 60 * 1000,
    queryFn: () => fetchTradeById(tradeId as string),
  });
}

export function useTradesByOwner(ownerId: string | undefined) {
  return useQuery({
    queryKey: ["owner-trades", ownerId ?? ""],
    enabled: Boolean(ownerId),
    staleTime: 60 * 1000,
    queryFn: () => fetchTradesByOwner(ownerId as string),
  });
}
