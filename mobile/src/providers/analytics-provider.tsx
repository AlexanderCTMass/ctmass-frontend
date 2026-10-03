import { useSegments } from "expo-router";
import { type ReactNode, useEffect } from "react";

import { trackScreen } from "@/lib/analytics";

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const segments = useSegments();

  const screen =
    segments.filter((segment) => !segment.startsWith("(")).join("/") || "index";

  useEffect(() => {
    trackScreen(screen);
  }, [screen]);

  return <>{children}</>;
}
