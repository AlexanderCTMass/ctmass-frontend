import Constants from "expo-constants";
import * as TrackingTransparency from "expo-tracking-transparency";
import { AppState, Platform } from "react-native";
import { Settings } from "react-native-fbsdk-next";

import { analyticsEvents, errorMessage } from "@/lib/analytics-events";

let started = false;
let promptedThisLaunch = false;
let markSettled: () => void = () => {};
const settled = new Promise<void>((resolve) => {
  markSettled = resolve;
});

function isAdTrackingEnabled(): boolean {
  return Constants.expoConfig?.extra?.adTrackingEnabled === true;
}

function whenAppActive(): Promise<void> {
  if (AppState.currentState === "active") return Promise.resolve();
  return new Promise((resolve) => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") return;
      subscription.remove();
      resolve();
    });
  });
}

async function applyIosPermission(): Promise<void> {
  await whenAppActive();
  const current = await TrackingTransparency.getTrackingPermissionsAsync();
  let { granted, status } = current;
  const prompted =
    status === TrackingTransparency.PermissionStatus.UNDETERMINED &&
    current.canAskAgain;
  if (prompted) {
    promptedThisLaunch = true;
    ({ granted, status } =
      await TrackingTransparency.requestTrackingPermissionsAsync());
  }
  await Settings.setAdvertiserTrackingEnabled(granted);
  Settings.setAdvertiserIDCollectionEnabled(granted);

  if (status === TrackingTransparency.PermissionStatus.UNDETERMINED) {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") return;
      subscription.remove();
      void applyIosPermission().catch(reportFailure);
    });
    return;
  }
  analyticsEvents.trackingPermissionResolved({ granted, prompted });
}

function reportFailure(error: unknown): void {
  analyticsEvents.trackingPermissionFailed({ error: errorMessage(error) });
}

export function whenAdTrackingSettled(): Promise<void> {
  if (Platform.OS !== "ios" || !isAdTrackingEnabled()) return Promise.resolve();
  return settled;
}

export function wasAdTrackingPromptedThisLaunch(): boolean {
  return promptedThisLaunch;
}

export async function initAdTracking(): Promise<void> {
  if (started || !isAdTrackingEnabled()) return;
  started = true;
  try {
    if (Platform.OS === "ios") {
      await applyIosPermission();
    } else {
      Settings.setAdvertiserIDCollectionEnabled(true);
    }
  } catch (error) {
    reportFailure(error);
  } finally {
    markSettled();
  }
}
