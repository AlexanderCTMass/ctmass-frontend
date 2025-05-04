import { onCall } from 'firebase-functions/v2/https'
import { PaymentService } from './src/services/payment/payment.service.js'
import { updateDonationRank } from './src/triggers/donations/donation.triggers.js'
import { HttpsError } from 'firebase-functions/v2/https'

export const createStripePaymentIntent = onCall(
    { enforceAppCheck: false, cors: true },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'Authentication required')
        }

        const { amount, currency = 'usd' } = request.data
        return PaymentService.createPaymentIntent(amount, currency, request.auth.uid)
    }
)

export { updateDonationRank }