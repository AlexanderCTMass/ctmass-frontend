import { onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import { defineSecret } from "firebase-functions/params";
import { PaymentService } from "./src/services/payment/payment.service.js";

// Объявляем секреты на верхнем уровне
const stripeSecret = defineSecret("STRIPE_SECRET_KEY");
const replicateToken = defineSecret("REPLICATE_API_TOKEN");

initializeApp();

const DEFAULT_REPLICATE_ENDPOINT = "https://api.replicate.com/v1/predictions";
const MODEL_VERSION = "2e4785a4d80dadf580077b2244c8d7c05d8e3faac04a04c02d8e099dd2876789";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const pollPredictionStatus = async (predictionUrl, token, maxAttempts = 30, interval = 2000) => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(predictionUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch prediction status");
    }

    const prediction = await response.json();

    if (prediction.status === "succeeded") {
      return prediction;
    } else if (prediction.status === "failed") {
      throw new Error(prediction.error || "AI generation failed");
    }

    await wait(interval);
  }

  throw new Error("Timeout waiting for AI generation to complete");
};

export const generateAiAvatars = onRequest(
  {
    secrets: [replicateToken], // Явно указываем зависимость от секрета
    cors: true,
    timeoutSeconds: 300, // Увеличиваем таймаут для длительной генерации
    memory: "1GiB", // Увеличиваем память для обработки изображений
  },
  async (req, res) => {
    // CORS headers
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");

    // Handle OPTIONS
    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }

    // Только POST запросы
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    try {
      // Проверка токена аутентификации
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const idToken = authHeader.split("Bearer ")[1];
      const decodedToken = await getAuth().verifyIdToken(idToken);
      console.log("Decoded UID:", decodedToken.uid);

      // Валидация входных данных
      const { imageUrl, prompt, count = 3 } = req.body;

      if (!imageUrl) {
        return res.status(400).json({ error: "Reference image URL is required" });
      }

      if (count < 1 || count > 5) {
        return res.status(400).json({ error: "Count must be between 1 and 5" });
      }

      const sanitizedPrompt =
          prompt?.trim() || "Professional business headshot, photo-realistic, neutral background";
      const token = replicateToken.value(); // Получаем значение секрета
      const results = [];

      // Генерируем запрошенное количество аватаров
      for (let i = 0; i < count; i++) {
        console.log(`Generating avatar ${i + 1} of ${count} for user: ${decodedToken.uid}`);


        // eslint-disable-next-line max-len
        const payload = {
          version: MODEL_VERSION,
          input: {
            image: imageUrl,
            prompt: sanitizedPrompt,
            guidance_scale: 5,
            // eslint-disable-next-line max-len
            negative_prompt: "blurry, distorted, caricature, watermark, text, low quality, lowres, low quality, worst quality, painting, drawing, illustration, glitch, deformed, mutated, cross-eyed, ugly, disfigured",
          },
        };

        // Запуск предсказания
        const startResponse = await fetch(DEFAULT_REPLICATE_ENDPOINT, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Prefer": "wait",
          },
          body: JSON.stringify(payload),
        });

        if (!startResponse.ok) {
          const errorData = await startResponse.text();
          throw new Error(`Failed to start AI generation: ${errorData}`);
        }

        const prediction = await startResponse.json();

        // Ожидание завершения генерации
        let finalPrediction = prediction;
        if (prediction.status === "processing" || prediction.status === "starting") {
          finalPrediction = await pollPredictionStatus(prediction.urls.get, token);
        }

        if (!finalPrediction.output ||
            !Array.isArray(finalPrediction.output) ||
            finalPrediction.output.length === 0) {
          throw new Error("No output received from AI generation");
        }

        const outputUrl = finalPrediction.output[0];

        // Скачиваем сгенерированное изображение
        const imageResponse = await fetch(outputUrl);
        if (!imageResponse.ok) {
          throw new Error("Failed to fetch generated image");
        }

        const imageBuffer = await imageResponse.arrayBuffer();

        // Сохраняем в Firebase Storage
        const bucket = getStorage().bucket();
        const fileName = `avatars/${decodedToken.uid}/${Date.now()}-${i}.png`;
        const file = bucket.file(fileName);

        await file.save(Buffer.from(imageBuffer), {
          metadata: {
            contentType: "image/png",
            metadata: {
              userId: decodedToken.uid,
              generatedAt: new Date().toISOString(),
              prompt: sanitizedPrompt,
            },
          },
        });

        // Делаем файл публично доступным (или настраиваем под ваши нужды)
        await file.makePublic();

        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        results.push({
          id: `${Date.now()}-${i}`,
          url: publicUrl,
          fileName: fileName,
        });

        console.log(`Avatar ${i + 1} generated successfully: ${fileName}`);
      }

      // Возвращаем результаты
      res.status(200).json({
        success: true,
        avatars: results,
        count: results.length,
      });
    } catch (error) {
      console.error("[generateAiAvatars] Error:", error);

      // Определяем статус ошибки
      let statusCode = 500;
      if (error.message.includes("Unauthorized") || error.message.includes("authentication")) {
        statusCode = 401;
      } else if (error.message.includes("required")) {
        statusCode = 400;
      }

      res.status(statusCode).json({
        error: "Failed to generate avatars",
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  },
);
export const createStripePaymentIntent = onRequest(
  {
    secrets: [stripeSecret], // Явно указываем зависимость от секрета
    cors: true,
  },
  async (req, res) => {
    // CORS headers
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    // Handle OPTIONS
    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }

    try {
      // Проверка токена
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const idToken = authHeader.split("Bearer ")[1];
      const decodedToken = await getAuth().verifyIdToken(idToken);
      console.log("Decoded UID:", decodedToken.uid);

      // Основная логика
      const { amount, currency = "usd" } = req.body;
      const result = await PaymentService.createPaymentIntent(
        amount,
        currency,
        decodedToken.uid,
        stripeSecret.value(), // Передаем значение секрета
      );

      res.status(200).json(result);
    } catch (error) {
      console.error("Error:", error);
      res.status(401).json({
        error: "Authentication failed",
        details: error.message,
      });
    }
  },
);
