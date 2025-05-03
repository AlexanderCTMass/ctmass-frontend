const { onCall } = require("firebase-functions/v2/https");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { defineSecret } = require("firebase-functions/params");
const stripe = require("stripe");
const functions = require("firebase-functions");

// Определяем секрет (без попытки получить значение)
const stripeSecret = defineSecret("STRIPE_SECRET_KEY");

// Установка глобальных опций
setGlobalOptions({
  region: "us-central1",
  maxInstances: 10,
  secrets: [stripeSecret],
});

// Инициализация приложения
initializeApp();

const db = getFirestore();

/**
 * Создает платежное намерение в Stripe
 */
exports.createStripePaymentIntent = onCall(
  {
    enforceAppCheck: false,
    cors: true,
    secrets: [stripeSecret],
  },
  async (request) => {
    // Инициализируем Stripe только во время выполнения
    const stripeClient = stripe(stripeSecret.value());

    if (!request.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Authentication required",
      );
    }

    const { amount, currency = "usd" } = request.data;

    try {
      const paymentIntent = await stripeClient.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        payment_method_types: ["card", "us_bank_account"],
        metadata: {
          userId: request.auth.uid,
        },
      });

      return { clientSecret: paymentIntent.client_secret };
    } catch (error) {
      console.error("Stripe error:", error);
      throw new functions.https.HttpsError(
        "internal",
        error.message || "Payment processing failed",
      );
    }
  },
);

/**
 * Обновляет ранг донатера
 */
exports.updateDonationRank = onDocumentUpdated(
  {
    document: "profiles/{userId}",
    memory: "512MiB",
  },
  async (event) => {
    try {
      const beforeData = event.data?.before?.data();
      const afterData = event.data?.after?.data();

      if (!beforeData || !afterData) {
        console.log("No document data available");
        return;
      }

      if (beforeData.totalDonations === afterData.totalDonations) {
        return;
      }

      const donationTiers = [
        { amount: 1000, badge: "Platinum Sponsor" },
        { amount: 500, badge: "Gold Supporter" },
        { amount: 100, badge: "Silver Backer" },
        { amount: 50, badge: "Bronze Contributor" },
        { amount: 10, badge: "Supporter" },
      ];

      const newBadge = donationTiers.find(
        (tier) => afterData.totalDonations >= tier.amount,
      )?.badge || "New Donor";

      if (newBadge !== afterData.donationBadge) {
        await db.doc(`profiles/${event.params.userId}`).update({
          donationBadge: newBadge,
          isSupporter: afterData.totalDonations >= 10,
          lastUpdated: FieldValue.serverTimestamp(),
        });
        console.log(`Updated rank for user ${event.params.userId} to ${newBadge}`);
      }
    } catch (error) {
      console.error("Error updating donation rank:", error);
      throw error;
    }
  },
);
