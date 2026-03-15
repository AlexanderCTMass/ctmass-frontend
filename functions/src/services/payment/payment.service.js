import { HttpsError } from "firebase-functions/v2/https";
import Stripe from "stripe";

export class PaymentService {
  static async createPaymentIntent(amount, currency, userId, stripeSecretKey) {
    try {
      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2023-10-16', // Укажите актуальную версию
        typescript: true,
      });

      // Валидация
      if (amount <= 0) {
        throw new Error("Amount must be greater than 0");
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        payment_method_types: ["card", "us_bank_account"],
        metadata: {
          userId,
          environment: process.env.FUNCTIONS_EMULATOR === 'true' ? 'emulator' : 'production'
        },
        // Для тестирования в эмуляторе
        ...(process.env.FUNCTIONS_EMULATOR === 'true' && {
          // Используем тестовые ключи Stripe
        }),
      });

      return {
        clientSecret: paymentIntent.client_secret,
        // Добавляем доп. информацию для отладки
        ...(process.env.FUNCTIONS_EMULATOR === 'true' && {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount
        })
      };
    } catch (error) {
      console.error("Stripe error:", error);

      // Более детальная обработка ошибок Stripe
      if (error.type === 'StripeCardError') {
        throw new HttpsError('failed-precondition', error.message);
      } else if (error.type === 'StripeInvalidRequestError') {
        throw new HttpsError('invalid-argument', error.message);
      } else {
        throw new HttpsError('internal', "Payment processing failed");
      }
    }
  }
}