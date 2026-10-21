import { create } from "zustand";

export type EarnEvent = { amount: number; gap: number; reason: string };

type LoyaltyState = {
  balance: number;
  minShopPrice: number;
  earn: EarnEvent | null;
  setBalance: (value: number) => void;
  setMinShopPrice: (value: number) => void;
  showEarn: (event: EarnEvent) => void;
  setEarnReason: (reason: string) => void;
  clearEarn: () => void;
};

export const useLoyaltyStore = create<LoyaltyState>((set) => ({
  balance: 0,
  minShopPrice: 0,
  earn: null,
  setBalance: (balance) => set({ balance }),
  setMinShopPrice: (minShopPrice) => set({ minShopPrice }),
  showEarn: (earn) => set({ earn }),
  setEarnReason: (reason) =>
    set((state) => (state.earn ? { earn: { ...state.earn, reason } } : state)),
  clearEarn: () => set({ earn: null }),
}));
