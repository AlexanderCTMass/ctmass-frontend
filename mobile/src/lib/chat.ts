import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "@react-native-firebase/firestore";

import { getDb } from "@/lib/firebase";

export type ChatThread = {
  id: string;
  users: string[];
  type: "direct" | "project";
  projectId?: string;
  updatedAt?: Date | null;
  hasMessageMeta?: boolean;
  lastText?: string | null;
  lastIsAttachment?: boolean;
  lastSenderId?: string | null;
  unread?: number;
  clearedAt?: Date | null;
  needsRevivalCheck?: boolean;
};

export type MessageSegment = { text: string; bold: boolean };

export type MessageBody =
  | { kind: "text"; text: string }
  | { kind: "info"; text: string }
  | { kind: "html"; text: string; segments: MessageSegment[] };

const INFO_PREFIX = "%INFO:";
const HTML_PREFIX = "%HTML:";
const BOLD_OPEN = "\uE000";
const BOLD_CLOSE = "\uE001";

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#039;": "'",
  "&#39;": "'",
  "&nbsp;": " ",
};

function decodeEntities(value: string): string {
  return value.replace(
    /&(?:amp|lt|gt|quot|nbsp|#(\d+)|#x([0-9a-f]+));/gi,
    (entity, decimal?: string, hex?: string) => {
      const code = decimal
        ? Number.parseInt(decimal, 10)
        : hex
          ? Number.parseInt(hex, 16)
          : null;
      if (code === null) return HTML_ENTITIES[entity.toLowerCase()] ?? entity;
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : entity;
    },
  );
}

function htmlToSegments(html: string): MessageSegment[] {
  const marked = html
    .replace(/\s+/g, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|div|h[1-6]|li)>/gi, "\n")
    .replace(/<(?:strong|b)(?:\s[^>]*)?>/gi, BOLD_OPEN)
    .replace(/<\/(?:strong|b)>/gi, BOLD_CLOSE)
    .replace(/<[^>]+>/g, "");
  const cleaned = decodeEntities(marked)
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();

  const segments: MessageSegment[] = [];
  let bold = false;
  for (const part of cleaned.split(/([\uE000\uE001])/)) {
    if (part === BOLD_OPEN) bold = true;
    else if (part === BOLD_CLOSE) bold = false;
    else if (part) segments.push({ text: part, bold });
  }
  return segments;
}

export function parseMessageBody(text: string, mine: boolean): MessageBody {
  if (text.startsWith(INFO_PREFIX)) {
    const parts = text.split(INFO_PREFIX).map((part) => part.trim());
    const own = parts[1] ?? "";
    const theirs = parts[2] ?? "";
    return { kind: "info", text: (mine ? own : theirs) || own || theirs };
  }
  if (text.startsWith(HTML_PREFIX)) {
    const segments = htmlToSegments(text.slice(HTML_PREFIX.length));
    return {
      kind: "html",
      segments,
      text: segments.map((segment) => segment.text).join(""),
    };
  }
  return { kind: "text", text };
}

function clearedAtFor(
  data: Record<string, unknown>,
  uid: string,
): { cleared: boolean; at: Date | null } {
  const map = data.deletedAt;
  if (!map || typeof map !== "object" || !(uid in map)) {
    return { cleared: false, at: null };
  }
  return { cleared: true, at: toDate((map as Record<string, unknown>)[uid]) };
}

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

export async function getThread(
  threadId: string,
  uid?: string,
): Promise<ChatThread | null> {
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
    clearedAt: uid ? clearedAtFor(data, uid).at : null,
  };
}

export async function deleteThreadsForUser(
  threadIds: string[],
  uid: string,
): Promise<void> {
  if (threadIds.length === 0) return;
  const db = getDb();
  const batch = writeBatch(db);
  for (const threadId of threadIds) {
    batch.update(doc(db, "Chat", threadId), {
      [`deletedAt.${uid}`]: serverTimestamp(),
      [`unread.${uid}`]: 0,
    });
  }
  await Promise.all([
    batch.commit(),
    ...threadIds.map((threadId) =>
      markThreadRead(threadId, uid).catch((error) => {
        console.warn("deleteThreadsForUser markRead error", error);
      }),
    ),
  ]);
}

export async function hasMessagesAfter(
  threadId: string,
  after: Date,
): Promise<boolean> {
  const db = getDb();
  const q = query(
    collection(db, "Chat", threadId, "messages"),
    where("createdAt", ">", Timestamp.fromDate(after)),
    limit(1),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.length > 0;
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
  const toMark = snapshot.docs.filter(
    (docSnap) => (docSnap.data().senderId as string) !== uid,
  );
  if (toMark.length === 0) return;
  await Promise.all(toMark.map((docSnap) => updateDoc(docSnap.ref, { isRead: true })));
  try {
    await updateDoc(doc(db, "Chat", threadId), { [`unread.${uid}`]: 0 });
  } catch (error) {
    console.warn("markThreadRead meta error", error);
  }
}

export async function getUnreadCount(
  threadId: string,
  uid: string,
  after?: Date | null,
): Promise<number> {
  const db = getDb();
  const q = query(
    collection(db, "Chat", threadId, "messages"),
    where("isRead", "==", false),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.filter((docSnap) => {
    const data = docSnap.data();
    if ((data.senderId as string) === uid) return false;
    if (!after) return true;
    const createdAt = toDate(data.createdAt);
    return !createdAt || createdAt.getTime() > after.getTime();
  }).length;
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
      const visible = snapshot.docs.filter((docSnap) => {
        const { cleared, at } = clearedAtFor(docSnap.data(), userId);
        return !cleared || at !== null;
      });
      const threads: ChatThread[] = visible.map((docSnap) => {
        const data = docSnap.data();
        const clearedAt = clearedAtFor(data, userId).at;
        const updatedAt = toDate(data.updatedAt);
        const needsRevivalCheck =
          clearedAt !== null &&
          data.updatedAt !== null &&
          (updatedAt === null || updatedAt.getTime() <= clearedAt.getTime());
        const unreadMap = data.unread as Record<string, unknown> | undefined;
        const rawUnread =
          unreadMap && typeof unreadMap === "object"
            ? unreadMap[userId]
            : undefined;
        return {
          id: docSnap.id,
          users: (data.users as string[]) ?? [],
          type: data.type === "project" ? "project" : "direct",
          projectId: data.projectId as string | undefined,
          updatedAt,
          clearedAt,
          needsRevivalCheck,
          hasMessageMeta: typeof data.lastMessageText === "string",
          lastText:
            typeof data.lastMessageText === "string"
              ? data.lastMessageText
              : null,
          lastIsAttachment: Boolean(data.lastMessageIsAttachment),
          lastSenderId:
            typeof data.lastMessageSenderId === "string"
              ? data.lastMessageSenderId
              : null,
          unread: typeof rawUnread === "number" ? rawUnread : undefined,
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
): Promise<string> {
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

  const messageRef = await addDoc(
    collection(db, "Chat", threadId, "messages"),
    {
      senderId,
      text,
      attachments,
      createdAt: serverTimestamp(),
      isRead: false,
    },
  );

  const update: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
    lastMessageText: text?.trim() ? text.trim() : "",
    lastMessageIsAttachment: attachments.length > 0,
    lastMessageSenderId: senderId,
  };
  for (const participant of participants) {
    if (participant && participant !== senderId) {
      update[`unread.${participant}`] = increment(1);
    }
  }
  await updateDoc(chatRef, update);
  return messageRef.id;
}
