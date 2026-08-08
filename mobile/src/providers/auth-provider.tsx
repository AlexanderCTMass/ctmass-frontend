import { type ReactNode, useEffect } from "react";
import { onAuthStateChanged, type User } from "@react-native-firebase/auth";

import { getFirebaseAuth } from "@/lib/firebase";
import { ensureProfile } from "@/lib/profile";
import { mapOnboardingRole } from "@/lib/roles";
import { useAppStore } from "@/store/use-app-store";
import {
  type AuthProvider as Provider,
  useAuthStore,
} from "@/store/use-auth-store";
import { useProjectDraftStore } from "@/store/use-project-draft-store";

function resolveProvider(user: User): Provider {
  const providerId = user.providerData[0]?.providerId ?? "";
  if (providerId.includes("google")) return "google";
  if (providerId.includes("apple")) return "apple";
  return "email";
}

async function handleUser(user: User): Promise<void> {
  const role = mapOnboardingRole(useAppStore.getState().role);
  const draftStore = useProjectDraftStore.getState();
  const provider = resolveProvider(user);

  try {
    const { profile, created } = await ensureProfile(user, role, {
      specialty: draftStore.specialty,
      description: draftStore.name,
      location: draftStore.location,
    });

    if (created && draftStore.specialty) {
      draftStore.reset();
    }

    useAuthStore.getState().signIn({
      uid: user.uid,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      provider,
    });
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

export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (user) => {
      if (!user) {
        useAuthStore.getState().signOut();
        return;
      }
      void handleUser(user);
    });

    return unsubscribe;
  }, []);

  return <>{children}</>;
}
