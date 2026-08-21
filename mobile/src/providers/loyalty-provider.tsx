import { type ReactNode, useEffect, useRef } from "react";

import { EarnCoinsModal } from "@/components/shop/earn-coins-modal";
import { subscribeBalance } from "@/lib/loyalty";
import { minPaidPrice } from "@/lib/shop";
import { useShopFeatures } from "@/queries/use-shop";
import { useAuthStore } from "@/store/use-auth-store";
import { useLoyaltyStore } from "@/store/use-loyalty-store";

export function LoyaltyProvider({ children }: { children: ReactNode }) {
  const uid = useAuthStore((state) => state.user?.uid);
  const role = useAuthStore((state) => state.user?.role);
  const { data: features } = useShopFeatures();

  const setBalance = useLoyaltyStore((state) => state.setBalance);
  const setMinShopPrice = useLoyaltyStore((state) => state.setMinShopPrice);
  const showEarn = useLoyaltyStore((state) => state.showEarn);

  const prevBalance = useRef<number | null>(null);

  useEffect(() => {
    if (!features) return;
    setMinShopPrice(minPaidPrice(features, role ?? null));
  }, [features, role, setMinShopPrice]);

  useEffect(() => {
    prevBalance.current = null;
    if (!uid) {
      setBalance(0);
      return;
    }
    const unsubscribe = subscribeBalance(uid, (balance) => {
      setBalance(balance);
      const prev = prevBalance.current;
      prevBalance.current = balance;
      if (prev !== null && balance > prev) {
        const gap = Math.max(0, useLoyaltyStore.getState().minShopPrice - balance);
        showEarn({ amount: balance - prev, gap });
      }
    });
    return unsubscribe;
  }, [uid, setBalance, showEarn]);

  return (
    <>
      {children}
      <EarnCoinsModal />
    </>
  );
}
