import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { Stack, router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ArchiveIcon, HeartIcon } from "@/components/icons";
import { TradeCard } from "@/components/trade/trade-card";
import { BackButton } from "@/components/ui/back-button";
import { DistanceSlider } from "@/components/ui/distance-slider";
import { FeedTabs } from "@/components/ui/feed-tabs";
import { ScreenBackground } from "@/components/ui/screen-background";
import { SwipeCard, useSwipeSides } from "@/components/ui/swipe-card";
import { UndoToast, useUndoToast } from "@/components/ui/undo-toast";
import {
  Brand,
  Radius,
  Spacing,
  type ThemeColors,
  makeStyles,
  useTheme,
} from "@/constants/theme";
import {
  type SwipeSource,
  specialistSubject,
  useSwipeActions,
} from "@/hooks/use-swipe-actions";
import { useSwipeHint } from "@/hooks/use-swipe-hint";
import { publicPhone, useTradeContact } from "@/hooks/use-trade-contact";
import { analyticsEvents } from "@/lib/analytics-events";
import { distanceMiles } from "@/lib/geo";
import { tapFeedback } from "@/lib/haptics";
import { toHref } from "@/lib/navigation";
import { rankByAffinity } from "@/lib/swipes";
import {
  type Specialist,
  fetchSpecialistsByEmail,
  groupSpecialists,
  matchesSpecialistQuery,
  tradesByOwner,
} from "@/lib/trades";
import { useProfile } from "@/queries/use-profile";
import { useSpecialistPool } from "@/queries/use-specialist-search";
import { useSpecialistsByIds } from "@/queries/use-swipes";
import { useAuthStore } from "@/store/use-auth-store";

const MIN_RADIUS = 10;
const MAX_RADIUS = 100;

type Tab = "all" | "liked" | "archived";

const EMAIL_RE = /^\S+@\S+\.\S+$/;

type Row =
  | { kind: "header"; id: string; title: string }
  | {
      kind: "specialist";
      id: string;
      specialist: Specialist;
      group: string;
      position: number;
    };

function groupBadge(
  group: string,
  colors: ThemeColors,
): { label: string; tint: string; bg: string } | null {
  if (group === "top") {
    return { label: "Top rated", tint: colors.coin, bg: "rgba(255,193,7,0.16)" };
  }
  if (group === "recent") {
    return { label: "New", tint: colors.accent, bg: "rgba(22,179,100,0.14)" };
  }
  return null;
}

function SkeletonRow() {
  const styles = useStyles();
  return (
    <View style={[styles.card, styles.cardItem]}>
      <View style={styles.cardHeader}>
        <View style={styles.skeletonAvatar} />
        <View style={styles.cardHeaderText}>
          <View style={[styles.skeletonLine, { width: "60%" }]} />
          <View style={[styles.skeletonLine, { width: "40%", marginTop: 8 }]} />
        </View>
      </View>
      <View style={[styles.skeletonLine, { width: "50%" }]} />
      <View style={styles.skeletonButton} />
    </View>
  );
}

function SkeletonList() {
  return (
    <View>
      <SkeletonRow />
      <SkeletonRow />
      <SkeletonRow />
      <SkeletonRow />
      <SkeletonRow />
    </View>
  );
}

export default function SearchScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const uid = useAuthStore((state) => state.user?.uid);

  const [text, setText] = useState("");
  const [emailQuery, setEmailQuery] = useState("");
  const [radius, setRadius] = useState(50);
  const [tab, setTab] = useState<Tab>("all");

  const swipe = useSwipeActions(uid, "search");
  const sides = useSwipeSides();
  const swipeHint = useSwipeHint("search");
  const undo = useUndoToast();
  const contact = useTradeContact("card");
  const { liked, archived } = swipe.specialistIndex;
  const savedIds = useMemo(
    () => [...(tab === "archived" ? archived : liked)],
    [tab, liked, archived],
  );
  const saved = useSpecialistsByIds(savedIds, uid, tab !== "all");

  const pool = useSpecialistPool(uid);
  const profile = useProfile(uid);
  const origin = profile.data?.location?.center ?? null;
  const emailResults = useQuery({
    queryKey: ["specialist-email", emailQuery],
    enabled: emailQuery.length > 0,
    staleTime: 60 * 1000,
    queryFn: () => fetchSpecialistsByEmail(emailQuery, uid),
  });

  useEffect(() => {
    analyticsEvents.specialistSearchViewed();
  }, []);

  const trimmed = text.trim();
  const looksEmail = EMAIL_RE.test(trimmed);
  const emailActive =
    looksEmail && emailQuery === trimmed.toLowerCase() && !!emailResults.data;

  const rankKey = `${tab}|${pool.dataUpdatedAt}|${swipe.isReady}`;
  const [ranking, setRanking] = useState({
    key: "",
    index: swipe.specialistIndex,
  });
  if (ranking.key !== rankKey) {
    setRanking({ key: rankKey, index: swipe.specialistIndex });
  }

  const rows = useMemo<Row[]>(() => {
    if (tab !== "all") {
      const set = tab === "archived" ? archived : liked;
      const list = (saved.data ?? [])
        .filter((specialist) => set.has(specialist.tradeId))
        .filter((specialist) => matchesSpecialistQuery(specialist, trimmed));
      if (list.length === 0) return [];
      return [
        {
          kind: "header",
          id: `h-${tab}`,
          title:
            tab === "archived" ? "Archived specialists" : "Liked specialists",
        },
        ...list.map((specialist, index) => ({
          kind: "specialist" as const,
          id: specialist.tradeId,
          specialist,
          group: tab,
          position: index,
        })),
      ];
    }

    if (emailActive) {
      const list = emailResults.data ?? [];
      if (list.length === 0) return [];
      return [
        { kind: "header", id: "h-match", title: "Matches" },
        ...list.map((specialist, index) => ({
          kind: "specialist" as const,
          id: specialist.tradeId,
          specialist,
          group: "email",
          position: index,
        })),
      ];
    }

    const withinRadius = (specialist: Specialist): boolean => {
      if (!origin) return true;
      if (specialist.lat == null || specialist.lng == null) return true;
      return (
        distanceMiles(origin[1], origin[0], specialist.lat, specialist.lng) <=
        radius
      );
    };
    const base = (pool.data ?? [])
      .filter((specialist) => !archived.has(specialist.tradeId))
      .filter((specialist) => matchesSpecialistQuery(specialist, trimmed))
      .filter(withinRadius);
    const groups = groupSpecialists(base);
    const out: Row[] = [];
    const pushGroup = (title: string, group: Specialist[], key: string) => {
      if (group.length === 0) return;
      const list = rankByAffinity(
        group,
        ranking.index,
        (specialist) => specialist.tradeId,
        (specialist) => specialist.specialtyLabel,
      );
      out.push({ kind: "header", id: `h-${key}`, title });
      list.forEach((specialist, index) => {
        out.push({
          kind: "specialist",
          id: specialist.tradeId,
          specialist,
          group: key,
          position: index,
        });
      });
    };
    pushGroup("Top rated", groups.topRated, "top");
    pushGroup("Recently joined", groups.recent, "recent");
    pushGroup("More specialists", groups.more, "more");
    return out;
  }, [
    tab,
    saved.data,
    liked,
    archived,
    ranking.index,
    emailActive,
    emailResults.data,
    pool.data,
    trimmed,
    origin,
    radius,
  ]);

  const likeSpecialist = (specialist: Specialist, source: SwipeSource) => {
    const subject = specialistSubject(specialist);
    if (liked.has(specialist.tradeId)) swipe.unlike(subject, source);
    else swipe.like(subject, source);
  };

  const archiveSpecialist = (specialist: Specialist) => {
    const subject = specialistSubject(specialist);
    const revert = swipe.archive(subject, "swipe");
    undo.show("Specialist archived", revert);
  };

  const restoreSpecialist = (specialist: Specialist) => {
    swipe.restore(specialistSubject(specialist), "swipe");
  };

  const changeTab = (next: Tab) => {
    analyticsEvents.cardFeedTabChanged({
      screen: "search",
      tab: next,
      count:
        next === "liked"
          ? liked.size
          : next === "archived"
            ? archived.size
            : (pool.data?.length ?? 0),
    });
    undo.hide();
    setTab(next);
  };

  const firstSpecialist = rows.find((row) => row.kind === "specialist")?.id;
  const hintTarget =
    tab === "all" && swipe.isReady && swipeHint.pending && !pool.isLoading
      ? firstSpecialist
      : undefined;

  const onSubmit = () => {
    if (looksEmail) {
      setEmailQuery(trimmed.toLowerCase());
    }
    const count = rows.filter((row) => row.kind === "specialist").length;
    analyticsEvents.specialistSearchPerformed({
      query_length: trimmed.length,
      results_count: count,
      is_email: looksEmail,
    });
  };

  const ownerTrades = useMemo(
    () => tradesByOwner([...(pool.data ?? []), ...(saved.data ?? [])]),
    [pool.data, saved.data],
  );
  const otherTradesOf = (specialist: Specialist): Specialist[] => {
    const seen = new Set<string>([specialist.tradeId]);
    return (ownerTrades.get(specialist.ownerId) ?? []).filter((item) => {
      if (seen.has(item.tradeId)) return false;
      seen.add(item.tradeId);
      return true;
    });
  };

  const openTrade = (specialist: Specialist, group: string, position: number) => {
    tapFeedback();
    analyticsEvents.specialistSearchProfileOpened({
      owner_id: specialist.ownerId,
      trade_id: specialist.tradeId,
      group,
      position,
    });
    router.push(
      toHref(
        `/trade/${encodeURIComponent(specialist.ownerId)}?tradeId=${encodeURIComponent(specialist.tradeId)}`,
      ),
    );
  };

  const distanceTo = (specialist: Specialist): number | null =>
    origin && specialist.lat != null && specialist.lng != null
      ? distanceMiles(origin[1], origin[0], specialist.lat, specialist.lng)
      : null;

  const loading =
    tab !== "all"
      ? savedIds.length > 0 && saved.isLoading
      : looksEmail
        ? emailResults.isLoading
        : pool.isLoading;
  const showEmpty = !loading && rows.length === 0;
  const emptyTitle =
    tab === "liked"
      ? "No liked specialists yet"
      : tab === "archived"
        ? "Archive is empty"
        : "No specialists found";
  const emptyText =
    tab === "liked"
      ? "Swipe a specialist right or tap the heart to save them here. Your likes are private."
      : tab === "archived"
        ? "Specialists you swipe left will show up here. Swipe right to bring them back."
        : trimmed || origin
          ? "Try a different name, specialty, email, or a wider distance."
          : "Specialists will appear here.";

  return (
    <ScreenBackground>
      <Stack.Screen options={{ gestureEnabled: false }} />
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Find a specialist</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.searchWrap}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Search by name, specialty or email"
            placeholderTextColor={colors.textMuted}
            style={styles.search}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={onSubmit}
          />
          {looksEmail && !emailActive ? (
            <Text style={styles.hint}>Press search to look up this email.</Text>
          ) : null}
        </View>

        {origin && !emailActive && tab === "all" ? (
          <View style={styles.sliderWrap}>
            <DistanceSlider
              value={radius}
              min={MIN_RADIUS}
              max={MAX_RADIUS}
              step={5}
              onChange={setRadius}
            />
          </View>
        ) : null}

        {uid ? (
          <View style={styles.tabsWrap}>
            <FeedTabs<Tab>
              value={tab}
              onChange={changeTab}
              tabs={[
                { key: "all", label: "All" },
                {
                  key: "liked",
                  label: "Liked",
                  count: liked.size,
                  icon: (color) => <HeartIcon size={14} color={color} filled />,
                },
                {
                  key: "archived",
                  label: "Archived",
                  count: archived.size,
                  icon: (color) => <ArchiveIcon size={14} color={color} />,
                },
              ]}
            />
          </View>
        ) : null}

        <View style={styles.listWrap}>
          <FlashList
            data={rows}
            extraData={[swipe.specialistIndex, hintTarget]}
            keyExtractor={(item) => item.id}
            getItemType={(item) => item.kind}
            renderItem={({ item }) => {
              if (item.kind === "header") {
                return <Text style={styles.groupTitle}>{item.title}</Text>;
              }
              const specialist = item.specialist;
              const isLiked = liked.has(specialist.tradeId);
              const phone = publicPhone(specialist.owner);
              const isSelf = contact.isSelf(specialist.ownerId);
              const card = (
                <TradeCard
                  specialist={specialist}
                  badge={groupBadge(item.group, colors)}
                  distance={distanceTo(specialist)}
                  liked={isLiked}
                  phone={phone}
                  otherTrades={otherTradesOf(specialist)}
                  onPress={() =>
                    openTrade(specialist, item.group, item.position)
                  }
                  onOpenTrade={(other) =>
                    openTrade(other, item.group, item.position)
                  }
                  onToggleLike={
                    uid && tab !== "archived"
                      ? () => likeSpecialist(specialist, "tap")
                      : undefined
                  }
                  onMessage={
                    isSelf ? undefined : () => void contact.message(specialist)
                  }
                  onCall={() => contact.call(specialist, phone)}
                  onRequestQuote={
                    isSelf ? undefined : () => contact.requestQuote(specialist)
                  }
                />
              );
              if (!uid) return <View style={styles.cardItem}>{card}</View>;
              return (
                <SwipeCard
                  itemKey={specialist.tradeId}
                  style={styles.cardItem}
                  liked={isLiked}
                  hint={hintTarget === specialist.tradeId}
                  onHintShown={swipeHint.markShown}
                  right={
                    tab === "archived"
                      ? sides.restore(() => restoreSpecialist(specialist))
                      : sides.like(
                          isLiked,
                          () => likeSpecialist(specialist, "swipe"),
                          tab === "liked",
                        )
                  }
                  left={
                    tab === "archived"
                      ? undefined
                      : sides.archive(() => archiveSpecialist(specialist))
                  }
                >
                  {card}
                </SwipeCard>
              );
            }}
            ListEmptyComponent={
              loading ? (
                <SkeletonList />
              ) : showEmpty ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyTitle}>{emptyTitle}</Text>
                  <Text style={styles.emptyText}>{emptyText}</Text>
                </View>
              ) : null
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
          <UndoToast toast={undo.toast} onHide={undo.hide} />
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
  searchWrap: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
    gap: 6,
  },
  search: {
    minHeight: 48,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    color: t.colors.text,
    fontSize: 15,
  },
  hint: {
    color: t.colors.textMuted,
    fontSize: 12.5,
  },
  sliderWrap: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  tabsWrap: {
    paddingHorizontal: Spacing.base,
  },
  skeletonAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: t.colors.skeleton,
  },
  skeletonButton: {
    height: 46,
    borderRadius: Radius.pill,
    backgroundColor: t.colors.skeleton,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: t.colors.skeleton,
  },
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  groupTitle: {
    color: t.colors.textSecondary,
    fontSize: 12.5,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginTop: Spacing.base,
    marginBottom: Spacing.sm,
  },
  card: {
    padding: Spacing.base,
    borderRadius: Radius.lg,
    backgroundColor: t.colors.card,
    borderWidth: 1,
    borderColor: t.colors.border,
    gap: Spacing.md,
  },
  cardItem: {
    marginBottom: Spacing.md,
  },
  listWrap: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  cardHeaderText: {
    flex: 1,
    gap: 2,
  },
  cardName: {
    color: t.colors.text,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  cardSpecialty: {
    color: t.colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  badgeText: {
    fontSize: 11.5,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  placeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  place: {
    flex: 1,
    color: t.colors.textSecondary,
    fontSize: 13.5,
    fontWeight: "600",
  },
  stats: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
  },
  stat: {
    flex: 1,
    gap: 4,
  },
  statLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statLabel: {
    color: t.colors.textSecondary,
    fontSize: 12.5,
    fontWeight: "600",
  },
  statValue: {
    color: t.colors.text,
    fontSize: 15.5,
    fontWeight: "800",
  },
  statDivider: {
    width: 1,
    marginHorizontal: Spacing.base,
    backgroundColor: t.colors.border,
  },
  cta: {
    height: 46,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.primaryDark,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  empty: {
    alignItems: "center",
    paddingTop: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  emptyTitle: {
    color: t.colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  emptyText: {
    color: t.colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
}));
