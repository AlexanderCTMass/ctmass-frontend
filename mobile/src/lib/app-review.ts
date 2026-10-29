import * as StoreReview from "expo-store-review";
import { Linking, Platform } from "react-native";

import { storage } from "@/lib/storage";

export type AppReviewMethod = "native" | "store" | "unavailable";

const NATIVE_PROMPT_SHOWN_KEY = "ctmass.app-review-native-shown";

function reviewPageUrl(): string | null {
  const url = StoreReview.storeUrl();
  if (!url) return null;
  if (Platform.OS !== "ios") return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}action=write-review`;
}

export async function requestAppReview(): Promise<AppReviewMethod> {
  const alreadyPrompted = storage.getBoolean(NATIVE_PROMPT_SHOWN_KEY) === true;
  if (!alreadyPrompted && (await StoreReview.isAvailableAsync())) {
    storage.set(NATIVE_PROMPT_SHOWN_KEY, true);
    await StoreReview.requestReview();
    return "native";
  }
  const url = reviewPageUrl();
  if (!url) return "unavailable";
  await Linking.openURL(url);
  return "store";
}
