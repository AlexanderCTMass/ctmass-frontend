import { useQuery } from "@tanstack/react-query";

import {
  OTHER_TRADE_LABEL,
  findTrade,
  siblingTrades,
  tradeQueryLabels,
} from "@/constants/trade-taxonomy";
import {
  fetchRecentSpecialists,
  fetchSpecialistsByLabels,
  fetchSpecialistsByService,
  type Specialist,
} from "@/lib/trades";

export type SpecialistsResult = {
  items: Specialist[];
  usedFallback: boolean;
};

async function loadSpecialists(
  specialty: string,
  excludeOwnerId?: string,
): Promise<SpecialistsResult> {
  const trade = findTrade(specialty);
  if (specialty === OTHER_TRADE_LABEL || !trade) {
    const direct =
      specialty === OTHER_TRADE_LABEL
        ? []
        : await fetchSpecialistsByLabels([specialty], excludeOwnerId);
    if (direct.length > 0) return { items: direct, usedFallback: false };
    const items = await fetchRecentSpecialists(excludeOwnerId);
    return { items, usedFallback: true };
  }

  const [direct, byService] = await Promise.all([
    fetchSpecialistsByLabels(tradeQueryLabels(trade), excludeOwnerId),
    fetchSpecialistsByService(trade.label, excludeOwnerId),
  ]);
  const matched = uniqueByTrade([...direct, ...byService]);
  if (matched.length > 0) {
    return { items: matched, usedFallback: false };
  }

  const adjacent = siblingTrades(trade).flatMap(tradeQueryLabels);
  if (adjacent.length > 0) {
    const related = await fetchSpecialistsByLabels(adjacent, excludeOwnerId);
    if (related.length > 0) {
      return { items: related, usedFallback: true };
    }
  }

  const recent = await fetchRecentSpecialists(excludeOwnerId);
  return { items: recent, usedFallback: true };
}

function uniqueByTrade(list: Specialist[]): Specialist[] {
  const seen = new Set<string>();
  return list.filter((item) => {
    if (seen.has(item.tradeId)) return false;
    seen.add(item.tradeId);
    return true;
  });
}

export function useSpecialists(
  specialty: string | null,
  excludeOwnerId?: string,
) {
  return useQuery({
    queryKey: ["specialists", specialty ?? "any", excludeOwnerId ?? ""],
    enabled: Boolean(specialty),
    staleTime: 5 * 60 * 1000,
    queryFn: () => loadSpecialists(specialty as string, excludeOwnerId),
  });
}
