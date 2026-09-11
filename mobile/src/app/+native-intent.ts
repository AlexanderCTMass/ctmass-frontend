import { analyticsEvents } from "@/lib/analytics-events";

function resolvePath(path: string): string {
  try {
    if (path.startsWith("http://") || path.startsWith("https://")) {
      const url = new URL(path);
      return `${url.pathname}${url.search}`;
    }
  } catch {
    return path;
  }
  return path;
}

export function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}): string {
  const resolved = resolvePath(path);
  try {
    analyticsEvents.deepLinkOpened({
      path: resolved.split("?")[0] ?? resolved,
      initial,
      has_invite_ref: /[?&](ref|connect)=/.test(resolved),
    });
  } catch {
    // analytics must never block link handling
  }
  return resolved;
}
