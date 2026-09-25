import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChevronLeftIcon, ResponsesIcon, ReviewIcon } from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { BackButton } from "@/components/ui/back-button";
import { PressableScale } from "@/components/ui/pressable-scale";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { analyticsEvents, errorMessage } from "@/lib/analytics-events";
import { startChat } from "@/lib/chat";
import { tapFeedback } from "@/lib/haptics";
import { chatHref, toHref } from "@/lib/navigation";
import { cancelProject, type ProjectDetail, type Responder } from "@/lib/projects";
import type { Specialist } from "@/lib/trades";
import { useProject } from "@/queries/use-project";
import { useSpecialists } from "@/queries/use-specialists";
import { useAuthStore } from "@/store/use-auth-store";

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase();
}

function InProgressView({
  project,
  uid,
}: {
  project: ProjectDetail;
  uid: string;
}) {
  const styles = useStyles();
  const [opening, setOpening] = useState(false);
  const open = async () => {
    analyticsEvents.myRequestOpenChatTapped({
      project_id: project.id,
      contractor_uid: project.contractorId ?? null,
    });
    if (!project.contractorId || opening) return;
    tapFeedback();
    setOpening(true);
    try {
      const threadId = await startChat(uid, project.contractorId, project.id);
      router.push(chatHref(threadId, project.contractorName));
    } finally {
      setOpening(false);
    }
  };

  return (
    <View style={styles.inProgress}>
      <Text style={styles.sectionTitle}>Your specialist</Text>
      <View style={styles.specialistCard}>
        <Avatar name={project.contractorName || "Specialist"} size={46} />
        <View style={styles.specialistBody}>
          <Text style={styles.specialistName} numberOfLines={1}>
            {project.contractorName || "Specialist"}
          </Text>
          <Text style={styles.specialistMeta}>
            {project.state === "completed"
              ? "Project completed"
              : "Working on your project"}
          </Text>
        </View>
      </View>
      <PrimaryButton
        label={opening ? "Opening…" : "Open chat"}
        onPress={() => void open()}
        disabled={opening}
      />
    </View>
  );
}

function ResponderRow({
  responder,
  projectId,
  position,
}: {
  responder: Responder;
  projectId: string;
  position: number;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <PressableScale
      accessibilityLabel={responder.userName}
      onPress={() => {
        tapFeedback();
        analyticsEvents.myRequestResponderOpened({
          project_id: projectId,
          responder_uid: responder.userId,
          position,
        });
        router.push(
          toHref(
            `/trade/${encodeURIComponent(responder.userId)}?projectId=${encodeURIComponent(projectId)}`,
          ),
        );
      }}
    >
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {initials(responder.userName || "S")}
          </Text>
        </View>
        <View style={styles.rowBody}>
          <Text style={styles.rowName} numberOfLines={1}>
            {responder.userName || "Specialist"}
          </Text>
          <Text style={styles.rowMeta}>Tap to view profile</Text>
        </View>
        <View style={styles.chevron}>
          <ChevronLeftIcon size={18} color={colors.textMuted} />
        </View>
      </View>
    </PressableScale>
  );
}

function LookingSpecialists({
  project,
  uid,
}: {
  project: ProjectDetail;
  uid: string;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { data, isLoading } = useSpecialists(project.specialtyLabel, uid);
  const specialists = data?.items ?? [];

  const message = async (specialist: Specialist) => {
    tapFeedback();
    analyticsEvents.specialistMessageTapped({
      screen: "my_request",
      specialist_owner_id: specialist.ownerId,
      trade_id: specialist.tradeId,
      specialty: specialist.specialtyLabel,
      rating: specialist.rating,
      reviews: specialist.reviews,
      position: specialists.indexOf(specialist),
      project_id: project.id,
    });
    const threadId = await startChat(uid, specialist.ownerId, project.id);
    router.push(chatHref(threadId, specialist.name));
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Specialists for this job</Text>
      {isLoading ? (
        <Text style={styles.loading}>Finding specialists…</Text>
      ) : specialists.length === 0 ? (
        <Text style={styles.loading}>
          No specialists yet — we&apos;ll notify you when a match appears.
        </Text>
      ) : (
        specialists.map((specialist) => (
          <View key={specialist.tradeId} style={styles.row}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(specialist.name)}</Text>
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.rowName} numberOfLines={1}>
                {specialist.name}
              </Text>
              <View style={styles.ratingRow}>
                <ReviewIcon size={13} color={colors.coin} />
                <Text style={styles.rowMeta}>
                  {specialist.rating > 0
                    ? `${specialist.rating.toFixed(1)} · ${specialist.reviews} reviews`
                    : specialist.specialtyLabel || "New specialist"}
                </Text>
              </View>
            </View>
            <PressableScale
              accessibilityLabel={`Message ${specialist.name}`}
              onPress={() => void message(specialist)}
            >
              <View style={styles.messageChip}>
                <Text style={styles.messageChipText}>Message</Text>
              </View>
            </PressableScale>
          </View>
        ))
      )}
    </View>
  );
}

export default function MyRequestScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === "string" ? params.id : undefined;
  const uid = useAuthStore((state) => state.user?.uid) ?? "";

  const queryClient = useQueryClient();
  const { data: project, isLoading } = useProject(id);
  const [cancelling, setCancelling] = useState(false);

  const cancelled = project?.state === "cancelled";
  const assigned =
    project?.state === "in_progress" || project?.state === "completed";
  const completed = project?.state === "completed";
  const responders = project?.responders ?? [];
  const hasResponses = responders.length > 0;
  const canCancel =
    !!project &&
    (project.state === "published" || project.state === "in_progress");

  const runCancel = async () => {
    if (!project || cancelling) return;
    setCancelling(true);
    try {
      const counterparty =
        project.state === "in_progress" && project.contractorId
          ? project.contractorId
          : null;
      await cancelProject(project, uid, counterparty);
      analyticsEvents.projectCancelled({
        project_id: project.id,
        role: "customer",
        state: project.state,
      });
      void queryClient.invalidateQueries({ queryKey: ["my-projects"] });
      void queryClient.invalidateQueries({ queryKey: ["project", project.id] });
      router.back();
    } catch (error) {
      analyticsEvents.projectCancelFailed({
        project_id: project.id,
        error_message: errorMessage(error),
      });
      setCancelling(false);
      Alert.alert("Couldn't cancel", "Please try again.");
    }
  };

  const confirmCancel = () => {
    tapFeedback();
    Alert.alert(
      "Cancel this request?",
      "This can't be undone. Any specialist working on it will be notified.",
      [
        { text: "Keep request", style: "cancel" },
        {
          text: "Cancel request",
          style: "destructive",
          onPress: () => void runCancel(),
        },
      ],
    );
  };

  const viewedRef = useRef(false);
  useEffect(() => {
    if (!project || viewedRef.current) return;
    viewedRef.current = true;
    analyticsEvents.myRequestViewed({
      project_id: project.id,
      state: project.state,
      response_count: project.responders.length,
    });
  }, [project]);

  const statusLabel = cancelled
    ? "Cancelled"
    : completed
      ? "Completed"
      : assigned
        ? "In progress"
        : hasResponses
          ? `${responders.length} ${responders.length === 1 ? "response" : "responses"}`
          : "Looking for specialists";

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : !project ? (
          <View style={styles.center}>
            <Text style={styles.missing}>
              This request is no longer available.
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {project.requestId ? (
              <Text style={styles.requestId}>Request #{project.requestId}</Text>
            ) : null}
            <Text style={styles.title}>{project.title}</Text>
            <View style={styles.statusRow}>
              <ResponsesIcon size={14} color={colors.accent} />
              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>

            {cancelled ? (
              <View style={styles.cancelledCard}>
                <Text style={styles.cancelledText}>
                  This request was cancelled.
                </Text>
              </View>
            ) : assigned ? (
              <InProgressView project={project} uid={uid} />
            ) : hasResponses ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Responses</Text>
                {responders.map((responder, index) => (
                  <ResponderRow
                    key={responder.threadId || responder.userId}
                    responder={responder}
                    projectId={project.id}
                    position={index}
                  />
                ))}
              </View>
            ) : (
              <LookingSpecialists project={project} uid={uid} />
            )}

            {canCancel ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancel request"
                hitSlop={8}
                disabled={cancelling}
                onPress={confirmCancel}
                style={styles.cancelWrap}
              >
                <Text style={styles.cancelLink}>
                  {cancelling ? "Cancelling…" : "Cancel request"}
                </Text>
              </Pressable>
            ) : null}
          </ScrollView>
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
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  missing: {
    color: t.colors.textSecondary,
    fontSize: 15,
    textAlign: "center",
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  requestId: {
    color: t.colors.textSecondary,
    fontSize: 12.5,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  title: {
    color: t.colors.text,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginTop: 4,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  statusText: {
    color: t.colors.accent,
    fontSize: 13.5,
    fontWeight: "700",
  },
  section: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  sectionTitle: {
    color: t.colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  loading: {
    color: t.colors.textSecondary,
    fontSize: 14,
  },
  inProgress: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  specialistCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.base,
    padding: Spacing.base,
    borderRadius: Radius.lg,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  specialistBody: {
    flex: 1,
  },
  specialistName: {
    color: t.colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  specialistMeta: {
    color: t.colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.base,
    padding: Spacing.base,
    borderRadius: Radius.lg,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(22,179,100,0.14)",
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.3)",
  },
  avatarText: {
    color: t.colors.accent,
    fontSize: 15,
    fontWeight: "800",
  },
  rowBody: {
    flex: 1,
  },
  rowName: {
    color: t.colors.text,
    fontSize: 15.5,
    fontWeight: "700",
  },
  rowMeta: {
    color: t.colors.textSecondary,
    fontSize: 13,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 3,
  },
  chevron: {
    transform: [{ rotate: "180deg" }],
  },
  messageChip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(22,179,100,0.16)",
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.4)",
  },
  messageChipText: {
    color: t.colors.accent,
    fontSize: 13,
    fontWeight: "700",
  },
  cancelledCard: {
    marginTop: Spacing.xl,
    padding: Spacing.base,
    borderRadius: Radius.lg,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  cancelledText: {
    color: t.colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  cancelWrap: {
    alignItems: "center",
    paddingVertical: Spacing.base,
    marginTop: Spacing.lg,
  },
  cancelLink: {
    color: t.colors.destructive,
    fontSize: 14,
    fontWeight: "700",
  },
}));
