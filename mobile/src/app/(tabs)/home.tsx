import { FlashList, type FlashListRef } from "@shopify/flash-list";
import { useQueryClient } from "@tanstack/react-query";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
import { Brand, Colors, Radius, Spacing } from "@/constants/theme";
import { timeAgo } from "@/lib/format";
import { tapFeedback } from "@/lib/haptics";
import { chatHref, toHref } from "@/lib/navigation";
import type { ProjectDetail } from "@/lib/projects";
import { useMyProjects, useNearbyProjects } from "@/queries/use-projects";
import { useAppStore } from "@/store/use-app-store";
import { useAuthStore } from "@/store/use-auth-store";
import { useProjectDraftStore } from "@/store/use-project-draft-store";
import { useTradeDraftStore } from "@/store/use-trade-draft-store";

type Mode = "homeowner" | "contractor";
const PAGE_SIZE = 25;

function statusMeta(
  state: string,
  responseCount: number,
): { label: string; tint: string; bg: string } {
  if (state === "published" && responseCount > 0) {
    return {
      label: `${responseCount} ${responseCount === 1 ? "response" : "responses"}`,
      tint: Brand.info,
      bg: "rgba(41,112,255,0.16)",
    };
  }
  switch (state) {
    case "in_progress":
      return {
        label: "in progress",
        tint: Brand.primaryLight,
        bg: "rgba(22,179,100,0.14)",
      };
    case "published":
      return {
        label: "looking for specialists",
        tint: Brand.coin,
        bg: "rgba(255,193,7,0.14)",
      };
    case "completed":
      return {
        label: "completed",
        tint: Brand.primaryLight,
        bg: "rgba(22,179,100,0.14)",
      };
    case "moderate":
      return {
        label: "in review",
        tint: Brand.info,
        bg: "rgba(41,112,255,0.16)",
      };
    default:
      return {
        label: "draft",
        tint: Colors.textSecondary,
        bg: Colors.surfaceStrong,
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
  const status = statusMeta(project.state, project.responseCount);
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
              <CheckIcon size={12} color={Brand.primaryLight} strokeWidth={3} />
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

function EmptyState({ title, text }: { title: string; text: string }) {
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
          <ChevronLeftIcon size={18} color={Colors.text} />
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
          <ChevronLeftIcon size={18} color={Colors.text} />
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
  return (
    <View style={styles.card}>
      <View style={[styles.skeletonLine, { width: "58%" }]} />
      <View style={[styles.skeletonLine, { width: "36%", marginTop: 10 }]} />
    </View>
  );
}

function SkeletonList() {
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

  useFocusEffect(
    useCallback(() => {
      if (!uid) return;
      void queryClient.invalidateQueries({ queryKey: ["my-projects"] });
      void queryClient.invalidateQueries({ queryKey: ["nearby-projects"] });
    }, [uid, queryClient]),
  );

  const isHomeowner = mode === "homeowner";
  const myItems = myProjects.data ?? [];
  const nearbyItems = nearby.data ?? [];

  const page = isHomeowner ? myPage : nearbyPage;
  const items = isHomeowner ? myItems : nearbyItems;
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [page, mode]);

  const openNearby = (project: ProjectDetail) => {
    tapFeedback();
    const respondedThread = uid
      ? project.responders.find((item) => item.userId === uid)?.threadId
      : undefined;
    if (respondedThread) {
      router.push(chatHref(respondedThread, project.customerName));
      return;
    }
    queryClient.setQueryData(["project", project.id], project);
    router.push(toHref(`/request/${project.id}`));
  };

  const openMyRequest = (project: ProjectDetail) => {
    tapFeedback();
    queryClient.setQueryData(["project", project.id], project);
    router.push(toHref(`/my-request/${project.id}`));
  };

  const newRequest = () => {
    tapFeedback();
    resetProjectDraft();
    router.push("/homeowner-choose-specialty");
  };

  const newTrade = () => {
    tapFeedback();
    resetTradeDraft();
    router.push(toHref("/contractor-setup-trade"));
  };

  const isLoading = isHomeowner ? myProjects.isLoading : nearby.isLoading;

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <SegmentedControl mode={mode} onChange={setMode} />
        </View>

        <FlashList
          ref={listRef}
          data={pageItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>
            isHomeowner ? (
              <MyRequestCard
                project={item}
                onPress={() => openMyRequest(item)}
              />
            ) : (
              <NearbyCard
                project={item}
                responded={
                  uid ? item.responders.some((r) => r.userId === uid) : false
                }
                onPress={() => openNearby(item)}
              />
            )
          }
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>
              {isHomeowner ? "My requests" : "Requests nearby"}
            </Text>
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
              onChange={isHomeowner ? setMyPage : setNearbyPage}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.footer}>
          {isHomeowner ? (
            <PrimaryButton label="New request" onPress={newRequest} />
          ) : (
            <PrimaryButton label="New trade" onPress={newTrade} />
          )}
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: Colors.surface,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.textSecondary,
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
    color: Colors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: Spacing.md,
  },
  card: {
    padding: Spacing.base,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  cardTitle: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  cardMeta: {
    color: Colors.textSecondary,
    fontSize: 13.5,
  },
  cardPosted: {
    color: Colors.textMuted,
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
    color: Brand.primaryLight,
    fontSize: 12,
    fontWeight: "700",
  },
  loading: {
    color: Colors.textSecondary,
    fontSize: 14,
    paddingVertical: Spacing.md,
  },
  skeletonList: {
    gap: Spacing.md,
  },
  skeletonLine: {
    height: 13,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  empty: {
    alignItems: "center",
    paddingTop: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  emptyText: {
    color: Colors.textSecondary,
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
    color: Brand.primaryLight,
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
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pageButtonNext: {
    transform: [{ rotate: "180deg" }],
  },
  pageButtonDisabled: {
    opacity: 0.4,
  },
  pageLabel: {
    color: Colors.textSecondary,
    fontSize: 13.5,
    fontWeight: "600",
    minWidth: 96,
    textAlign: "center",
  },
});
