import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MapPinIcon, TradeGroupIcon } from "@/components/icons";
import { compactPlace } from "@/components/project/project-card";
import { TierPill } from "@/components/trade/tier-badge";
import { BackButton } from "@/components/ui/back-button";
import { PressableScale } from "@/components/ui/pressable-scale";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { analyticsEvents, errorMessage } from "@/lib/analytics-events";
import { tapFeedback } from "@/lib/haptics";
import { useT } from "@/lib/i18n";
import { toHref } from "@/lib/navigation";
import { priceLine } from "@/lib/trade-display";
import { type Specialist, deleteTrade } from "@/lib/trades";
import { useTradesByOwner } from "@/queries/use-trade";
import { useAuthStore } from "@/store/use-auth-store";
import { useTradeDraftStore } from "@/store/use-trade-draft-store";

function TradeRow({
  trade,
  deleting,
  onOpen,
  onEdit,
  onDelete,
}: {
  trade: Specialist;
  deleting: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t, tx } = useT();
  const place = trade.placeName ? compactPlace(trade.placeName) : "";
  const accepting = trade.details.availability?.acceptingWork !== false;
  return (
    <PressableScale accessibilityLabel={trade.name} onPress={onOpen}>
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.icon}>
            <TradeGroupIcon
              groupId={trade.details.groupId}
              size={20}
              color={colors.accent}
            />
          </View>
          <View style={styles.body}>
            <Text style={styles.specialty} numberOfLines={1}>
              {tx(trade.specialtyLabel) || t("tradePage.thisTrade")}
            </Text>
            <Text style={styles.title} numberOfLines={1}>
              {trade.name}
            </Text>
            <View style={styles.metaRow}>
              <TierPill years={trade.details.experienceYears} small />
              {place ? (
                <View style={styles.place}>
                  <MapPinIcon size={13} color={colors.textSecondary} />
                  <Text style={styles.meta} numberOfLines={1}>
                    {place}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.meta} numberOfLines={1}>
              {priceLine(trade.details.rates, t)}
            </Text>
            {!accepting ? (
              <Text style={styles.paused}>{t("trade.notAccepting")}</Text>
            ) : null}
          </View>
        </View>
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={onEdit}
            style={({ pressed }) => [
              styles.action,
              styles.actionPrimary,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.actionText, styles.actionTextPrimary]}>
              {t("tradePage.edit")}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={onOpen}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          >
            <Text style={styles.actionText}>{t("myTrades.view")}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={deleting}
            onPress={onDelete}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          >
            {deleting ? (
              <ActivityIndicator size="small" color={colors.danger} />
            ) : (
              <Text style={[styles.actionText, styles.actionDanger]}>
                {t("common.delete")}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </PressableScale>
  );
}

export default function MyTradesScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useT();
  const uid = useAuthStore((state) => state.user?.uid);
  const resetTradeDraft = useTradeDraftStore((state) => state.reset);
  const queryClient = useQueryClient();
  const { data: trades = [], isLoading } = useTradesByOwner(uid);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    analyticsEvents.myTradesViewed();
  }, []);

  const openTrade = (trade: Specialist) => {
    tapFeedback();
    analyticsEvents.myTradesOpened({ trade_id: trade.tradeId });
    router.push(
      toHref(
        `/trade/${encodeURIComponent(trade.ownerId)}?tradeId=${encodeURIComponent(trade.tradeId)}`,
      ),
    );
  };

  const editTrade = (trade: Specialist) => {
    tapFeedback();
    analyticsEvents.myTradesEditTapped({ trade_id: trade.tradeId });
    router.push(toHref(`/trade-edit/${encodeURIComponent(trade.tradeId)}`));
  };

  const addTrade = () => {
    tapFeedback();
    analyticsEvents.myTradesAddTapped({ trades_count: trades.length });
    resetTradeDraft();
    router.push(toHref("/contractor-setup-trade"));
  };

  const runDelete = async (trade: Specialist) => {
    setDeletingId(trade.tradeId);
    try {
      await deleteTrade(trade.tradeId);
      analyticsEvents.tradeDeleted({ trade_id: trade.tradeId });
      void queryClient.invalidateQueries({ queryKey: ["trade"] });
      void queryClient.invalidateQueries({ queryKey: ["owner-trades"] });
      void queryClient.invalidateQueries({ queryKey: ["specialist-pool"] });
    } catch (error) {
      analyticsEvents.tradeDeleteFailed({
        trade_id: trade.tradeId,
        error_message: errorMessage(error),
      });
      Alert.alert(t("tradePage.deleteFailed"), t("common.pleaseTryAgain"));
    } finally {
      setDeletingId(null);
    }
  };

  const confirmDelete = (trade: Specialist) => {
    if (deletingId) return;
    tapFeedback();
    Alert.alert(t("tradePage.deleteTitle"), t("tradePage.deleteText"), [
      { text: t("tradePage.keepTrade"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => void runDelete(trade),
      },
    ]);
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.headerTitle}>{t("myTrades.title")}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.intro}>{t("myTrades.intro")}</Text>
          {isLoading ? (
            <ActivityIndicator color={colors.accent} style={styles.loader} />
          ) : trades.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>{t("myTrades.emptyTitle")}</Text>
              <Text style={styles.emptyText}>{t("myTrades.emptyText")}</Text>
            </View>
          ) : (
            trades.map((trade) => (
              <TradeRow
                key={trade.tradeId}
                trade={trade}
                deleting={deletingId === trade.tradeId}
                onOpen={() => openTrade(trade)}
                onEdit={() => editTrade(trade)}
                onDelete={() => confirmDelete(trade)}
              />
            ))
          )}
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton label={t("myTrades.add")} onPress={addTrade} />
        </View>
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
  content: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  intro: {
    color: t.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  loader: {
    marginTop: Spacing.xl,
  },
  empty: {
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.xl,
  },
  emptyTitle: {
    color: t.colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  emptyText: {
    color: t.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  card: {
    padding: Spacing.base,
    gap: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: t.colors.card,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  cardTop: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.isDark
      ? "rgba(63,199,154,0.14)"
      : "rgba(22,179,100,0.10)",
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  specialty: {
    color: t.colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  title: {
    color: t.colors.textSecondary,
    fontSize: 13.5,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  place: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 1,
  },
  meta: {
    flexShrink: 1,
    color: t.colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  paused: {
    color: t.colors.coin,
    fontSize: 12.5,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  action: {
    flex: 1,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.colors.surfaceStrong,
  },
  actionPrimary: {
    backgroundColor: t.colors.accent,
  },
  actionText: {
    color: t.colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  actionTextPrimary: {
    color: t.colors.onAccent,
  },
  actionDanger: {
    color: t.colors.danger,
  },
  pressed: {
    opacity: 0.7,
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
}));
