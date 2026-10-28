import { useQuery } from "@tanstack/react-query";

import { fetchPublicCertificates } from "@/lib/certificates";
import { fetchProfileBrief, type ProfileBrief } from "@/lib/profiles";
import { fetchPublicProfile } from "@/lib/public-profile";
import { fetchReviews, type Review } from "@/lib/reviews";

export type ReviewWithAuthor = Review & { author: ProfileBrief | null };

export function useOwnerPublicProfile(ownerId: string | undefined) {
  return useQuery({
    queryKey: ["public-profile", ownerId ?? ""],
    enabled: Boolean(ownerId),
    staleTime: 5 * 60 * 1000,
    queryFn: () => fetchPublicProfile(ownerId as string),
  });
}

export function useTradeCertificates(
  ownerId: string | undefined,
  tradeId: string | undefined,
) {
  return useQuery({
    queryKey: ["public-certificates", ownerId ?? ""],
    enabled: Boolean(ownerId),
    staleTime: 5 * 60 * 1000,
    queryFn: () => fetchPublicCertificates(ownerId as string),
    select: (list) => {
      if (!tradeId) return [];
      const linked = list.filter((cert) =>
        cert.linkedTradeIds.includes(tradeId),
      );
      return linked.length > 0 ? linked : list;
    },
  });
}

export type OwnerReviews = {
  total: number;
  scope: "trade" | "all";
  items: ReviewWithAuthor[];
};

export function useOwnerReviews(
  ownerId: string | undefined,
  limit: number,
  tradeId?: string,
) {
  return useQuery({
    queryKey: ["owner-reviews", ownerId ?? "", tradeId ?? "", limit],
    enabled: Boolean(ownerId),
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<OwnerReviews> => {
      const all = await fetchReviews(ownerId as string);
      const own = tradeId ? all.filter((review) => review.tradeId === tradeId) : [];
      const scope = own.length > 0 ? "trade" : "all";
      const list = scope === "trade" ? own : all;
      const sorted = [...list].sort(
        (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
      );
      const top = sorted.slice(0, limit);
      const authors = await Promise.all(
        top.map((review) =>
          review.authorId
            ? fetchProfileBrief(review.authorId).catch(() => null)
            : Promise.resolve(null),
        ),
      );
      return {
        total: list.length,
        scope,
        items: top.map((review, index) => ({
          ...review,
          author: authors[index] ?? null,
        })),
      };
    },
  });
}
