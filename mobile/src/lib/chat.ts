import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
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

export type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  createdAt: Date | null;
  isRead: boolean;
};

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
    attachments: [],
    createdAt: serverTimestamp(),
    isRead: false,
  });

  await updateDoc(chatRef, { updatedAt: serverTimestamp() });
}
