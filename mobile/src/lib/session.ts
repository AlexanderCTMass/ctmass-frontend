import type { User } from "@react-native-firebase/auth";

import { consumePendingInviterRef } from "@/lib/deep-links";
import { acceptInviteFromRef, acceptPendingInvitesForUser } from "@/lib/friends";
import { ensureProfile } from "@/lib/profile";
import { mapOnboardingRole } from "@/lib/roles";
import { useAppStore } from "@/store/use-app-store";
import {
  type AuthProvider as Provider,
  useAuthStore,
} from "@/store/use-auth-store";

function resolveProvider(user: User): Provider {
  const providerId = user.providerData[0]?.providerId ?? "";
  if (providerId.includes("google")) return "google";
  if (providerId.includes("apple")) return "apple";
  return "email";
}

export async function applyFirebaseUser(user: User): Promise<void> {
  if (user.isAnonymous) {
    useAuthStore.getState().signInGuest({
      uid: user.uid,
      email: "",
      name: "Guest",
      role: mapOnboardingRole(useAppStore.getState().role),
      provider: "guest",
    });
    return;
  }

  const role = mapOnboardingRole(useAppStore.getState().role);
  const provider = resolveProvider(user);

  try {
    const { profile } = await ensureProfile(user, role);

    useAuthStore.getState().signIn({
      uid: user.uid,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      provider,
    });

    void acceptPendingInvitesForUser(user.uid, profile.email || user.email);
    const inviterRef = consumePendingInviterRef();
    if (inviterRef) void acceptInviteFromRef(user.uid, inviterRef);
  } catch {
    useAuthStore.getState().signIn({
      uid: user.uid,
      email: user.email ?? "",
      name: user.displayName ?? user.email ?? "CTMASS user",
      role: null,
      provider,
    });
  }
}
