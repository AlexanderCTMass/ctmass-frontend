const DEFAULT_REPLICATE_ENDPOINT = 'http://localhost:8010/proxy/v1/predictions';
const REPLICATE_API_TOKEN = "r8_ekxZMuQJrFKtEnlHUFPiC5k62Hfe2W73tJMR6";
const MODEL_VERSION = '2e4785a4d80dadf580077b2244c8d7c05d8e3faac04a04c02d8e099dd2876789';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const pollPredictionStatus = async (predictionUrl, maxAttempts = 30, interval = 2000) => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const response = await fetch(predictionUrl, {
            headers: {
                Authorization: `Bearer ${REPLICATE_API_TOKEN}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch prediction status');
        }

        const prediction = await response.json();

        if (prediction.status === 'succeeded') {
            return prediction;
        } else if (prediction.status === 'failed') {
            throw new Error(prediction.error || 'AI generation failed');
        }

        await wait(interval);
    }

    throw new Error('Timeout waiting for AI generation to complete');
};

const fetchImageAsBlob = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch generated image');
    }
    return response.blob();
};

/**
 * Generates avatar variations using Replicate API.
 * @param {Object} options
 * @param {string} options.imageUrl - Public URL of the reference photo (from Firebase Storage).
 * @param {string} options.prompt - Prompt / style guidance.
 * @param {number} [options.count=3] - Number of variations to request.
 * @returns {Promise<Array<{id: string, blob: Blob}>>}
 */
export const generateAiAvatars = async ({ imageUrl, prompt, count = 3 }) => {
    if (!imageUrl) {
        throw new Error('Reference image URL is required for AI generation.');
    }

    if (!REPLICATE_API_TOKEN) {
        throw new Error('Replicate API token is not configured. Please check your environment variables.');
    }

    try {
        const sanitizedPrompt = prompt?.trim() || 'Professional business headshot, photo-realistic, neutral background';
        const results = [];

        for (let i = 0; i < count; i += 1) {
            // Prepare request payload
            const payload = {
                version: MODEL_VERSION,
                input: {
                    image: imageUrl,
                    prompt: sanitizedPrompt,
                    guidance_scale: 5,
                    negative_prompt: 'blurry, distorted, caricature, watermark, text, low quality, lowres, low quality, worst quality, painting, drawing, illustration, glitch, deformed, mutated, cross-eyed, ugly, disfigured'
                }
            };

            // Start prediction
            const startResponse = await fetch(DEFAULT_REPLICATE_ENDPOINT, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
                    'Content-Type': 'application/json',
                    Prefer: 'wait'
                },
                body: JSON.stringify(payload)
            });

            if (!startResponse.ok) {
                const errorData = await startResponse.text();
                throw new Error(`Failed to start AI generation: ${errorData}`);
            }

            const prediction = await startResponse.json();

            // Poll for completion if needed
            let finalPrediction = prediction;
            if (prediction.status === 'processing' || prediction.status === 'starting') {
                finalPrediction = await pollPredictionStatus(prediction.urls.get);
            }

            if (!finalPrediction.output || !Array.isArray(finalPrediction.output) || finalPrediction.output.length === 0) {
                throw new Error('No output received from AI generation');
            }

            // Get the first output URL (main generated image)
            const outputUrl = finalPrediction.output[0];

            // Fetch the image as blob
            const blob = await fetchImageAsBlob(outputUrl);

            results.push({
                id: `${Date.now()}-${i}-${Math.random().toString(36).substring(7)}`,
                blob
            });
        }

        return results;
    } catch (error) {
        console.error('[Replicate Avatar] Generation error:', error);
        throw new Error(error?.message || 'Failed to generate avatars. Please try again in a moment.');
    }
};