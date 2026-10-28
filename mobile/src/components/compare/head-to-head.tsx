import { Pressable, ScrollView, Text, View } from "react-native";

import { CheckIcon } from "@/components/icons";
import {
  type CompareRanks,
  useCompareColors,
} from "@/components/compare/compare-card";
import { ToggleRow } from "@/components/trade/form-parts";
import { TierPill } from "@/components/trade/tier-badge";
import { Avatar } from "@/components/ui/avatar";
import {
  Brand,
  Radius,
  Spacing,
  makeStyles,
  useTheme,
} from "@/constants/theme";
import {
  type CompareRow,
  isMutedValue,
  leadsCount,
} from "@/lib/compare-metrics";
import { useT } from "@/lib/i18n";
import type { Specialist } from "@/lib/trades";

function ColumnHead({
  trade,
  other,
  canSwap,
  onSwap,
  onOpen,
}: {
  trade: Specialist;
  other: Specialist;
  canSwap: boolean;
  onSwap: () => void;
  onOpen: () => void;
}) {
  const styles = useStyles();
  const { t } = useT();
  const { colors } = useTheme();
  const lead = leadsCount(trade, other);
  const ahead = lead.total > 0 && lead.wins * 2 > lead.total;
  return (
    <View style={[styles.head, ahead && styles.headAhead]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          canSwap
            ? t("compare.swapA11y", { name: trade.name })
            : t("compare.openA11y", { name: trade.name })
        }
        onPress={canSwap ? onSwap : onOpen}
        style={styles.headTap}
      >
        <Avatar name={trade.name} url={trade.avatarUrl || null} size={50} />
        <Text style={styles.headName} numberOfLines={2}>
          {trade.name}
        </Text>
        <TierPill years={trade.details.experienceYears} small />
      </Pressable>
      {lead.total > 0 ? (
        <Text
          style={[
            styles.lead,
            { color: ahead ? colors.accent : colors.textSecondary },
          ]}
        >
          {t("compare.leadsIn", { wins: lead.wins, total: lead.total })}
        </Text>
      ) : null}
      <Pressable accessibilityRole="button" hitSlop={8} onPress={onOpen}>
        <Text style={styles.view}>{t("compare.viewTrade")}</Text>
      </Pressable>
    </View>
  );
}

export function HeadToHead({
  left,
  right,
  ranks,
  distanceTo,
  rows,
  canSwap,
  differencesOnly,
  onDifferencesChange,
  onSwap,
  onOpen,
  onQuote,
}: {
  left: Specialist;
  right: Specialist;
  ranks: CompareRanks;
  distanceTo: (trade: Specialist) => number | null;
  rows: CompareRow[];
  canSwap: boolean;
  differencesOnly: boolean;
  onDifferencesChange: (next: boolean) => void;
  onSwap: (side: 0 | 1) => void;
  onOpen: (trade: Specialist) => void;
  onQuote: (trade: Specialist) => void;
}) {
  const styles = useStyles();
  const { t } = useT();
  const tones = useCompareColors();
  const pair = [left, right];

  return (
    <View style={styles.wrap}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heads}>
          <ColumnHead
            trade={left}
            other={right}
            canSwap={canSwap}
            onSwap={() => onSwap(0)}
            onOpen={() => onOpen(left)}
          />
          <ColumnHead
            trade={right}
            other={left}
            canSwap={canSwap}
            onSwap={() => onSwap(1)}
            onOpen={() => onOpen(right)}
          />
          <View pointerEvents="none" style={styles.vs}>
            <Text style={styles.vsText}>{t("compare.vs")}</Text>
          </View>
        </View>

        {canSwap ? (
          <Text style={styles.hint}>{t("compare.swapHint")}</Text>
        ) : null}

        <ToggleRow
          label={t("compare.differencesOnly")}
          value={differencesOnly}
          onChange={onDifferencesChange}
        />

        <View style={styles.table}>
          {rows.length === 0 ? (
            <Text style={styles.same}>{t("compare.same")}</Text>
          ) : (
            rows.map((row, index) => {
              const ranked = row.metric ? ranks[row.metric] : null;
              return (
                <View
                  key={row.key}
                  style={[styles.row, index > 0 && styles.rowBorder]}
                >
                  <Text style={styles.rowLabel}>{row.label(t)}</Text>
                  <View style={styles.cells}>
                    {pair.map((trade) => {
                      const value = row.value(trade, distanceTo(trade), t);
                      const win = ranked?.get(trade.tradeId)?.best === true;
                      const muted = isMutedValue(value, t);
                      return (
                        <View
                          key={trade.tradeId}
                          style={[
                            styles.cell,
                            win && { backgroundColor: tones.winBackground },
                          ]}
                        >
                          <Text
                            style={[
                              styles.cellText,
                              win && styles.cellWin,
                              muted && styles.cellMuted,
                            ]}
                            numberOfLines={4}
                          >
                            {value}
                          </Text>
                          {win ? (
                            <CheckIcon
                              size={14}
                              color={tones.winText}
                              strokeWidth={3}
                            />
                          ) : null}
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })
          )}
        </View>

        <Text style={styles.note}>{t("compare.note")}</Text>
      </ScrollView>

      <View style={styles.footer}>
        {pair.map((trade, index) => (
          <Pressable
            key={trade.tradeId}
            accessibilityRole="button"
            onPress={() => onQuote(trade)}
            style={({ pressed }) => [
              styles.quote,
              index === 0 ? styles.quotePrimary : styles.quoteSecondary,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.quoteText,
                index === 0
                  ? styles.quoteTextPrimary
                  : styles.quoteTextSecondary,
              ]}
              numberOfLines={1}
            >
              {t("compare.quoteName", { name: trade.name.split(" ")[0] })}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  heads: {
    flexDirection: "row",
    gap: 10,
  },
  head: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.lg,
    backgroundColor: t.colors.card,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  headAhead: {
    borderWidth: 2,
    borderColor: Brand.primary,
  },
  headTap: {
    alignItems: "center",
    gap: 4,
  },
  headName: {
    color: t.colors.text,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  lead: {
    fontSize: 11.5,
    fontWeight: "700",
    marginTop: 2,
  },
  view: {
    color: t.colors.accent,
    fontSize: 12.5,
    fontWeight: "700",
    paddingVertical: 2,
  },
  vs: {
    position: "absolute",
    left: "50%",
    top: 34,
    width: 34,
    height: 34,
    marginLeft: -17,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.colors.textStrong,
    borderWidth: 2,
    borderColor: t.colors.card,
  },
  vsText: {
    color: t.colors.card,
    fontSize: 11,
    fontWeight: "900",
  },
  hint: {
    color: t.colors.textMuted,
    fontSize: 12,
    textAlign: "center",
  },
  table: {
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: t.colors.card,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  same: {
    color: t.colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    paddingVertical: Spacing.base,
  },
  row: {
    paddingVertical: 10,
    gap: 6,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
  },
  rowLabel: {
    color: t.colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
    textAlign: "center",
    textTransform: "uppercase",
  },
  cells: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  cell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minHeight: 36,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 12,
  },
  cellText: {
    flexShrink: 1,
    color: t.colors.textSecondary,
    fontSize: 13.5,
    fontWeight: "600",
    textAlign: "center",
  },
  cellWin: {
    color: t.colors.text,
    fontWeight: "800",
  },
  cellMuted: {
    color: t.colors.textMuted,
  },
  note: {
    color: t.colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  quote: {
    flex: 1,
    height: 52,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.sm,
  },
  quotePrimary: {
    backgroundColor: Brand.primaryDark,
  },
  quoteSecondary: {
    borderWidth: 1.5,
    borderColor: t.colors.accent,
    backgroundColor: t.colors.card,
  },
  quoteText: {
    fontSize: 14,
    fontWeight: "800",
  },
  quoteTextPrimary: {
    color: "#FFFFFF",
  },
  quoteTextSecondary: {
    color: t.colors.accent,
  },
  pressed: {
    opacity: 0.75,
  },
}));
