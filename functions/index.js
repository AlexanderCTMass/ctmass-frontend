import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { defineSecret } from 'firebase-functions/params'; // Добавьте этот импорт
import { PaymentService } from "./src/services/payment/payment.service.js";

// Объявите секрет на верхнем уровне
const stripeSecret = defineSecret('STRIPE_SECRET_KEY');

initializeApp();

export const createStripePaymentIntent = onRequest(
    {
        secrets: [stripeSecret], // Явно указываем зависимость от секрета
        cors: true
    },
    async (req, res) => {
        // CORS headers
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        // Handle OPTIONS
        if (req.method === 'OPTIONS') {
            return res.status(204).send('');
        }

        try {
            // Проверка токена
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const idToken = authHeader.split('Bearer ')[1];
            const decodedToken = await getAuth().verifyIdToken(idToken);
            console.log('Decoded UID:', decodedToken.uid);

            // Основная логика
            const { amount, currency = 'usd' } = req.body;
            const result = await PaymentService.createPaymentIntent(
                amount,
                currency,
                decodedToken.uid,
                stripeSecret.value() // Передаем значение секрета
            );

            res.status(200).json(result);
        } catch (error) {
            console.error('Error:', error);
            res.status(401).json({
                error: 'Authentication failed',
                details: error.message
            });
        }
    }
);