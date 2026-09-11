import { router } from "expo-router";
import { useCallback } from "react";

import { analyticsEvents, currentScreen } from "@/lib/analytics-events";
import { toHref } from "@/lib/navigation";
import { useAuthStore } from "@/store/use-auth-store";

export function useRequireAuth(): () => boolean {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useCallback(() => {
    if (isAuthenticated) return true;
    analyticsEvents.authRequiredPrompted({ screen: currentScreen() });
    router.push(toHref("/auth"));
    return false;
  }, [isAuthenticated]);
}
