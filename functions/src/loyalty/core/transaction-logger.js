import { getFirestore, FieldValue } from "firebase-admin/firestore";

export class TransactionLogger {
  static async recordTransaction(transactionData) {
    const db = getFirestore();

    const { userId, userRole, actionType, amount, referenceId, metadata } =
      transactionData;

    const idempotencyKey = [userId, actionType, referenceId]
      .filter(Boolean)
      .join(":");

    const txRef = db.collection("loyalty_transactions").doc();
    const userRef = db.collection("profiles").doc(userId);

    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);

      let currentBalance = 0;
      if (userDoc.exists) {
        currentBalance = userDoc.data().loyaltyBalance || 0;
      }

      const newBalance = currentBalance + amount;

      if (newBalance < 0) {
        throw new Error("Insufficient balance");
      }

      transaction.set(txRef, {
        userId,
        userRole,
        actionType,
        amount,
        referenceId: referenceId || null,
        metadata: metadata || null,
        idempotencyKey,
        createdAt: FieldValue.serverTimestamp(),
        processed: true,
      });

      transaction.update(userRef, {
        loyaltyBalance: newBalance,
        loyaltyLastUpdated: FieldValue.serverTimestamp(),
      });
    });

    return txRef.id;
  }

  static async recordDeduction(userId, amount, reason, metadata) {
    const db = getFirestore();

    const txRef = db.collection("loyalty_transactions").doc();
    const userRef = db.collection("profiles").doc(userId);

    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error("User not found");
      }

      const currentBalance = userDoc.data().loyaltyBalance || 0;
      const newBalance = currentBalance - amount;

      if (newBalance < 0) {
        throw new Error("Insufficient balance");
      }

      transaction.set(txRef, {
        userId,
        userRole: userDoc.data().role || null,
        actionType: "DEDUCTION",
        amount: -amount,
        referenceId: null,
        metadata: { reason, ...metadata },
        idempotencyKey: `${userId}:DEDUCTION:${Date.now()}`,
        createdAt: FieldValue.serverTimestamp(),
        processed: true,
      });

      transaction.update(userRef, {
        loyaltyBalance: newBalance,
        loyaltyLastUpdated: FieldValue.serverTimestamp(),
      });
    });

    return true;
  }
}
