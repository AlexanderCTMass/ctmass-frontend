import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "@react-native-firebase/firestore";

import { getDb } from "@/lib/firebase";
import { fetchProfileBrief, type ProfileBrief } from "@/lib/profiles";

const CONNECTIONS = "connections";
const INVITES = "friendInvites";

export type Friend = ProfileBrief;

function connectionId(a: string, b: string): string {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

export async function fetchFriendIds(uid: string): Promise<string[]> {
  const db = getDb();
  const snapshot = await getDocs(
    query(collection(db, CONNECTIONS), where("users", "array-contains", uid)),
  );
  const ids: string[] = [];
  snapshot.docs.forEach((docSnap) => {
    const data = asRecord(docSnap.data());
    const users = Array.isArray(data.users)
      ? (data.users as unknown[]).filter(
          (item): item is string => typeof item === "string",
        )
      : [];
    const friends = asRecord(asRecord(data.items).friends);
    const other = users.find((item) => item !== uid);
    if (other && friends.status === "confirmed") ids.push(other);
  });
  return Array.from(new Set(ids));
}

export async function fetchFriends(uid: string): Promise<Friend[]> {
  const ids = await fetchFriendIds(uid);
  return Promise.all(ids.map((id) => fetchProfileBrief(id)));
}

export async function sendFriendInvite(
  inviterId: string,
  inviterName: string,
  email: string,
): Promise<void> {
  const db = getDb();
  await addDoc(collection(db, INVITES), {
    inviterId,
    inviterName,
    email: email.trim().toLowerCase(),
    status: "pending",
    source: "mobile",
    createdAt: serverTimestamp(),
  });
}

export async function confirmFriendship(a: string, b: string): Promise<void> {
  const db = getDb();
  await setDoc(
    doc(db, CONNECTIONS, connectionId(a, b)),
    {
      users: [a, b],
      items: {
        friends: {
          status: "confirmed",
          initiatedBy: a,
          updatedAt: serverTimestamp(),
        },
      },
    },
    { merge: true },
  );
}

export async function acceptPendingInvitesForUser(
  uid: string,
  email: string | null | undefined,
): Promise<void> {
  const normalized = (email ?? "").trim().toLowerCase();
  if (!uid || !normalized) return;
  try {
    const db = getDb();
    const snapshot = await getDocs(
      query(
        collection(db, INVITES),
        where("email", "==", normalized),
        where("status", "==", "pending"),
      ),
    );
    await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = asRecord(docSnap.data());
        const inviterId =
          typeof data.inviterId === "string" ? data.inviterId : "";
        if (!inviterId || inviterId === uid) return;
        await confirmFriendship(inviterId, uid);
        await updateDoc(docSnap.ref, {
          status: "accepted",
          accepteeId: uid,
          acceptedAt: serverTimestamp(),
        });
      }),
    );
  } catch (error) {
    console.warn("acceptPendingInvitesForUser error", error);
  }
}

export async function acceptInviteFromRef(
  uid: string,
  inviterId: string,
): Promise<void> {
  if (!uid || !inviterId || uid === inviterId) return;
  try {
    await confirmFriendship(inviterId, uid);
  } catch (error) {
    console.warn("acceptInviteFromRef error", error);
  }
}
