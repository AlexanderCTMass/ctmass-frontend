import type { User } from "@react-native-firebase/auth";
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from "@react-native-firebase/firestore";
import { Platform } from "react-native";

import { getDb } from "@/lib/firebase";
import { findEmailInviter } from "@/lib/friends";
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
  platform: string;
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
    platform: Platform.OS,
  };

  let referral: { invitedBy: string; invitedVia: string } | null =
    invitedBy && invitedBy !== user.uid
      ? { invitedBy, invitedVia: "profile_link" }
      : null;
  if (!referral) {
    const snapshot = await getDoc(ref);
    if (snapshot.exists()) return { profile, created: false };
    const emailInviter = await findEmailInviter(user.uid, user.email);
    if (emailInviter) {
      referral = { invitedBy: emailInviter, invitedVia: "email_invite" };
    }
  }

  const created = await runTransaction(db, async (tx) => {
    const existing = await tx.get(ref);
    if (existing.exists()) return false;
    tx.set(ref, {
      ...profile,
      ...referral,
      registrationAt: serverTimestamp(),
    });
    return true;
  });

  return { profile, created };
}
