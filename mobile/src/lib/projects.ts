import {
  collection,
  getDocs,
  limit,
  query,
  where,
} from "@react-native-firebase/firestore";

import { getDb } from "@/lib/firebase";

const COLLECTION = "projects";
const LIST_LIMIT = 20;

export type ProjectItem = {
  id: string;
  title: string;
  state: string;
  specialtyLabel: string;
  placeName: string;
  customerName: string;
};

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function mapProject(id: string, data: Record<string, unknown>): ProjectItem {
  const location = asRecord(data.location);
  const addressLocation = asRecord(location.addressLocation);
  return {
    id,
    title:
      str(data.title) ||
      str(data.specialtyLabel) ||
      str(data.subtitle) ||
      "Project",
    state: str(data.state, "draft"),
    specialtyLabel: str(data.specialtyLabel) || str(data.subtitle),
    placeName:
      str(location.place_name) ||
      str(addressLocation.place_name) ||
      str(location.address),
    customerName: str(data.customerName),
  };
}

export async function fetchMyProjects(uid: string): Promise<ProjectItem[]> {
  const db = getDb();
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", uid),
    limit(LIST_LIMIT),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) =>
    mapProject(docSnap.id, asRecord(docSnap.data())),
  );
}

export async function fetchNearbyProjects(
  excludeUid?: string,
): Promise<ProjectItem[]> {
  const db = getDb();
  const q = query(
    collection(db, COLLECTION),
    where("state", "==", "published"),
    limit(LIST_LIMIT),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((docSnap) => {
      const data = asRecord(docSnap.data());
      return { item: mapProject(docSnap.id, data), userId: str(data.userId) };
    })
    .filter((entry) => !excludeUid || entry.userId !== excludeUid)
    .map((entry) => entry.item);
}
