import { getApp } from "@react-native-firebase/app";

import { getFirebaseAuth } from "@/lib/firebase";

const FUNCTIONS_REGION = "us-central1";

export type ServiceInquiry = {
  email: string;
  services: string[];
  message: string;
};

type CallableError = { error?: { message?: string } };

export async function sendServiceInquiry(input: ServiceInquiry): Promise<void> {
  const projectId = getApp().options.projectId;
  if (!projectId) throw new Error("Missing Firebase project configuration.");

  const url = `https://${FUNCTIONS_REGION}-${projectId}.cloudfunctions.net/sendServiceInquiry`;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const user = getFirebaseAuth().currentUser;
  if (user) {
    try {
      headers.Authorization = `Bearer ${await user.getIdToken()}`;
    } catch {
      // ignore — inquiry works without auth
    }
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      data: {
        email: input.email,
        services: input.services,
        message: input.message,
      },
    }),
  });

  if (!response.ok) {
    let message = "We couldn't send your message. Please try again.";
    try {
      const body = (await response.json()) as CallableError;
      if (body.error?.message) message = body.error.message;
    } catch {
      // response had no JSON body — keep the default message
    }
    throw new Error(message);
  }
}
