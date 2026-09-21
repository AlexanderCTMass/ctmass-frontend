import { useQuery } from "@tanstack/react-query";

import { fetchUserVideos } from "@/lib/videos";

export const userVideosKey = (uid: string | undefined) => [
  "videos",
  "by-user",
  uid ?? "",
];

export function useUserVideos(uid: string | undefined, includeHidden = false) {
  return useQuery({
    queryKey: [...userVideosKey(uid), includeHidden],
    enabled: Boolean(uid),
    staleTime: 5 * 60 * 1000,
    queryFn: () => fetchUserVideos(uid as string, includeHidden),
  });
}
