import { useQuery } from "@tanstack/react-query";

import { OTHER_SPECIALTY } from "@/constants/specialties";
import { adjacentLabels } from "@/lib/specialty-adjacency";
import {
  fetchRecentSpecialists,
  fetchSpecialistsByLabels,
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
  if (specialty === OTHER_SPECIALTY) {
    const items = await fetchRecentSpecialists(excludeOwnerId);
    return { items, usedFallback: true };
  }

  const direct = await fetchSpecialistsByLabels([specialty], excludeOwnerId);
  if (direct.length > 0) {
    return { items: direct, usedFallback: false };
  }

  const adjacent = adjacentLabels(specialty);
  if (adjacent.length > 0) {
    const related = await fetchSpecialistsByLabels(adjacent, excludeOwnerId);
    if (related.length > 0) {
      return { items: related, usedFallback: true };
    }
  }

  const recent = await fetchRecentSpecialists(excludeOwnerId);
  return { items: recent, usedFallback: true };
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
