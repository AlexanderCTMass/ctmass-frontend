import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  updateDoc,
  where,
} from "@react-native-firebase/firestore";

import { sendMessage, startChat } from "@/lib/chat";
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
  createdAt: Date | null;
};

export type ProjectDetail = ProjectItem & {
  userId: string;
  description: string;
  attach: string[];
  requestId: string;
};

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function toDate(value: unknown): Date | null {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return (value.toDate as () => Date)();
  }
  return null;
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
    createdAt: toDate(data.createdAt),
  };
}

function mapProjectDetail(
  id: string,
  data: Record<string, unknown>,
): ProjectDetail {
  const attach = Array.isArray(data.attach)
    ? data.attach.filter((item): item is string => typeof item === "string")
    : [];
  return {
    ...mapProject(id, data),
    userId: str(data.userId),
    description: str(data.description),
    attach,
    requestId: str(data.requestId),
  };
}

export async function fetchMyProjects(
  uid: string,
  max = LIST_LIMIT,
): Promise<ProjectItem[]> {
  const db = getDb();
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", uid),
    limit(max),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((docSnap) => mapProject(docSnap.id, asRecord(docSnap.data())))
    .sort(
      (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
    );
}

export async function fetchNearbyProjects(
  excludeUid?: string,
  max = LIST_LIMIT,
): Promise<ProjectItem[]> {
  const db = getDb();
  const q = query(
    collection(db, COLLECTION),
    where("state", "==", "published"),
    limit(max),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((docSnap) => {
      const data = asRecord(docSnap.data());
      return { item: mapProject(docSnap.id, data), userId: str(data.userId) };
    })
    .filter((entry) => !excludeUid || entry.userId !== excludeUid)
    .map((entry) => entry.item)
    .sort(
      (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
    );
}

export async function fetchProjectById(
  id: string,
): Promise<ProjectDetail | null> {
  const db = getDb();
  const snapshot = await getDoc(doc(db, COLLECTION, id));
  if (!snapshot.exists()) return null;
  return mapProjectDetail(snapshot.id, asRecord(snapshot.data()));
}

export type CreateProjectInput = {
  title: string;
  specialtyLabel: string;
  description: string;
  locationName: string;
  requestId: string | null;
  customerName: string;
  customerMail: string;
  attach?: string[];
};

export async function createProject(
  uid: string,
  input: CreateProjectInput,
): Promise<string> {
  const db = getDb();
  const docRef = await addDoc(collection(db, COLLECTION), {
    title: input.title,
    specialtyLabel: input.specialtyLabel,
    specialtyId: null,
    description: input.description,
    location: input.locationName ? { place_name: input.locationName } : null,
    projectMaximumBudget: null,
    attach: input.attach ?? [],
    userId: uid,
    customerName: input.customerName,
    customerMail: input.customerMail,
    customerAvatar: null,
    state: "published",
    requestId: input.requestId,
    source: "mobile",
    createdAt: new Date(),
  });
  return docRef.id;
}

export async function respondToProject(
  project: { id: string; userId: string },
  responder: { uid: string; name: string },
  message: string,
): Promise<string> {
  const db = getDb();
  const threadId = await startChat(project.userId, responder.uid, project.id);
  await updateDoc(doc(db, COLLECTION, project.id), {
    respondedSpecialists: arrayUnion({
      userId: responder.uid,
      userName: responder.name,
      userAvatar: null,
      threadId,
      createdAt: new Date(),
    }),
  });
  await sendMessage(threadId, responder.uid, message, [
    responder.uid,
    project.userId,
  ]);
  return threadId;
}
