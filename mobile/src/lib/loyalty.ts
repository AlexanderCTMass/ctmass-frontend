import { doc, onSnapshot } from "@react-native-firebase/firestore";

import { getDb } from "@/lib/firebase";

export type CoinNotice = {
  id: string;
  amount: number;
  reason: string;
  createdAt: number;
};

function latestCoinNotice(list: unknown): CoinNotice | null {
  if (!Array.isArray(list)) return null;
  let latest: CoinNotice | null = null;
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    if (record.type !== "loyalty_coins_earned") continue;
    const createdAt =
      typeof record.createdAt === "number" ? record.createdAt : 0;
    if (latest && createdAt <= latest.createdAt) continue;
    latest = {
      id: typeof record.id === "string" ? record.id : String(createdAt),
      amount: typeof record.amount === "number" ? record.amount : 0,
      reason: typeof record.reason === "string" ? record.reason : "",
      createdAt,
    };
  }
  return latest;
}

export function subscribeBalance(
  uid: string,
  onChange: (balance: number, notice: CoinNotice | null) => void,
): () => void {
  const db = getDb();
  return onSnapshot(
    doc(db, "profiles", uid),
    (snapshot) => {
      if (!snapshot) return;
      const data = snapshot.exists() ? snapshot.data() : undefined;
      const raw: unknown = data?.loyaltyBalance;
      onChange(
        typeof raw === "number" ? raw : 0,
        latestCoinNotice(data?.notificationList),
      );
    },
    (error) => {
      console.warn("subscribeBalance error", error);
    },
  );
}
