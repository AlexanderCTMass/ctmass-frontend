import { useProfile } from "@/queries/use-profile";
import { useTradeByOwner } from "@/queries/use-trade";

export function useMyCenter(uid: string | undefined): [number, number] | null {
  const profile = useProfile(uid);
  const trade = useTradeByOwner(uid);
  return profile.data?.location?.center ?? trade.data?.center ?? null;
}
