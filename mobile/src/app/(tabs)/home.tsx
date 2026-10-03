import { FlashList, type FlashListRef } from "@shopify/flash-list";
import { useQueryClient } from "@tanstack/react-query";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { CheckIcon, ChevronLeftIcon } from "@/components/icons";
import { PressableScale } from "@/components/ui/pressable-scale";
import { PrimaryButton } from "@/components/ui/primary-button";
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
import { startChat } from "@/lib/chat";
import { timeAgo } from "@/lib/format";
import { tapFeedback } from "@/lib/haptics";
import { chatHref, toHref } from "@/lib/navigation";
import type { ProjectDetail } from "@/lib/projects";
import {
  useInvitedProjects,
  useMyProjects,
  useNearbyProjects,
} from "@/queries/use-projects";
import { useTradeByOwner } from "@/queries/use-trade";
import { useAppStore } from "@/store/use-app-store";
import { useAuthStore } from "@/store/use-auth-store";
import { useProjectDraftStore } from "@/store/use-project-draft-store";
import { useTradeDraftStore } from "@/store/use-trade-draft-store";

type Mode = "homeowner" | "contractor";
const PAGE_SIZE = 25;

function statusMeta(
  state: string,
  responseCount: number,
  colors: ThemeColors,
): { label: string; tint: string; bg: string } {
  if (state === "published" && responseCount > 0) {
    return {
      label: `${responseCount} ${responseCount === 1 ? "response" : "responses"}`,
      tint: colors.info,
      bg: "rgba(41,112,255,0.16)",
    };
  }
  switch (state) {
    case "in_progress":
      return {
        label: "in progress",
        tint: colors.accent,
        bg: "rgba(22,179,100,0.14)",
      };
    case "published":
      return {
        label: "looking for specialists",
        tint: colors.coin,
        bg: "rgba(255,193,7,0.14)",
      };
    case "completed":
      return {
        label: "completed",
        tint: colors.accent,
        bg: "rgba(22,179,100,0.14)",
      };
    case "cancelled":
      return {
        label: "cancelled",
        tint: colors.textSecondary,
        bg: colors.surfaceStrong,
      };
    case "moderate":
      return {
        label: "in review",
        tint: colors.info,
        bg: "rgba(41,112,255,0.16)",
      };
    default:
      return {
        label: "draft",
        tint: colors.textSecondary,
        bg: colors.surfaceStrong,
      };
  }
}

function SegmentedControl({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (mode: Mode) => void;
}) {
  const styles = useStyles();
  const index = mode === "contractor" ? 1 : 0;
  const [width, setWidth] = useState(0);
  const pillWidth = width > 0 ? (width - 8) / 2 : 0;
  const offset = useSharedValue(index);

  useEffect(() => {
    offset.value = withTiming(index, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [index, offset]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value * pillWidth }],
  }));

  return (
    <View
      style={styles.segment}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      {pillWidth > 0 ? (
        <Animated.View
          style={[styles.segmentPill, { width: pillWidth }, pillStyle]}
        />
      ) : null}
      {(["homeowner", "contractor"] as const).map((value) => {
        const active = mode === value;
        return (
          <Pressable
            key={value}
            accessibilityRole="button"
            style={styles.segmentItem}
            onPress={() => {
              if (!active) {
                tapFeedback();
                onChange(value);
              }
            }}
          >
            <Text
              style={[styles.segmentText, active && styles.segmentTextActive]}
            >
              {value === "homeowner" ? "Homeowner" : "Contractor"}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function MyRequestCard({
  project,
  onPress,
}: {
  project: ProjectDetail;
  onPress: () => void;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const status = statusMeta(project.state, project.responseCount, colors);
  return (
    <PressableScale accessibilityLabel={project.title} onPress={onPress}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {project.title}
          </Text>
          <View style={[styles.chip, { backgroundColor: status.bg }]}>
            <Text style={[styles.chipText, { color: status.tint }]}>
              {status.label}
            </Text>
          </View>
        </View>
        {project.placeName ? (
          <Text style={styles.cardMeta} numberOfLines={1}>
            {project.placeName}
          </Text>
        ) : null}
      </View>
    </PressableScale>
  );
}

function NearbyCard({
  project,
  responded,
  onPress,
}: {
  project: ProjectDetail;
  responded: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const meta = [project.placeName, project.specialtyLabel]
    .filter(Boolean)
    .join(" · ");
  const posted = timeAgo(project.createdAt);
  return (
    <PressableScale accessibilityLabel={project.title} onPress={onPress}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {project.title}
          </Text>
          {responded ? (
            <View style={styles.respondedChip}>
              <CheckIcon size={12} color={colors.accent} strokeWidth={3} />
              <Text style={styles.respondedText}>Responded</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.cardMeta} numberOfLines={1}>
          {meta || "New request"}
        </Text>
        {posted ? <Text style={styles.cardPosted}>posted {posted}</Text> : null}
      </View>
    </PressableScale>
  );
}

function InvitedCard({
  project,
  onPress,
}: {
  project: ProjectDetail;
  onPress: () => void;
}) {
  const styles = useStyles();
  const meta = [project.customerName, project.specialtyLabel]
    .filter(Boolean)
    .join(" · ");
  return (
    <PressableScale accessibilityLabel={project.title} onPress={onPress}>
      <View style={styles.invitedCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {project.title}
          </Text>
          <View style={styles.invitedBadge}>
            <Text style={styles.invitedBadgeText}>Invited</Text>
          </View>
        </View>
        <Text style={styles.cardMeta} numberOfLines={1}>
          {meta || "Direct service request"}
        </Text>
      </View>
    </PressableScale>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  const styles = useStyles();
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  if (totalPages <= 1) return null;
  return (
    <View style={styles.paginationWrap}>
      <View style={styles.pagination}>
        <Pressable
          accessibilityRole="button"
          disabled={page <= 1}
          onPress={() => onChange(page - 1)}
          style={[styles.pageButton, page <= 1 && styles.pageButtonDisabled]}
        >
          <ChevronLeftIcon size={18} color={colors.text} />
        </Pressable>
        <Text style={styles.pageLabel}>
          Page {page} of {totalPages}
        </Text>
        <Pressable
          accessibilityRole="button"
          disabled={page >= totalPages}
          onPress={() => onChange(page + 1)}
          style={[
            styles.pageButton,
            styles.pageButtonNext,
            page >= totalPages && styles.pageButtonDisabled,
          ]}
        >
          <ChevronLeftIcon size={18} color={colors.text} />
        </Pressable>
      </View>
      {page > 1 ? (
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => onChange(1)}
        >
          <Text style={styles.firstPageLink}>Back to first page</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function SkeletonCard() {
  const styles = useStyles();
  return (
    <View style={styles.card}>
      <View style={[styles.skeletonLine, { width: "58%" }]} />
      <View style={[styles.skeletonLine, { width: "36%", marginTop: 10 }]} />
    </View>
  );
}

function SkeletonList() {
  const styles = useStyles();
  return (
    <View style={styles.skeletonList}>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </View>
  );
}

export default function HomeTab() {
  const styles = useStyles();
  const role = useAppStore((state) => state.role);
  const uid = useAuthStore((state) => state.user?.uid);
  const queryClient = useQueryClient();
  const resetProjectDraft = useProjectDraftStore((state) => state.reset);
  const resetTradeDraft = useTradeDraftStore((state) => state.reset);
  const [mode, setMode] = useState<Mode>(
    role === "contractor" ? "contractor" : "homeowner",
  );
  const [myPage, setMyPage] = useState(1);
  const [nearbyPage, setNearbyPage] = useState(1);
  const listRef = useRef<FlashListRef<ProjectDetail>>(null);

  const myProjects = useMyProjects(uid);
  const nearby = useNearbyProjects(uid);
  const invited = useInvitedProjects(uid);
  const myTrade = useTradeByOwner(mode === "contractor" ? uid : undefined);
  const hasTrade = Boolean(myTrade.data);

  useFocusEffect(
    useCallback(() => {
      if (!uid) return;
      void queryClient.invalidateQueries({ queryKey: ["my-projects"] });
      void queryClient.invalidateQueries({ queryKey: ["nearby-projects"] });
      void queryClient.invalidateQueries({ queryKey: ["invited-projects"] });
    }, [uid, queryClient]),
  );

  const isHomeowner = mode === "homeowner";
  const myItems = myProjects.data ?? [];
  const nearbyItems = nearby.data ?? [];
  const invitedItems = !isHomeowner ? (invited.data ?? []) : [];

  const page = isHomeowner ? myPage : nearbyPage;
  const items = isHomeowner ? myItems : nearbyItems;
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [page, mode]);

  const openNearby = (project: ProjectDetail, index: number) => {
    tapFeedback();
    const respondedThread = uid
      ? project.responders.find((item) => item.userId === uid)?.threadId
      : undefined;
    analyticsEvents.homeNearbyRequestOpened({
      project_id: project.id,
      specialty: project.specialtyLabel,
      responded: Boolean(respondedThread),
      destination: respondedThread ? "chat" : "request",
      position: (page - 1) * PAGE_SIZE + index,
      page,
    });
    if (respondedThread) {
      router.push(chatHref(respondedThread, project.customerName));
      return;
    }
    queryClient.setQueryData(["project", project.id], project);
    router.push(toHref(`/request/${project.id}`));
  };

  const openMyRequest = (project: ProjectDetail, index: number) => {
    tapFeedback();
    analyticsEvents.homeMyRequestOpened({
      project_id: project.id,
      state: project.state,
      response_count: project.responseCount,
      position: (page - 1) * PAGE_SIZE + index,
      page,
    });
    queryClient.setQueryData(["project", project.id], project);
    router.push(toHref(`/my-request/${project.id}`));
  };

  const openInvited = (project: ProjectDetail) => {
    if (!uid) return;
    tapFeedback();
    analyticsEvents.invitedProjectOpened({ project_id: project.id });
    void startChat(project.userId, uid, project.id).then((threadId) => {
      router.push(chatHref(threadId, project.customerName));
    });
  };

  const findSpecialist = () => {
    tapFeedback();
    router.push(toHref("/search"));
  };

  const openMyJobs = () => {
    tapFeedback();
    router.push(toHref("/my-jobs"));
  };

  const changeMode = (next: Mode) => {
    analyticsEvents.homeModeChanged({ mode: next, previous_mode: mode });
    setMode(next);
  };

  const changePage = (next: number) => {
    analyticsEvents.homePageChanged({
      mode,
      page: next,
      total_pages: totalPages,
    });
    if (isHomeowner) setMyPage(next);
    else setNearbyPage(next);
  };

  const newRequest = () => {
    tapFeedback();
    analyticsEvents.homeNewRequestTapped();
    resetProjectDraft();
    router.push("/homeowner-choose-specialty");
  };

  const newTrade = () => {
    tapFeedback();
    analyticsEvents.homeNewTradeTapped();
    resetTradeDraft();
    router.push(toHref("/contractor-setup-trade"));
  };

  const isLoading = isHomeowner ? myProjects.isLoading : nearby.isLoading;
  const isEmpty = !isLoading && items.length === 0;

  useEffect(() => {
    if (isEmpty) analyticsEvents.homeEmptyStateShown({ mode });
  }, [isEmpty, mode]);

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <SegmentedControl mode={mode} onChange={changeMode} />
        </View>

        <FlashList
          ref={listRef}
          data={pageItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) =>
            isHomeowner ? (
              <MyRequestCard
                project={item}
                onPress={() => openMyRequest(item, index)}
              />
            ) : (
              <NearbyCard
                project={item}
                responded={
                  uid ? item.responders.some((r) => r.userId === uid) : false
                }
                onPress={() => openNearby(item, index)}
              />
            )
          }
          ListHeaderComponent={
            <View>
              {!isHomeowner && invitedItems.length > 0 ? (
                <View style={styles.invitedSection}>
                  <Text style={styles.invitedSectionTitle}>
                    Direct requests
                  </Text>
                  {invitedItems.map((project) => (
                    <InvitedCard
                      key={project.id}
                      project={project}
                      onPress={() => openInvited(project)}
                    />
                  ))}
                </View>
              ) : null}
              <Text style={styles.sectionTitle}>
                {isHomeowner ? "My requests" : "Requests nearby"}
              </Text>
            </View>
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            isLoading ? (
              <SkeletonList />
            ) : isHomeowner ? (
              <EmptyState
                title="No requests yet"
                text="Post your first request and get matched with local specialists."
              />
            ) : (
              <EmptyState
                title="No open requests nearby"
                text="New jobs in your area will show up here. Check back soon."
              />
            )
          }
          ListFooterComponent={
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={changePage}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.footer}>
          {isHomeowner ? (
            <>
              <PrimaryButton label="New request" onPress={newRequest} />
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={findSpecialist}
              >
                <Text style={styles.findLink}>Find a specialist</Text>
              </Pressable>
            </>
          ) : hasTrade ? (
            <>
              <PrimaryButton label="My jobs" onPress={openMyJobs} />
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={newTrade}
              >
                <Text style={styles.findLink}>Create a new trade</Text>
              </Pressable>
            </>
          ) : (
            <>
              <PrimaryButton label="New trade" onPress={newTrade} />
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={openMyJobs}
              >
                <Text style={styles.findLink}>My jobs</Text>
              </Pressable>
            </>
          )}
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
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
    alignItems: "center",
  },
  segment: {
    flexDirection: "row",
    backgroundColor: t.colors.surface,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: t.colors.border,
    padding: 4,
    position: "relative",
  },
  segmentPill: {
    position: "absolute",
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: Radius.pill,
    backgroundColor: Brand.primary,
  },
  segmentItem: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentText: {
    color: t.colors.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  segmentTextActive: {
    color: "#04170D",
  },
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.base,
  },
  separator: {
    height: Spacing.md,
  },
  sectionTitle: {
    color: t.colors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: Spacing.md,
  },
  card: {
    padding: Spacing.base,
    borderRadius: Radius.lg,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    gap: 6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  cardTitle: {
    flex: 1,
    color: t.colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  cardMeta: {
    color: t.colors.textSecondary,
    fontSize: 13.5,
  },
  cardPosted: {
    color: t.colors.textMuted,
    fontSize: 12.5,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  respondedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(22,179,100,0.14)",
  },
  respondedText: {
    color: t.colors.accent,
    fontSize: 12,
    fontWeight: "700",
  },
  invitedSection: {
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  invitedSectionTitle: {
    color: t.colors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  invitedCard: {
    padding: Spacing.base,
    borderRadius: Radius.lg,
    backgroundColor: "rgba(22,179,100,0.08)",
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.35)",
    gap: 6,
  },
  invitedBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(22,179,100,0.18)",
  },
  invitedBadgeText: {
    color: t.colors.accent,
    fontSize: 12,
    fontWeight: "800",
  },
  findLink: {
    color: t.colors.accent,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    paddingVertical: Spacing.xs,
  },
  loading: {
    color: t.colors.textSecondary,
    fontSize: 14,
    paddingVertical: Spacing.md,
  },
  skeletonList: {
    gap: Spacing.md,
  },
  skeletonLine: {
    height: 13,
    borderRadius: 6,
    backgroundColor: t.colors.skeleton,
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
  footer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  paginationWrap: {
    alignItems: "center",
    gap: Spacing.sm,
    paddingTop: Spacing.lg,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.base,
  },
  firstPageLink: {
    color: t.colors.accent,
    fontSize: 13,
    fontWeight: "600",
    paddingVertical: Spacing.xs,
  },
  pageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  pageButtonNext: {
    transform: [{ rotate: "180deg" }],
  },
  pageButtonDisabled: {
    opacity: 0.4,
  },
  pageLabel: {
    color: t.colors.textSecondary,
    fontSize: 13.5,
    fontWeight: "600",
    minWidth: 96,
    textAlign: "center",
  },
}));
