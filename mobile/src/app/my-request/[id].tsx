import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
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
import { Brand, Colors, Radius, Spacing } from "@/constants/theme";
import { startChat } from "@/lib/chat";
import { tapFeedback } from "@/lib/haptics";
import { chatHref, toHref } from "@/lib/navigation";
import type { ProjectDetail, Responder } from "@/lib/projects";
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
  const [opening, setOpening] = useState(false);
  const open = async () => {
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
          <Text style={styles.specialistMeta}>Working on your project</Text>
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
}: {
  responder: Responder;
  projectId: string;
}) {
  return (
    <PressableScale
      accessibilityLabel={responder.userName}
      onPress={() => {
        tapFeedback();
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
          <ChevronLeftIcon size={18} color={Colors.textMuted} />
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
  const { data, isLoading } = useSpecialists(project.specialtyLabel, uid);
  const specialists = data?.items ?? [];

  const message = async (specialist: Specialist) => {
    tapFeedback();
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
                <ReviewIcon size={13} color={Brand.coin} />
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
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === "string" ? params.id : undefined;
  const uid = useAuthStore((state) => state.user?.uid) ?? "";

  const { data: project, isLoading } = useProject(id);

  const inProgress = project?.state === "in_progress";
  const responders = project?.responders ?? [];
  const hasResponses = responders.length > 0;

  const statusLabel = inProgress
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
            <ActivityIndicator color={Brand.primaryLight} />
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
              <ResponsesIcon size={14} color={Brand.primaryLight} />
              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>

            {inProgress ? (
              <InProgressView project={project} uid={uid} />
            ) : hasResponses ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Responses</Text>
                {responders.map((responder) => (
                  <ResponderRow
                    key={responder.threadId || responder.userId}
                    responder={responder}
                    projectId={project.id}
                  />
                ))}
              </View>
            ) : (
              <LookingSpecialists project={project} uid={uid} />
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
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
    color: Colors.textSecondary,
    fontSize: 15,
    textAlign: "center",
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  requestId: {
    color: Colors.textSecondary,
    fontSize: 12.5,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  title: {
    color: Colors.text,
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
    color: Brand.primaryLight,
    fontSize: 13.5,
    fontWeight: "700",
  },
  section: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  loading: {
    color: Colors.textSecondary,
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
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  specialistBody: {
    flex: 1,
  },
  specialistName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  specialistMeta: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.base,
    padding: Spacing.base,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Brand.primaryLight,
    fontSize: 15,
    fontWeight: "800",
  },
  rowBody: {
    flex: 1,
  },
  rowName: {
    color: Colors.text,
    fontSize: 15.5,
    fontWeight: "700",
  },
  rowMeta: {
    color: Colors.textSecondary,
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
    color: Brand.primaryLight,
    fontSize: 13,
    fontWeight: "700",
  },
});
