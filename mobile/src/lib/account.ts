import { getApp } from "@react-native-firebase/app";

import { signOutEverywhere } from "@/lib/auth";
import { getFirebaseAuth } from "@/lib/firebase";

const FUNCTIONS_REGION = "us-central1";

type CallableError = { error?: { message?: string; status?: string } };

export async function deleteMyAccount(): Promise<void> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("You are not signed in.");

  const idToken = await user.getIdToken();
  const projectId = getApp().options.projectId;
  if (!projectId) throw new Error("Missing Firebase project configuration.");

  const url = `https://${FUNCTIONS_REGION}-${projectId}.cloudfunctions.net/deleteMyAccount`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ data: { reason: "user_requested" } }),
  });

  if (!response.ok) {
    let message = "We couldn't delete your account. Please try again.";
    try {
      const body = (await response.json()) as CallableError;
      if (body.error?.message) message = body.error.message;
    } catch {
      // response had no JSON body — keep the default message
    }
    throw new Error(message);
  }

  await signOutEverywhere();
}
