import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import { Platform } from "react-native";
import {
  AppleAuthProvider,
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
} from "@react-native-firebase/auth";

import {
  getFirebaseAuth,
  getGoogleIdToken,
  signOutGoogle,
} from "@/lib/firebase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export async function signInWithGoogle(): Promise<void> {
  const idToken = await getGoogleIdToken();
  const credential = GoogleAuthProvider.credential(idToken);
  await signInWithCredential(getFirebaseAuth(), credential);
}

export function isAppleSignInSupported(): boolean {
  return Platform.OS === "ios";
}

export async function isAppleSignInAvailable(): Promise<boolean> {
  if (!isAppleSignInSupported()) return false;
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
}

function randomNonce(length = 24): string {
  const bytes = Crypto.getRandomBytes(length);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export class AppleSignInCancelledError extends Error {
  constructor() {
    super("Apple sign-in was cancelled.");
    this.name = "AppleSignInCancelledError";
  }
}

export async function signInWithApple(): Promise<void> {
  const rawNonce = randomNonce();
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce,
  );

  let appleCredential: AppleAuthentication.AppleAuthenticationCredential;
  try {
    appleCredential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code?: string }).code === "ERR_REQUEST_CANCELED"
    ) {
      throw new AppleSignInCancelledError();
    }
    throw error;
  }

  const { identityToken } = appleCredential;
  if (!identityToken) {
    throw new Error("Apple did not return an identity token.");
  }

  const credential = AppleAuthProvider.credential(identityToken, rawNonce);
  await signInWithCredential(getFirebaseAuth(), credential);
}

export async function signOutEverywhere(): Promise<void> {
  await signOutGoogle();
  await signOut(getFirebaseAuth());
}
