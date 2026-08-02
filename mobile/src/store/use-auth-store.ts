import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { persistedStorage } from "@/lib/storage";

export type AuthProvider = "email" | "google";

export type AuthUser = {
  email: string;
  provider: AuthProvider;
};

type AuthState = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  signIn: (user: AuthUser) => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      signIn: (user) => set({ isAuthenticated: true, user }),
      signOut: () => set({ isAuthenticated: false, user: null }),
    }),
    {
      name: "ctmass.auth-state",
      storage: createJSONStorage(() => persistedStorage),
    },
  ),
);
