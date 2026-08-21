import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { persistedStorage } from "@/lib/storage";
import type { Role } from "@/lib/roles";

export type AuthProvider = "email" | "google" | "apple";

export type AuthUser = {
  uid: string;
  email: string;
  name: string;
  role: Role | null;
  provider: AuthProvider;
};

type AuthState = {
  isAuthenticated: boolean;
  isInitializing: boolean;
  user: AuthUser | null;
  signIn: (user: AuthUser) => void;
  signOut: () => void;
  setInitializing: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isInitializing: true,
      user: null,
      signIn: (user) =>
        set({ isAuthenticated: true, user, isInitializing: false }),
      signOut: () =>
        set({ isAuthenticated: false, user: null, isInitializing: false }),
      setInitializing: (value) => set({ isInitializing: value }),
    }),
    {
      name: "ctmass.auth-state",
      storage: createJSONStorage(() => persistedStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    },
  ),
);
