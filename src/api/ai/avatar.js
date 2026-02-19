const DEFAULT_HF_ENDPOINT = 'https://router.huggingface.co/models/InstantX/InstantID';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

/**
 * Generates avatar variations using a Hugging Face inference endpoint.
 * @param {Object} options
 * @param {File} options.imageFile - Reference photo (image file).
 * @param {string} options.prompt - Prompt / style guidance.
 * @param {number} [options.count=3] - Number of variations to request.
 * @returns {Promise<Array<{id: string, blob: Blob}>>}
 */
export const generateAiAvatars = async ({ imageFile, prompt, count = 3 }) => {
    if (!imageFile) {
        throw new Error('Reference image is required for AI generation.');
    }

    const token = '';
    if (!token) {
        throw new Error('There no points for this model.');
    }

    const endpoint = DEFAULT_HF_ENDPOINT || process.env.REACT_APP_HF_MODEL_ENDPOINT;
    const base64 = await fileToBase64(imageFile);
    const cleanBase64 = base64.replace(/^data:.+;base64,/, '');

    const sanitizedPrompt = prompt?.trim() || 'Professional business headshot, photo-realistic, neutral background, 4k';
    const results = [];

    for (let i = 0; i < count; i += 1) {
        const seed = Math.floor(Math.random() * 1000000000);

        const payload = {
            inputs: {
                image: cleanBase64,
                prompt: sanitizedPrompt,
                negative_prompt: 'blurry, distorted, caricature, watermark, text, low quality',
                seed
            },
            parameters: {
                num_inference_steps: 28,
                guidance_scale: 7.5,
                strength: 0.65,
                num_images: 1
            }
        };

        let attempt = 0;
        const maxAttempts = 3;

        // eslint-disable-next-line no-constant-condition
        while (true) {
            attempt += 1;
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'x-wait-for-model': 'true',
                    'x-use-cache': 'false'
                },
                body: JSON.stringify(payload)
            });

            if (response.status === 503) {
                if (attempt >= maxAttempts) {
                    throw new Error('The AI model is warming up. Please try again shortly.');
                }
                const json = await response.json();
                const waitTime = Math.ceil((json?.estimated_time ?? 8) * 1000);
                await wait(waitTime);
                continue;
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'AI generation request failed.');
            }

            const blob = await response.blob();
            results.push({
                id: `${Date.now()}-${i}-${seed}`,
                blob
            });

            break;
        }
    }

    return results;
};