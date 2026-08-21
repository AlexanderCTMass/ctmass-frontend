import * as Linking from "expo-linking";
import { type ReactNode, useEffect } from "react";
import { AppState } from "react-native";

import {
  consumePendingInviterRef,
  parseInviteRef,
  setPendingInviterRef,
} from "@/lib/deep-links";
import { acceptInviteFromRef } from "@/lib/friends";
import {
  getInitialNotificationData,
  registerFcmToken,
  subscribeNotificationOpen,
  subscribeTokenRefresh,
  updateLastSeen,
} from "@/lib/notifications";
import { configurePushDisplay } from "@/lib/push-display";
import { routeFromPushData } from "@/lib/push-routing";
import { useAuthStore } from "@/store/use-auth-store";

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const uid = useAuthStore((state) => state.user?.uid);

  useEffect(() => {
    const teardownDisplay = configurePushDisplay();

    const unsubscribeOpen = subscribeNotificationOpen((data) => {
      routeFromPushData(data);
    });

    void getInitialNotificationData().then((data) => {
      if (data) routeFromPushData(data);
    });

    void Linking.getInitialURL().then((url) => {
      const ref = parseInviteRef(url);
      if (ref) setPendingInviterRef(ref);
    });

    const linkSubscription = Linking.addEventListener("url", (event) => {
      const ref = parseInviteRef(event.url);
      if (ref) setPendingInviterRef(ref);
    });

    return () => {
      teardownDisplay();
      unsubscribeOpen();
      linkSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!uid) return;

    void registerFcmToken(uid);
    void updateLastSeen(uid);

    const ref = consumePendingInviterRef();
    if (ref) void acceptInviteFromRef(uid, ref);

    const unsubscribeToken = subscribeTokenRefresh(uid);

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void updateLastSeen(uid);
    });

    return () => {
      unsubscribeToken();
      subscription.remove();
    };
  }, [uid]);

  return <>{children}</>;
}
