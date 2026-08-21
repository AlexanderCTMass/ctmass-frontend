import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { logger } from "firebase-functions/v2";
import { randomUUID } from "node:crypto";

// Appends an in-app notification to profiles/{userId}.notificationList.
// mirrorNotificationToPush (onDocumentUpdated profiles/{userId}) then delivers it
// to FCM for every stored token (web + mobile). Respects
// profiles.notificationPrefs[prefKey] when a prefKey is provided.
export async function appendAppNotification(userId, notification, prefKey) {
  if (!userId) return false;
  try {
    const db = getFirestore();
    const ref = db.collection("profiles").doc(userId);
    const snap = await ref.get();
    if (!snap.exists) return false;

    const data = snap.data() || {};
    if (prefKey) {
      const prefs = data.notificationPrefs || {};
      if (prefs[prefKey] === false) return false;
    }

    const entry = {
      id: randomUUID(),
      createdAt: Date.now(),
      read: false,
      ...notification,
    };

    await ref.update({ notificationList: FieldValue.arrayUnion(entry) });
    return true;
  } catch (error) {
    logger.warn("appendAppNotification failed", {
      userId,
      error: error.message,
    });
    return false;
  }
}
