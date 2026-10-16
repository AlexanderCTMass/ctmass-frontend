import type { User } from "@react-native-firebase/auth";
import {
  doc,
  runTransaction,
  serverTimestamp,
} from "@react-native-firebase/firestore";

import { getDb } from "@/lib/firebase";
import type { Role } from "@/lib/roles";

export type Profile = {
  id: string;
  avatar: string | null;
  name: string;
  email: string;
  businessName: string;
  profilePage: string;
  emailVerified: boolean;
  phone: string | null;
  plan: string;
  role: Role;
  notifications: string[];
  notificationList: unknown[];
  source: string;
};

export type EnsureProfileResult = {
  profile: Profile;
  created: boolean;
};

function slugify(value: string): string {
  return value
    .replace(/[^a-z0-9_]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export async function ensureProfile(
  user: User,
  role: Role,
  invitedBy?: string | null,
): Promise<EnsureProfileResult> {
  const db = getDb();
  const ref = doc(db, "profiles", user.uid);
  const emailName = (user.email ?? "").split("@")[0]?.trim() ?? "";
  const displayName = user.displayName || emailName || "CTMASS user";

  const profile: Profile = {
    id: user.uid,
    avatar: user.photoURL ?? null,
    name: displayName,
    email: user.email ?? "",
    businessName: displayName,
    profilePage: slugify(displayName),
    emailVerified: user.emailVerified ?? false,
    phone: user.phoneNumber ?? null,
    plan: "Base",
    role,
    notifications: ["EVENTS_NOTIFICATIONS"],
    notificationList: [],
    source: "mobile",
  };

  const created = await runTransaction(db, async (tx) => {
    const existing = await tx.get(ref);
    if (existing.exists()) return false;
    const referral =
      invitedBy && invitedBy !== user.uid
        ? { invitedBy, invitedVia: "profile_link" }
        : {};
    tx.set(ref, {
      ...profile,
      ...referral,
      registrationAt: serverTimestamp(),
    });
    return true;
  });

  return { profile, created };
}
