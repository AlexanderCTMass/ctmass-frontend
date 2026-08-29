import Constants from "expo-constants";
import { getApp } from "@react-native-firebase/app";
import { getAuth } from "@react-native-firebase/auth";
import { getFirestore } from "@react-native-firebase/firestore";
import {
  GoogleSignin,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";

export function getFirebaseApp() {
  return getApp();
}

export function getFirebaseAuth() {
  return getAuth(getApp());
}

export function getDb() {
  return getFirestore(getApp());
}

function resolveWebClientId(): string | undefined {
  const raw: unknown = Constants.expoConfig?.extra?.googleWebClientId;
  return typeof raw === "string" && raw.length > 0 ? raw : undefined;
}

let googleConfigured = false;

export function configureGoogleSignin() {
  if (googleConfigured) return;
  const webClientId = resolveWebClientId() ?? "autoDetect";
  GoogleSignin.configure({
    webClientId,
    offlineAccess: false,
  });
  googleConfigured = true;
}

export async function getGoogleIdToken(): Promise<string> {
  configureGoogleSignin();
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();

  if (!isSuccessResponse(response)) {
    throw new GoogleSignInCancelledError();
  }

  const idToken =
    response.data.idToken ?? (await GoogleSignin.getTokens()).idToken;
  if (!idToken) {
    throw new Error("Google did not return an ID token.");
  }
  return idToken;
}

export async function signOutGoogle(): Promise<void> {
  try {
    await GoogleSignin.signOut();
  } catch {
    // ignore — nothing to clean up
  }
}

export class GoogleSignInCancelledError extends Error {
  constructor() {
    super("Google sign-in was cancelled.");
    this.name = "GoogleSignInCancelledError";
  }
}
