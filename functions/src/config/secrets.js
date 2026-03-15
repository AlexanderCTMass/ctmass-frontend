import { defineSecret } from "firebase-functions/params";

export const secrets = {
    stripe: defineSecret("STRIPE_SECRET_KEY"),
    replicate: defineSecret("REPLICATE_API_TOKEN"),
    brevo: defineSecret("BREVO_API_KEY")
};