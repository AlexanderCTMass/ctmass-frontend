import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions/v2";
import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

const ICON = "/icons/icon-192.png";

// App-only reminder (NOT written to notificationList). Role-based copy + deep link.
const MESSAGES = {
  WORKER: {
    title: "New project requests are in!",
    body: "New project requests just appeared — there may be something for you. Open the app to take a look.",
    link: "/cabinet/projects/find",
    appLink: "/home",
  },
  CUSTOMER: {
    title: "Your specialists are ready",
    body: "Got work to do? Our specialists are ready to take it on. Post your request in the app.",
    link: "/cabinet/projects/create",
    appLink: "/home",
  },
};

const INACTIVE_DAYS = 5;
const COOLDOWN_DAYS = 7;

const isInvalidToken = (error) => {
  const code = error?.code || "";
  return (
    code.includes("registration-token-not-registered") ||
    code.includes("invalid-argument") ||
    code.includes("invalid-registration-token")
  );
};

// Daily at 10:00 America/New_York (Eastern, MA & CT; auto-handles EDT/EST).
export const inactivityReminder = onSchedule(
  {
    schedule: "every day 10:00",
    timeZone: "America/New_York",
    timeoutSeconds: 540,
    memory: "256MiB",
  },
  async () => {
    const db = getFirestore();
    const now = Date.now();
    const inactiveBefore = Timestamp.fromMillis(now - INACTIVE_DAYS * 24 * 60 * 60 * 1000);
    const cooldownMs = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
    const messaging = getMessaging();

    const snap = await db
      .collection("profiles")
      .where("lastSeen", "<=", inactiveBefore)
      .get();

    logger.info(`inactivityReminder: ${snap.size} inactive profile(s) to check`);

    let sent = 0;

    for (const doc of snap.docs) {
      const p = doc.data();
      const msg = MESSAGES[p.role];
      const tokens = Array.isArray(p.fcmTokens) ? p.fcmTokens : [];
      if (!msg || tokens.length === 0) continue;
      if ((p.notificationPrefs || {}).inactivity === false) continue;

      const lastPush = p.lastInactivityPushAt?.toMillis?.() || 0;
      if (now - lastPush < cooldownMs) continue;

      const res = await messaging.sendEachForMulticast({
        tokens,
        data: {
          title: msg.title,
          body: msg.body,
          link: msg.link,
          appLink: msg.appLink,
          icon: ICON,
        },
        webpush: { headers: { Urgency: "high" } },
      });

      const invalidTokens = [];
      res.responses.forEach((r, i) => {
        if (!r.success && isInvalidToken(r.error)) {
          invalidTokens.push(tokens[i]);
        }
      });

      const update = { lastInactivityPushAt: Timestamp.now() };
      if (invalidTokens.length > 0) {
        update.fcmTokens = FieldValue.arrayRemove(...invalidTokens);
      }
      await doc.ref.update(update);
      sent += 1;
    }

    logger.info(`inactivityReminder: sent ${sent} reminder(s)`);
  }
);
