import { getApp } from "@react-native-firebase/app";

import { signOutEverywhere } from "@/lib/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import i18n from "@/lib/i18n";

const FUNCTIONS_REGION = "us-central1";

type CallableError = { error?: { message?: string; status?: string } };

const offlineMessage = () => i18n.t("account.offline");
const failedMessage = () => i18n.t("account.deleteFailed");

export class AccountDeletionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccountDeletionError";
  }
}

export async function deleteMyAccount(): Promise<void> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new AccountDeletionError(i18n.t("account.notSignedIn"));

  const projectId = getApp().options.projectId;
  if (!projectId) throw new AccountDeletionError(failedMessage());

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
    throw new AccountDeletionError(offlineMessage());
  }

  if (!response.ok) {
    let message = failedMessage();
    try {
      const body = (await response.json()) as CallableError;
      const status = body.error?.status ?? "";
      if (status === "UNAUTHENTICATED") message = i18n.t("account.notSignedIn");
      if (status === "FAILED_PRECONDITION") {
        message = i18n.t("account.adminCannotDelete");
      }
    } catch {
      // response had no JSON body — keep the default message
    }
    throw new AccountDeletionError(message);
  }

  await signOutEverywhere();
}
