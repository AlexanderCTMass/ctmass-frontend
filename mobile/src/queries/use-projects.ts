import { useQuery } from "@tanstack/react-query";

import { fetchMyProjects, fetchNearbyProjects } from "@/lib/projects";

export function useMyProjects(uid?: string) {
  return useQuery({
    queryKey: ["my-projects", uid ?? ""],
    enabled: Boolean(uid),
    staleTime: 60 * 1000,
    queryFn: () => fetchMyProjects(uid as string),
  });
}

export function useNearbyProjects(uid?: string) {
  return useQuery({
    queryKey: ["nearby-projects", uid ?? ""],
    staleTime: 60 * 1000,
    queryFn: () => fetchNearbyProjects(uid),
  });
}
