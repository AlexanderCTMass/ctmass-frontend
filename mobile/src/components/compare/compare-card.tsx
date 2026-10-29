import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

import { CheckIcon, TradeGroupIcon } from "@/components/icons";
import { shortPlace } from "@/components/project/project-card";
import { TierPill } from "@/components/trade/tier-badge";
import { Avatar } from "@/components/ui/avatar";
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import {
  CARD_ROWS,
  type MetricKey,
  type MetricRank,
  isMutedValue,
  rankLabelText,
} from "@/lib/compare-metrics";
import { formatMiles } from "@/lib/geo";
import { useT } from "@/lib/i18n";
import type { Specialist } from "@/lib/trades";

export type CompareRanks = Record<MetricKey, Map<string, MetricRank>>;

export function useCompareColors() {
  const { isDark, colors } = useTheme();
  return {
    winBackground: isDark ? "rgba(63,199,154,0.16)" : "#DDF3E6",
    winText: colors.accent,
    neutralBackground: colors.track,
  };
}

export function CompareCard({
  trade,
  ranks,
  distance,
  position,
  total,
  photoHeight,
  compact = false,
  onOpen,
}: {
  trade: Specialist;
  ranks: CompareRanks;
  distance: number | null;
  position: number;
  total: number;
  photoHeight: number;
  compact?: boolean;
  onOpen: () => void;
}) {
  const styles = useStyles();
  const { t, tx } = useT();
  const { colors } = useTheme();
  const tones = useCompareColors();
  const place = trade.placeName ? shortPlace(trade.placeName) : "";
  const meta = [tx(trade.specialtyLabel), place, formatMiles(distance)]
    .filter(Boolean)
    .join(" · ");

  return (
    <View style={styles.card}>
      <View style={[styles.photo, { height: photoHeight }]}>
        {trade.coverUrl ? (
          <Image
            source={{ uri: trade.coverUrl }}
            style={styles.photoImage}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <TradeGroupIcon
            groupId={trade.details.groupId}
            size={44}
            color={colors.textMuted}
            strokeWidth={1.6}
          />
        )}
        <View style={styles.counter}>
          <Text style={styles.counterText}>
            {t("compare.position", { position, total })}
          </Text>
        </View>
        <View style={styles.avatarRing}>
          <Avatar name={trade.name} url={trade.avatarUrl || null} size={56} />
        </View>
        <View style={styles.photoTier}>
          <TierPill years={trade.details.experienceYears} />
        </View>
      </View>

      <View style={styles.identity}>
        <Text style={styles.name} numberOfLines={1}>
          {trade.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {meta}
        </Text>
        <Text style={styles.rating}>
          {trade.reviews > 0 ? (
            <>
              ★ {trade.rating.toFixed(1)}{" "}
              <Text style={styles.ratingCount}>
                ({t("compare.reviews", { count: trade.reviews })})
              </Text>
            </>
          ) : (
            <Text style={styles.ratingCount}>
              {t("compare.values.newOnCtmass")}
            </Text>
          )}
        </Text>
      </View>

      <View style={styles.rows}>
        {CARD_ROWS.map((row) => {
          const value = row.value(trade, distance, t);
          const rank = row.metric
            ? ranks[row.metric].get(trade.tradeId)
            : undefined;
          const muted = isMutedValue(value, t);
          const booleanMetric =
            row.metric === "license" || row.metric === "insurance";
          return (
            <View
              key={row.key}
              style={[styles.row, compact && styles.rowCompact]}
            >
              <Text style={styles.rowLabel} numberOfLines={1}>
                {row.label(t)}
              </Text>
              <Text
                style={[styles.rowValue, muted && styles.rowMuted]}
                numberOfLines={1}
              >
                {value}
              </Text>
              {booleanMetric && !muted ? (
                <CheckIcon size={16} color={tones.winText} strokeWidth={2.8} />
              ) : rank?.label ? (
                <View
                  style={[
                    styles.chip,
                    {
                      backgroundColor: rank.best
                        ? tones.winBackground
                        : tones.neutralBackground,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: rank.best ? tones.winText : colors.textSecondary,
                      },
                    ]}
                  >
                    {rankLabelText(rank.label, t)}
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("compare.seeAllDetailsFor", { name: trade.name })}
        hitSlop={8}
        onPress={onOpen}
        style={styles.detailsLink}
      >
        <Text style={styles.detailsText}>{t("compare.seeAllDetails")}</Text>
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  card: {
    flex: 1,
    borderRadius: Radius.xl,
    overflow: "hidden",
    backgroundColor: t.colors.card,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  photo: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.colors.surfaceStrong,
  },
  photoImage: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  counter: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(4,19,11,0.55)",
  },
  counterText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  avatarRing: {
    position: "absolute",
    left: Spacing.base,
    bottom: -24,
    padding: 3,
    borderRadius: 34,
    backgroundColor: t.colors.card,
  },
  photoTier: {
    position: "absolute",
    left: 92,
    bottom: 10,
  },
  identity: {
    paddingTop: 30,
    paddingHorizontal: Spacing.base,
    gap: 2,
  },
  name: {
    color: t.colors.text,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  meta: {
    color: t.colors.textSecondary,
    fontSize: 13,
  },
  rating: {
    color: t.colors.text,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  ratingCount: {
    color: t.colors.textMuted,
    fontWeight: "500",
  },
  rows: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    minHeight: 36,
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
  },
  rowCompact: {
    minHeight: 29,
  },
  rowLabel: {
    width: 104,
    color: t.colors.textMuted,
    fontSize: 12.5,
  },
  rowValue: {
    flex: 1,
    color: t.colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  rowMuted: {
    color: t.colors.textMuted,
    fontWeight: "600",
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "800",
  },
  detailsLink: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  detailsText: {
    color: t.colors.accent,
    fontSize: 13,
    fontWeight: "700",
  },
}));
