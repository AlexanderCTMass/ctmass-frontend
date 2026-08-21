import { useQuery } from "@tanstack/react-query";

import { fetchProjectById } from "@/lib/projects";

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: ["project", id ?? ""],
    enabled: Boolean(id),
    staleTime: 60 * 1000,
    queryFn: () => fetchProjectById(id as string),
  });
}
