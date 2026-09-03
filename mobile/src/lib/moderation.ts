import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "@react-native-firebase/firestore";

import { getDb } from "@/lib/firebase";

export type ReportInput = {
  reporterId: string;
  reportedId: string;
  reportedName: string;
  reason: string;
  comment: string;
  mediaUrl: string | null;
};

export async function reportUser(input: ReportInput): Promise<void> {
  const db = getDb();
  await addDoc(collection(db, "reports"), {
    reporterId: input.reporterId,
    reportedId: input.reportedId,
    reportedName: input.reportedName,
    reason: input.reason,
    comment: input.comment,
    mediaUrl: input.mediaUrl,
    status: "open",
    createdAt: serverTimestamp(),
  });
}

export async function blockUser(uid: string, targetId: string): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, "profiles", uid), {
    blockedUsers: arrayUnion(targetId),
  });
}

export async function unblockUser(
  uid: string,
  targetId: string,
): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, "profiles", uid), {
    blockedUsers: arrayRemove(targetId),
  });
}

export type BlockState = {
  iBlocked: boolean;
  blockedMe: boolean;
};

function readBlockedList(value: unknown): string[] {
  const raw =
    value && typeof value === "object"
      ? (value as Record<string, unknown>).blockedUsers
      : undefined;
  return Array.isArray(raw)
    ? raw.filter((item): item is string => typeof item === "string")
    : [];
}

export async function fetchBlockState(
  uid: string,
  targetId: string,
): Promise<BlockState> {
  const db = getDb();
  const [mine, theirs] = await Promise.all([
    getDoc(doc(db, "profiles", uid)),
    getDoc(doc(db, "profiles", targetId)),
  ]);
  const myBlocked = readBlockedList(mine.exists() ? mine.data() : undefined);
  const theirBlocked = readBlockedList(theirs.exists() ? theirs.data() : undefined);
  return {
    iBlocked: myBlocked.includes(targetId),
    blockedMe: theirBlocked.includes(uid),
  };
}
