import { Alert } from "react-native";

import {
  type TradeActionSource,
  analyticsEvents,
} from "@/lib/analytics-events";
import { selectFeedback, warningFeedback } from "@/lib/haptics";
import { MAX_COMPARE, useCompareStore } from "@/store/use-compare-store";
import i18n from "@/lib/i18n";

export function useCompare(source: TradeActionSource) {
  const tradeIds = useCompareStore((state) => state.tradeIds);
  const toggleStore = useCompareStore((state) => state.toggle);

  const toggle = (tradeId: string) => {
    const result = toggleStore(tradeId);
    const count = useCompareStore.getState().tradeIds.length;
    analyticsEvents.compareToggled({
      trade_id: tradeId,
      action: result,
      count,
      source,
    });
    if (result === "full") {
      warningFeedback();
      Alert.alert(
        i18n.t("contact.compareFullTitle", { count: MAX_COMPARE }),
        i18n.t("contact.compareFullText"),
      );
      return;
    }
    selectFeedback();
  };

  return {
    tradeIds,
    count: tradeIds.length,
    isCompared: (tradeId: string) => tradeIds.includes(tradeId),
    toggle,
  };
}
