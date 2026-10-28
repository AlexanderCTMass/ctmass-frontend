import { Text, View } from "react-native";

import { CheckIcon } from "@/components/icons";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { translateKey, useT } from "@/lib/i18n";
import { tradeCompleteness } from "@/lib/trade-details";
import type { TradeProfile } from "@/lib/trades";

export function TradeCompleteness({
  trade,
  portfolioCount,
}: {
  trade: TradeProfile;
  portfolioCount?: number;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useT();
  const items = tradeCompleteness(trade.details, {
    about: trade.about,
    portfolioCount,
  });
  const done = items.filter((item) => item.done).length;
  const missing = items.filter((item) => !item.done);
  if (missing.length === 0) return null;
  return (
    <View style={styles.card}>
      <View style={styles.headRow}>
        <Text style={styles.title}>{t("trade.completeness.title")}</Text>
        <Text style={styles.percent}>
          {Math.round((done / items.length) * 100)}%
        </Text>
      </View>
      <ProgressBar progress={done / items.length} />
      <Text style={styles.hint}>{t("trade.completeness.hint")}</Text>
      <View style={styles.list}>
        {missing.map((item) => (
          <View key={item.key} style={styles.item}>
            <View style={styles.dot}>
              <CheckIcon size={10} color={colors.textMuted} strokeWidth={3} />
            </View>
            <Text style={styles.itemText}>
              {translateKey(t, `trade.completeness.items.${item.key}`)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  card: {
    marginTop: Spacing.md,
    padding: Spacing.base,
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    backgroundColor: t.colors.card,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  headRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: t.colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  percent: {
    color: t.colors.accent,
    fontSize: 15,
    fontWeight: "800",
  },
  hint: {
    color: t.colors.textSecondary,
    fontSize: 12.5,
  },
  list: {
    gap: 6,
    marginTop: 2,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: t.colors.borderStrong,
  },
  itemText: {
    color: t.colors.textSecondary,
    fontSize: 13.5,
    fontWeight: "600",
  },
}));
