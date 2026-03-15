import { onRequest } from "firebase-functions/v2/https";
import { getStorage } from "firebase-admin/storage";
import { secrets } from "../../config/secrets.js";
import { verifyAuthToken } from "../../utils/auth.js";
import { handleCors } from "../../middleware/cors.js";
import { logger } from "../../utils/logger.js";
import { ReplicateService } from "./replicate.service.js";

export const generateAiAvatars = onRequest(
    {
        secrets: [secrets.replicate],
        cors: true,
        timeoutSeconds: 300,
        memory: "1GiB",
    },
    async (req, res) => {
        if (handleCors(req, res)) return;

        if (req.method !== "POST") {
            return res.status(405).json({ error: "Method not allowed" });
        }

        try {
            const decodedToken = await verifyAuthToken(req.headers.authorization);
            logger.info("AI generation request", { userId: decodedToken.uid });

            const { imageUrl, prompt, count = 3 } = req.body;

            if (!imageUrl) {
                return res.status(400).json({ error: "Reference image URL is required" });
            }

            if (count < 1 || count > 5) {
                return res.status(400).json({ error: "Count must be between 1 and 5" });
            }

            const replicateService = new ReplicateService(secrets.replicate.value());
            const results = [];
            const bucket = getStorage().bucket();

            for (let i = 0; i < count; i++) {
                logger.info(`Generating avatar ${i + 1} of ${count}`);

                const prediction = await replicateService.createPrediction(imageUrl, prompt);

                let finalPrediction = prediction;
                if (prediction.status === "processing" || prediction.status === "starting") {
                    finalPrediction = await replicateService.pollPrediction(prediction.urls.get);
                }

                if (!finalPrediction.output?.length) {
                    throw new Error("No output received from AI generation");
                }

                const outputUrl = finalPrediction.output[0];
                const imageResponse = await fetch(outputUrl);
                const imageBuffer = await imageResponse.arrayBuffer();

                const fileName = `avatars/${decodedToken.uid}/${Date.now()}-${i}.png`;
                const file = bucket.file(fileName);

                await file.save(Buffer.from(imageBuffer), {
                    metadata: {
                        contentType: "image/png",
                        metadata: {
                            userId: decodedToken.uid,
                            generatedAt: new Date().toISOString(),
                            prompt: prompt || "default",
                        },
                    },
                });

                await file.makePublic();
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

                results.push({
                    id: `${Date.now()}-${i}`,
                    url: publicUrl,
                    fileName: fileName,
                });
            }

            logger.info("Avatars generated", { userId: decodedToken.uid, count });

            res.status(200).json({
                success: true,
                avatars: results,
                count: results.length,
            });

        } catch (error) {
            logger.error("AI generation failed", error);

            const statusCode = error.message.includes("Unauthorized") ? 401 :
                error.message.includes("required") ? 400 : 500;

            res.status(statusCode).json({
                error: "Failed to generate avatars",
                message: error.message,
                timestamp: new Date().toISOString(),
            });
        }
    }
);