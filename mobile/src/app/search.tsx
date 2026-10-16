import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { Stack, router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MapPinIcon, ReviewIcon, UsersIcon } from "@/components/icons";
import { shortPlace } from "@/components/project/project-card";
import { Avatar } from "@/components/ui/avatar";
import { BackButton } from "@/components/ui/back-button";
import { DistanceSlider } from "@/components/ui/distance-slider";
import { PressableScale } from "@/components/ui/pressable-scale";
import { ScreenBackground } from "@/components/ui/screen-background";
import {
  Brand,
  Radius,
  Spacing,
  type ThemeColors,
  makeStyles,
  useTheme,
} from "@/constants/theme";
import { analyticsEvents } from "@/lib/analytics-events";
import { distanceMiles, formatMiles } from "@/lib/geo";
import { tapFeedback } from "@/lib/haptics";
import { toHref } from "@/lib/navigation";
import {
  type Specialist,
  fetchSpecialistsByEmail,
  groupSpecialists,
  matchesSpecialistQuery,
} from "@/lib/trades";
import { useProfile } from "@/queries/use-profile";
import { useSpecialistPool } from "@/queries/use-specialist-search";
import { useAuthStore } from "@/store/use-auth-store";

const MIN_RADIUS = 10;
const MAX_RADIUS = 100;

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

function SpecialistCard({
  specialist,
  group,
  distance,
  onPress,
}: {
  specialist: Specialist;
  group: string;
  distance: number | null;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const badge = groupBadge(group, colors);
  const place = specialist.placeName ? shortPlace(specialist.placeName) : "";
  const placeLine = [place, formatMiles(distance)].filter(Boolean).join(" · ");
  const rated = specialist.rating > 0;
  const iconColor = colors.textSecondary;
  return (
    <PressableScale accessibilityLabel={specialist.name} onPress={onPress}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Avatar
            name={specialist.name}
            url={specialist.avatarUrl || null}
            size={52}
          />
          <View style={styles.cardHeaderText}>
            <Text style={styles.cardName} numberOfLines={2}>
              {specialist.name}
            </Text>
            {specialist.specialtyLabel ? (
              <Text style={styles.cardSpecialty} numberOfLines={1}>
                {specialist.specialtyLabel}
              </Text>
            ) : null}
          </View>
          {badge ? (
            <View style={[styles.badge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.tint }]}>
                {badge.label}
              </Text>
            </View>
          ) : null}
        </View>

        {placeLine ? (
          <View style={styles.placeRow}>
            <MapPinIcon size={15} color={colors.accent} />
            <Text style={styles.place} numberOfLines={1}>
              {placeLine}
            </Text>
          </View>
        ) : null}

        <View style={styles.stats}>
          <View style={styles.stat}>
            <View style={styles.statLabelRow}>
              <ReviewIcon size={14} color={rated ? colors.coin : iconColor} />
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <Text style={styles.statValue}>
              {rated ? specialist.rating.toFixed(1) : "New"}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <View style={styles.statLabelRow}>
              <UsersIcon size={14} color={iconColor} />
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
            <Text style={styles.statValue}>
              {specialist.reviews > 0
                ? `${specialist.reviews} ${specialist.reviews === 1 ? "review" : "reviews"}`
                : "No reviews yet"}
            </Text>
          </View>
        </View>

        <View style={styles.cta}>
          <Text style={styles.ctaText}>View services</Text>
        </View>
      </View>
    </PressableScale>
  );
}

function SkeletonRow() {
  const styles = useStyles();
  return (
    <View style={styles.card}>
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

  const rows = useMemo<Row[]>(() => {
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
      .filter((specialist) => matchesSpecialistQuery(specialist, trimmed))
      .filter(withinRadius);
    const groups = groupSpecialists(base);
    const out: Row[] = [];
    const pushGroup = (title: string, list: Specialist[], key: string) => {
      if (list.length === 0) return;
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
  }, [emailActive, emailResults.data, pool.data, trimmed, origin, radius]);

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

  const loading = looksEmail
    ? emailResults.isLoading
    : pool.isLoading;
  const showEmpty = !loading && rows.length === 0;

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

        {origin && !emailActive ? (
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

        <FlashList
          data={rows}
          keyExtractor={(item) => item.id}
          getItemType={(item) => item.kind}
          renderItem={({ item }) =>
            item.kind === "header" ? (
              <Text style={styles.groupTitle}>{item.title}</Text>
            ) : (
              <SpecialistCard
                specialist={item.specialist}
                group={item.group}
                distance={distanceTo(item.specialist)}
                onPress={() =>
                  openTrade(item.specialist, item.group, item.position)
                }
              />
            )
          }
          ListEmptyComponent={
            loading ? (
              <SkeletonList />
            ) : showEmpty ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No specialists found</Text>
                <Text style={styles.emptyText}>
                  {trimmed || origin
                    ? "Try a different name, specialty, email, or a wider distance."
                    : "Specialists will appear here."}
                </Text>
              </View>
            ) : null
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
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
    backgroundColor: t.isDark ? t.colors.surface : t.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: t.colors.border,
    gap: Spacing.md,
    marginBottom: Spacing.md,
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
