import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions/v2";
import { LoyaltyCore } from "../../core/index.js";
import { AdminRewards } from "../../core/admin-rewards.js";

const REQUIRED_FIELDS = ["name", "email", "phone", "avatar"];

function isProfileComplete(data) {
  return REQUIRED_FIELDS.every((field) => {
    const value = data[field];
    return value !== null && value !== undefined && value !== "";
  });
}

export const onProfileUpdatedLoyalty = onDocumentUpdated(
  {
    document: "profiles/{userId}",
    timeoutSeconds: 30,
    memory: "256MiB",
  },
  async (event) => {
    try {
      const before = event.data.before.data();
      const after = event.data.after.data();
      const userId = event.params.userId;

      const wasBefore = isProfileComplete(before);
      const isNow = isProfileComplete(after);

      if (!wasBefore && isNow) {
        const userRole = after.role || "CUSTOMER";

        await LoyaltyCore.awardCoins(userId, userRole, "COMPLETE_PROFILE", userId);

        await AdminRewards.awardToGroup("georgeAlex", 5, "COMPLETE_PROFILE", userId);
      }
    } catch (error) {
      logger.error("Loyalty: error awarding COMPLETE_PROFILE coins", error);
    }
  },
);
