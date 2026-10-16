import * as Linking from "expo-linking";

import { storage } from "@/lib/storage";

const PENDING_INVITER_KEY = "ctmass.pending-inviter";
const PENDING_REFERRER_KEY = "ctmass.pending-referrer";
const REFERRER_TTL_MS = 30 * 24 * 60 * 60 * 1000;

type PendingReferrer = { uid: string; at: number };

export function setPendingReferrer(uid: string): void {
  const value = uid.trim();
  if (!value) return;
  const entry: PendingReferrer = { uid: value, at: Date.now() };
  storage.set(PENDING_REFERRER_KEY, JSON.stringify(entry));
}

export function peekPendingReferrer(): string | null {
  const raw = storage.getString(PENDING_REFERRER_KEY);
  if (!raw) return null;
  try {
    const entry = JSON.parse(raw) as Partial<PendingReferrer>;
    if (
      typeof entry.uid === "string" &&
      entry.uid &&
      typeof entry.at === "number" &&
      Date.now() - entry.at < REFERRER_TTL_MS
    ) {
      return entry.uid;
    }
  } catch {
    storage.remove(PENDING_REFERRER_KEY);
    return null;
  }
  storage.remove(PENDING_REFERRER_KEY);
  return null;
}

export function clearPendingReferrer(): void {
  storage.remove(PENDING_REFERRER_KEY);
}

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
