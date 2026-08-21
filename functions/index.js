import { initializeApp } from "firebase-admin/app";

// Инициализация Firebase Admin
initializeApp();

// Экспорт всех функций
export { sendSMS, processSMSQueue, getBrevoCredits } from "./src/services/sms/sms.handlers.js";
export { generateAiAvatars } from "./src/services/ai/ai.handlers.js";
export { createStripePaymentIntent } from "./src/services/payment/payment.handlers.js";

export {
  onProfileCreatedLoyalty,
  onProfileUpdatedLoyalty,
  onProjectCreatedLoyalty,
  onPortfolioAddedLoyalty,
  onReferralUserRegistered,
  onJobCompletedReferral,
  awardBugReportCoins,
} from "./src/loyalty/triggers/index.js";

export { autoApproveTrades } from "./src/services/trades/auto-approve.js";

export { deleteUserAccount } from "./src/services/admin/delete-user.js";

export { mirrorNotificationToPush } from "./src/services/push/mirror-notifications.js";

export { inactivityReminder } from "./src/services/push/inactivity-reminder.js";

export { onProjectCreatedNotify } from "./src/services/push/on-project-created-notify.js";

export { onFriendInviteCreated } from "./src/services/push/on-friend-invite.js";