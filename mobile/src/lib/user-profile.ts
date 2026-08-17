import { doc, getDoc, updateDoc } from "@react-native-firebase/firestore";

import { getDb } from "@/lib/firebase";

export type EditableProfile = {
  name: string;
  businessName: string;
  professionalRole: string;
  shortBio: string;
  email: string;
  phone: string;
  address: string;
  avatar: string | null;
};

export type ProfilePatch = Partial<Omit<EditableProfile, "avatar">>;

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readAddress(data: Record<string, unknown>): string {
  const address = data.address;
  if (typeof address === "string" && address.trim()) return address.trim();
  const loc = data.location;
  if (loc && typeof loc === "object") {
    const placeName = (loc as Record<string, unknown>).place_name;
    if (typeof placeName === "string" && placeName.trim()) return placeName.trim();
  }
  return "";
}

export async function fetchEditableProfile(uid: string): Promise<EditableProfile> {
  const db = getDb();
  const snapshot = await getDoc(doc(db, "profiles", uid));
  const raw = snapshot.exists() ? snapshot.data() : undefined;
  const data =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    name: str(data.name) || str(data.businessName),
    businessName: str(data.businessName),
    professionalRole: str(data.professionalRole),
    shortBio: str(data.shortBio),
    email: str(data.email),
    phone: str(data.phone),
    address: readAddress(data),
    avatar: str(data.avatar) || null,
  };
}

export async function updateEditableProfile(
  uid: string,
  patch: ProfilePatch,
): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, "profiles", uid), patch);
}

export async function updateAvatar(uid: string, avatar: string): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, "profiles", uid), { avatar });
}
