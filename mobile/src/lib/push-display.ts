import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import type { PushData } from "@/lib/notifications";
import { routeFromPushData } from "@/lib/push-routing";

const CHANNEL_ID = "default";

Notifications.setNotificationHandler({
  handleNotification: () =>
    Promise.resolve({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
});

export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: "Notifications",
    importance: Notifications.AndroidImportance.HIGH,
    lightColor: "#16B364",
  });
}

export async function presentFromData(data: PushData): Promise<void> {
  if (!data) return;
  const title = typeof data.title === "string" ? data.title : "CTMASS";
  const body = typeof data.body === "string" ? data.body : "";
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data },
    trigger: null,
  });
}

// Pushes are only shown when the app is NOT in the foreground (background handler
// presents them). While the app is open we deliberately show nothing — the user
// is already in the app and sees updates in the UI. We only wire tap-routing here.
export function configurePushDisplay(): () => void {
  void ensureAndroidChannel();

  const responseSub = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      routeFromPushData(response.notification.request.content.data as PushData);
    },
  );

  return () => {
    responseSub.remove();
  };
}
