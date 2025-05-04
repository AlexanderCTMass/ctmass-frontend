import { HttpsError } from 'firebase-functions/v2/https'
import stripePackage from 'stripe'
import { defineSecret } from 'firebase-functions/params'

const stripeSecret = defineSecret('STRIPE_SECRET_KEY')

export class PaymentService {
    static async createPaymentIntent(amount, currency, userId) {
        try {
            const stripe = stripePackage(stripeSecret.value())

            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency,
                payment_method_types: ['card', 'us_bank_account'],
                metadata: { userId }
            })

            return { clientSecret: paymentIntent.client_secret }
        } catch (error) {
            console.error('Stripe error:', error)
            throw new HttpsError('internal', error.message || 'Payment processing failed')
        }
    }
}