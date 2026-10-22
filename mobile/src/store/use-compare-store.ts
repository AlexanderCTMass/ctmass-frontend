import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { persistedStorage } from "@/lib/storage";

export const MAX_COMPARE = 5;

export type CompareToggleResult = "added" | "removed" | "full";

type CompareState = {
  tradeIds: string[];
  toggle: (tradeId: string) => CompareToggleResult;
  remove: (tradeId: string) => void;
  clear: () => void;
};

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      tradeIds: [],
      toggle: (tradeId) => {
        const current = get().tradeIds;
        if (current.includes(tradeId)) {
          set({ tradeIds: current.filter((id) => id !== tradeId) });
          return "removed";
        }
        if (current.length >= MAX_COMPARE) return "full";
        set({ tradeIds: [...current, tradeId] });
        return "added";
      },
      remove: (tradeId) =>
        set({ tradeIds: get().tradeIds.filter((id) => id !== tradeId) }),
      clear: () => set({ tradeIds: [] }),
    }),
    {
      name: "ctmass.compare",
      storage: createJSONStorage(() => persistedStorage),
      partialize: (state) => ({ tradeIds: state.tradeIds }),
    },
  ),
);
