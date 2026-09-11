import { useSegments } from "expo-router";
import { type ReactNode, useEffect } from "react";

import { identifyUser, trackScreen } from "@/lib/analytics";
import { useAuthStore } from "@/store/use-auth-store";

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const segments = useSegments();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const uid = useAuthStore((state) => state.user?.uid);
  const role = useAuthStore((state) => state.user?.role ?? null);
  const provider = useAuthStore((state) => state.user?.provider);

  useEffect(() => {
    identifyUser(
      isAuthenticated && uid && provider ? { uid, role, provider } : null,
    );
  }, [isAuthenticated, uid, role, provider]);

  const screen =
    segments.filter((segment) => !segment.startsWith("(")).join("/") || "index";

  useEffect(() => {
    trackScreen(screen);
  }, [screen]);

  return <>{children}</>;
}
