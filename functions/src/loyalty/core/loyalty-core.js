import { getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions/v2";
import { LoyaltyConfig } from "./loyalty-config.js";
import { IdempotencyGuard } from "./idempotency-guard.js";
import { TransactionLogger } from "./transaction-logger.js";

export class LoyaltyCore {
  static async awardCoins(userId, userRole, actionType, referenceId, metadata) {
    const actionConfig = await LoyaltyConfig.getActionConfig(actionType, userRole);

    if (!actionConfig) {
      logger.warn("Loyalty action not found, disabled, or not available for role", {
        actionType,
        userRole,
      });
      return 0;
    }

    if (referenceId) {
      const isDuplicate = await IdempotencyGuard.isDuplicate(
        userId,
        actionType,
        referenceId,
      );
      if (isDuplicate) {
        logger.info("Loyalty duplicate prevented", { userId, actionType, referenceId });
        return 0;
      }
    }

    const maxReached = await IdempotencyGuard.checkMaxPerUser(
      userId,
      actionType,
      actionConfig.maxPerUser,
    );
    if (maxReached) {
      logger.info("Loyalty max per user reached", { userId, actionType });
      return 0;
    }

    const onCooldown = await IdempotencyGuard.checkCooldown(
      userId,
      actionType,
      actionConfig.cooldownDays,
    );
    if (onCooldown) {
      logger.info("Loyalty cooldown active", { userId, actionType });
      return 0;
    }

    const coinsToAward = actionConfig.coinsAwarded;

    if (!coinsToAward || coinsToAward <= 0) {
      logger.info("Loyalty: zero coins configured for role, skipping", {
        userId,
        actionType,
        userRole,
      });
      return 0;
    }

    const txId = await TransactionLogger.recordTransaction({
      userId,
      userRole,
      actionType,
      amount: coinsToAward,
      referenceId,
      metadata,
    });

    logger.info("Loyalty coins awarded", {
      txId,
      userId,
      actionType,
      userRole,
      amount: coinsToAward,
    });

    return coinsToAward;
  }

  static async deductCoins(userId, amount, reason, metadata) {
    if (amount <= 0) {
      throw new Error("Deduction amount must be positive");
    }

    const balance = await LoyaltyCore.getBalance(userId);
    if (balance < amount) {
      return false;
    }

    await TransactionLogger.recordDeduction(userId, amount, reason, metadata);

    logger.info("Loyalty coins deducted", { userId, amount, reason });
    return true;
  }

  static async getTransactionHistory(userId, limit = 20, startAfter) {
    const db = getFirestore();

    let query = db
      .collection("loyalty_transactions")
      .where("userId", "==", userId)
      .where("processed", "==", true)
      .orderBy("createdAt", "desc")
      .limit(limit);

    if (startAfter) {
      const startDoc = await db
        .collection("loyalty_transactions")
        .doc(startAfter)
        .get();
      if (startDoc.exists) {
        query = query.startAfter(startDoc);
      }
    }

    const snapshot = await query.get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    }));
  }

  static async getBalance(userId) {
    const db = getFirestore();
    const userDoc = await db.collection("profiles").doc(userId).get();

    if (!userDoc.exists) {
      return 0;
    }

    return userDoc.data().loyaltyBalance || 0;
  }
}
