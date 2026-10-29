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

import { ChevronLeftIcon, HeartIcon, ResponsesIcon } from "@/components/icons";
import { ProjectDetails } from "@/components/project/project-details";
import { TradeCard } from "@/components/trade/trade-card";
import { Avatar } from "@/components/ui/avatar";
import { BackButton } from "@/components/ui/back-button";
import { PressableScale } from "@/components/ui/pressable-scale";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { publicPhone, useTradeContact } from "@/hooks/use-trade-contact";
import { analyticsEvents, errorMessage } from "@/lib/analytics-events";
import { startChat } from "@/lib/chat";
import { distanceMiles } from "@/lib/geo";
import { tapFeedback } from "@/lib/haptics";
import { useT } from "@/lib/i18n";
import { chatHref, toHref } from "@/lib/navigation";
import {
  cancelProject,
  type ProjectDetail,
  type Responder,
} from "@/lib/projects";
import type { Specialist } from "@/lib/trades";
import { useProject } from "@/queries/use-project";
import { useSpecialists } from "@/queries/use-specialists";
import { useProjectLikeStats } from "@/queries/use-swipes";
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
  const { t } = useT();
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
      <Text style={styles.sectionTitle}>{t("myRequest.yourSpecialist")}</Text>
      <View style={styles.specialistCard}>
        <Avatar
          name={project.contractorName || t("myRequest.specialist")}
          size={46}
        />
        <View style={styles.specialistBody}>
          <Text style={styles.specialistName} numberOfLines={1}>
            {project.contractorName || t("myRequest.specialist")}
          </Text>
          <Text style={styles.specialistMeta}>
            {project.state === "completed"
              ? t("chat.projectCompleted")
              : t("myRequest.working")}
          </Text>
        </View>
      </View>
      <PrimaryButton
        label={opening ? t("friends.opening") : t("home.openChat")}
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
  const { t } = useT();
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
            {responder.userName || t("myRequest.specialist")}
          </Text>
          <Text style={styles.rowMeta}>{t("myRequest.tapProfile")}</Text>
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
  const styles = useStyles();
  const { t } = useT();
  const { data, isLoading } = useSpecialists(project.specialtyLabel, uid);
  const specialists = (data?.items ?? []).filter(
    (specialist) => !project.declinedBy.includes(specialist.ownerId),
  );

  const contact = useTradeContact("card");
  const origin = project.locationCenter;
  const distanceTo = (specialist: Specialist): number | null =>
    origin && specialist.lat != null && specialist.lng != null
      ? distanceMiles(origin[1], origin[0], specialist.lat, specialist.lng)
      : null;

  const openTrade = (specialist: Specialist) => {
    tapFeedback();
    router.push(
      toHref(
        `/trade/${encodeURIComponent(specialist.ownerId)}?tradeId=${encodeURIComponent(specialist.tradeId)}&projectId=${encodeURIComponent(project.id)}`,
      ),
    );
  };

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
      <Text style={styles.sectionTitle}>{t("myRequest.forThisJob")}</Text>
      {isLoading ? (
        <Text style={styles.loading}>{t("myRequest.finding")}</Text>
      ) : specialists.length === 0 ? (
        <Text style={styles.loading}>{t("myRequest.noSpecialists")}</Text>
      ) : (
        <View style={styles.cards}>
          {specialists.map((specialist) => {
            const phone = publicPhone(specialist.owner);
            return (
              <TradeCard
                key={specialist.tradeId}
                specialist={specialist}
                distance={distanceTo(specialist)}
                phone={phone}
                onPress={() => openTrade(specialist)}
                onMessage={() => void message(specialist)}
                onCall={() => contact.call(specialist, phone)}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}

export default function MyRequestScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t, tx } = useT();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === "string" ? params.id : undefined;
  const uid = useAuthStore((state) => state.user?.uid) ?? "";

  const queryClient = useQueryClient();
  const { data: project, isLoading } = useProject(id);
  const likeStats = useProjectLikeStats(uid || undefined);
  const likeCount = (id && likeStats.data?.[id]) || 0;
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
      Alert.alert(t("jobs.cancelFailed"), t("common.pleaseTryAgain"));
    }
  };

  const confirmCancel = () => {
    tapFeedback();
    Alert.alert(t("myRequest.cancelTitle"), t("myRequest.cancelText"), [
      { text: t("myRequest.keep"), style: "cancel" },
      {
        text: t("myRequest.cancel"),
        style: "destructive",
        onPress: () => void runCancel(),
      },
    ]);
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
    ? t("jobs.status.cancelled")
    : completed
      ? t("jobs.status.completed")
      : assigned
        ? t("jobs.status.inProgress")
        : hasResponses
          ? t("project.responses", { count: responders.length })
          : t("myRequest.looking");

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
            <Text style={styles.missing}>{t("myRequest.unavailable")}</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {project.requestId ? (
              <Text style={styles.requestId}>
                {t("specialists.requestNumber", { id: project.requestId })}
              </Text>
            ) : null}
            <Text style={styles.title}>{tx(project.title)}</Text>
            <View style={styles.statusRow}>
              <ResponsesIcon size={14} color={colors.accent} />
              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>
            {likeCount > 0 ? (
              <View style={styles.statusRow}>
                <HeartIcon size={14} color={colors.accent} filled />
                <Text style={styles.statusText}>
                  {t("project.likes", { count: likeCount })}
                </Text>
              </View>
            ) : null}

            <ProjectDetails project={project} contactMode="owner" />

            {cancelled ? (
              <View style={styles.cancelledCard}>
                <Text style={styles.cancelledText}>
                  {t("myRequest.wasCancelled")}
                </Text>
              </View>
            ) : assigned ? (
              <InProgressView project={project} uid={uid} />
            ) : hasResponses ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {t("project.responsesLabel")}
                </Text>
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
                accessibilityLabel={t("myRequest.cancel")}
                hitSlop={8}
                disabled={cancelling}
                onPress={confirmCancel}
                style={styles.cancelWrap}
              >
                <Text style={styles.cancelLink}>
                  {cancelling
                    ? t("myRequest.cancelling")
                    : t("myRequest.cancel")}
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
  cards: {
    gap: Spacing.md,
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
  chevron: {
    transform: [{ rotate: "180deg" }],
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
