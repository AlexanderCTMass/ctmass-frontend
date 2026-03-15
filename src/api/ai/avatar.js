import {getAuth} from "firebase/auth";

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

        const response = await fetch(`${process.env.REACT_APP_FB_GENERATE_AVA_API_URL}`, {
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