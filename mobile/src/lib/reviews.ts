import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "@react-native-firebase/firestore";

import { getDb } from "@/lib/firebase";

export type Review = {
  id: string;
  text: string;
  rating: number;
  authorId: string;
  projectId: string;
  createdAt: Date | null;
};

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function num(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function toDate(value: unknown): Date | null {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }
  return null;
}

// Mirrors web extendedProfileApi.addReview: writes to the reviewed user's
// profiles/{id}/reviews subcollection with { text, rating, authorId, projectId, date }.
export async function addReview(
  targetProfileId: string,
  projectId: string | null,
  text: string,
  rating: number,
  authorId: string,
): Promise<void> {
  if (!targetProfileId) return;
  const db = getDb();
  await addDoc(collection(db, "profiles", targetProfileId, "reviews"), {
    text,
    rating,
    authorId,
    projectId: projectId ?? null,
    date: serverTimestamp(),
    source: "mobile",
  });
}

export async function fetchReviews(userId: string): Promise<Review[]> {
  if (!userId) return [];
  const db = getDb();
  const snapshot = await getDocs(collection(db, "profiles", userId, "reviews"));
  return snapshot.docs
    .map((docSnap) => {
      const data = (docSnap.data() ?? {}) as Record<string, unknown>;
      return {
        id: docSnap.id,
        text: str(data.text),
        rating: num(data.rating),
        authorId: str(data.authorId),
        projectId: str(data.projectId),
        createdAt: toDate(data.date),
      };
    })
    .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
}

export function reviewSummary(reviews: Review[]): {
  average: number;
  count: number;
} {
  const rated = reviews.filter((review) => review.rating > 0);
  if (rated.length === 0) return { average: 0, count: reviews.length };
  const sum = rated.reduce((acc, review) => acc + review.rating, 0);
  return { average: sum / rated.length, count: reviews.length };
}

// Live rating for a user, computed from their reviews subcollection at read
// time — the same approach the web uses (profileService.updateRatingInfo), so
// reviews left on either platform count immediately.
export async function fetchOwnerRating(
  userId: string,
): Promise<{ average: number; count: number }> {
  if (!userId) return { average: 0, count: 0 };
  const reviews = await fetchReviews(userId);
  return reviewSummary(reviews);
}
