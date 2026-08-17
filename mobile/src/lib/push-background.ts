import { getApp } from "@react-native-firebase/app";
import { getMessaging, setBackgroundMessageHandler } from "@react-native-firebase/messaging";

import type { PushData } from "@/lib/notifications";
import { ensureAndroidChannel, presentFromData } from "@/lib/push-display";

setBackgroundMessageHandler(getMessaging(getApp()), async (message) => {
  await ensureAndroidChannel();
  await presentFromData(message?.data as PushData);
});
