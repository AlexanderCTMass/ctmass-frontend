import { doc, onSnapshot } from "@react-native-firebase/firestore";

import { getDb } from "@/lib/firebase";

export function subscribeBalance(
  uid: string,
  onChange: (balance: number) => void,
): () => void {
  const db = getDb();
  return onSnapshot(
    doc(db, "profiles", uid),
    (snapshot) => {
      if (!snapshot) return;
      const data = snapshot.exists() ? snapshot.data() : undefined;
      const raw: unknown = data?.loyaltyBalance;
      onChange(typeof raw === "number" ? raw : 0);
    },
    (error) => {
      console.warn("subscribeBalance error", error);
    },
  );
}
