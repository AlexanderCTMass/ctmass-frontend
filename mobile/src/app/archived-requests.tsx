import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useMemo } from "react";
import { ActivityIndicator, Alert, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProjectCard } from "@/components/project/project-card";
import { BackButton } from "@/components/ui/back-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { SwipeCard, useSwipeSides } from "@/components/ui/swipe-card";
import { Spacing, makeStyles, useTheme } from "@/constants/theme";
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
import { analyticsEvents } from "@/lib/analytics-events";
import { startChat } from "@/lib/chat";
import { distanceBetweenCenters } from "@/lib/geo";
import { tapFeedback } from "@/lib/haptics";
import { useT } from "@/lib/i18n";
import { chatHref, toHref } from "@/lib/navigation";
import type { ProjectDetail } from "@/lib/projects";
import { useInvitedProjects } from "@/queries/use-projects";
import { useProjectsByIds } from "@/queries/use-swipes";
import { useAuthStore } from "@/store/use-auth-store";

export default function ArchivedRequestsScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t, tx } = useT();
  const queryClient = useQueryClient();
  const uid = useAuthStore((state) => state.user?.uid);
  const invited = useInvitedProjects(uid);
  const myCenter = useMyCenter(uid);
  const actions = useInvitedRequestActions(uid);
  const swipe = useSwipeActions(uid, "archive");
  const sides = useSwipeSides();
  const { archived } = swipe.projectIndex;
  const archivedIds = useMemo(() => [...archived], [archived]);
  const swiped = useProjectsByIds(archivedIds);

  const isInvited = (project: ProjectDetail) =>
    Boolean(uid && project.proposerUserId === uid);

  const items = useMemo(() => {
    const invitedArchived = (invited.data ?? []).filter(
      (project) =>
        isVisibleTo(project, uid) &&
        (isArchivedBy(project, uid) || archived.has(project.id)),
    );
    const seen = new Set(invitedArchived.map((project) => project.id));
    const others = (swiped.data ?? []).filter(
      (project) =>
        archived.has(project.id) &&
        !seen.has(project.id) &&
        isOpenFor(project, uid) &&
        isVisibleTo(project, uid),
    );
    return [...invitedArchived, ...others].sort(
      (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
    );
  }, [invited.data, swiped.data, archived, uid]);

  const restore = (project: ProjectDetail, source: SwipeSource) => {
    swipe.restore(projectSubject(project), source);
    if (isInvited(project) && isArchivedBy(project, uid)) {
      actions.restore(project);
    }
  };

  const open = (project: ProjectDetail) => {
    if (!uid) return;
    tapFeedback();
    if (isInvited(project)) {
      analyticsEvents.invitedProjectOpened({ project_id: project.id });
      void startChat(project.userId, uid, project.id).then((threadId) => {
        router.push(chatHref(threadId, project.customerName));
      });
      return;
    }
    const thread = project.responders.find(
      (item) => item.userId === uid,
    )?.threadId;
    if (thread) {
      router.push(chatHref(thread, project.customerName));
      return;
    }
    queryClient.setQueryData(["project", project.id], project);
    router.push(toHref(`/request/${project.id}`));
  };

  const openMenu = (project: ProjectDetail) => {
    tapFeedback();
    Alert.alert(tx(project.title), t("home.menuQuestion"), [
      { text: t("ui.restore"), onPress: () => restore(project, "menu") },
      ...(isInvited(project)
        ? [
            {
              text: t("common.delete"),
              style: "destructive" as const,
              onPress: () => actions.remove(project),
            },
          ]
        : []),
      { text: t("common.cancel"), style: "cancel" },
    ]);
  };

  const loading =
    invited.isLoading ||
    !swipe.isReady ||
    (archivedIds.length > 0 && swiped.isLoading);

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <View style={styles.headerText}>
            <Text style={styles.title}>{t("archive.title")}</Text>
            <Text style={styles.subtitle}>{t("archive.subtitle")}</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : (
          <FlatList
            data={items}
            extraData={swipe.projectIndex}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>
                  {t("search.empty.archiveTitle")}
                </Text>
                <Text style={styles.emptyText}>{t("archive.emptyText")}</Text>
              </View>
            }
            renderItem={({ item }) => (
              <SwipeCard
                itemKey={item.id}
                right={sides.restore(() => restore(item, "swipe"))}
              >
                <ProjectCard
                  project={item}
                  badge={{
                    label: t("archive.badge"),
                    tint: colors.textSecondary,
                    bg: colors.surfaceStrong,
                  }}
                  distance={distanceBetweenCenters(
                    myCenter,
                    item.locationCenter,
                  )}
                  ctaLabel={
                    isInvited(item)
                      ? t("home.openChat")
                      : t("archive.viewDetails")
                  }
                  showResponses={false}
                  onPress={() => open(item)}
                  onMore={() => openMenu(item)}
                />
              </SwipeCard>
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
