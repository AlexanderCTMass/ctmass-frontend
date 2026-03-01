import {getAuth} from "firebase/auth";

const DEFAULT_REPLICATE_ENDPOINT = 'https://api.replicate.com/v1/predictions';
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
    try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            throw new Error('User not authenticated');
        }

        const token = await user.getIdToken();

        const response = await fetch('https://us-central1-ctmasstest.cloudfunctions.net/generateAiAvatars', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                imageUrl,
                prompt,
                count
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to generate avatars');
        }

        const data = await response.json();
        return data.avatars;
    } catch (error) {
        console.error('Failed to generate avatars:', error);
        throw error;
    }
};