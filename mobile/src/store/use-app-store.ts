import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { persistedStorage } from "@/lib/storage";

export type UserRole = "homeowner" | "contractor";

type AppState = {
  role: UserRole | null;
  hasCompletedOnboarding: boolean;
  completeOnboarding: (role: UserRole) => void;
  resetOnboarding: () => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      role: null,
      hasCompletedOnboarding: false,
      completeOnboarding: (role) => set({ role, hasCompletedOnboarding: true }),
      resetOnboarding: () => set({ role: null, hasCompletedOnboarding: false }),
    }),
    {
      name: "ctmass.app-state",
      storage: createJSONStorage(() => persistedStorage),
    },
  ),
);
