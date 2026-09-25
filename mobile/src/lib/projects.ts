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

import {
  notifyCompletionRequested,
  notifyProjectCancelled,
  notifyProjectCompleted,
  notifyProjectResponse,
  notifyReviewReceived,
  notifyServiceRequested,
} from "@/lib/app-notifications";
import { sendMessage, startChat } from "@/lib/chat";
import { getDb } from "@/lib/firebase";
import { stripHtml } from "@/lib/format";
import { addReview } from "@/lib/reviews";

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
  status: string;
  specialtyLabel: string;
  placeName: string;
  customerName: string;
  createdAt: Date | null;
  responseCount: number;
  proposerUserId: string;
};

export type ProjectDetail = ProjectItem & {
  userId: string;
  description: string;
  attach: string[];
  requestId: string;
  contractorId: string;
  contractorName: string;
  responders: Responder[];
  completionRequested: boolean;
  customerReviewed: boolean;
  contractorReviewed: boolean;
};

export type ReviewInput = { rating: number; message: string };

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
    status: str(data.status),
    specialtyLabel: str(data.specialtyLabel) || str(data.subtitle),
    placeName:
      str(location.place_name) ||
      str(addressLocation.place_name) ||
      str(location.address),
    customerName: str(data.customerName),
    createdAt: toDate(data.createdAt),
    responseCount: responders.length,
    proposerUserId: str(data.proposerUserId),
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
    description: stripHtml(str(data.description)),
    attach,
    requestId: str(data.requestId),
    contractorId: str(data.contractorId),
    contractorName: str(data.contractorName),
    responders: toResponders(data.respondedSpecialists),
    completionRequested: data.completionRequested === true,
    customerReviewed: asRecord(data.customerCompleteReview).rating !== undefined,
    contractorReviewed:
      asRecord(data.contractorCompleteReview).rating !== undefined,
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
    .filter((item) => item.status !== "deleted" && item.state !== "deleted")
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
    .filter((item) => item.status !== "deleted" && item.state !== "deleted")
    .filter((item) => !excludeUid || item.userId !== excludeUid)
    .filter((item) => !item.proposerUserId)
    .sort(
      (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
    );
}

// Projects a homeowner directed at a specific specialist (Request Services).
// The invited specialist sees these at the top of their Contractor home.
export async function fetchInvitedProjects(
  specialistUid: string,
): Promise<ProjectDetail[]> {
  if (!specialistUid) return [];
  const db = getDb();
  const q = query(
    collection(db, COLLECTION),
    where("proposerUserId", "==", specialistUid),
    limit(LIST_LIMIT),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((docSnap) => mapProjectDetail(docSnap.id, asRecord(docSnap.data())))
    .filter((item) => item.status !== "deleted" && item.state !== "deleted")
    .filter((item) => item.state === "published" || item.state === "in_progress")
    .sort(
      (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
    );
}

// Jobs a contractor has been selected for (My Jobs / History).
export async function fetchContractorJobs(
  contractorId: string,
): Promise<ProjectDetail[]> {
  if (!contractorId) return [];
  const db = getDb();
  const q = query(
    collection(db, COLLECTION),
    where("contractorId", "==", contractorId),
    limit(LIST_LIMIT),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((docSnap) => mapProjectDetail(docSnap.id, asRecord(docSnap.data())))
    .filter((item) => item.status !== "deleted" && item.state !== "deleted")
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
  proposerUserId?: string | null;
};

export async function createProject(
  uid: string,
  input: CreateProjectInput,
): Promise<string> {
  const db = getDb();
  const proposerUserId = input.proposerUserId ?? null;
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
    proposerUserId,
    directed: Boolean(proposerUserId),
    source: "mobile",
    createdAt: new Date(),
  });
  return docRef.id;
}

// Request Services: creates a project directed at one specialist, opens a chat
// and sends the invite, then notifies the specialist (push via notificationList).
export async function createDirectedRequest(
  uid: string,
  specialist: { id: string; name: string },
  input: CreateProjectInput & { requesterName: string },
): Promise<{ projectId: string; threadId: string }> {
  const projectId = await createProject(uid, {
    ...input,
    proposerUserId: specialist.id,
  });
  const threadId = await startChat(uid, specialist.id, projectId);
  // Register the specialist as a responder so the homeowner can Confirm
  // selection in chat and the project can reach in_progress → completion.
  const db = getDb();
  await updateDoc(doc(db, COLLECTION, projectId), {
    respondedSpecialists: arrayUnion({
      userId: specialist.id,
      userName: specialist.name,
      userAvatar: null,
      threadId,
      createdAt: new Date(),
    }),
  });
  const invite = input.description.trim()
    ? `Hi ${specialist.name}! I'd like to request your services for "${input.title}". ${input.description.trim()}`
    : `Hi ${specialist.name}! I'd like to request your services for "${input.title}".`;
  await sendMessage(threadId, uid, invite, [uid, specialist.id]);
  void notifyServiceRequested(
    specialist.id,
    input.requesterName || "A client",
    projectId,
    input.title,
    threadId,
  );
  return { projectId, threadId };
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

function reviewMessage(rating: number, message: string): string {
  const stars = "★".repeat(Math.max(0, Math.min(5, Math.round(rating))));
  return message.trim() ? `${stars}  ${message.trim()}` : stars;
}

// Contractor marks the work done — the project stays in_progress until the
// customer confirms (mirrors web completeProjectFromContractor).
export async function contractorMarkComplete(
  project: ProjectDetail,
  threadId: string,
  contractorId: string,
  customerId: string,
): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, COLLECTION, project.id), {
    completionRequested: true,
    completionRequestedAt: new Date(),
  });
  await sendMessage(
    threadId,
    contractorId,
    "The project has been marked as complete. Waiting for the customer's confirmation.",
    [contractorId, customerId],
  );
  void notifyCompletionRequested(
    customerId,
    project.id,
    project.title,
    threadId,
  );
}

// Customer confirms completion and leaves a review of the contractor
// (mirrors web completeProject: state -> completed + addReview on contractor).
export async function customerCompleteWithReview(
  project: ProjectDetail,
  threadId: string,
  customerId: string,
  contractorId: string,
  review: ReviewInput,
): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, COLLECTION, project.id), {
    state: "completed",
    customerCompleteReview: { rating: review.rating, message: review.message },
    completedAt: new Date(),
  });
  await addReview(
    contractorId,
    project.id,
    review.message,
    review.rating,
    customerId,
  );
  await sendMessage(threadId, customerId, "The project is completed.", [
    customerId,
    contractorId,
  ]);
  await sendMessage(
    threadId,
    customerId,
    reviewMessage(review.rating, review.message),
    [customerId, contractorId],
  );
  void notifyProjectCompleted(contractorId, project.id, project.title, threadId);
}

// Contractor reviews the customer after completion. The spec shows reviews on
// both public profiles, so this writes to the customer's reviews too.
export async function contractorReviewCustomer(
  project: ProjectDetail,
  threadId: string,
  contractorId: string,
  customerId: string,
  review: ReviewInput,
): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, COLLECTION, project.id), {
    contractorCompleteReview: { rating: review.rating, message: review.message },
  });
  await addReview(
    customerId,
    project.id,
    review.message,
    review.rating,
    contractorId,
  );
  await sendMessage(
    threadId,
    contractorId,
    reviewMessage(review.rating, review.message),
    [contractorId, customerId],
  );
  void notifyReviewReceived(customerId, project.id, project.title, threadId);
}

// Cancels a project (either party). When a counterparty is set, posts a chat
// notice and pushes a notification to them.
export async function cancelProject(
  project: ProjectDetail,
  byUid: string,
  counterpartyId: string | null,
): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, COLLECTION, project.id), {
    state: "cancelled",
    cancelledAt: new Date(),
    cancelledBy: byUid,
  });
  if (counterpartyId) {
    const contractorId = project.contractorId || counterpartyId;
    const threadId = await startChat(project.userId, contractorId, project.id);
    await sendMessage(threadId, byUid, "This project has been cancelled.", [
      byUid,
      counterpartyId,
    ]);
    void notifyProjectCancelled(
      counterpartyId,
      project.id,
      project.title,
      threadId,
    );
  }
}
