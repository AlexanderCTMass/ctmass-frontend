import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions/v2";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import {
  buildPushMessage,
  isInvalidToken,
  summarizeResponses,
} from "./fcm-payload.js";

const ICON = "/icons/icon-192.png";

const decodeEntities = (value) =>
  value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");

const stripHtml = (value = "") =>
  decodeEntities(String(value).replace(/<[^>]*>/g, "")).trim();

const linkForNotification = (n) => {
  if (!n) return "/";
  if (n.link) return n.link;
  switch (n.type) {
    case "new_message":
      return "/?open=messenger";
    default:
      return "/";
  }
};

const PREF_BY_TYPE = {
  new_message: "messages",
  project_response: "projectResponses",
};

const isMuted = (prefs, type) => {
  const key = PREF_BY_TYPE[type];
  return Boolean(key) && prefs?.[key] === false;
};

// Mirrors newly added, unread in-app notifications (profiles.notificationList)
// to FCM push (web + mobile). Runs on every profile update but returns fast
// when nothing new.
export const mirrorNotificationToPush = onDocumentUpdated(
  { document: "profiles/{userId}", timeoutSeconds: 60, memory: "256MiB" },
  async (event) => {
    const before = event.data?.before?.data()?.notificationList || [];
    const afterData = event.data?.after?.data() || {};
    const after = afterData.notificationList || [];

    const beforeById = new Map(before.map((n) => [n?.id, n]));
    const prefs = afterData.notificationPrefs || {};
    const isNew = (n) => {
      const previous = beforeById.get(n.id);
      if (!previous) return true;
      return (
        n.type === "new_message" &&
        Number(n.createdAt || 0) > Number(previous.createdAt || 0)
      );
    };
    const added = after.filter(
      (n) => n && !n.read && isNew(n) && !isMuted(prefs, n.type)
    );
    if (added.length === 0) return;

    const tokens = Array.isArray(afterData.fcmTokens) ? afterData.fcmTokens : [];
    if (tokens.length === 0) return;

    const messaging = getMessaging();
    const invalidTokens = new Set();

    for (const n of added) {
      const link = linkForNotification(n);
      const res = await messaging.sendEachForMulticast(
        buildPushMessage({
          tokens,
          title: String(n.title || "CTMASS"),
          body: stripHtml(n.text),
          collapseId: n.type === "new_message" ? n.id : null,
          data: {
            link,
            icon: ICON,
            ...(n.type ? { type: String(n.type) } : {}),
            ...(n.appLink ? { appLink: String(n.appLink) } : {}),
            ...(n.threadId ? { threadId: String(n.threadId) } : {}),
            ...(n.projectId ? { projectId: String(n.projectId) } : {}),
          },
        })
      );
      logger.info("mirrorNotificationToPush: sent", {
        type: n.type || null,
        tokens: tokens.length,
        ...summarizeResponses(res),
      });
      res.responses.forEach((r, i) => {
        if (!r.success && isInvalidToken(r.error)) {
          invalidTokens.add(tokens[i]);
        }
      });
    }

    if (invalidTokens.size > 0) {
      await getFirestore()
        .doc(`profiles/${event.params.userId}`)
        .update({ fcmTokens: FieldValue.arrayRemove(...invalidTokens) })
        .catch((e) => logger.warn("mirrorNotificationToPush: token cleanup failed", e));
    }
  }
);
