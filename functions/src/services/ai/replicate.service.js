export class ReplicateService {
    constructor(token) {
        this.token = token;
        this.baseUrl = "https://api.replicate.com/v1";
        this.modelVersion = "2e4785a4d80dadf580077b2244c8d7c05d8e3faac04a04c02d8e099dd2876789";
    }

    async createPrediction(imageUrl, prompt) {
        const response = await fetch(`${this.baseUrl}/predictions`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.token}`,
                "Content-Type": "application/json",
                "Prefer": "wait",
            },
            body: JSON.stringify({
                version: this.modelVersion,
                input: {
                    image: imageUrl,
                    prompt: prompt || "Professional business headshot, photo-realistic, neutral background",
                    guidance_scale: 5,
                    negative_prompt: "blurry, distorted, caricature, watermark, text, low quality, lowres, low quality, worst quality, painting, drawing, illustration, glitch, deformed, mutated, cross-eyed, ugly, disfigured",
                },
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to start AI generation: ${error}`);
        }

        return response.json();
    }

    async pollPrediction(predictionUrl, maxAttempts = 30, interval = 2000) {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const response = await fetch(predictionUrl, {
                headers: { Authorization: `Bearer ${this.token}` },
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

            await this.wait(interval);
        }

        throw new Error("Timeout waiting for AI generation to complete");
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}