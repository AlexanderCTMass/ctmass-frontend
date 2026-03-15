import { initializeApp } from "firebase-admin/app";

// Инициализация Firebase Admin
initializeApp();

// Экспорт всех функций
export { sendSMS, processSMSQueue, getBrevoCredits } from "./src/services/sms/sms.handlers.js";
export { generateAiAvatars } from "./src/services/ai/ai.handlers.js";
export { createStripePaymentIntent } from "./src/services/payment/payment.handlers.js";