import { create } from "zustand";

export type EarnEvent = { amount: number; gap: number };

type LoyaltyState = {
  balance: number;
  minShopPrice: number;
  earn: EarnEvent | null;
  setBalance: (value: number) => void;
  setMinShopPrice: (value: number) => void;
  showEarn: (event: EarnEvent) => void;
  clearEarn: () => void;
};

export const useLoyaltyStore = create<LoyaltyState>((set) => ({
  balance: 0,
  minShopPrice: 0,
  earn: null,
  setBalance: (balance) => set({ balance }),
  setMinShopPrice: (minShopPrice) => set({ minShopPrice }),
  showEarn: (earn) => set({ earn }),
  clearEarn: () => set({ earn: null }),
}));
