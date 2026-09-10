import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { persistedStorage } from "@/lib/storage";
import type { Role } from "@/lib/roles";

export type AuthProvider = "email" | "google" | "apple" | "guest";

export type AuthUser = {
  uid: string;
  email: string;
  name: string;
  role: Role | null;
  provider: AuthProvider;
};

type AuthState = {
  isAuthenticated: boolean;
  isGuest: boolean;
  isInitializing: boolean;
  user: AuthUser | null;
  signIn: (user: AuthUser) => void;
  signInGuest: (user: AuthUser) => void;
  signOut: () => void;
  setInitializing: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isGuest: false,
      isInitializing: true,
      user: null,
      signIn: (user) =>
        set({
          isAuthenticated: true,
          isGuest: false,
          user,
          isInitializing: false,
        }),
      signInGuest: (user) =>
        set({
          isAuthenticated: false,
          isGuest: true,
          user,
          isInitializing: false,
        }),
      signOut: () =>
        set({
          isAuthenticated: false,
          isGuest: false,
          user: null,
          isInitializing: false,
        }),
      setInitializing: (value) => set({ isInitializing: value }),
    }),
    {
      name: "ctmass.auth-state",
      storage: createJSONStorage(() => persistedStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        isGuest: state.isGuest,
        user: state.user,
      }),
    },
  ),
);
