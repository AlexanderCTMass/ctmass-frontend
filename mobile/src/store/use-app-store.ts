import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { persistedStorage } from "@/lib/storage";

export type UserRole = "homeowner" | "contractor";

type AppState = {
  role: UserRole | null;
  hasCompletedOnboarding: boolean;
  trackingConsent: boolean | null;
  setRole: (role: UserRole) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setTrackingConsent: (value: boolean) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      role: null,
      hasCompletedOnboarding: false,
      trackingConsent: null,
      setRole: (role) => set({ role }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      resetOnboarding: () => set({ role: null, hasCompletedOnboarding: false }),
      setTrackingConsent: (value) => set({ trackingConsent: value }),
    }),
    {
      name: "ctmass.app-state",
      storage: createJSONStorage(() => persistedStorage),
    },
  ),
);
