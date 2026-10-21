import { useCallback, useState } from "react";

import { analyticsEvents } from "@/lib/analytics-events";
import { storage } from "@/lib/storage";

function readSeen(key: string): boolean {
  try {
    return storage.getBoolean(key) === true;
  } catch {
    return true;
  }
}

export function useSwipeHint(screen: string) {
  const key = `swipe-hint:${screen}`;
  const [pending, setPending] = useState(() => !readSeen(key));

  const markShown = useCallback(() => {
    try {
      storage.set(key, true);
    } catch {
      setPending(false);
    }
    setPending(false);
    analyticsEvents.swipeHintShown({ screen });
  }, [key, screen]);

  return { pending, markShown };
}
