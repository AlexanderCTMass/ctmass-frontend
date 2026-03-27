import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions/v2";
import { LoyaltyCore } from "../../core/index.js";

export const onPortfolioAddedLoyalty = onDocumentCreated(
  {
    document: "profiles/{userId}/portfolio/{portfolioId}",
    timeoutSeconds: 30,
    memory: "256MiB",
  },
  async (event) => {
    try {
      const userId = event.params.userId;
      const portfolioId = event.params.portfolioId;

      await LoyaltyCore.awardCoins(
        userId,
        "WORKER",
        "ADD_PORTFOLIO",
        portfolioId,
      );
    } catch (error) {
      logger.error("Loyalty: error awarding ADD_PORTFOLIO coins", error);
    }
  },
);
