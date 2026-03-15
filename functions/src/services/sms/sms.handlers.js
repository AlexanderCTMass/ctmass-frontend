import {onRequest} from "firebase-functions/v2/https";
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {secrets} from "../../config/secrets.js";
import {verifyAuthToken, checkAdminAccess} from "../../utils/auth.js";
import {validateSMSRequest} from "../../utils/validators.js";
import {logSMSEvent} from "../../utils/firestore.js";
import {handleCors} from "../../middleware/cors.js";
import {logger} from "../../utils/logger.js";
import {BrevoSMSService} from "./brevo.service.js";

// HTTP функция для отправки SMS
export const sendSMS = onRequest(
    {
        secrets: [secrets.brevo],
        cors: true,
        timeoutSeconds: 30,
        memory: "256MiB",
    },
    async (req, res) => {
        if (handleCors(req, res)) return;

        try {
            // Только POST
            if (req.method !== "POST") {
                return res.status(405).json({error: "Method not allowed"});
            }

            // Проверка аутентификации
            const decodedToken = await verifyAuthToken(req.headers.authorization);
            logger.info("SMS request received", {userId: decodedToken.uid});

            // Валидация данных
            const validatedData = validateSMSRequest(req.body);

            // Инициализация сервиса
            const smsService = new BrevoSMSService(secrets.brevo.value());

            // Отправка SMS
            const result = await smsService.sendSMS({
                ...validatedData,
                tag: 'invitation'
            });

            // Логирование успеха
            await logSMSEvent("smsLogs", {
                ...validatedData,
                userId: decodedToken.uid,
                status: "sent",
                ...result
            });

            logger.info("SMS sent successfully", {
                userId: decodedToken.uid,
                messageId: result.messageId
            });

            res.status(200).json({
                success: true,
                ...result
            });

        } catch (error) {
            logger.error("SMS sending failed", error, {
                userId: req.body?.userId
            });

            // Логирование ошибки
            await logSMSEvent("smsLogs", {
                to: req.body?.to,
                message: req.body?.message,
                userId: req.body?.userId || "unknown",
                status: "failed",
                error: error.message
            });

            // Определение статус кода
            const statusCode = error.message.includes("Unauthorized") ? 401 :
                error.message.includes("Invalid request") ? 400 :
                    error.message.includes("credits") ? 402 : 500;

            res.status(statusCode).json({
                error: "Failed to send SMS",
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
);

// Firestore триггер для обработки очереди
export const processSMSQueue = onDocumentCreated(
    {
        document: "smsQueue/{smsId}",
        secrets: [secrets.brevo],
        timeoutSeconds: 60,
        memory: "256MiB",
    },
    async (event) => {
        const sms = event.data.data();
        const smsId = event.params.smsId;

        logger.info("Processing SMS from queue", {smsId, to: sms.to});

        if (sms.status !== "pending") {
            logger.info(`SMS ${smsId} already processed`, {status: sms.status});
            return;
        }

        try {
            // Обновляем статус
            await event.data.ref.update({
                status: "processing",
                processingStartedAt: new Date().toISOString(),
            });

            // Валидация номера
            validateSMSRequest({to: sms.to, message: sms.message});

            // Инициализация сервиса
            const smsService = new BrevoSMSService(secrets.brevo.value());

            // Отправка SMS
            const result = await smsService.sendSMS({
                to: sms.to,
                message: sms.message,
                sender: sms.sender || "CTMASS",
                tag: sms.metadata?.type || 'general'
            });

            // Фильтруем undefined значения из result
            const cleanResult = Object.fromEntries(
                Object.entries(result).filter(([_, value]) => value !== undefined)
            );

            // Обновление статуса в очереди
            await event.data.ref.update({
                status: "sent",
                sentAt: new Date().toISOString(),
                ...cleanResult
            });

            // Логирование
            await logSMSEvent("smsLogs", {
                smsId,
                to: sms.to,
                message: sms.message,
                metadata: sms.metadata || {},
                userId: sms.userId || "system",
                status: "sent",
                ...cleanResult
            });

            logger.info("SMS from queue sent", {smsId, messageId: result.messageId});

        } catch (error) {
            logger.error("Queue SMS failed", error, {smsId});

            await event.data.ref.update({
                status: "failed",
                failedAt: new Date().toISOString(),
                error: error.message,
            });

            await logSMSEvent("smsLogs", {
                smsId,
                to: sms.to,
                message: sms.message,
                metadata: sms.metadata || {},
                userId: sms.userId || "system",
                status: "failed",
                error: error.message
            });
        }
    }
);

// Функция для проверки баланса (только админ)
export const getBrevoCredits = onRequest(
    {
        secrets: [secrets.brevo],
        cors: true,
    },
    async (req, res) => {
        if (handleCors(req, res)) return;

        try {
            const decodedToken = await verifyAuthToken(req.headers.authorization);
            await checkAdminAccess(decodedToken.uid);

            const smsService = new BrevoSMSService(secrets.brevo.value());
            const account = await smsService.checkAccount();

            res.status(200).json({
                success: true,
                email: account.email,
                companyName: account.companyName,
                // Баланс SMS нужно получать отдельно или хранить в Firestore
            });

        } catch (error) {
            logger.error("Failed to get account info", error);

            const statusCode = error.message.includes("Unauthorized") ? 401 :
                error.message.includes("Forbidden") ? 403 : 500;

            res.status(statusCode).json({
                error: "Failed to get account info",
                message: error.message
            });
        }
    }
);