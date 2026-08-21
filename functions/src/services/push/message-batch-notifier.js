import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions/v2";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { appendAppNotification } from "./app-notifications.js";

const WINDOW_MINUTES = 5;

// Batches new-message notifications: runs every 5 minutes, aggregates unread
// counts per recipient across their threads, and sends at most one push per run.
// Relies on the denormalized Chat fields: unread.<uid>, lastMessageSenderId,
// updatedAt. profiles.lastMsgBatchAt gates against re-notifying the same pile.
export const messageBatchNotifier = onSchedule(
  {
    schedule: "every 5 minutes",
    timeoutSeconds: 300,
    memory: "256MiB",
  },
  async () => {
    const db = getFirestore();
    const now = Date.now();
    const since = Timestamp.fromMillis(now - (WINDOW_MINUTES + 1) * 60 * 1000);

    const snap = await db
      .collection("Chat")
      .where("updatedAt", ">=", since)
      .get();
    if (snap.empty) return;

    const perRecipient = new Map();

    for (const doc of snap.docs) {
      const chat = doc.data() || {};
      const users = Array.isArray(chat.users) ? chat.users : [];
      const lastSender = chat.lastMessageSenderId;
      const updatedAtMs = chat.updatedAt?.toMillis?.() || 0;
      const unread = chat.unread || {};

      for (const uid of users) {
        if (uid === lastSender) continue;
        const count = typeof unread[uid] === "number" ? unread[uid] : 0;
        if (count <= 0) continue;

        const peerId = users.find((other) => other !== uid) || null;
        const agg = perRecipient.get(uid) || {
          count: 0,
          peers: [],
          maxUpdated: 0,
        };
        agg.count += count;
        agg.peers.push(peerId);
        agg.maxUpdated = Math.max(agg.maxUpdated, updatedAtMs);
        perRecipient.set(uid, agg);
      }
    }

    let sentCount = 0;

    for (const [recipientId, agg] of perRecipient) {
      const profSnap = await db.collection("profiles").doc(recipientId).get();
      if (!profSnap.exists) continue;
      const prof = profSnap.data() || {};
      if ((prof.notificationPrefs || {}).messages === false) continue;

      const lastNotified = prof.lastMsgBatchAt?.toMillis?.() || 0;
      if (agg.maxUpdated <= lastNotified) continue;

      const senderCount = agg.peers.length;
      let text;
      if (senderCount === 1) {
        const peerId = agg.peers[0];
        let peerName = "someone";
        if (peerId) {
          const peerSnap = await db.collection("profiles").doc(peerId).get();
          const peerData = peerSnap.exists ? peerSnap.data() || {} : {};
          peerName = peerData.businessName || peerData.name || "someone";
        }
        text = `You have ${agg.count} new message${
          agg.count === 1 ? "" : "s"
        } from ${peerName}.`;
      } else {
        text = `You have ${agg.count} new messages from ${senderCount} people.`;
      }

      const sent = await appendAppNotification(
        recipientId,
        {
          title: "New messages",
          text,
          type: "new_message",
          appLink: "/chats",
        },
        "messages",
      );

      if (sent) {
        await db
          .collection("profiles")
          .doc(recipientId)
          .update({ lastMsgBatchAt: Timestamp.now() });
        sentCount += 1;
      }
    }

    logger.info(`messageBatchNotifier: sent ${sentCount} batched notification(s)`);
  },
);
