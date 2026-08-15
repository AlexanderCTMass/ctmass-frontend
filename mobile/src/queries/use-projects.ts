import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { fetchMyProjects, fetchNearbyProjects } from "@/lib/projects";

export function useMyProjects(uid: string | undefined, pageSize: number) {
  return useQuery({
    queryKey: ["my-projects", uid ?? "", pageSize],
    enabled: Boolean(uid),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
    queryFn: () => fetchMyProjects(uid as string, pageSize),
  });
}

export function useNearbyProjects(uid: string | undefined, pageSize: number) {
  return useQuery({
    queryKey: ["nearby-projects", uid ?? "", pageSize],
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
    queryFn: () => fetchNearbyProjects(uid, pageSize),
  });
}
