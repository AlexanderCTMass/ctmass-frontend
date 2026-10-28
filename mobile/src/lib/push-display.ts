import * as Notifications from "expo-notifications";
import { AppState, Platform } from "react-native";

import type { PushData } from "@/lib/notifications";
import { routeFromPushData } from "@/lib/push-routing";
import i18n from "@/lib/i18n";

const CHANNEL_ID = "default";
const BRAND_COLOR = "#16B364";

Notifications.setNotificationHandler({
  handleNotification: () => {
    const visible = AppState.currentState !== "active";
    return Promise.resolve({
      shouldShowBanner: visible,
      shouldShowList: visible,
      shouldPlaySound: visible,
      shouldSetBadge: false,
    });
  },
});

export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: i18n.t("profile.tab.notifications"),
    importance: Notifications.AndroidImportance.HIGH,
    enableVibrate: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    lightColor: BRAND_COLOR,
  });
}

export async function presentFromData(data: PushData): Promise<void> {
  if (!data) return;
  const title = typeof data.title === "string" ? data.title : "CTMASS";
  const body = typeof data.body === "string" ? data.body : "";
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data, sound: "default", color: BRAND_COLOR },
    trigger: { channelId: CHANNEL_ID },
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

  void Notifications.getLastNotificationResponseAsync().then((response) => {
    if (!response) return;
    routeFromPushData(response.notification.request.content.data as PushData);
    void Notifications.clearLastNotificationResponseAsync();
  });

  return () => {
    responseSub.remove();
  };
}
