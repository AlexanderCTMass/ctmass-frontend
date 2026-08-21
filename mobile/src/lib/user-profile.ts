import { doc, getDoc, updateDoc } from "@react-native-firebase/firestore";

import { getDb } from "@/lib/firebase";
import type { GeoPlace } from "@/lib/mapbox";

export type EditableProfile = {
  name: string;
  businessName: string;
  professionalRole: string;
  shortBio: string;
  email: string;
  phone: string;
  address: string;
  location: GeoPlace | null;
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

function readLocation(data: Record<string, unknown>): GeoPlace | null {
  const loc = data.location;
  if (!loc || typeof loc !== "object") return null;
  const raw = loc as Record<string, unknown>;
  const placeName = typeof raw.place_name === "string" ? raw.place_name : "";
  const center =
    Array.isArray(raw.center) &&
    raw.center.length === 2 &&
    typeof raw.center[0] === "number" &&
    typeof raw.center[1] === "number"
      ? ([raw.center[0], raw.center[1]] as [number, number])
      : null;
  if (!placeName || !center) return null;
  return {
    id: typeof raw.id === "string" ? raw.id : placeName,
    place_name: placeName,
    text: typeof raw.text === "string" ? raw.text : placeName,
    center,
    geometry: { type: "Point", coordinates: center },
  };
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
    location: readLocation(data),
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
