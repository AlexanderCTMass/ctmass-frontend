import * as TrackingTransparency from "expo-tracking-transparency";

import { useAppStore } from "@/store/use-app-store";

let inFlight = false;

export async function requestTrackingConsentOnce(): Promise<void> {
  if (inFlight) return;
  if (useAppStore.getState().trackingConsent !== null) return;
  inFlight = true;
  try {
    const current = await TrackingTransparency.getTrackingPermissionsAsync();
    let granted = current.granted;
    if (!granted && current.canAskAgain) {
      const result =
        await TrackingTransparency.requestTrackingPermissionsAsync();
      granted = result.granted;
    }
    useAppStore.getState().setTrackingConsent(granted);
  } catch {
    useAppStore.getState().setTrackingConsent(true);
  } finally {
    inFlight = false;
  }
}
