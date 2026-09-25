import { useQuery } from "@tanstack/react-query";

import {
  fetchContractorJobs,
  fetchInvitedProjects,
  fetchMyProjects,
  fetchNearbyProjects,
} from "@/lib/projects";

export function useMyProjects(uid: string | undefined) {
  return useQuery({
    queryKey: ["my-projects", uid ?? ""],
    enabled: Boolean(uid),
    staleTime: 60 * 1000,
    queryFn: () => fetchMyProjects(uid as string),
  });
}

export function useNearbyProjects(uid: string | undefined) {
  return useQuery({
    queryKey: ["nearby-projects", uid ?? ""],
    staleTime: 60 * 1000,
    queryFn: () => fetchNearbyProjects(uid),
  });
}

export function useInvitedProjects(uid: string | undefined) {
  return useQuery({
    queryKey: ["invited-projects", uid ?? ""],
    enabled: Boolean(uid),
    staleTime: 60 * 1000,
    queryFn: () => fetchInvitedProjects(uid as string),
  });
}

export function useContractorJobs(uid: string | undefined) {
  return useQuery({
    queryKey: ["contractor-jobs", uid ?? ""],
    enabled: Boolean(uid),
    staleTime: 60 * 1000,
    queryFn: () => fetchContractorJobs(uid as string),
  });
}
