import {
  collection,
  doc,
  getDoc,
  getDocs,
} from "@react-native-firebase/firestore";

import { getDb } from "@/lib/firebase";

export type ProfileBrief = {
  uid: string;
  name: string;
  avatar: string | null;
};

export type PersonResult = {
  uid: string;
  name: string;
  email: string;
  avatar: string | null;
  businessName: string;
};

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export async function fetchProfileBrief(uid: string): Promise<ProfileBrief> {
  const db = getDb();
  const snapshot = await getDoc(doc(db, "profiles", uid));
  const raw = snapshot.exists() ? snapshot.data() : undefined;
  const data =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const name = str(data.name) || str(data.businessName) || "User";
  const avatar = str(data.avatar) || null;
  return { uid, name, avatar };
}

export async function fetchAllPeople(): Promise<PersonResult[]> {
  const db = getDb();
  const snapshot = await getDocs(collection(db, "profiles"));
  return snapshot.docs.map((docSnap) => {
    const data = (docSnap.data() ?? {}) as Record<string, unknown>;
    const name =
      str(data.name) || str(data.businessName) || str(data.email) || "User";
    return {
      uid: docSnap.id,
      name,
      email: str(data.email),
      avatar: str(data.avatar) || null,
      businessName: str(data.businessName),
    };
  });
}

export function filterPeople(
  people: PersonResult[],
  queryText: string,
  excludeUids: Set<string>,
): PersonResult[] {
  const q = queryText.trim().toLowerCase();
  if (!q) return [];
  return people
    .filter((person) => !excludeUids.has(person.uid))
    .filter((person) => {
      const nameOk = person.name.toLowerCase().includes(q);
      const emailOk = person.email.toLowerCase().includes(q);
      const bizOk = person.businessName.toLowerCase().includes(q);
      return nameOk || emailOk || bizOk;
    })
    .slice(0, 30);
}
