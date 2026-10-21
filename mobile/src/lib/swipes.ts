import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "@react-native-firebase/firestore";

import { getDb } from "@/lib/firebase";

export type SwipeTarget = "project" | "specialist";
export type SwipeValue = "like" | "archive";

export type SwipeRecord = {
  id: string;
  targetType: SwipeTarget;
  targetId: string;
  value: SwipeValue;
  topic: string;
};

export type SwipeInput = Omit<SwipeRecord, "id">;

export type ProjectLikeStats = Record<string, number>;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

export function swipeId(targetType: SwipeTarget, targetId: string): string {
  return `${targetType}_${targetId}`;
}

export function topicKey(label: string): string {
  return label.trim().toLowerCase();
}

function toRecord(
  id: string,
  data: Record<string, unknown>,
): SwipeRecord | null {
  const targetType = data.targetType;
  const value = data.value;
  const targetId = typeof data.targetId === "string" ? data.targetId : "";
  if (targetType !== "project" && targetType !== "specialist") return null;
  if (value !== "like" && value !== "archive") return null;
  if (!targetId) return null;
  return {
    id,
    targetType,
    targetId,
    value,
    topic: typeof data.topic === "string" ? data.topic : "",
  };
}

export async function fetchSwipes(uid: string): Promise<SwipeRecord[]> {
  const snapshot = await getDocs(
    collection(getDb(), "profiles", uid, "swipes"),
  );
  return snapshot.docs
    .map((docSnap) => toRecord(docSnap.id, asRecord(docSnap.data())))
    .filter((item): item is SwipeRecord => item !== null);
}

export async function saveSwipe(uid: string, input: SwipeInput): Promise<void> {
  await setDoc(
    doc(
      getDb(),
      "profiles",
      uid,
      "swipes",
      swipeId(input.targetType, input.targetId),
    ),
    { ...input, updatedAt: serverTimestamp() },
  );
}

export async function clearSwipe(
  uid: string,
  targetType: SwipeTarget,
  targetId: string,
): Promise<void> {
  await deleteDoc(
    doc(getDb(), "profiles", uid, "swipes", swipeId(targetType, targetId)),
  );
}

export async function fetchProjectLikeStats(
  uid: string,
): Promise<ProjectLikeStats> {
  const snapshot = await getDocs(
    collection(getDb(), "profiles", uid, "projectStats"),
  );
  const out: ProjectLikeStats = {};
  for (const docSnap of snapshot.docs) {
    const count = asRecord(docSnap.data()).likeCount;
    if (typeof count === "number" && count > 0) out[docSnap.id] = count;
  }
  return out;
}

export type SwipeIndex = {
  liked: Set<string>;
  archived: Set<string>;
  affinity: Map<string, number>;
};

export function buildSwipeIndex(
  records: SwipeRecord[],
  targetType: SwipeTarget,
): SwipeIndex {
  const liked = new Set<string>();
  const archived = new Set<string>();
  const affinity = new Map<string, number>();
  for (const record of records) {
    if (record.targetType !== targetType) continue;
    if (record.topic) {
      const weight = record.value === "like" ? 1 : -1;
      affinity.set(record.topic, (affinity.get(record.topic) ?? 0) + weight);
    }
    if (record.value === "like") liked.add(record.targetId);
    else archived.add(record.targetId);
  }
  return { liked, archived, affinity };
}

export function rankByAffinity<T>(
  list: T[],
  index: SwipeIndex,
  idOf: (item: T) => string,
  topicOf: (item: T) => string,
): T[] {
  const score = (item: T) =>
    (index.liked.has(idOf(item)) ? 100 : 0) +
    (index.affinity.get(topicKey(topicOf(item))) ?? 0);
  return list
    .map((item, position) => ({ item, position, score: score(item) }))
    .sort((a, b) => b.score - a.score || a.position - b.position)
    .map((entry) => entry.item);
}
