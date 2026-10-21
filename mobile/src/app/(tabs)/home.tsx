import { FlashList, type FlashListRef } from "@shopify/flash-list";
import { useQueryClient } from "@tanstack/react-query";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
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
import {
  ArchiveIcon,
  ChevronLeftIcon,
  HeartIcon,
  ResponsesIcon,
  SelectSpecialistIcon,
  SubmitRequestIcon,
} from "@/components/icons";
import { type CardBadge, ProjectCard } from "@/components/project/project-card";
import { FeedTabs, SortChip } from "@/components/ui/feed-tabs";
import { PrimaryButton } from "@/components/ui/primary-button";
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
  isArchivedBy,
  isOpenFor,
  isVisibleTo,
  useInvitedRequestActions,
} from "@/hooks/use-invited-request-actions";
import { useMyCenter } from "@/hooks/use-my-center";
import {
  type SwipeSource,
  projectSubject,
  useSwipeActions,
} from "@/hooks/use-swipe-actions";
import { useSwipeHint } from "@/hooks/use-swipe-hint";
import { AD_PLACEMENTS } from "@/lib/ad-placements";
import { analyticsEvents } from "@/lib/analytics-events";
import { startChat } from "@/lib/chat";
import { distanceBetweenCenters } from "@/lib/geo";
import { tapFeedback } from "@/lib/haptics";
import { chatHref, toHref } from "@/lib/navigation";
import type { ProjectDetail } from "@/lib/projects";
import { rankByAffinity } from "@/lib/swipes";
import {
  useInvitedProjects,
  useMyProjects,
  useNearbyProjects,
} from "@/queries/use-projects";
import { useProjectLikeStats, useProjectsByIds } from "@/queries/use-swipes";
import { useTradeByOwner } from "@/queries/use-trade";
import { useAppStore } from "@/store/use-app-store";
import { useAuthStore } from "@/store/use-auth-store";
import { useProjectDraftStore } from "@/store/use-project-draft-store";
import { useTradeDraftStore } from "@/store/use-trade-draft-store";

type Mode = "homeowner" | "contractor";
type FeedTabKey = "all" | "liked";
type FeedSort = "for_you" | "newest";
const PAGE_SIZE = 25;
const SEGMENT_TIMING = { duration: 220, easing: Easing.out(Easing.cubic) };

function isMode(value: unknown): value is Mode {
  return value === "homeowner" || value === "contractor";
}

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
  const [animate, setAnimate] = useState(false);
  const pillWidth = width > 0 ? (width - 8) / 2 : 0;

  const pillStyle = useAnimatedStyle(() => {
    const target = index * pillWidth;
    return {
      transform: [
        { translateX: animate ? withTiming(target, SEGMENT_TIMING) : target },
      ],
    };
  }, [index, pillWidth, animate]);

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
                setAnimate(true);
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
  liked,
  dismissOnUnlike = false,
  hint,
  onHintShown,
  onPress,
  onLike,
  onToggleLike,
  onArchive,
  onDelete,
}: {
  project: ProjectDetail;
  distance: number | null;
  liked: boolean;
  dismissOnUnlike?: boolean;
  hint: boolean;
  onHintShown: () => void;
  onPress: () => void;
  onLike: () => void;
  onToggleLike: () => void;
  onArchive: (source: SwipeSource) => void;
  onDelete: () => void;
}) {
  const { colors } = useTheme();
  const sides = useSwipeSides();
  const openMenu = () => {
    tapFeedback();
    Alert.alert(project.title, "What would you like to do with this request?", [
      { text: "Archive", onPress: () => onArchive("menu") },
      { text: "Delete", style: "destructive", onPress: onDelete },
      { text: "Cancel", style: "cancel" },
    ]);
  };
  return (
    <SwipeCard
      itemKey={project.id}
      liked={liked}
      hint={hint}
      onHintShown={onHintShown}
      right={sides.like(liked, onLike, dismissOnUnlike)}
      left={sides.archive(() => onArchive("swipe"))}
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
        liked={liked}
        onPress={onPress}
        onMore={openMenu}
        onToggleLike={onToggleLike}
      />
    </SwipeCard>
  );
}

const HOMEOWNER_STEPS = [
  {
    key: "describe",
    icon: SubmitRequestIcon,
    title: "Describe the job",
    text: "Answer a few quick questions about what you need.",
  },
  {
    key: "offers",
    icon: ResponsesIcon,
    title: "Get responses",
    text: "Local specialists reach out to you in chat.",
  },
  {
    key: "hire",
    icon: SelectSpecialistIcon,
    title: "Hire the right pro",
    text: "Compare ratings and reviews, then choose.",
  },
] as const;

function HomeownerEmptyState() {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.heroCard}>
      <View style={styles.heroBadge}>
        <SubmitRequestIcon size={34} color={colors.accent} />
      </View>
      <Text style={styles.heroTitle}>What needs doing?</Text>
      <Text style={styles.heroText}>
        Post a request and local specialists will reach out to you. You decide
        who to hire.
      </Text>
      <View style={styles.steps}>
        {HOMEOWNER_STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <View key={step.key} style={styles.step}>
              <View style={styles.stepIcon}>
                <Icon size={20} color={colors.accent} />
              </View>
              <View style={styles.stepBody}>
                <Text style={styles.stepTitle}>
                  {index + 1}. {step.title}
                </Text>
                <Text style={styles.stepText}>{step.text}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
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
  const params = useLocalSearchParams<{ mode?: string }>();
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
  const swipe = useSwipeActions(uid, "home");
  const sides = useSwipeSides();
  const swipeHint = useSwipeHint("home-contractor");
  const undo = useUndoToast();
  const likeStats = useProjectLikeStats(mode === "homeowner" ? uid : undefined);
  const [tab, setTab] = useState<FeedTabKey>("all");
  const [sort, setSort] = useState<FeedSort>("for_you");

  const requestedMode = isMode(params.mode) ? params.mode : null;
  const [appliedMode, setAppliedMode] = useState<Mode | null>(null);
  if (requestedMode !== appliedMode) {
    setAppliedMode(requestedMode);
    if (requestedMode) setMode(requestedMode);
  }

  useEffect(() => {
    if (requestedMode) router.setParams({ mode: undefined });
  }, [requestedMode]);

  useFocusEffect(
    useCallback(() => {
      if (!uid) return;
      void queryClient.invalidateQueries({ queryKey: ["my-projects"] });
      void queryClient.invalidateQueries({ queryKey: ["nearby-projects"] });
      void queryClient.invalidateQueries({ queryKey: ["invited-projects"] });
      void queryClient.invalidateQueries({ queryKey: ["project-like-stats"] });
    }, [uid, queryClient]),
  );

  const isHomeowner = mode === "homeowner";
  const showLiked = !isHomeowner && tab === "liked";
  const { liked, archived } = swipe.projectIndex;
  const myItems = myProjects.data ?? [];
  const nearbyFresh = useMemo(() => {
    const list = (nearby.data ?? []).filter((item) => !archived.has(item.id));
    return sort === "for_you"
      ? rankByAffinity(
          list,
          swipe.projectIndex,
          (item) => item.id,
          (item) => item.specialtyLabel,
        )
      : list;
  }, [nearby.data, archived, sort, swipe.projectIndex]);
  const invitedVisible = (invited.data ?? []).filter((project) =>
    isVisibleTo(project, uid),
  );
  const invitedArchivedIds = invitedVisible
    .filter((project) => isArchivedBy(project, uid))
    .map((project) => project.id);
  const invitedItems =
    !isHomeowner && !showLiked
      ? invitedVisible.filter(
          (project) => !isArchivedBy(project, uid) && !archived.has(project.id),
        )
      : [];
  const openIds = new Set([
    ...(nearby.data ?? []).map((project) => project.id),
    ...invitedVisible.map((project) => project.id),
  ]);
  const archivedCount = new Set([
    ...invitedArchivedIds,
    ...[...archived].filter((id) => openIds.has(id)),
  ]).size;
  const likedIds = useMemo(() => [...liked], [liked]);
  const likedProjects = useProjectsByIds(likedIds, !isHomeowner);
  const likedItems = useMemo(
    () =>
      (likedProjects.data ?? []).filter(
        (item) =>
          liked.has(item.id) &&
          !archived.has(item.id) &&
          isOpenFor(item, uid) &&
          isVisibleTo(item, uid) &&
          !isArchivedBy(item, uid),
      ),
    [likedProjects.data, liked, archived, uid],
  );
  const nearbyItems = showLiked ? likedItems : nearbyFresh;
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
  }, [page, mode, tab]);

  const isInvited = (project: ProjectDetail) =>
    Boolean(uid && project.proposerUserId === uid);

  const likeProject = (project: ProjectDetail, source: SwipeSource) => {
    const subject = projectSubject(project);
    if (liked.has(project.id)) swipe.unlike(subject, source);
    else swipe.like(subject, source);
  };

  const archiveProject = (project: ProjectDetail, source: SwipeSource) => {
    const subject = projectSubject(project);
    const invitedOne = isInvited(project);
    const revert = swipe.archive(subject, source);
    if (invitedOne) invitedActions.archive(project);
    undo.show("Request archived", () => {
      revert();
      if (invitedOne) invitedActions.restore(project);
    });
  };

  const changeTab = (next: FeedTabKey) => {
    analyticsEvents.cardFeedTabChanged({
      screen: "home",
      tab: next,
      count: next === "liked" ? liked.size : nearbyFresh.length,
    });
    setNearbyPage(1);
    setTab(next);
  };

  const toggleSort = () => {
    const next: FeedSort = sort === "for_you" ? "newest" : "for_you";
    analyticsEvents.cardFeedSortChanged({ screen: "home", sort: next });
    setNearbyPage(1);
    setSort(next);
  };

  const hintReady =
    !isHomeowner && swipe.isReady && swipeHint.pending && !nearby.isLoading;
  const hintTarget = hintReady
    ? (invitedItems[0]?.id ?? (page === 1 ? pageItems[0]?.id : undefined))
    : undefined;

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

        <View style={styles.listWrap}>
          <FlashList
            ref={listRef}
            data={rows}
            extraData={[swipe.projectIndex, likeStats.data, hintTarget]}
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
                  likeCount={likeStats.data?.[row.item.id] ?? 0}
                  onPress={() => openMyRequest(row.item, row.index)}
                />
              ) : isInvited(row.item) ? (
                <InvitedRow
                  project={row.item}
                  distance={distanceTo(row.item)}
                  liked={liked.has(row.item.id)}
                  dismissOnUnlike={showLiked}
                  hint={hintTarget === row.item.id}
                  onHintShown={swipeHint.markShown}
                  onPress={() => openInvited(row.item)}
                  onLike={() => likeProject(row.item, "swipe")}
                  onToggleLike={() => likeProject(row.item, "tap")}
                  onArchive={(source) => archiveProject(row.item, source)}
                  onDelete={() => invitedActions.remove(row.item)}
                />
              ) : (
                <SwipeCard
                  itemKey={row.item.id}
                  liked={liked.has(row.item.id)}
                  hint={hintTarget === row.item.id}
                  onHintShown={swipeHint.markShown}
                  right={
                    uid
                      ? sides.like(
                          liked.has(row.item.id),
                          () => likeProject(row.item, "swipe"),
                          showLiked,
                        )
                      : undefined
                  }
                  left={
                    uid
                      ? sides.archive(() => archiveProject(row.item, "swipe"))
                      : undefined
                  }
                >
                  <ProjectCard
                    project={row.item}
                    badge={
                      uid && row.item.responders.some((r) => r.userId === uid)
                        ? {
                            label: "Responded",
                            tint: colors.accent,
                            bg: "rgba(22,179,100,0.14)",
                          }
                        : statusMeta(
                            row.item.state,
                            row.item.responseCount,
                            colors,
                          )
                    }
                    distance={distanceTo(row.item)}
                    ctaLabel={
                      uid && row.item.responders.some((r) => r.userId === uid)
                        ? "Open chat"
                        : "View details & respond"
                    }
                    liked={liked.has(row.item.id)}
                    onPress={() => openNearby(row.item, row.index)}
                    onToggleLike={
                      uid ? () => likeProject(row.item, "tap") : undefined
                    }
                  />
                </SwipeCard>
              )
            }
            ListHeaderComponent={
              <View>
                <AdCarousel placement={AD_PLACEMENTS.HomeTop} />
                {invitedItems.length > 0 ? (
                  <View style={styles.invitedSection}>
                    <Text style={styles.invitedSectionTitle}>
                      Direct requests
                    </Text>
                    <Text style={styles.invitedHint}>
                      Homeowners sent these to you directly. Swipe right to
                      like, left to archive, or reply in chat.
                    </Text>
                    {invitedItems.map((project) => (
                      <InvitedRow
                        key={project.id}
                        project={project}
                        distance={distanceTo(project)}
                        liked={liked.has(project.id)}
                        hint={hintTarget === project.id}
                        onHintShown={swipeHint.markShown}
                        onPress={() => openInvited(project)}
                        onLike={() => likeProject(project, "swipe")}
                        onToggleLike={() => likeProject(project, "tap")}
                        onArchive={(source) => archiveProject(project, source)}
                        onDelete={() => invitedActions.remove(project)}
                      />
                    ))}
                  </View>
                ) : null}
                {isHomeowner && isEmpty ? null : (
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                      {isHomeowner
                        ? "My requests"
                        : showLiked
                          ? "Liked requests"
                          : "Requests nearby"}
                    </Text>
                    {!isHomeowner && archivedCount > 0 ? (
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
                )}
                {!isHomeowner ? (
                  <FeedTabs<FeedTabKey>
                    value={tab}
                    onChange={changeTab}
                    tabs={[
                      { key: "all", label: "All" },
                      {
                        key: "liked",
                        label: "Liked",
                        count: liked.size,
                        icon: (color) => (
                          <HeartIcon size={14} color={color} filled />
                        ),
                      },
                    ]}
                    trailing={
                      showLiked ? null : (
                        <SortChip
                          label={sort === "for_you" ? "For you" : "Newest"}
                          onPress={toggleSort}
                        />
                      )
                    }
                  />
                ) : null}
              </View>
            }
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              isLoading ? (
                <SkeletonList />
              ) : isHomeowner ? (
                <HomeownerEmptyState />
              ) : showLiked ? (
                likedProjects.isLoading ? (
                  <SkeletonList />
                ) : (
                  <EmptyState
                    title="No liked requests yet"
                    text="Swipe a request right or tap the heart to save it here. Your likes are private."
                  />
                )
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
          <UndoToast toast={undo.toast} onHide={undo.hide} />
        </View>

        <View style={styles.footer}>
          {isHomeowner ? (
            <>
              <PrimaryButton
                label={isEmpty ? "Post a request" : "New request"}
                onPress={newRequest}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Browse specialists and request one directly"
                onPress={findSpecialist}
                style={({ pressed }) => [
                  styles.browseButton,
                  pressed && styles.browseButtonPressed,
                ]}
              >
                <SelectSpecialistIcon size={18} color={colors.accent} />
                <Text style={styles.browseText}>
                  Or choose a specialist yourself
                </Text>
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    flexShrink: 1,
    color: t.colors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  listWrap: {
    flex: 1,
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
  heroCard: {
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: t.isDark ? t.colors.surface : t.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.35)",
    gap: Spacing.sm,
  },
  heroBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(22,179,100,0.14)",
    marginBottom: Spacing.xs,
  },
  heroTitle: {
    color: t.colors.text,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.4,
    textAlign: "center",
  },
  heroText: {
    color: t.colors.textSecondary,
    fontSize: 15,
    lineHeight: 21,
    textAlign: "center",
  },
  steps: {
    alignSelf: "stretch",
    gap: Spacing.md,
    marginTop: Spacing.md,
    paddingTop: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(22,179,100,0.12)",
  },
  stepBody: {
    flex: 1,
    gap: 2,
  },
  stepTitle: {
    color: t.colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  stepText: {
    color: t.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  browseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    height: 46,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: "rgba(22,179,100,0.45)",
    backgroundColor: t.isDark ? "rgba(22,179,100,0.08)" : "rgba(255,255,255,0.7)",
  },
  browseButtonPressed: {
    opacity: 0.7,
  },
  browseText: {
    color: t.colors.accent,
    fontSize: 14.5,
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
