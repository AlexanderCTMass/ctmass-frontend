import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { fetchProjectsByIds } from "@/lib/projects";
import { fetchProjectLikeStats, fetchSwipes } from "@/lib/swipes";
import { fetchSpecialistsByIds } from "@/lib/trades";

export function swipesKey(uid: string | undefined) {
  return ["swipes", uid ?? ""];
}

export function useSwipes(uid: string | undefined) {
  return useQuery({
    queryKey: swipesKey(uid),
    enabled: Boolean(uid),
    staleTime: 5 * 60 * 1000,
    queryFn: () => fetchSwipes(uid as string),
  });
}

export function useProjectLikeStats(uid: string | undefined) {
  return useQuery({
    queryKey: ["project-like-stats", uid ?? ""],
    enabled: Boolean(uid),
    staleTime: 60 * 1000,
    queryFn: () => fetchProjectLikeStats(uid as string),
  });
}

export function useProjectsByIds(ids: string[], enabled = true) {
  const sorted = [...ids].sort();
  return useQuery({
    queryKey: ["projects-by-ids", sorted.join(",")],
    enabled: enabled && sorted.length > 0,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
    queryFn: () => fetchProjectsByIds(sorted),
  });
}

export function useSpecialistsByIds(
  ids: string[],
  excludeOwnerId: string | undefined,
  enabled = true,
) {
  const sorted = [...ids].sort();
  return useQuery({
    queryKey: ["specialists-by-ids", sorted.join(","), excludeOwnerId ?? ""],
    enabled: enabled && sorted.length > 0,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    queryFn: () => fetchSpecialistsByIds(sorted, excludeOwnerId),
  });
}
