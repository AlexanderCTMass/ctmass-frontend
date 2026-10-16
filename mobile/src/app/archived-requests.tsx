import { router } from "expo-router";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { RestoreIcon, TrashIcon } from "@/components/icons";
import { ProjectCard } from "@/components/project/project-card";
import { SwipeActionsRow } from "@/components/project/swipe-actions-row";
import { BackButton } from "@/components/ui/back-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Spacing, makeStyles, useTheme } from "@/constants/theme";
import {
  isArchivedBy,
  isVisibleTo,
  useInvitedRequestActions,
} from "@/hooks/use-invited-request-actions";
import { useMyCenter } from "@/hooks/use-my-center";
import { analyticsEvents } from "@/lib/analytics-events";
import { startChat } from "@/lib/chat";
import { distanceBetweenCenters } from "@/lib/geo";
import { tapFeedback } from "@/lib/haptics";
import { chatHref } from "@/lib/navigation";
import type { ProjectDetail } from "@/lib/projects";
import { useInvitedProjects } from "@/queries/use-projects";
import { useAuthStore } from "@/store/use-auth-store";

export default function ArchivedRequestsScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const uid = useAuthStore((state) => state.user?.uid);
  const invited = useInvitedProjects(uid);
  const myCenter = useMyCenter(uid);
  const actions = useInvitedRequestActions(uid);

  const items = (invited.data ?? []).filter(
    (project) => isVisibleTo(project, uid) && isArchivedBy(project, uid),
  );

  const open = (project: ProjectDetail) => {
    if (!uid) return;
    tapFeedback();
    analyticsEvents.invitedProjectOpened({ project_id: project.id });
    void startChat(project.userId, uid, project.id).then((threadId) => {
      router.push(chatHref(threadId, project.customerName));
    });
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <View style={styles.headerText}>
            <Text style={styles.title}>Archived requests</Text>
            <Text style={styles.subtitle}>
              Swipe left to restore or delete a request.
            </Text>
          </View>
        </View>

        {invited.isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>Archive is empty</Text>
                <Text style={styles.emptyText}>
                  Direct requests you archive on the Home tab will show up
                  here.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <SwipeActionsRow
                onOpen={() =>
                  analyticsEvents.invitedProjectSwiped({
                    project_id: item.id,
                    screen: "archive",
                  })
                }
                actions={[
                  {
                    key: "restore",
                    label: "Restore",
                    icon: <RestoreIcon size={22} color="#FFFFFF" />,
                    background: colors.accent,
                    onPress: () => actions.restore(item),
                  },
                  {
                    key: "delete",
                    label: "Delete",
                    icon: <TrashIcon size={22} color="#FFFFFF" />,
                    background: colors.danger,
                    onPress: () => actions.remove(item),
                  },
                ]}
              >
                <ProjectCard
                  project={item}
                  badge={{
                    label: "Archived",
                    tint: colors.textSecondary,
                    bg: colors.surfaceStrong,
                  }}
                  distance={distanceBetweenCenters(
                    myCenter,
                    item.locationCenter,
                  )}
                  ctaLabel="Open chat"
                  showResponses={false}
                  onPress={() => open(item)}
                />
              </SwipeActionsRow>
            )}
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
    paddingBottom: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: t.colors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  subtitle: {
    color: t.colors.textMuted,
    fontSize: 12.5,
    marginTop: 2,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  separator: {
    height: Spacing.md,
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
