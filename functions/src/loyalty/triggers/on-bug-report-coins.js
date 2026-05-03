import { onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";
import { getFirestore } from "firebase-admin/firestore";
import { LoyaltyCore } from "../core/index.js";
import { AdminRewards } from "../core/admin-rewards.js";

export const awardBugReportCoins = onCall(
  {
    timeoutSeconds: 30,
    memory: "256MiB",
  },
  async (request) => {
    if (!request.auth) {
      throw new Error("Unauthenticated");
    }

    const userId = request.auth.uid;
    const { bugReportId } = request.data || {};
    const referenceId = bugReportId || `bug_${Date.now()}`;

    try {
      const db = getFirestore();
      const profileDoc = await db.collection("profiles").doc(userId).get();
      const userRole = profileDoc.exists
        ? profileDoc.data().role || "CUSTOMER"
        : "CUSTOMER";

      await LoyaltyCore.awardCoins(
        userId,
        userRole,
        "BUG_REPORT",
        referenceId,
      );

      await AdminRewards.awardToGroup("georgeAlex", 3, "BUG_REPORT", referenceId);

      logger.info("BugReport coins awarded", { userId, referenceId });
      return { success: true };
    } catch (error) {
      logger.error("Error awarding bug report coins", error);
      throw error;
    }
  },
);
