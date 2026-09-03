import { doc, getDoc } from "@react-native-firebase/firestore";

import { getDb } from "@/lib/firebase";

export type PublicProfile = {
  uid: string;
  name: string;
  avatar: string | null;
  role: string | null;
  businessName: string;
  professionalRole: string;
  shortBio: string;
  address: string;
};

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readAddress(data: Record<string, unknown>): string {
  const address = str(data.address);
  if (address.trim()) return address.trim();
  const loc = data.location;
  if (loc && typeof loc === "object") {
    const placeName = (loc as Record<string, unknown>).place_name;
    if (typeof placeName === "string") return placeName.trim();
  }
  return "";
}

export async function fetchPublicProfile(
  uid: string,
): Promise<PublicProfile | null> {
  const db = getDb();
  const snapshot = await getDoc(doc(db, "profiles", uid));
  if (!snapshot.exists()) return null;
  const data = (snapshot.data() ?? {}) as Record<string, unknown>;
  return {
    uid,
    name: str(data.name) || str(data.businessName) || "User",
    avatar: str(data.avatar) || null,
    role: str(data.role) || null,
    businessName: str(data.businessName),
    professionalRole: str(data.professionalRole),
    shortBio: str(data.shortBio),
    address: readAddress(data),
  };
}
