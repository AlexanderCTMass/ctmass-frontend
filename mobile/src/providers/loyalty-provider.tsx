import { type ReactNode, useEffect, useRef } from "react";

import { EarnCoinsModal } from "@/components/shop/earn-coins-modal";
import { successFeedback } from "@/lib/haptics";
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

  const setEarnReason = useLoyaltyStore((state) => state.setEarnReason);

  const prevBalance = useRef<number | null>(null);
  const seenNotice = useRef<string | null>(null);

  useEffect(() => {
    if (!features) return;
    setMinShopPrice(minPaidPrice(features, role ?? null));
  }, [features, role, setMinShopPrice]);

  useEffect(() => {
    prevBalance.current = null;
    seenNotice.current = null;
    if (!uid) {
      setBalance(0);
      return;
    }
    const unsubscribe = subscribeBalance(uid, (balance, notice) => {
      setBalance(balance);
      const prev = prevBalance.current;
      prevBalance.current = balance;
      const freshReason =
        prev !== null && notice && notice.id !== seenNotice.current
          ? notice.reason
          : "";
      if (notice) seenNotice.current = notice.id;
      if (prev !== null && balance > prev) {
        const gap = Math.max(
          0,
          useLoyaltyStore.getState().minShopPrice - balance,
        );
        successFeedback();
        showEarn({ amount: balance - prev, gap, reason: freshReason });
      } else if (freshReason && !useLoyaltyStore.getState().earn?.reason) {
        setEarnReason(freshReason);
      }
    });
    return unsubscribe;
  }, [uid, setBalance, showEarn, setEarnReason]);

  return (
    <>
      {children}
      <EarnCoinsModal />
    </>
  );
}
