import type { Href } from "expo-router";

export function toHref(path: string): Href {
  return path as Href;
}

export function chatHref(
  threadId: string,
  peerName?: string | null,
  peerAvatar?: string | null,
): Href {
  const params = new URLSearchParams({ threadId });
  if (peerName) params.set("peerName", peerName);
  if (peerAvatar) params.set("peerAvatar", peerAvatar);
  return `/chat?${params.toString()}` as Href;
}
