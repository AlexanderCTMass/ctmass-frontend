import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions/v2";
import { getFirestore } from "firebase-admin/firestore";
import { LoyaltyCore } from "../../core/index.js";
import { ReferralService } from "./referral-service.js";

export const onReferralUserRegistered = onDocumentCreated(
  {
    document: "profiles/{userId}",
    timeoutSeconds: 30,
    memory: "256MiB",
  },
  async (event) => {
    try {
      const profile = event.data.data();
      const userId = event.params.userId;
      const referralCode = profile.referredBy;

      if (!referralCode) return;

      const db = getFirestore();
      const referrerSnapshot = await db
        .collection("profiles")
        .where("referralCode", "==", referralCode)
        .limit(1)
        .get();

      if (referrerSnapshot.empty) return;

      const referrerId = referrerSnapshot.docs[0].id;
      const userRole = profile.role || "CUSTOMER";

      if (userRole === "CUSTOMER") {
        await ReferralService.createReferral(
          referrerId,
          userId,
          "CUSTOMER",
          "HOMEOWNER_POSTS_PROJECT",
        );
      } else if (userRole === "WORKER") {
        await ReferralService.createReferral(
          referrerId,
          userId,
          "WORKER",
          "CONTRACTOR_COMPLETES_JOB",
        );
      }
    } catch (error) {
      logger.error("Loyalty: error processing referral registration", error);
    }
  },
);

export const onJobCompletedReferral = onDocumentUpdated(
  {
    document: "projects/{projectId}",
    timeoutSeconds: 30,
    memory: "256MiB",
  },
  async (event) => {
    try {
      const before = event.data.before.data();
      const after = event.data.after.data();

      const wasCompleted = before.state === "COMPLETED";
      const isNowCompleted = after.state === "COMPLETED";

      if (wasCompleted || !isNowCompleted) return;

      const contractorId = after.contractorId || after.specialistId;
      if (!contractorId) return;

      const referral = await ReferralService.getPendingReferral(
        contractorId,
        "CONTRACTOR_COMPLETES_JOB",
      );

      if (!referral) return;

      const db = getFirestore();
      const referrerDoc = await db
        .collection("profiles")
        .doc(referral.referrerId)
        .get();
      const referrerRole = referrerDoc.exists
        ? referrerDoc.data().role || "CUSTOMER"
        : "CUSTOMER";

      await LoyaltyCore.awardCoins(
        referral.referrerId,
        referrerRole,
        "INVITE_CONTRACTOR_COMPLETES_JOB",
        event.params.projectId,
      );

      await ReferralService.markReferralCompleted(referral.id);

      const homeownerId = after.userId;
      if (!homeownerId) return;

      const neighborReferral = await ReferralService.getPendingReferral(
        homeownerId,
        "NEIGHBOR_HIRES_CONTRACTOR",
      );

      if (!neighborReferral) return;

      const neighborReferrerDoc = await db
        .collection("profiles")
        .doc(neighborReferral.referrerId)
        .get();
      const neighborReferrerRole = neighborReferrerDoc.exists
        ? neighborReferrerDoc.data().role || "CUSTOMER"
        : "CUSTOMER";

      await LoyaltyCore.awardCoins(
        neighborReferral.referrerId,
        neighborReferrerRole,
        "HOMEOWNER_REFERS_NEIGHBOR_HIRES",
        event.params.projectId,
      );

      await ReferralService.markReferralCompleted(neighborReferral.id);
    } catch (error) {
      logger.error("Loyalty: error in onJobCompletedReferral", error);
    }
  },
);
