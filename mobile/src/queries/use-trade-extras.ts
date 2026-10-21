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
    select: (list) =>
      tradeId ? list.filter((cert) => cert.linkedTradeIds.includes(tradeId)) : [],
  });
}

export function useOwnerReviews(ownerId: string | undefined, limit: number) {
  return useQuery({
    queryKey: ["owner-reviews", ownerId ?? "", limit],
    enabled: Boolean(ownerId),
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<{ total: number; items: ReviewWithAuthor[] }> => {
      const all = await fetchReviews(ownerId as string);
      const sorted = [...all].sort(
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
        total: all.length,
        items: top.map((review, index) => ({
          ...review,
          author: authors[index] ?? null,
        })),
      };
    },
  });
}
