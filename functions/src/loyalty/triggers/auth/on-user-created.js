import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions/v2";
import { LoyaltyCore } from "../../core/index.js";
import { AdminRewards } from "../../core/admin-rewards.js";

export const onProfileCreatedLoyalty = onDocumentCreated(
  {
    document: "profiles/{userId}",
    timeoutSeconds: 30,
    memory: "256MiB",
  },
  async (event) => {
    try {
      const profile = event.data.data();
      const userId = event.params.userId;
      const userRole = profile.role || "CUSTOMER";

      await LoyaltyCore.awardCoins(userId, userRole, "REGISTER", userId);

      await AdminRewards.awardToGroup("yakov", 10, "REGISTER", userId);
    } catch (error) {
      logger.error("Loyalty: error awarding REGISTER coins", error);
    }
  },
);
