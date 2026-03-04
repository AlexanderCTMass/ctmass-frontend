import { HttpsError } from "firebase-functions/v2/https";
import stripePackage from "stripe";

// eslint-disable-next-line require-jsdoc
export class PaymentService {
  // eslint-disable-next-line require-jsdoc
  static async createPaymentIntent(amount, currency, userId, stripeSecretKey) {
    try {
      const stripe = stripePackage(stripeSecretKey); // Используем переданный ключ

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        payment_method_types: ["card", "us_bank_account"],
        metadata: { userId },
      });

      return { clientSecret: paymentIntent.client_secret };
    } catch (error) {
      console.error("Stripe error:", error);
      throw new HttpsError("internal", error.message || "Payment processing failed");
    }
  }
}
