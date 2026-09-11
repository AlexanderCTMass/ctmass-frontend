import { type ReactNode, useEffect } from "react";
import {
  onAuthStateChanged,
  signInAnonymously,
} from "@react-native-firebase/auth";

import { getFirebaseAuth } from "@/lib/firebase";
import { applyFirebaseUser } from "@/lib/session";
import { useAuthStore } from "@/store/use-auth-store";

export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        useAuthStore.getState().signOut();
        void signInAnonymously(auth).catch(() => {
          // retried on next auth state change / app start
        });
        return;
      }
      void applyFirebaseUser(user);
    });

    return unsubscribe;
  }, []);

  return <>{children}</>;
}
