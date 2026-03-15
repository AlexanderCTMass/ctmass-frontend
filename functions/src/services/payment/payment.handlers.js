import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { verifyAuthToken } from "../../utils/auth.js";
import { handleCors } from "../../middleware/cors.js";
import { logger } from "../../utils/logger.js";
import { PaymentService } from "./payment.service.js";

// Определяем секреты для разных окружений
const stripeSecret = defineSecret("STRIPE_SECRET_KEY");

export const createStripePaymentIntent = onRequest(
    {
        secrets: [stripeSecret],
        cors: (req, res) => {
            // Динамическая настройка CORS в зависимости от окружения
            const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';

            if (isEmulator) {
                // В эмуляторе разрешаем все
                res.set('Access-Control-Allow-Origin', '*');
                return true;
            } else {
                // В продакшене используем нашу логику
                handleCors(req, res);
                return true;
            }
        },
        // Для эмулятора разрешаем неаутентифицированные запросы
        invoker: process.env.FUNCTIONS_EMULATOR === 'true' ? 'public' : 'private',
    },
    async (req, res) => {
        // Обработка preflight запросов
        if (req.method === "OPTIONS") {
            res.status(204).send("");
            return;
        }

        try {
            // В эмуляторе можно пропустить проверку токена для тестирования
            let userId = 'test-user-id';

            if (process.env.FUNCTIONS_EMULATOR !== 'true') {
                const decodedToken = await verifyAuthToken(req.headers.authorization);
                userId = decodedToken.uid;
                logger.info("Payment intent request", { userId });
            } else {
                logger.info("Emulator: Payment intent request", {
                    userId,
                    headers: req.headers
                });
            }

            const { amount, currency = "usd" } = req.body;

            // Валидация
            if (!amount || amount <= 0) {
                res.status(400).json({ error: "Invalid amount" });
                return;
            }

            const result = await PaymentService.createPaymentIntent(
                amount,
                currency,
                userId,
                stripeSecret.value()
            );

            res.status(200).json(result);

        } catch (error) {
            logger.error("Payment intent failed", error);

            // Разные статусы для разных ошибок
            if (error.code === 'auth/argument-error') {
                res.status(401).json({ error: "Invalid authentication" });
            } else {
                res.status(500).json({
                    error: "Payment processing failed",
                    details: process.env.FUNCTIONS_EMULATOR === 'true'
                        ? error.message
                        : undefined
                });
            }
        }
    }
);