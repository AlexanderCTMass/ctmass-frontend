import { useQuery } from "@tanstack/react-query";

import { fetchFriends } from "@/lib/friends";

export function useFriends(uid: string | undefined) {
  return useQuery({
    queryKey: ["friends", uid ?? ""],
    enabled: Boolean(uid),
    staleTime: 30 * 1000,
    queryFn: () => fetchFriends(uid as string),
  });
}
