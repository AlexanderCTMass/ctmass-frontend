import { getFirestore } from "firebase-admin/firestore";

export class IdempotencyGuard {
  static generateKey(userId, actionType, referenceId) {
    const parts = [userId, actionType];
    if (referenceId) {
      parts.push(referenceId);
    }
    return parts.join(":");
  }

  static async isDuplicate(userId, actionType, referenceId) {
    const db = getFirestore();
    const key = IdempotencyGuard.generateKey(userId, actionType, referenceId);

    const snapshot = await db
      .collection("loyalty_transactions")
      .where("idempotencyKey", "==", key)
      .where("processed", "==", true)
      .limit(1)
      .get();

    return !snapshot.empty;
  }

  static async checkMaxPerUser(userId, actionType, maxPerUser) {
    if (maxPerUser === null || maxPerUser === undefined) {
      return false;
    }

    const db = getFirestore();
    const snapshot = await db
      .collection("loyalty_transactions")
      .where("userId", "==", userId)
      .where("actionType", "==", actionType)
      .where("processed", "==", true)
      .where("amount", ">", 0)
      .get();

    return snapshot.size >= maxPerUser;
  }

  static async checkCooldown(userId, actionType, cooldownDays) {
    if (cooldownDays === null || cooldownDays === undefined) {
      return false;
    }

    const db = getFirestore();
    const cooldownDate = new Date();
    cooldownDate.setDate(cooldownDate.getDate() - cooldownDays);

    const snapshot = await db
      .collection("loyalty_transactions")
      .where("userId", "==", userId)
      .where("actionType", "==", actionType)
      .where("processed", "==", true)
      .where("amount", ">", 0)
      .where("createdAt", ">=", cooldownDate)
      .limit(1)
      .get();

    return !snapshot.empty;
  }
}
