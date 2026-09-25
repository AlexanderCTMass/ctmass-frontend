import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChevronLeftIcon, ReviewIcon } from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { BackButton } from "@/components/ui/back-button";
import { PressableScale } from "@/components/ui/pressable-scale";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { analyticsEvents } from "@/lib/analytics-events";
import { tapFeedback } from "@/lib/haptics";
import { toHref } from "@/lib/navigation";
import {
  type Specialist,
  fetchSpecialistsByEmail,
  groupSpecialists,
  matchesSpecialistQuery,
} from "@/lib/trades";
import { useSpecialistPool } from "@/queries/use-specialist-search";
import { useAuthStore } from "@/store/use-auth-store";

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

function SpecialistRow({
  specialist,
  onPress,
}: {
  specialist: Specialist;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <PressableScale accessibilityLabel={specialist.name} onPress={onPress}>
      <View style={styles.card}>
        <Avatar name={specialist.name} url={specialist.avatarUrl || null} size={46} />
        <View style={styles.cardBody}>
          <Text style={styles.cardName} numberOfLines={1}>
            {specialist.name}
          </Text>
          <View style={styles.metaRow}>
            {specialist.rating > 0 ? (
              <>
                <ReviewIcon size={13} color={colors.coin} />
                <Text style={styles.metaText} numberOfLines={1}>
                  {specialist.rating.toFixed(1)} · {specialist.reviews} reviews
                  {specialist.specialtyLabel
                    ? ` · ${specialist.specialtyLabel}`
                    : ""}
                </Text>
              </>
            ) : (
              <Text style={styles.metaText} numberOfLines={1}>
                {specialist.specialtyLabel || "New specialist"}
              </Text>
            )}
          </View>
          {specialist.placeName ? (
            <Text style={styles.place} numberOfLines={1}>
              {specialist.placeName}
            </Text>
          ) : null}
        </View>
        <View style={styles.chevron}>
          <ChevronLeftIcon size={18} color={colors.textMuted} />
        </View>
      </View>
    </PressableScale>
  );
}

export default function SearchScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const uid = useAuthStore((state) => state.user?.uid);

  const [text, setText] = useState("");
  const [emailQuery, setEmailQuery] = useState("");

  const pool = useSpecialistPool(uid);
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

    const base = (pool.data ?? []).filter((specialist) =>
      matchesSpecialistQuery(specialist, trimmed),
    );
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
  }, [emailActive, emailResults.data, pool.data, trimmed]);

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

  const openProfile = (specialist: Specialist, group: string, position: number) => {
    tapFeedback();
    analyticsEvents.specialistSearchProfileOpened({
      owner_id: specialist.ownerId,
      group,
      position,
    });
    router.push(
      toHref(
        `/user/${specialist.ownerId}?name=${encodeURIComponent(specialist.name)}`,
      ),
    );
  };

  const loading = looksEmail
    ? emailResults.isLoading
    : pool.isLoading;
  const showEmpty = !loading && rows.length === 0;

  return (
    <ScreenBackground>
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

        <FlashList
          data={rows}
          keyExtractor={(item) => item.id}
          getItemType={(item) => item.kind}
          renderItem={({ item }) =>
            item.kind === "header" ? (
              <Text style={styles.groupTitle}>{item.title}</Text>
            ) : (
              <SpecialistRow
                specialist={item.specialist}
                onPress={() =>
                  openProfile(item.specialist, item.group, item.position)
                }
              />
            )
          }
          ListEmptyComponent={
            showEmpty ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No specialists found</Text>
                <Text style={styles.emptyText}>
                  {trimmed
                    ? "Try a different name, specialty or email."
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
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.base,
    padding: Spacing.base,
    borderRadius: Radius.lg,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    marginBottom: Spacing.sm,
  },
  cardBody: {
    flex: 1,
    gap: 2,
  },
  cardName: {
    color: t.colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    flex: 1,
    color: t.colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  place: {
    color: t.colors.textMuted,
    fontSize: 12.5,
  },
  chevron: {
    transform: [{ rotate: "180deg" }],
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
