import * as Linking from "expo-linking";
import { type ReactNode, useEffect } from "react";
import { AppState } from "react-native";

import { analyticsEvents } from "@/lib/analytics-events";
import {
  consumePendingInviterRef,
  parseInviteRef,
  setPendingInviterRef,
} from "@/lib/deep-links";
import { acceptInviteFromRef } from "@/lib/friends";
import {
  getInitialNotificationData,
  hasNotificationPermission,
  registerFcmToken,
  requestNotificationPermission,
  subscribeNotificationOpen,
  subscribeTokenRefresh,
  updateLastSeen,
  wasNotificationPermissionAsked,
} from "@/lib/notifications";
import { configurePushDisplay } from "@/lib/push-display";
import { routeFromPushData } from "@/lib/push-routing";
import {
  wasAdTrackingPromptedThisLaunch,
  whenAdTrackingSettled,
} from "@/lib/tracking";
import { useAppStore } from "@/store/use-app-store";
import { useAuthStore } from "@/store/use-auth-store";

async function enablePush(uid: string): Promise<void> {
  await whenAdTrackingSettled();
  if (
    !wasAdTrackingPromptedThisLaunch() &&
    !wasNotificationPermissionAsked() &&
    !(await hasNotificationPermission())
  ) {
    const result = await requestNotificationPermission();
    analyticsEvents.notificationPermissionResult({
      granted: result === "granted",
      source: "app_launch",
    });
  }
  await registerFcmToken(uid);
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const uid = useAuthStore((state) => state.user?.uid);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasCompletedOnboarding = useAppStore(
    (state) => state.hasCompletedOnboarding,
  );

  useEffect(() => {
    const teardownDisplay = configurePushDisplay();

    const unsubscribeOpen = subscribeNotificationOpen((data) => {
      analyticsEvents.pushNotificationOpened({
        type: data?.type ?? null,
        app_link: data?.appLink ?? null,
        cold_start: false,
      });
      routeFromPushData(data);
    });

    void getInitialNotificationData().then((data) => {
      if (!data) return;
      analyticsEvents.pushNotificationOpened({
        type: data.type ?? null,
        app_link: data.appLink ?? null,
        cold_start: true,
      });
      routeFromPushData(data);
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
    if (!uid || !isAuthenticated || !hasCompletedOnboarding) return;
    void enablePush(uid);
  }, [uid, isAuthenticated, hasCompletedOnboarding]);

  useEffect(() => {
    if (!uid || !isAuthenticated) return;

    void registerFcmToken(uid);
    void updateLastSeen(uid);

    const ref = consumePendingInviterRef();
    if (ref) void acceptInviteFromRef(uid, ref);

    const unsubscribeToken = subscribeTokenRefresh(uid);

    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") return;
      void updateLastSeen(uid);
      void registerFcmToken(uid);
    });

    return () => {
      unsubscribeToken();
      subscription.remove();
    };
  }, [uid, isAuthenticated]);

  return <>{children}</>;
}
