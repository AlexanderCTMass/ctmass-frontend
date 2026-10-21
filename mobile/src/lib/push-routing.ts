import { router } from "expo-router";

import { toHref } from "@/lib/navigation";
import type { PushData } from "@/lib/notifications";
import { useAppStore } from "@/store/use-app-store";
import { useProjectDraftStore } from "@/store/use-project-draft-store";

const DUPLICATE_WINDOW_MS = 2500;
const NEW_REQUEST_PATH = "/homeowner-choose-specialty";
const TAB_PATHS = new Set(["/home", "/chats", "/shop", "/profile"]);

const CHAT_TYPES = new Set([
  "new_message",
  "project_response",
  "project_completion_requested",
  "project_completed",
  "review_received",
  "project_cancelled",
  "request_declined",
  "service_request",
]);

let lastRouted = { key: "", at: 0 };
let navigationReady = false;
let pendingRoutes: string[] | null = null;

function isDuplicate(data: NonNullable<PushData>): boolean {
  const key = `${data.appLink ?? ""}|${data.type ?? ""}|${data.threadId ?? ""}|${data.projectId ?? ""}`;
  const now = Date.now();
  const duplicate =
    lastRouted.key === key && now - lastRouted.at < DUPLICATE_WINDOW_MS;
  lastRouted = { key, at: now };
  return duplicate;
}

function isContractor(): boolean {
  return useAppStore.getState().role === "contractor";
}

function appLinkOf(data: NonNullable<PushData>): string | null {
  const appLink = data.appLink;
  return typeof appLink === "string" && appLink.startsWith("/") && appLink !== "/"
    ? appLink
    : null;
}

export function resolvePushRoutes(data: NonNullable<PushData>): string[] {
  const type = data.type ?? "";
  const appLink = appLinkOf(data);

  if (CHAT_TYPES.has(type)) {
    if (data.threadId) {
      return [`/chat?threadId=${encodeURIComponent(data.threadId)}`];
    }
    return [appLink ?? "/chats"];
  }

  switch (type) {
    case "loyalty_coins_earned":
    case "coin_admin_adjustment":
      return ["/shop", "/earn-coins"];
    case "new_project":
      return data.projectId
        ? [`/request/${encodeURIComponent(data.projectId)}`]
        : ["/home?mode=contractor"];
    case "inactivity_reminder":
      return isContractor()
        ? ["/home?mode=contractor"]
        : ["/home?mode=homeowner", NEW_REQUEST_PATH];
    case "friend_request":
    case "friend_added":
      return ["/friends"];
    case "shop_order":
      return ["/shop-orders"];
    default:
      return [appLink ?? "/home"];
  }
}

function isTabPath(path: string): boolean {
  return TAB_PATHS.has(path.split("?")[0]);
}

function navigate(routes: string[]): void {
  routes.forEach((path) => {
    if (path === NEW_REQUEST_PATH) useProjectDraftStore.getState().reset();
    if (isTabPath(path)) router.navigate(toHref(path));
    else router.push(toHref(path));
  });
}

export function setPushNavigationReady(ready: boolean): void {
  navigationReady = ready;
  if (!ready || !pendingRoutes) return;
  const routes = pendingRoutes;
  pendingRoutes = null;
  navigate(routes);
}

export function routeFromPushData(data: PushData): void {
  if (!data) return;
  if (isDuplicate(data)) return;
  const routes = resolvePushRoutes(data);
  if (!navigationReady) {
    pendingRoutes = routes;
    return;
  }
  navigate(routes);
}
