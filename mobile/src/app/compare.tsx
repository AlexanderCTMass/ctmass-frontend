import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CloseIcon, ScaleIcon } from "@/components/icons";
import { shortPlace } from "@/components/project/project-card";
import { TierAvatar } from "@/components/trade/tier-badge";
import { ToggleRow } from "@/components/trade/form-parts";
import { BackButton } from "@/components/ui/back-button";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import {
  RATE_BASIS_SHORT,
  crewSizeLabel,
  emergencyLabel,
  pricingModelLabel,
  responseShortLabel,
  warrantyLabel,
} from "@/constants/trade-options";
import { Brand, Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { publicPhone, useTradeContact } from "@/hooks/use-trade-contact";
import { analyticsEvents } from "@/lib/analytics-events";
import { yearsInBusiness } from "@/lib/business-profile";
import { distanceMiles, formatMiles } from "@/lib/geo";
import { tapFeedback } from "@/lib/haptics";
import { toHref } from "@/lib/navigation";
import { isCredentialCurrent } from "@/lib/trade-details";
import {
  availabilityLine,
  priceSubline,
  rateAmount,
  shortDate,
} from "@/lib/trade-display";
import type { Specialist } from "@/lib/trades";
import { useProfile } from "@/queries/use-profile";
import { useSpecialistsByIds } from "@/queries/use-swipes";
import { useAuthStore } from "@/store/use-auth-store";
import { MAX_COMPARE, useCompareStore } from "@/store/use-compare-store";

const LABEL_WIDTH = 116;
const COLUMN_WIDTH = 172;
const HEADER_HEIGHT = 156;
const NOT_PROVIDED = "Not provided";

type CompareRow = {
  key: string;
  label: string;
  height: number;
  value: (trade: Specialist, distance: number | null) => string;
};

function rateValue(trade: Specialist): string {
  const rates = trade.details.rates;
  if (!rates || rates.model === "not_provided") return NOT_PROVIDED;
  if (rates.model === "quote") return "Quote only";
  const amount = rateAmount(rates);
  if (!amount) return pricingModelLabel(rates.model);
  return `${amount} / ${RATE_BASIS_SHORT[rates.basis]}`;
}

function credentialValue(
  credential: Specialist["details"]["license"],
  withState: boolean,
): string {
  if (!credential) return NOT_PROVIDED;
  if (!isCredentialCurrent(credential)) return "Expired";
  const parts = ["Provided"];
  if (withState && credential.state) parts.push(credential.state);
  if (credential.expiresAt) parts.push(`thru ${shortDate(credential.expiresAt)}`);
  return parts.join(" · ");
}

const ROWS: CompareRow[] = [
  {
    key: "experience",
    label: "Years in this trade",
    height: 52,
    value: (trade) =>
      trade.details.experienceYears !== null
        ? `${trade.details.experienceYears} ${trade.details.experienceYears === 1 ? "year" : "years"}`
        : NOT_PROVIDED,
  },
  {
    key: "business",
    label: "Years in business",
    height: 52,
    value: (trade) => {
      const years = trade.owner ? yearsInBusiness(trade.owner.business) : null;
      return years !== null ? `${years} ${years === 1 ? "year" : "years"}` : NOT_PROVIDED;
    },
  },
  { key: "rate", label: "Rate", height: 64, value: rateValue },
  {
    key: "fees",
    label: "Minimum & service call",
    height: 64,
    value: (trade) => priceSubline(trade.details.rates) || NOT_PROVIDED,
  },
  {
    key: "emergency",
    label: "Emergency",
    height: 64,
    value: (trade) => {
      const availability = trade.details.availability;
      if (!availability || availability.emergency === "none") return "No emergency service";
      return [emergencyLabel(availability.emergency), trade.details.rates?.afterHours]
        .filter(Boolean)
        .join(" · ");
    },
  },
  {
    key: "license",
    label: "License",
    height: 64,
    value: (trade) => credentialValue(trade.details.license, true),
  },
  {
    key: "insurance",
    label: "Insurance",
    height: 64,
    value: (trade) => credentialValue(trade.details.insurance, false),
  },
  {
    key: "rating",
    label: "Rating & reviews",
    height: 52,
    value: (trade) =>
      trade.rating > 0
        ? `★ ${trade.rating.toFixed(1)} (${trade.reviews})`
        : "New on CTMASS",
  },
  {
    key: "jobs",
    label: "Jobs on CTMASS",
    height: 52,
    value: (trade) => (trade.completedProjects > 0 ? String(trade.completedProjects) : "None yet"),
  },
  {
    key: "services",
    label: "Services",
    height: 78,
    value: (trade) => trade.details.services.join(", ") || NOT_PROVIDED,
  },
  {
    key: "availability",
    label: "Availability",
    height: 64,
    value: (trade) => availabilityLine(trade.details.availability) || NOT_PROVIDED,
  },
  {
    key: "response",
    label: "Typical response",
    height: 64,
    value: (trade) => {
      const label = responseShortLabel(trade.details.responseTime);
      return label ? `${label} (set by contractor)` : "Not yet established";
    },
  },
  {
    key: "area",
    label: "Service area",
    height: 64,
    value: (trade, distance) => {
      const radius = trade.details.radiusMiles;
      const away = formatMiles(distance);
      const parts = [
        trade.placeName ? shortPlace(trade.placeName) : "",
        radius ? `+${radius} mi` : "",
      ].filter(Boolean);
      const area = parts.join(" ") || NOT_PROVIDED;
      return away ? `${area} · ${away} away` : area;
    },
  },
  {
    key: "crew",
    label: "Crew",
    height: 52,
    value: (trade) => {
      const business = trade.owner?.business;
      if (!business?.crewSize) return NOT_PROVIDED;
      return `${crewSizeLabel(business.crewSize)}${business.usesSubcontractors ? " · subs" : ""}`;
    },
  },
  {
    key: "warranty",
    label: "Warranty",
    height: 64,
    value: (trade) => {
      const policy = trade.details.workPolicy;
      return policy.warranty ? warrantyLabel(policy.warranty) : "Not specified";
    },
  },
  {
    key: "languages",
    label: "Languages",
    height: 52,
    value: (trade) => trade.owner?.business.languages.join(", ") || NOT_PROVIDED,
  },
  {
    key: "contact",
    label: "Contact options",
    height: 52,
    value: (trade) =>
      ["Message", publicPhone(trade.owner) ? "Phone" : "", trade.owner?.email ? "Email" : ""]
        .filter(Boolean)
        .join(", "),
  },
];

export default function CompareScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const uid = useAuthStore((state) => state.user?.uid);
  const tradeIds = useCompareStore((state) => state.tradeIds);
  const remove = useCompareStore((state) => state.remove);
  const clear = useCompareStore((state) => state.clear);
  const { data, isLoading, isPlaceholderData, isFetching } = useSpecialistsByIds(
    tradeIds,
    undefined,
    tradeIds.length > 0,
  );
  const profile = useProfile(uid);
  const origin = profile.data?.location?.center ?? null;
  const contact = useTradeContact("compare");
  const [differencesOnly, setDifferencesOnly] = useState(false);

  const trades = useMemo(() => {
    const byId = new Map((data ?? []).map((trade) => [trade.tradeId, trade]));
    return tradeIds
      .map((id) => byId.get(id))
      .filter((trade): trade is Specialist => Boolean(trade));
  }, [data, tradeIds]);

  useEffect(() => {
    if (!data || data.length === 0 || isPlaceholderData || isFetching) return;
    const found = new Set(data.map((trade) => trade.tradeId));
    for (const id of tradeIds) {
      if (!found.has(id)) remove(id);
    }
  }, [data, isPlaceholderData, isFetching, tradeIds, remove]);

  const openedRef = useRef(false);
  useEffect(() => {
    if (openedRef.current || trades.length === 0) return;
    openedRef.current = true;
    analyticsEvents.compareOpened({ count: trades.length });
  }, [trades.length]);

  const distanceTo = (trade: Specialist): number | null =>
    origin && trade.lat != null && trade.lng != null
      ? distanceMiles(origin[1], origin[0], trade.lat, trade.lng)
      : null;

  const rows = useMemo(() => {
    if (!differencesOnly || trades.length < 2) return ROWS;
    return ROWS.filter((row) => {
      const values = trades.map((trade) => row.value(trade, null));
      return new Set(values).size > 1;
    });
  }, [differencesOnly, trades]);

  const openTrade = (trade: Specialist) => {
    tapFeedback();
    router.push(
      toHref(
        `/trade/${encodeURIComponent(trade.ownerId)}?tradeId=${encodeURIComponent(trade.tradeId)}`,
      ),
    );
  };

  const removeTrade = (trade: Specialist) => {
    tapFeedback();
    remove(trade.tradeId);
    analyticsEvents.compareRemoved({ trade_id: trade.tradeId, count: tradeIds.length - 1 });
  };

  const empty = !isLoading && trades.length === 0;

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Compare</Text>
          {trades.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => {
                tapFeedback();
                analyticsEvents.compareCleared({ count: trades.length });
                clear();
              }}
            >
              <Text style={styles.clear}>Clear all</Text>
            </Pressable>
          ) : (
            <View style={styles.headerSpacer} />
          )}
        </View>

        {isLoading && tradeIds.length > 0 ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : empty ? (
          <View style={styles.center}>
            <View style={styles.emptyIcon}>
              <ScaleIcon size={28} color={colors.accent} />
            </View>
            <Text style={styles.emptyTitle}>
              Choose up to {MAX_COMPARE} contractors to compare
            </Text>
            <Text style={styles.emptyText}>
              Tap the scale icon on any trade card to add it here.
            </Text>
            <View style={styles.emptyButton}>
              <PrimaryButton
                label="Find specialists"
                onPress={() => router.replace(toHref("/search"))}
              />
            </View>
          </View>
        ) : (
          <>
            {trades.length > 1 ? (
              <View style={styles.toggleWrap}>
                <ToggleRow
                  label="Show differences only"
                  value={differencesOnly}
                  onChange={(next) => {
                    analyticsEvents.compareDifferencesToggled({
                      enabled: next,
                      count: trades.length,
                    });
                    setDifferencesOnly(next);
                  }}
                />
              </View>
            ) : null}
            <ScrollView
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.table}>
                <View style={styles.labels}>
                  <View style={[styles.labelCell, { height: HEADER_HEIGHT }]} />
                  {rows.map((row) => (
                    <View key={row.key} style={[styles.labelCell, { height: row.height }]}>
                      <Text style={styles.label} numberOfLines={2}>
                        {row.label}
                      </Text>
                    </View>
                  ))}
                  <View style={[styles.labelCell, styles.actionsCell]} />
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {trades.map((trade) => {
                    const distance = distanceTo(trade);
                    const phone = publicPhone(trade.owner);
                    return (
                      <View key={trade.tradeId} style={styles.column}>
                        <View style={[styles.headCell, { height: HEADER_HEIGHT }]}>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Remove ${trade.name}`}
                            hitSlop={8}
                            onPress={() => removeTrade(trade)}
                            style={styles.remove}
                          >
                            <CloseIcon size={14} color={colors.textSecondary} />
                          </Pressable>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Open ${trade.name}`}
                            onPress={() => openTrade(trade)}
                            style={styles.headBody}
                          >
                            <TierAvatar
                              name={trade.name}
                              url={trade.avatarUrl || null}
                              years={trade.details.experienceYears}
                              size={44}
                            />
                            <Text style={styles.headName} numberOfLines={2}>
                              {trade.name}
                            </Text>
                            <Text style={styles.headTrade} numberOfLines={1}>
                              {trade.specialtyLabel}
                            </Text>
                          </Pressable>
                        </View>
                        {rows.map((row) => {
                          const value = row.value(trade, distance);
                          const muted =
                            value === NOT_PROVIDED ||
                            value === "Not specified" ||
                            value === "Not yet established";
                          return (
                            <View key={row.key} style={[styles.cell, { height: row.height }]}>
                              <Text
                                style={[styles.cellText, muted && styles.cellMuted]}
                                numberOfLines={row.height > 64 ? 3 : 2}
                              >
                                {value}
                              </Text>
                            </View>
                          );
                        })}
                        <View style={[styles.cell, styles.actionsCell]}>
                          <Pressable
                            accessibilityRole="button"
                            onPress={() => contact.requestQuote(trade)}
                            style={({ pressed }) => [styles.quote, pressed && styles.pressed]}
                          >
                            <Text style={styles.quoteText}>Request quote</Text>
                          </Pressable>
                          <View style={styles.smallActions}>
                            <Pressable
                              accessibilityRole="button"
                              onPress={() => void contact.message(trade)}
                              style={({ pressed }) => [styles.small, pressed && styles.pressed]}
                            >
                              <Text style={styles.smallText}>Message</Text>
                            </Pressable>
                            {phone ? (
                              <Pressable
                                accessibilityRole="button"
                                onPress={() => contact.call(trade, phone)}
                                style={({ pressed }) => [styles.small, pressed && styles.pressed]}
                              >
                                <Text style={styles.smallText}>Call</Text>
                              </Pressable>
                            ) : null}
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
              <Text style={styles.note}>
                All details are provided by contractors. CTMASS does not verify
                licenses, insurance or prices. Rates with a different basis
                (tech-hour, crew-hour, visit) are not directly comparable.
              </Text>
            </ScrollView>
          </>
        )}
      </SafeAreaView>
    </ScreenBackground>
  );
}

const useStyles = makeStyles((t) => ({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    color: t.colors.text,
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 40,
  },
  clear: {
    color: t.colors.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(22,179,100,0.12)",
  },
  emptyTitle: {
    color: t.colors.text,
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },
  emptyText: {
    color: t.colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
  },
  emptyButton: {
    alignSelf: "stretch",
    marginTop: Spacing.md,
  },
  toggleWrap: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  content: {
    paddingBottom: Spacing.xl,
  },
  table: {
    flexDirection: "row",
  },
  labels: {
    width: LABEL_WIDTH,
    borderRightWidth: 1,
    borderRightColor: t.colors.border,
  },
  labelCell: {
    justifyContent: "center",
    paddingLeft: Spacing.base,
    paddingRight: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.border,
  },
  label: {
    color: t.colors.textSecondary,
    fontSize: 12.5,
    fontWeight: "700",
  },
  column: {
    width: COLUMN_WIDTH,
    borderRightWidth: 1,
    borderRightColor: t.colors.border,
  },
  headCell: {
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.border,
  },
  headBody: {
    alignItems: "center",
    gap: 4,
  },
  headName: {
    color: t.colors.text,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  headTrade: {
    color: t.colors.textSecondary,
    fontSize: 12.5,
    fontWeight: "600",
  },
  remove: {
    position: "absolute",
    top: 6,
    right: 6,
    zIndex: 1,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.colors.surfaceStrong,
  },
  cell: {
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.border,
  },
  cellText: {
    color: t.colors.text,
    fontSize: 13.5,
    fontWeight: "600",
  },
  cellMuted: {
    color: t.colors.textMuted,
  },
  actionsCell: {
    height: 108,
    gap: Spacing.sm,
  },
  quote: {
    height: 40,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.primaryDark,
  },
  quoteText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "800",
  },
  smallActions: {
    flexDirection: "row",
    gap: 6,
  },
  small: {
    flex: 1,
    height: 36,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.colors.surfaceStrong,
  },
  smallText: {
    color: t.colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.7,
  },
  note: {
    color: t.colors.textMuted,
    fontSize: 12.5,
    lineHeight: 18,
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.base,
  },
}));
