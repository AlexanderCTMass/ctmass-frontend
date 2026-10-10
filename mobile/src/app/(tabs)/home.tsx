import { FlashList, type FlashListRef } from "@shopify/flash-list";
import { useQueryClient } from "@tanstack/react-query";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { AdBanner } from "@/components/ads/ad-banner";
import { AdCarousel } from "@/components/ads/ad-carousel";
import {
  type InlineRow,
  inlineRowKey,
  inlineRowType,
  useInlineAds,
} from "@/components/ads/use-inline-ads";
import { ArchiveIcon, ChevronLeftIcon, TrashIcon } from "@/components/icons";
import { type CardBadge, ProjectCard } from "@/components/project/project-card";
import { SwipeActionsRow } from "@/components/project/swipe-actions-row";
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
import {
  isArchivedBy,
  isVisibleTo,
  useInvitedRequestActions,
} from "@/hooks/use-invited-request-actions";
import { useMyCenter } from "@/hooks/use-my-center";
import { AD_PLACEMENTS } from "@/lib/ad-placements";
import { analyticsEvents } from "@/lib/analytics-events";
import { startChat } from "@/lib/chat";
import { distanceBetweenCenters } from "@/lib/geo";
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

function projectKey(project: ProjectDetail): string {
  return project.id;
}

function statusMeta(
  state: string,
  responseCount: number,
  colors: ThemeColors,
): CardBadge {
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
        label: "open",
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

function InvitedRow({
  project,
  distance,
  onPress,
  onArchive,
  onDelete,
}: {
  project: ProjectDetail;
  distance: number | null;
  onPress: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const { colors } = useTheme();
  return (
    <SwipeActionsRow
      onOpen={() =>
        analyticsEvents.invitedProjectSwiped({
          project_id: project.id,
          screen: "home",
        })
      }
      actions={[
        {
          key: "archive",
          label: "Archive",
          icon: <ArchiveIcon size={22} color="#FFFFFF" />,
          background: colors.info,
          onPress: onArchive,
        },
        {
          key: "delete",
          label: "Delete",
          icon: <TrashIcon size={22} color="#FFFFFF" />,
          background: colors.danger,
          onPress: onDelete,
        },
      ]}
    >
      <ProjectCard
        project={project}
        badge={{
          label: "Invited",
          tint: colors.accent,
          bg: "rgba(22,179,100,0.18)",
        }}
        distance={distance}
        ctaLabel="Open chat"
        showResponses={false}
        highlighted
        onPress={onPress}
      />
    </SwipeActionsRow>
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
      <View style={[styles.skeletonLine, { width: "92%", marginTop: 14 }]} />
      <View style={[styles.skeletonLine, { width: "74%", marginTop: 8 }]} />
      <View style={[styles.skeletonButton, { marginTop: 16 }]} />
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
  const { colors } = useTheme();
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
  const listRef = useRef<FlashListRef<InlineRow<ProjectDetail>>>(null);

  const myProjects = useMyProjects(uid);
  const nearby = useNearbyProjects(uid);
  const invited = useInvitedProjects(uid);
  const myTrade = useTradeByOwner(mode === "contractor" ? uid : undefined);
  const hasTrade = Boolean(myTrade.data);
  const myCenter = useMyCenter(uid);
  const invitedActions = useInvitedRequestActions(uid);

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
  const invitedVisible = (invited.data ?? []).filter((project) =>
    isVisibleTo(project, uid),
  );
  const invitedItems = !isHomeowner
    ? invitedVisible.filter((project) => !isArchivedBy(project, uid))
    : [];
  const archivedCount = invitedVisible.filter((project) =>
    isArchivedBy(project, uid),
  ).length;
  const distanceTo = (project: ProjectDetail) =>
    distanceBetweenCenters(myCenter, project.locationCenter);

  const page = isHomeowner ? myPage : nearbyPage;
  const items = isHomeowner ? myItems : nearbyItems;
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageItems = useMemo(
    () => items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [items, page],
  );
  const adPlacement = isHomeowner
    ? AD_PLACEMENTS.HomeownerHomeBetweenRequests
    : AD_PLACEMENTS.ContractorHomeBetweenRequests;
  const { rows, onViewableItemsChanged, viewabilityConfig } = useInlineAds(
    adPlacement,
    pageItems,
    projectKey,
  );

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

  const openArchive = () => {
    tapFeedback();
    analyticsEvents.invitedArchiveOpened({ archived_count: archivedCount });
    router.push(toHref("/archived-requests"));
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
          data={rows}
          keyExtractor={inlineRowKey}
          getItemType={inlineRowType}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          renderItem={({ item: row }) =>
            row.kind === "ad" ? (
              <AdBanner
                ad={row.ad}
                placement={adPlacement}
                position={row.slot}
              />
            ) : isHomeowner ? (
              <ProjectCard
                project={row.item}
                badge={statusMeta(
                  row.item.state,
                  row.item.responseCount,
                  colors,
                )}
                ctaLabel="View request"
                onPress={() => openMyRequest(row.item, row.index)}
              />
            ) : (
              <ProjectCard
                project={row.item}
                badge={
                  uid && row.item.responders.some((r) => r.userId === uid)
                    ? {
                        label: "Responded",
                        tint: colors.accent,
                        bg: "rgba(22,179,100,0.14)",
                      }
                    : statusMeta(row.item.state, row.item.responseCount, colors)
                }
                distance={distanceTo(row.item)}
                ctaLabel={
                  uid && row.item.responders.some((r) => r.userId === uid)
                    ? "Open chat"
                    : "View details & respond"
                }
                onPress={() => openNearby(row.item, row.index)}
              />
            )
          }
          ListHeaderComponent={
            <View>
              <AdCarousel placement={AD_PLACEMENTS.HomeTop} />
              {!isHomeowner &&
              (invitedItems.length > 0 || archivedCount > 0) ? (
                <View style={styles.invitedSection}>
                  <View style={styles.invitedHeader}>
                    <Text style={styles.invitedSectionTitle}>
                      Direct requests
                    </Text>
                    {archivedCount > 0 ? (
                      <Pressable
                        accessibilityRole="button"
                        hitSlop={8}
                        onPress={openArchive}
                        style={styles.archiveLink}
                      >
                        <ArchiveIcon size={16} color={colors.accent} />
                        <Text style={styles.archiveLinkText}>
                          Archive ({archivedCount})
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                  {invitedItems.length > 0 ? (
                    <Text style={styles.invitedHint}>
                      Swipe left on a request to archive or delete it.
                    </Text>
                  ) : (
                    <Text style={styles.invitedHint}>
                      No new direct requests.
                    </Text>
                  )}
                  {invitedItems.map((project) => (
                    <InvitedRow
                      key={project.id}
                      project={project}
                      distance={distanceTo(project)}
                      onPress={() => openInvited(project)}
                      onArchive={() => invitedActions.archive(project)}
                      onDelete={() => invitedActions.remove(project)}
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
  invitedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  invitedHint: {
    color: t.colors.textMuted,
    fontSize: 12.5,
    marginTop: -Spacing.sm,
  },
  archiveLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(22,179,100,0.12)",
  },
  archiveLinkText: {
    color: t.colors.accent,
    fontSize: 13,
    fontWeight: "700",
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
  skeletonButton: {
    height: 46,
    borderRadius: Radius.pill,
    backgroundColor: t.colors.skeleton,
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
