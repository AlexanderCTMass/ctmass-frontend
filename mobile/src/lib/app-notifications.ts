import {
  arrayUnion,
  doc,
  getDoc,
  runTransaction,
  updateDoc,
} from "@react-native-firebase/firestore";

import { getDb } from "@/lib/firebase";

type Raw = Record<string, unknown>;

function isRecord(value: unknown): value is Raw {
  return !!value && typeof value === "object";
}

async function resolveSenderName(uid: string): Promise<string> {
  try {
    const snap = await getDoc(doc(getDb(), "profiles", uid));
    const data: Raw = snap.data() ?? {};
    const business =
      typeof data.businessName === "string" ? data.businessName : "";
    const name = typeof data.name === "string" ? data.name : "";
    return business || name || "a user";
  } catch {
    return "a user";
  }
}

// Mirrors web project-flow.js (sendNotificationToUser) so a project owner is
// notified once when a specialist responds — from either platform.
export async function notifyProjectResponse(
  ownerId: string,
  responderName: string,
  projectId: string,
  projectTitle: string,
  threadId: string,
): Promise<void> {
  if (!ownerId) return;
  try {
    const db = getDb();
    const link = `/cabinet/projects/${projectId}?threadKey=${threadId}`;
    await updateDoc(doc(db, "profiles", ownerId), {
      notificationList: arrayUnion({
        id: `resp:${threadId}`,
        createdAt: Date.now(),
        read: false,
        type: "project_response",
        title: "New response to the project",
        text: `Specialist ${responderName} is ready to help you with the project <a href="${link}">${projectTitle}</a>!`,
        threadId,
        projectId,
        appLink: `/chat?threadId=${threadId}`,
      }),
    });
  } catch (error) {
    console.warn("notifyProjectResponse error", error);
  }
}

// Mirrors web notificationApi.notifyNewMessage: one deduped notification per
// sender (id msg:<senderId>), replaced on each new message. The mirror function
// only pushes when the id is new, so the recipient gets one push per unread burst.
export async function upsertMessageNotification(
  recipientId: string,
  senderId: string,
  threadId: string,
): Promise<void> {
  if (!recipientId || !senderId || recipientId === senderId) return;
  try {
    const db = getDb();
    const name = await resolveSenderName(senderId);
    const ref = doc(db, "profiles", recipientId);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      const data: Raw = snap.data() ?? {};
      const list = Array.isArray(data.notificationList)
        ? data.notificationList
        : [];
      const filtered = list.filter(
        (item) =>
          !(
            isRecord(item) &&
            item.type === "new_message" &&
            item.senderId === senderId
          ),
      );
      filtered.push({
        id: `msg:${senderId}`,
        type: "new_message",
        createdAt: Date.now(),
        read: false,
        title: "New message",
        text: `You have a new message from <a href="#open-messenger">${name}</a>. Click to open the conversation.`,
        senderId,
        threadId,
        appLink: `/chat?threadId=${threadId}`,
      });
      tx.update(ref, { notificationList: filtered });
    });
  } catch (error) {
    console.warn("upsertMessageNotification error", error);
  }
}

export async function clearMessageNotification(
  recipientId: string,
  senderId: string,
): Promise<void> {
  if (!recipientId || !senderId) return;
  try {
    const db = getDb();
    const ref = doc(db, "profiles", recipientId);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      const data: Raw = snap.data() ?? {};
      const list = Array.isArray(data.notificationList)
        ? data.notificationList
        : [];
      const updated = list.filter(
        (item) =>
          !(
            isRecord(item) &&
            item.type === "new_message" &&
            item.senderId === senderId
          ),
      );
      tx.update(ref, { notificationList: updated });
    });
  } catch (error) {
    console.warn("clearMessageNotification error", error);
  }
}
