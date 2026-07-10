import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions/v2";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

const ICON = "/icons/icon-192.png";

const stripHtml = (value = "") => String(value).replace(/<[^>]*>/g, "").trim();

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

const isInvalidToken = (error) => {
  const code = error?.code || "";
  return (
    code.includes("registration-token-not-registered") ||
    code.includes("invalid-argument") ||
    code.includes("invalid-registration-token")
  );
};

// Mirrors newly added, unread in-app notifications (profiles.notificationList)
// to FCM web push. Runs on every profile update but returns fast when nothing new.
export const mirrorNotificationToPush = onDocumentUpdated(
  { document: "profiles/{userId}", timeoutSeconds: 60, memory: "256MiB" },
  async (event) => {
    const before = event.data?.before?.data()?.notificationList || [];
    const afterData = event.data?.after?.data() || {};
    const after = afterData.notificationList || [];

    const beforeIds = new Set(before.map((n) => n?.id));
    const added = after.filter((n) => n && !beforeIds.has(n.id) && !n.read);
    if (added.length === 0) return;

    const tokens = Array.isArray(afterData.fcmTokens) ? afterData.fcmTokens : [];
    if (tokens.length === 0) return;

    const messaging = getMessaging();
    const invalidTokens = new Set();

    for (const n of added) {
      const link = linkForNotification(n);
      const res = await messaging.sendEachForMulticast({
        tokens,
        data: {
          title: String(n.title || "CTMASS"),
          body: stripHtml(n.text),
          link,
          icon: ICON,
        },
        webpush: { headers: { Urgency: "high" } },
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
