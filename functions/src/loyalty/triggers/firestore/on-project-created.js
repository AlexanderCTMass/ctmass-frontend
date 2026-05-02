import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions/v2";
import { getFirestore } from "firebase-admin/firestore";
import { LoyaltyCore } from "../../core/index.js";
import { AdminRewards } from "../../core/admin-rewards.js";

export const onProjectCreatedLoyalty = onDocumentCreated(
  {
    document: "projects/{projectId}",
    timeoutSeconds: 30,
    memory: "256MiB",
  },
  async (event) => {
    try {
      const project = event.data.data();
      const projectId = event.params.projectId;
      const homeownerId = project.userId;

      if (!homeownerId) {
        logger.warn("Loyalty: project has no userId", { projectId });
        return;
      }

      const db = getFirestore();
      const profileDoc = await db.collection("profiles").doc(homeownerId).get();
      const userRole = profileDoc.exists
        ? profileDoc.data().role || "CUSTOMER"
        : "CUSTOMER";

      const hasPhotos =
        Array.isArray(project.attachments) && project.attachments.length > 0;

      const actionType = hasPhotos
        ? "POST_PROJECT_WITH_PHOTOS"
        : "POST_PROJECT";

      await LoyaltyCore.awardCoins(homeownerId, userRole, actionType, projectId, { hasPhotos });

      const adminCoins = hasPhotos ? 8 : 5;
      await AdminRewards.awardToGroup("georgeAlex", adminCoins, actionType, projectId);

      await checkReferralForProject(homeownerId, projectId);
    } catch (error) {
      logger.error("Loyalty: error in onProjectCreated", error);
    }
  },
);

async function checkReferralForProject(homeownerId, projectId) {
  try {
    const db = getFirestore();
    const snapshot = await db
      .collection("referrals")
      .where("refereeId", "==", homeownerId)
      .where("status", "==", "pending")
      .where("targetActionType", "==", "HOMEOWNER_POSTS_PROJECT")
      .limit(1)
      .get();

    if (snapshot.empty) return;

    const referral = snapshot.docs[0];
    const referralData = referral.data();

    const referrerDoc = await db
      .collection("profiles")
      .doc(referralData.referrerId)
      .get();
    const referrerRole = referrerDoc.exists
      ? referrerDoc.data().role || "CUSTOMER"
      : "CUSTOMER";

    const actionType =
      referrerRole === "WORKER"
        ? "CONTRACTOR_INVITES_HOMEOWNER_POSTS"
        : "INVITE_HOMEOWNER_POSTS_PROJECT";

    await LoyaltyCore.awardCoins(
      referralData.referrerId,
      referrerRole,
      actionType,
      projectId,
    );

    if (actionType === "CONTRACTOR_INVITES_HOMEOWNER_POSTS") {
      await AdminRewards.awardToGroup("georgeAlex", 10, actionType, projectId);
    }

    await referral.ref.update({
      status: "completed",
      completedAt: new Date().toISOString(),
      coinsAwarded: true,
    });
  } catch (error) {
    logger.error("Loyalty: error checking referral for project", error);
  }
}
