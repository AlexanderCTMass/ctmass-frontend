import type { User } from "@react-native-firebase/auth";
import {
  addDoc,
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from "@react-native-firebase/firestore";

import { getDb } from "@/lib/firebase";
import { type Role, Roles } from "@/lib/roles";

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

export type ProjectDraftInput = {
  specialty: string | null;
  description: string | null;
  location: string | null;
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
  draft?: ProjectDraftInput,
): Promise<EnsureProfileResult> {
  const db = getDb();
  const ref = doc(db, "profiles", user.uid);
  const displayName = user.displayName || user.email || "CTMASS user";

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
    tx.set(ref, { ...profile, registrationAt: serverTimestamp() });
    return true;
  });

  if (created && role === Roles.CUSTOMER && draft?.specialty) {
    try {
      await createProjectFromDraft(profile, draft);
    } catch {
      // non-fatal: the profile exists, the project can be added later on web
    }
  }

  return { profile, created };
}

async function createProjectFromDraft(
  profile: Profile,
  draft: ProjectDraftInput,
): Promise<void> {
  const db = getDb();
  await addDoc(collection(db, "projects"), {
    title: draft.specialty,
    specialtyLabel: draft.specialty,
    specialtyId: null,
    description: draft.description ?? "",
    location: draft.location ? { place_name: draft.location } : null,
    projectMaximumBudget: null,
    userId: profile.id,
    customerName: profile.name,
    customerMail: profile.email,
    customerAvatar: profile.avatar,
    state: "draft",
    source: "mobile",
    createdAt: new Date(),
  });
}
