import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { GeoPlace } from "@/lib/mapbox";
import type { TradeDetailsInput } from "@/lib/trade-details";
import type { TradeContactInput } from "@/lib/user-profile";
import { persistedStorage } from "@/lib/storage";

export type TradeDraft = {
  title: string;
  specialty: string | null;
  location: GeoPlace | null;
  about: string;
  details: TradeDetailsInput | null;
  contact: TradeContactInput | null;
  createdTradeId: string | null;
};

type TradeDraftState = TradeDraft & {
  patch: (values: Partial<TradeDraft>) => void;
  setCreatedTradeId: (id: string) => void;
  reset: () => void;
};

const initial: TradeDraft = {
  title: "",
  specialty: null,
  location: null,
  about: "",
  details: null,
  contact: null,
  createdTradeId: null,
};

export const useTradeDraftStore = create<TradeDraftState>()(
  persist(
    (set) => ({
      ...initial,
      patch: (values) => set(values),
      setCreatedTradeId: (id) => set({ createdTradeId: id }),
      reset: () => set(initial),
    }),
    {
      name: "ctmass.trade-draft",
      storage: createJSONStorage(() => persistedStorage),
    },
  ),
);
