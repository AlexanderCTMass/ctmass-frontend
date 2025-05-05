import {HttpsError, onCall} from 'firebase-functions/v2/https'
import {PaymentService} from './src/services/payment/payment.service.js'

export const createStripePaymentIntent = onCall(
    {region: "us-central1", enforceAppCheck: false, cors: true},
    async (request) => {
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'Authentication required')
        }

        const {amount, currency = 'usd'} = request.data
        return PaymentService.createPaymentIntent(amount, currency, request.auth.uid)
    }
)
