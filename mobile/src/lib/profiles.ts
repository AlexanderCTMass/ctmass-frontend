import { doc, getDoc } from "@react-native-firebase/firestore";

import { getDb } from "@/lib/firebase";

export type ProfileBrief = {
  uid: string;
  name: string;
  avatar: string | null;
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
