import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "@react-native-firebase/firestore";

import { getDb } from "@/lib/firebase";

export type ChatThread = {
  id: string;
  users: string[];
  type: "direct" | "project";
  projectId?: string;
  updatedAt?: Date | null;
};

export type ChatAttachment = {
  url: string;
  type: string;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  attachments: ChatAttachment[];
  createdAt: Date | null;
  isRead: boolean;
};

function toAttachments(value: unknown): ChatAttachment[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const url = typeof record.url === "string" ? record.url : "";
      if (!url) return null;
      const type = typeof record.type === "string" ? record.type : "image";
      return { url, type };
    })
    .filter((item): item is ChatAttachment => item !== null);
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

export async function getThread(threadId: string): Promise<ChatThread | null> {
  const db = getDb();
  const snapshot = await getDoc(doc(db, "Chat", threadId));
  if (!snapshot.exists()) return null;
  const data = snapshot.data() ?? {};
  return {
    id: snapshot.id,
    users: (data.users as string[]) ?? [],
    type: data.type === "project" ? "project" : "direct",
    projectId: data.projectId as string | undefined,
    updatedAt: toDate(data.updatedAt),
  };
}

export async function getLastMessage(
  threadId: string,
): Promise<ChatMessage | null> {
  const db = getDb();
  const q = query(
    collection(db, "Chat", threadId, "messages"),
    orderBy("createdAt", "desc"),
    limit(1),
  );
  const snapshot = await getDocs(q);
  const docSnap = snapshot.docs[0];
  if (!docSnap) return null;
  const data = docSnap.data();
  return {
    id: docSnap.id,
    senderId: (data.senderId as string) ?? "",
    text: (data.text as string) ?? "",
    attachments: toAttachments(data.attachments),
    createdAt: toDate(data.createdAt),
    isRead: Boolean(data.isRead),
  };
}

export async function markThreadRead(
  threadId: string,
  uid: string,
): Promise<void> {
  const db = getDb();
  const q = query(
    collection(db, "Chat", threadId, "messages"),
    where("isRead", "==", false),
  );
  const snapshot = await getDocs(q);
  await Promise.all(
    snapshot.docs
      .filter((docSnap) => (docSnap.data().senderId as string) !== uid)
      .map((docSnap) => updateDoc(docSnap.ref, { isRead: true })),
  );
}

export async function startChat(
  userId1: string,
  userId2: string,
  projectId?: string,
): Promise<string> {
  const db = getDb();
  const chatRef = collection(db, "Chat");

  const usersCond = where("users", "in", [
    [userId1, userId2],
    [userId2, userId1],
  ]);

  const q = projectId
    ? query(chatRef, usersCond, where("projectId", "==", projectId))
    : query(chatRef, usersCond, where("type", "==", "direct"));

  const snap = await getDocs(q);
  const existing = snap.docs[0];
  if (existing) return existing.id;

  const created = await addDoc(chatRef, {
    users: [userId1, userId2],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    type: projectId ? "project" : "direct",
    ...(projectId ? { projectId } : {}),
  });
  return created.id;
}

export function subscribeThreads(
  userId: string,
  onChange: (threads: ChatThread[]) => void,
): () => void {
  const db = getDb();
  const q = query(
    collection(db, "Chat"),
    where("users", "array-contains", userId),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      if (!snapshot) return;
      const threads: ChatThread[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          users: (data.users as string[]) ?? [],
          type: data.type === "project" ? "project" : "direct",
          projectId: data.projectId as string | undefined,
          updatedAt: toDate(data.updatedAt),
        };
      });
      threads.sort(
        (a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0),
      );
      onChange(threads);
    },
    (error) => {
      console.warn("subscribeThreads error", error);
    },
  );
}

export function subscribeMessages(
  threadId: string,
  onChange: (messages: ChatMessage[]) => void,
): () => void {
  const db = getDb();
  const q = query(
    collection(db, "Chat", threadId, "messages"),
    orderBy("createdAt", "asc"),
  );

  return onSnapshot(q, (snapshot) => {
    const messages: ChatMessage[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        senderId: (data.senderId as string) ?? "",
        text: (data.text as string) ?? "",
        attachments: toAttachments(data.attachments),
        createdAt: toDate(data.createdAt),
        isRead: Boolean(data.isRead),
      };
    });
    onChange(messages);
  });
}

export async function sendMessage(
  threadId: string,
  senderId: string,
  text: string,
  participants: string[],
  attachments: ChatAttachment[] = [],
): Promise<void> {
  const db = getDb();
  const chatRef = doc(db, "Chat", threadId);
  const chatDoc = await getDoc(chatRef);

  if (!chatDoc.exists()) {
    await setDoc(chatRef, {
      users: participants,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      type: "direct",
    });
  }

  await addDoc(collection(db, "Chat", threadId, "messages"), {
    senderId,
    text,
    attachments,
    createdAt: serverTimestamp(),
    isRead: false,
  });

  await updateDoc(chatRef, { updatedAt: serverTimestamp() });
}
