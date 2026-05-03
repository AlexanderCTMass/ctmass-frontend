import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { logger } from "firebase-functions/v2";

const ADMIN_EMAILS = {
  yakov: ["yaffagroup@gmail.com"],
  georgeAlex: ["george.ctmass@gmail.com", "alex.neu.ctmass@gmail.com"],
};

export class AdminRewards {
  static async awardToGroup(group, amount, actionType, referenceId) {
    if (amount <= 0) return;
    const emails = ADMIN_EMAILS[group] || [];
    if (emails.length === 0) return;

    const db = getFirestore();

    for (const email of emails) {
      try {
        const snapshot = await db
          .collection("profiles")
          .where("email", "==", email)
          .limit(1)
          .get();

        if (snapshot.empty) {
          logger.warn(`AdminRewards: profile not found for email ${email}`);
          continue;
        }

        const userId = snapshot.docs[0].id;
        const userRef = db.collection("profiles").doc(userId);
        const txRef = db.collection("loyalty_transactions").doc();
        const idempotencyKey = `${userId}:ADMIN_${actionType}:${referenceId || "noref"}`;

        const existing = await db
          .collection("loyalty_transactions")
          .where("idempotencyKey", "==", idempotencyKey)
          .limit(1)
          .get();

        if (!existing.empty) {
          logger.info(`AdminRewards: duplicate prevented for ${email} on ${actionType}`);
          continue;
        }

        await db.runTransaction(async (transaction) => {
          const userDoc = await transaction.get(userRef);
          const currentBalance = userDoc.exists
            ? userDoc.data().loyaltyBalance || 0
            : 0;

          transaction.set(txRef, {
            userId,
            userRole: "admin",
            actionType: `ADMIN_${actionType}`,
            amount,
            referenceId: referenceId || null,
            idempotencyKey,
            createdAt: FieldValue.serverTimestamp(),
            processed: true,
          });

          transaction.update(userRef, {
            loyaltyBalance: currentBalance + amount,
            loyaltyLastUpdated: FieldValue.serverTimestamp(),
          });
        });

        logger.info(`AdminRewards: awarded ${amount} coins to ${email} for ${actionType}`);
      } catch (error) {
        logger.error(`AdminRewards: error awarding to ${email} for ${actionType}`, error);
      }
    }
  }
}
