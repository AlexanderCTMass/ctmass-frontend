import { router } from "expo-router";

import { toHref } from "@/lib/navigation";
import type { PushData } from "@/lib/notifications";

// Maps an FCM data payload (produced by the mirror / trigger functions) to an
// in-app route. appLink carries the target path; type is the fallback.
const DUPLICATE_WINDOW_MS = 2500;
let lastRouted = { key: "", at: 0 };

function isDuplicate(data: NonNullable<PushData>): boolean {
  const key = `${data.appLink ?? ""}|${data.type ?? ""}|${data.threadId ?? ""}`;
  const now = Date.now();
  const duplicate =
    lastRouted.key === key && now - lastRouted.at < DUPLICATE_WINDOW_MS;
  lastRouted = { key, at: now };
  return duplicate;
}

export function routeFromPushData(data: PushData): void {
  if (!data) return;
  if (isDuplicate(data)) return;

  const appLink = data.appLink;
  if (typeof appLink === "string" && appLink.startsWith("/")) {
    router.push(toHref(appLink));
    return;
  }

  switch (data.type) {
    case "new_message":
      router.push(toHref("/chats"));
      break;
    case "project_response":
      router.push(
        toHref(data.threadId ? `/chat?threadId=${data.threadId}` : "/chats"),
      );
      break;
    case "new_project":
      router.push(toHref("/home"));
      break;
    default:
      break;
  }
}
