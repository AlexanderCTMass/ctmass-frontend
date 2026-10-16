import { useQuery } from "@tanstack/react-query";

import { fetchPortfolioItem, fetchTradePortfolio } from "@/lib/portfolio";

export function portfolioKey(ownerId: string, tradeId: string) {
  return ["portfolio", ownerId, tradeId] as const;
}

export function useTradePortfolio(
  ownerId: string | undefined,
  tradeId: string | undefined,
  isOwner: boolean,
) {
  return useQuery({
    queryKey: [...portfolioKey(ownerId ?? "", tradeId ?? ""), isOwner],
    enabled: Boolean(ownerId && tradeId),
    staleTime: 60 * 1000,
    queryFn: () =>
      fetchTradePortfolio(ownerId as string, tradeId as string, {
        publicOnly: !isOwner,
      }),
  });
}

export function usePortfolioItem(
  ownerId: string | undefined,
  id: string | undefined,
) {
  return useQuery({
    queryKey: ["portfolio-item", ownerId ?? "", id ?? ""],
    enabled: Boolean(ownerId && id),
    staleTime: 60 * 1000,
    queryFn: () => fetchPortfolioItem(ownerId as string, id as string),
  });
}
