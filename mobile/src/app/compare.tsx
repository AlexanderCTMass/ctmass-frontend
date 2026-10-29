import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  type LayoutChangeEvent,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CompareCard } from "@/components/compare/compare-card";
import { HeadToHead } from "@/components/compare/head-to-head";
import {
  type FlyCommand,
  type SwipeDirection,
  SwipeDeck,
} from "@/components/compare/swipe-deck";
import { CloseIcon, HeartIcon, ScaleIcon } from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { BackButton } from "@/components/ui/back-button";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { UndoToast, useUndoToast } from "@/components/ui/undo-toast";
import {
  Brand,
  Radius,
  Spacing,
  makeStyles,
  useTheme,
} from "@/constants/theme";
import { specialistSubject, useSwipeActions } from "@/hooks/use-swipe-actions";
import { useTradeContact } from "@/hooks/use-trade-contact";
import { analyticsEvents } from "@/lib/analytics-events";
import { DETAIL_ROWS, rankAll } from "@/lib/compare-metrics";
import { distanceMiles } from "@/lib/geo";
import { useT } from "@/lib/i18n";
import { tapFeedback } from "@/lib/haptics";
import { toHref } from "@/lib/navigation";
import type { Specialist } from "@/lib/trades";
import { useProfile } from "@/queries/use-profile";
import { useSpecialistsByIds } from "@/queries/use-swipes";
import { useAuthStore } from "@/store/use-auth-store";
import { MAX_COMPARE, useCompareStore } from "@/store/use-compare-store";

type Mode = "cards" | "side_by_side";
type Cursor = string | null;

const END: Cursor = "end";
const CARD_BODY_HEIGHT = 372;
const COMPACT_BODY_HEIGHT = 324;
const COMPACT_DECK_HEIGHT = 470;

function ModeSwitch({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (next: Mode) => void;
}) {
  const styles = useStyles();
  const { t } = useT();
  const options: { value: Mode; label: string }[] = [
    { value: "cards", label: t("compare.modeCards") },
    { value: "side_by_side", label: t("compare.modeSideBySide") },
  ];
  return (
    <View style={styles.switch} accessibilityRole="tablist">
      {options.map((option) => {
        const active = option.value === mode;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            style={[styles.switchItem, active && styles.switchItemActive]}
          >
            <Text
              style={[styles.switchText, active && styles.switchTextActive]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function CompareScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useT();
  const uid = useAuthStore((state) => state.user?.uid);
  const tradeIds = useCompareStore((state) => state.tradeIds);
  const remove = useCompareStore((state) => state.remove);
  const insert = useCompareStore((state) => state.insert);
  const clear = useCompareStore((state) => state.clear);
  const { data, isLoading, isPlaceholderData, isFetching } =
    useSpecialistsByIds(tradeIds, undefined, tradeIds.length > 0);
  const profile = useProfile(uid);
  const origin = profile.data?.location?.center ?? null;
  const contact = useTradeContact("compare");
  const swipe = useSwipeActions(uid, "compare");
  const liked = swipe.specialistIndex.liked;
  const undo = useUndoToast();
  const [mode, setMode] = useState<Mode>("cards");
  const [cursor, setCursor] = useState<Cursor>(null);
  const [fly, setFly] = useState<FlyCommand | null>(null);
  const [pair, setPair] = useState<[string | null, string | null]>([
    null,
    null,
  ]);
  const [differencesOnly, setDifferencesOnly] = useState(false);
  const [deckHeight, setDeckHeight] = useState(0);

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

  const ranks = useMemo(() => rankAll(trades), [trades]);

  const distanceTo = (trade: Specialist): number | null =>
    origin && trade.lat != null && trade.lng != null
      ? distanceMiles(origin[1], origin[0], trade.lat, trade.lng)
      : null;

  const activeMode: Mode = trades.length < 2 ? "cards" : mode;
  const cursorIndex =
    cursor === END
      ? -1
      : Math.max(
          0,
          trades.findIndex((trade) => trade.tradeId === cursor),
        );
  const finished = cursor === END && trades.length > 0;
  const current = finished ? null : (trades[cursorIndex] ?? null);
  const nextTrade = finished ? null : (trades[cursorIndex + 1] ?? null);

  const pairTrades = useMemo(() => {
    if (trades.length < 2) return null;
    const ids = trades.map((trade) => trade.tradeId);
    const preferred = [
      ...ids.filter((id) => liked.has(id)),
      ...ids.filter((id) => !liked.has(id)),
    ];
    let [left, right] = pair;
    if (!left || !ids.includes(left))
      left = preferred.find((id) => id !== right) ?? null;
    if (!right || !ids.includes(right) || right === left) {
      right = preferred.find((id) => id !== left) ?? null;
    }
    const a = trades.find((trade) => trade.tradeId === left);
    const b = trades.find((trade) => trade.tradeId === right);
    return a && b ? ([a, b] as const) : null;
  }, [trades, pair, liked]);

  const pairRanks = useMemo(
    () => (pairTrades ? rankAll([pairTrades[0], pairTrades[1]]) : ranks),
    [pairTrades, ranks],
  );

  const sideRows = useMemo(() => {
    if (!pairTrades || !differencesOnly) return DETAIL_ROWS;
    const [a, b] = pairTrades;
    return DETAIL_ROWS.filter(
      (row) => row.value(a, null, t) !== row.value(b, null, t),
    );
  }, [pairTrades, differencesOnly, t]);

  const openTrade = (trade: Specialist) => {
    tapFeedback();
    router.push(
      toHref(
        `/trade/${encodeURIComponent(trade.ownerId)}?tradeId=${encodeURIComponent(trade.tradeId)}`,
      ),
    );
  };

  const changeMode = (next: Mode) => {
    if (next === activeMode) return;
    tapFeedback();
    analyticsEvents.compareModeChanged({ mode: next, count: trades.length });
    setMode(next);
  };

  const jumpTo = (trade: Specialist) => {
    tapFeedback();
    setCursor(trade.tradeId);
    setMode("cards");
  };

  const decide = (direction: SwipeDirection, method: "swipe" | "button") => {
    const trade = current;
    if (!trade) return;
    const index = trades.indexOf(trade);
    const after = trades[index + 1]?.tradeId;
    setFly(null);
    analyticsEvents.compareSwiped({
      trade_id: trade.tradeId,
      action: direction === 1 ? "keep" : "drop",
      method,
      position: index + 1,
      count: trades.length,
    });
    if (direction === 1) {
      setCursor(after ?? END);
      if (!uid || liked.has(trade.tradeId)) return;
      const subject = specialistSubject(trade);
      swipe.like(subject, "swipe");
      undo.show(
        t("compare.addedToShortlist", { name: trade.name }),
        () => {
          analyticsEvents.compareUndone({
            trade_id: trade.tradeId,
            action: "keep",
          });
          swipe.unlike(subject, "undo");
          setCursor(trade.tradeId);
        },
        "like",
      );
      return;
    }
    const storeIndex = tradeIds.indexOf(trade.tradeId);
    setCursor(after ?? (trades.length > 1 ? END : null));
    remove(trade.tradeId);
    analyticsEvents.compareRemoved({
      trade_id: trade.tradeId,
      count: tradeIds.length - 1,
    });
    undo.show(t("compare.removedFromCompare", { name: trade.name }), () => {
      analyticsEvents.compareUndone({
        trade_id: trade.tradeId,
        action: "drop",
      });
      insert(trade.tradeId, storeIndex);
      setCursor(trade.tradeId);
    });
  };

  const decideBySwipe = (direction: SwipeDirection) =>
    decide(direction, fly ? "button" : "swipe");

  const press = (direction: SwipeDirection) => {
    if (!current || fly) return;
    tapFeedback();
    setFly({ direction, nonce: Date.now() });
  };

  const swap = (side: 0 | 1) => {
    if (!pairTrades) return;
    const ids = trades.map((trade) => trade.tradeId);
    const now = pairTrades[side].tradeId;
    const other = pairTrades[side === 0 ? 1 : 0].tradeId;
    const options = ids.filter((id) => id !== other);
    if (options.length < 2) return;
    const nextId = options[(options.indexOf(now) + 1) % options.length];
    tapFeedback();
    analyticsEvents.compareSwapped({ trade_id: nextId, count: trades.length });
    setPair(side === 0 ? [nextId, other] : [other, nextId]);
  };

  const clearAll = () => {
    tapFeedback();
    analyticsEvents.compareCleared({ count: trades.length });
    undo.hide();
    setCursor(null);
    clear();
  };

  const onDeckLayout = (event: LayoutChangeEvent) => {
    setDeckHeight(Math.round(event.nativeEvent.layout.height));
  };

  const compact = deckHeight > 0 && deckHeight < COMPACT_DECK_HEIGHT;
  const photoHeight = Math.max(
    64,
    Math.min(
      180,
      deckHeight - (compact ? COMPACT_BODY_HEIGHT : CARD_BODY_HEIGHT),
    ),
  );
  const empty = !isLoading && trades.length === 0;
  const shortlisted = trades.filter((trade) => liked.has(trade.tradeId)).length;

  const renderCard = (trade: Specialist) => (
    <CompareCard
      trade={trade}
      ranks={ranks}
      distance={distanceTo(trade)}
      position={trades.indexOf(trade) + 1}
      total={trades.length}
      photoHeight={photoHeight}
      compact={compact}
      onOpen={() => openTrade(trade)}
    />
  );

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.headerTitle}>{t("compare.title")}</Text>
          {trades.length > 1 ? (
            <ModeSwitch mode={activeMode} onChange={changeMode} />
          ) : null}
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
              {t("compare.emptyTitle", { count: MAX_COMPARE })}
            </Text>
            <Text style={styles.emptyText}>{t("compare.emptyText")}</Text>
            <View style={styles.emptyButton}>
              <PrimaryButton
                label={t("compare.findSpecialists")}
                onPress={() => router.replace(toHref("/search"))}
              />
            </View>
          </View>
        ) : activeMode === "side_by_side" && pairTrades ? (
          <HeadToHead
            left={pairTrades[0]}
            right={pairTrades[1]}
            ranks={pairRanks}
            distanceTo={distanceTo}
            rows={sideRows}
            canSwap={trades.length > 2}
            differencesOnly={differencesOnly}
            onDifferencesChange={(next) => {
              analyticsEvents.compareDifferencesToggled({
                enabled: next,
                count: trades.length,
              });
              setDifferencesOnly(next);
            }}
            onSwap={swap}
            onOpen={openTrade}
            onQuote={(trade) => contact.requestQuote(trade)}
          />
        ) : (
          <>
            <View style={styles.strip}>
              {trades.map((trade) => {
                const active = !finished && trade.tradeId === current?.tradeId;
                return (
                  <Pressable
                    key={trade.tradeId}
                    accessibilityRole="button"
                    accessibilityLabel={t("compare.showA11y", {
                      name: trade.name,
                    })}
                    accessibilityState={{ selected: active }}
                    onPress={() => jumpTo(trade)}
                    style={styles.face}
                  >
                    <View
                      style={[styles.faceRing, active && styles.faceRingActive]}
                    >
                      <Avatar
                        name={trade.name}
                        url={trade.avatarUrl || null}
                        size={42}
                      />
                    </View>
                    {liked.has(trade.tradeId) ? (
                      <View style={styles.faceBadge}>
                        <HeartIcon size={9} color="#FFFFFF" filled />
                      </View>
                    ) : null}
                    <Text
                      style={[styles.faceName, active && styles.faceNameActive]}
                      numberOfLines={1}
                    >
                      {trade.name.split(" ")[0]}
                    </Text>
                  </Pressable>
                );
              })}
              {trades.length < MAX_COMPARE ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t("compare.addA11y")}
                  onPress={() => {
                    tapFeedback();
                    router.push(toHref("/search"));
                  }}
                  style={styles.face}
                >
                  <View style={styles.addRing}>
                    <View style={styles.plus}>
                      <CloseIcon
                        size={18}
                        color={colors.textMuted}
                        strokeWidth={2.2}
                      />
                    </View>
                  </View>
                  <Text style={styles.faceName}>{t("compare.add")}</Text>
                </Pressable>
              ) : null}
            </View>

            <View style={styles.deckArea} onLayout={onDeckLayout}>
              {deckHeight === 0 ? null : finished ? (
                <View style={styles.endCard}>
                  <View style={styles.emptyIcon}>
                    <HeartIcon size={28} color={colors.accent} filled />
                  </View>
                  <Text style={styles.emptyTitle}>
                    {t("compare.seenAll", { count: trades.length })}
                  </Text>
                  <Text style={styles.emptyText}>
                    {shortlisted > 0
                      ? t("compare.shortlisted", { count: shortlisted })
                      : t("compare.swipeToShortlist")}
                  </Text>
                  <View style={styles.endActions}>
                    {trades.length > 1 ? (
                      <PrimaryButton
                        label={t("compare.compareSideBySide")}
                        onPress={() => changeMode("side_by_side")}
                      />
                    ) : null}
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        tapFeedback();
                        setCursor(null);
                      }}
                      style={styles.textButton}
                    >
                      <Text style={styles.textButtonLabel}>
                        {t("compare.startOver")}
                      </Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      onPress={clearAll}
                      style={styles.textButton}
                    >
                      <Text style={styles.clearLabel}>
                        {t("compare.clearAll")}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : current ? (
                <SwipeDeck
                  topKey={current.tradeId}
                  top={renderCard(current)}
                  next={nextTrade ? renderCard(nextTrade) : null}
                  fly={fly}
                  onDecide={decideBySwipe}
                />
              ) : null}
            </View>

            <View style={styles.toastAnchor}>
              <UndoToast toast={undo.toast} onHide={undo.hide} />
            </View>

            {current && !finished ? (
              <>
                <View style={styles.actions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("compare.removeA11y", {
                      name: current.name,
                    })}
                    onPress={() => press(-1)}
                    style={({ pressed }) => [
                      styles.round,
                      styles.drop,
                      pressed && styles.pressed,
                    ]}
                  >
                    <CloseIcon
                      size={24}
                      color={colors.danger}
                      strokeWidth={2.6}
                    />
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => contact.requestQuote(current)}
                    style={({ pressed }) => [
                      styles.quote,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.quoteText}>
                      {t("compare.requestQuote")}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("compare.keepA11y", {
                      name: current.name,
                    })}
                    onPress={() => press(1)}
                    style={({ pressed }) => [
                      styles.round,
                      styles.keep,
                      pressed && styles.pressed,
                    ]}
                  >
                    <HeartIcon
                      size={24}
                      color="#FFFFFF"
                      filled={liked.has(current.tradeId)}
                      strokeWidth={2.2}
                    />
                  </Pressable>
                </View>
                <Text style={styles.hint}>{t("compare.swipeHint")}</Text>
              </>
            ) : null}
          </>
        )}
        {empty ? <UndoToast toast={undo.toast} onHide={undo.hide} /> : null}
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
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    flex: 1,
    color: t.colors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  switch: {
    flexDirection: "row",
    padding: 3,
    borderRadius: Radius.pill,
    backgroundColor: t.colors.track,
  },
  switchItem: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  switchItemActive: {
    backgroundColor: Brand.primary,
  },
  switchText: {
    color: t.colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  switchTextActive: {
    color: "#04170D",
    fontWeight: "800",
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
    backgroundColor: t.isDark
      ? "rgba(63,199,154,0.16)"
      : "rgba(22,179,100,0.12)",
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
    lineHeight: 20,
    textAlign: "center",
  },
  emptyButton: {
    alignSelf: "stretch",
    marginTop: Spacing.md,
  },
  strip: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
  },
  face: {
    width: 60,
    alignItems: "center",
    gap: 4,
  },
  faceRing: {
    padding: 2,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "transparent",
  },
  faceRingActive: {
    borderColor: Brand.primary,
  },
  faceBadge: {
    position: "absolute",
    top: 0,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.primary,
    borderWidth: 2,
    borderColor: t.colors.background,
  },
  faceName: {
    color: t.colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  faceNameActive: {
    color: t.colors.text,
    fontWeight: "800",
  },
  addRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: t.colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  plus: {
    transform: [{ rotate: "45deg" }],
  },
  deckArea: {
    flex: 1,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
  },
  endCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    backgroundColor: t.colors.card,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  endActions: {
    alignSelf: "stretch",
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  textButton: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  textButtonLabel: {
    color: t.colors.accent,
    fontSize: 15,
    fontWeight: "700",
  },
  clearLabel: {
    color: t.colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  toastAnchor: {
    height: 0,
    zIndex: 2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: Spacing.base,
  },
  round: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  drop: {
    backgroundColor: t.colors.card,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  keep: {
    backgroundColor: Brand.primary,
  },
  quote: {
    flex: 1,
    height: 56,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.primaryDark,
  },
  quoteText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.75,
  },
  hint: {
    color: t.colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
}));
