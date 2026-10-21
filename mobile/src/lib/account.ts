import { getApp } from "@react-native-firebase/app";

import { signOutEverywhere } from "@/lib/auth";
import { getFirebaseAuth } from "@/lib/firebase";

const FUNCTIONS_REGION = "us-central1";

type CallableError = { error?: { message?: string; status?: string } };

const OFFLINE_MESSAGE =
  "We couldn't reach the server. Check your internet connection and try again.";
const FAILED_MESSAGE =
  "We couldn't delete your account right now. Please try again in a moment.";
const SAFE_STATUSES = new Set(["UNAUTHENTICATED", "FAILED_PRECONDITION"]);

export class AccountDeletionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccountDeletionError";
  }
}

export async function deleteMyAccount(): Promise<void> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new AccountDeletionError("You are not signed in.");

  const projectId = getApp().options.projectId;
  if (!projectId) throw new AccountDeletionError(FAILED_MESSAGE);

  const url = `https://${FUNCTIONS_REGION}-${projectId}.cloudfunctions.net/deleteMyAccount`;

  let response: Response;
  try {
    const idToken = await user.getIdToken();
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ data: { reason: "user_requested" } }),
    });
  } catch (error) {
    console.warn("deleteMyAccount network error", error);
    throw new AccountDeletionError(OFFLINE_MESSAGE);
  }

  if (!response.ok) {
    let message = FAILED_MESSAGE;
    try {
      const body = (await response.json()) as CallableError;
      const status = body.error?.status ?? "";
      if (body.error?.message && SAFE_STATUSES.has(status)) {
        message = body.error.message;
      }
    } catch {
      // response had no JSON body — keep the default message
    }
    throw new AccountDeletionError(message);
  }

  await signOutEverywhere();
}
