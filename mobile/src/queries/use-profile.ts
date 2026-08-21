import { useQuery } from "@tanstack/react-query";

import { fetchEditableProfile } from "@/lib/user-profile";

export function useProfile(uid: string | undefined) {
  return useQuery({
    queryKey: ["profile", uid ?? ""],
    enabled: Boolean(uid),
    staleTime: 30 * 1000,
    queryFn: () => fetchEditableProfile(uid as string),
  });
}
