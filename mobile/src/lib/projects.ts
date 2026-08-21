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

import { notifyProjectResponse } from "@/lib/app-notifications";
import { sendMessage, startChat } from "@/lib/chat";
import { getDb } from "@/lib/firebase";

const COLLECTION = "projects";
const LIST_LIMIT = 100;

export type Responder = {
  userId: string;
  userName: string;
  threadId: string;
};

export type ProjectItem = {
  id: string;
  title: string;
  state: string;
  specialtyLabel: string;
  placeName: string;
  customerName: string;
  createdAt: Date | null;
  responseCount: number;
};

export type ProjectDetail = ProjectItem & {
  userId: string;
  description: string;
  attach: string[];
  requestId: string;
  contractorId: string;
  contractorName: string;
  responders: Responder[];
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

function toResponders(value: unknown): Responder[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const record = asRecord(item);
      const userId = str(record.userId);
      const threadId = str(record.threadId);
      if (!userId) return null;
      return { userId, userName: str(record.userName), threadId };
    })
    .filter((item): item is Responder => item !== null);
}

function mapProject(id: string, data: Record<string, unknown>): ProjectItem {
  const location = asRecord(data.location);
  const addressLocation = asRecord(location.addressLocation);
  const responders = toResponders(data.respondedSpecialists);
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
    responseCount: responders.length,
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
    contractorId: str(data.contractorId),
    contractorName: str(data.contractorName),
    responders: toResponders(data.respondedSpecialists),
  };
}

export async function fetchMyProjects(
  uid: string,
  max = LIST_LIMIT,
): Promise<ProjectDetail[]> {
  const db = getDb();
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", uid),
    limit(max),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((docSnap) => mapProjectDetail(docSnap.id, asRecord(docSnap.data())))
    .sort(
      (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
    );
}

export async function fetchNearbyProjects(
  excludeUid?: string,
  max = LIST_LIMIT,
): Promise<ProjectDetail[]> {
  const db = getDb();
  const q = query(
    collection(db, COLLECTION),
    where("state", "==", "published"),
    limit(max),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((docSnap) => mapProjectDetail(docSnap.id, asRecord(docSnap.data())))
    .filter((item) => !excludeUid || item.userId !== excludeUid)
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
  project: { id: string; userId: string; title?: string },
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
  void notifyProjectResponse(
    project.userId,
    responder.name,
    project.id,
    project.title ?? "your project",
    threadId,
  );
  return threadId;
}

export async function selectSpecialist(
  projectId: string,
  ownerUid: string,
  contractor: { id: string; name: string },
  threadId: string,
): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, COLLECTION, projectId), {
    contractorId: contractor.id,
    contractorName: contractor.name,
    contractorAvatar: null,
    state: "in_progress",
  });
  await sendMessage(
    threadId,
    ownerUid,
    "You've been selected as the specialist for this project.",
    [ownerUid, contractor.id],
  );
}
