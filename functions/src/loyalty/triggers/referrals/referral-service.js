import { getFirestore, FieldValue } from "firebase-admin/firestore";

export class ReferralService {
  static generateReferralCode(userId) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${userId.slice(0, 4).toUpperCase()}-${code}`;
  }

  static async getOrCreateReferralCode(userId) {
    const db = getFirestore();
    const profileRef = db.collection("profiles").doc(userId);
    const profile = await profileRef.get();

    if (!profile.exists) return null;

    const existingCode = profile.data().referralCode;
    if (existingCode) return existingCode;

    const code = ReferralService.generateReferralCode(userId);
    await profileRef.update({ referralCode: code });
    return code;
  }

  static async createReferral(referrerId, refereeId, refereeRole, targetActionType) {
    const db = getFirestore();

    const existing = await db
      .collection("referrals")
      .where("referrerId", "==", referrerId)
      .where("refereeId", "==", refereeId)
      .where("targetActionType", "==", targetActionType)
      .limit(1)
      .get();

    if (!existing.empty) return existing.docs[0].id;

    const ref = await db.collection("referrals").add({
      referrerId,
      refereeId,
      refereeRole,
      status: "pending",
      targetActionType,
      createdAt: FieldValue.serverTimestamp(),
      completedAt: null,
      coinsAwarded: false,
    });

    return ref.id;
  }

  static async getPendingReferral(refereeId, targetActionType) {
    const db = getFirestore();

    const snapshot = await db
      .collection("referrals")
      .where("refereeId", "==", refereeId)
      .where("status", "==", "pending")
      .where("targetActionType", "==", targetActionType)
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    };
  }

  static async markReferralCompleted(referralId) {
    const db = getFirestore();

    await db.collection("referrals").doc(referralId).update({
      status: "completed",
      completedAt: FieldValue.serverTimestamp(),
      coinsAwarded: true,
    });
  }

  static async getReferralsByReferrer(referrerId, limit = 20) {
    const db = getFirestore();

    const snapshot = await db
      .collection("referrals")
      .where("referrerId", "==", referrerId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      completedAt: doc.data().completedAt?.toDate?.()?.toISOString() || null,
    }));
  }
}
