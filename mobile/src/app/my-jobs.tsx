import { FlashList } from "@shopify/flash-list";
import { useQueryClient } from "@tanstack/react-query";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackButton } from "@/components/ui/back-button";
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
import { analyticsEvents, errorMessage } from "@/lib/analytics-events";
import { startChat } from "@/lib/chat";
import { tapFeedback } from "@/lib/haptics";
import { chatHref } from "@/lib/navigation";
import { cancelProject, type ProjectDetail } from "@/lib/projects";
import { useContractorJobs } from "@/queries/use-projects";
import { useAuthStore } from "@/store/use-auth-store";

type Tab = "active" | "history";

function statusMeta(
  state: string,
  colors: ThemeColors,
): { label: string; tint: string; bg: string } {
  switch (state) {
    case "completed":
      return {
        label: "Completed",
        tint: colors.accent,
        bg: "rgba(22,179,100,0.14)",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        tint: colors.textSecondary,
        bg: colors.surfaceStrong,
      };
    default:
      return {
        label: "In progress",
        tint: colors.accent,
        bg: "rgba(22,179,100,0.14)",
      };
  }
}

function JobCard({
  project,
  onOpen,
  onCancel,
}: {
  project: ProjectDetail;
  onOpen: () => void;
  onCancel?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const status = statusMeta(project.state, colors);
  const meta = [project.customerName, project.specialtyLabel]
    .filter(Boolean)
    .join(" · ");
  return (
    <View style={styles.card}>
      <PressableScale accessibilityLabel={project.title} onPress={onOpen}>
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
        <Text style={styles.cardMeta} numberOfLines={1}>
          {meta || "Direct job"}
        </Text>
        {project.completionRequested && project.state === "in_progress" ? (
          <Text style={styles.cardHint}>
            Waiting for the customer to confirm completion.
          </Text>
        ) : null}
      </PressableScale>
      {onCancel ? (
        <View style={styles.cardActions}>
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={onCancel}
          >
            <Text style={styles.cancelLink}>Cancel job</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

export default function MyJobsScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const uid = useAuthStore((state) => state.user?.uid);
  const queryClient = useQueryClient();
  const jobs = useContractorJobs(uid);
  const [tab, setTab] = useState<Tab>("active");
  const [cancelling, setCancelling] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!uid) return;
      void queryClient.invalidateQueries({ queryKey: ["contractor-jobs"] });
    }, [uid, queryClient]),
  );

  const all = jobs.data ?? [];
  const active = all.filter((item) => item.state === "in_progress");
  const history = all.filter(
    (item) => item.state === "completed" || item.state === "cancelled",
  );
  const items = tab === "active" ? active : history;

  const viewedRef = useRef(false);
  useEffect(() => {
    if (jobs.isLoading || viewedRef.current) return;
    viewedRef.current = true;
    analyticsEvents.contractorJobsViewed({
      active_count: active.length,
      history_count: history.length,
    });
  }, [jobs.isLoading, active.length, history.length]);

  const openJob = (project: ProjectDetail) => {
    if (!uid) return;
    tapFeedback();
    analyticsEvents.contractorJobOpened({
      project_id: project.id,
      state: project.state,
    });
    void startChat(uid, project.userId, project.id).then((threadId) => {
      router.push(chatHref(threadId, project.customerName));
    });
  };

  const runCancel = async (project: ProjectDetail) => {
    if (!uid || cancelling) return;
    setCancelling(project.id);
    try {
      await cancelProject(project, uid, project.userId);
      analyticsEvents.projectCancelled({
        project_id: project.id,
        role: "contractor",
        state: project.state,
      });
      void queryClient.invalidateQueries({ queryKey: ["contractor-jobs"] });
      void queryClient.invalidateQueries({ queryKey: ["my-projects"] });
      void queryClient.invalidateQueries({ queryKey: ["invited-projects"] });
    } catch (error) {
      analyticsEvents.projectCancelFailed({
        project_id: project.id,
        error_message: errorMessage(error),
      });
      Alert.alert("Couldn't cancel", "Please try again.");
    } finally {
      setCancelling(null);
    }
  };

  const confirmCancel = (project: ProjectDetail) => {
    tapFeedback();
    Alert.alert(
      "Cancel this job?",
      "The customer will be notified. This can't be undone.",
      [
        { text: "Keep job", style: "cancel" },
        {
          text: "Cancel job",
          style: "destructive",
          onPress: () => void runCancel(project),
        },
      ],
    );
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.headerTitle}>My jobs</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.tabs}>
          {(["active", "history"] as const).map((value) => {
            const activeTab = tab === value;
            return (
              <Pressable
                key={value}
                accessibilityRole="button"
                style={[styles.tab, activeTab && styles.tabActive]}
                onPress={() => {
                  if (!activeTab) {
                    tapFeedback();
                    setTab(value);
                  }
                }}
              >
                <Text
                  style={[styles.tabText, activeTab && styles.tabTextActive]}
                >
                  {value === "active"
                    ? `Active${active.length ? ` (${active.length})` : ""}`
                    : `History${history.length ? ` (${history.length})` : ""}`}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {jobs.isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : (
          <FlashList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <JobCard
                project={item}
                onOpen={() => openJob(item)}
                onCancel={
                  tab === "active" && cancelling !== item.id
                    ? () => confirmCancel(item)
                    : undefined
                }
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>
                  {tab === "active" ? "No active jobs" : "No past jobs yet"}
                </Text>
                <Text style={styles.emptyText}>
                  {tab === "active"
                    ? "Jobs you're selected for show up here."
                    : "Completed and cancelled jobs appear here."}
                </Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
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
  tabs: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    alignItems: "center",
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  tabActive: {
    backgroundColor: "rgba(22,179,100,0.12)",
    borderColor: Brand.primary,
  },
  tabText: {
    color: t.colors.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  tabTextActive: {
    color: t.colors.textStrong,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  separator: {
    height: Spacing.md,
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
  cardHint: {
    color: t.colors.textMuted,
    fontSize: 12.5,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 2,
  },
  cancelLink: {
    color: t.colors.destructive,
    fontSize: 13,
    fontWeight: "700",
    paddingVertical: 2,
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
