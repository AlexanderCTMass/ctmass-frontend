import * as Linking from "expo-linking";

import { storage } from "@/lib/storage";

const PENDING_INVITER_KEY = "ctmass.pending-inviter";

export function setPendingInviterRef(ref: string): void {
  const value = ref.trim();
  if (value) storage.set(PENDING_INVITER_KEY, value);
}

export function clearPendingInviterRef(): void {
  storage.remove(PENDING_INVITER_KEY);
}

export function consumePendingInviterRef(): string | null {
  const ref = storage.getString(PENDING_INVITER_KEY) ?? null;
  if (ref) storage.remove(PENDING_INVITER_KEY);
  return ref;
}

// Extracts an invite ref (?ref=<inviterId>) from an app or universal link.
export function parseInviteRef(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = Linking.parse(url);
    const ref = parsed.queryParams?.ref;
    if (typeof ref === "string" && ref.trim()) return ref.trim();
  } catch {
    // ignore malformed urls
  }
  return null;
}
