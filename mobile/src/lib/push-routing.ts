import { router } from "expo-router";

import { toHref } from "@/lib/navigation";
import type { PushData } from "@/lib/notifications";

// Maps an FCM data payload (produced by the mirror / trigger functions) to an
// in-app route. appLink carries the target path; type is the fallback.
export function routeFromPushData(data: PushData): void {
  if (!data) return;

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
