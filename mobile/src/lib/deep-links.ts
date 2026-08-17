import * as Linking from "expo-linking";

let pendingInviterRef: string | null = null;

export function setPendingInviterRef(ref: string): void {
  pendingInviterRef = ref;
}

export function consumePendingInviterRef(): string | null {
  const ref = pendingInviterRef;
  pendingInviterRef = null;
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
