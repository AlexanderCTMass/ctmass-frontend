import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { GeoPlace } from "@/lib/mapbox";
import { persistedStorage } from "@/lib/storage";

export type TradeDraft = {
  title: string;
  specialty: string | null;
  location: GeoPlace | null;
  commuteDuration: number;
  about: string;
  priceType: string;
  price: string;
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
  commuteDuration: 20,
  about: "",
  priceType: "",
  price: "",
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
