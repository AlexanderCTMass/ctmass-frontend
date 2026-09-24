import type { User } from "@react-native-firebase/auth";

import { identifyUser } from "@/lib/analytics";
import { consumePendingInviterRef } from "@/lib/deep-links";
import {
  acceptInviteFromRef,
  acceptPendingInvitesForUser,
} from "@/lib/friends";
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
    const role = mapOnboardingRole(useAppStore.getState().role);
    identifyUser({ uid: user.uid, role, provider: "guest", isAnonymous: true });
    useAuthStore.getState().signInGuest({
      uid: user.uid,
      email: "",
      name: "Guest",
      role,
      provider: "guest",
    });
    return;
  }

  const role = mapOnboardingRole(useAppStore.getState().role);
  const provider = resolveProvider(user);
  identifyUser({ uid: user.uid, role, provider, isAnonymous: false });

  try {
    const { profile } = await ensureProfile(user, role);

    if (profile.role !== role) {
      identifyUser({
        uid: user.uid,
        role: profile.role,
        provider,
        isAnonymous: false,
      });
    }

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
