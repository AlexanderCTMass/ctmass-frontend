import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions/v2";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

export const autoApproveTrades = onSchedule(
  {
    schedule: "every 5 minutes",
    timeoutSeconds: 60,
    memory: "256MiB",
  },
  async () => {
    const db = getFirestore();
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    try {
      const snapshot = await db
        .collection("trades")
        .where("status", "==", "on_review")
        .where("createdAt", "<=", Timestamp.fromDate(tenMinutesAgo))
        .get();

      if (snapshot.empty) {
        logger.info("autoApproveTrades: no trades to approve");
        return;
      }

      const batch = db.batch();

      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          status: "not_active",
          approvedAt: Timestamp.now(),
        });
      });

      await batch.commit();

      logger.info(`autoApproveTrades: approved ${snapshot.size} trade(s)`);
    } catch (error) {
      logger.error("autoApproveTrades: error during auto-approve", error);
    }
  }
);
