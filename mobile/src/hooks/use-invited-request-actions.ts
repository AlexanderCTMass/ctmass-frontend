import { useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

import { analyticsEvents, errorMessage } from "@/lib/analytics-events";
import { errorFeedback, successFeedback } from "@/lib/haptics";
import {
  type ProjectDetail,
  declineInvitedProject,
  setProjectArchived,
} from "@/lib/projects";
import { useAuthStore } from "@/store/use-auth-store";
import i18n from "@/lib/i18n";

type Action = "archive" | "restore" | "delete";
type Patch = (project: ProjectDetail) => ProjectDetail;

export function useInvitedRequestActions(uid: string | undefined) {
  const queryClient = useQueryClient();
  const userName = useAuthStore((state) => state.user?.name);
  const key = ["invited-projects", uid ?? ""];

  const run = async (
    action: Action,
    project: ProjectDetail,
    change: Patch,
    write: (me: string) => Promise<void>,
  ) => {
    if (!uid) return;
    queryClient.setQueryData<ProjectDetail[]>(key, (current) =>
      current?.map((item) => (item.id === project.id ? change(item) : item)),
    );
    try {
      await write(uid);
      if (action === "delete") successFeedback();
      analyticsEvents.invitedProjectAction({ project_id: project.id, action });
      if (action === "delete") {
        void queryClient.invalidateQueries({
          queryKey: ["project", project.id],
        });
        void queryClient.invalidateQueries({ queryKey: ["nearby-projects"] });
      }
    } catch (error) {
      analyticsEvents.invitedProjectActionFailed({
        project_id: project.id,
        action,
        error_message: errorMessage(error),
      });
      void queryClient.invalidateQueries({ queryKey: key });
      errorFeedback();
      Alert.alert(i18n.t("ui.errorTitle"), i18n.t("common.pleaseTryAgain"));
    }
  };

  const without = (list: string[]) => list.filter((item) => item !== uid);

  const archive = (project: ProjectDetail) =>
    void run(
      "archive",
      project,
      (item) => ({
        ...item,
        archivedBy: [...without(item.archivedBy), uid ?? ""],
      }),
      (me) => setProjectArchived(project.id, me, true),
    );

  const restore = (project: ProjectDetail) =>
    void run(
      "restore",
      project,
      (item) => ({ ...item, archivedBy: without(item.archivedBy) }),
      (me) => setProjectArchived(project.id, me, false),
    );

  const remove = (project: ProjectDetail) => {
    if (project.state === "in_progress" && project.contractorId === uid) {
      Alert.alert(
        i18n.t("archive.inProgressTitle"),
        i18n.t("archive.inProgressText"),
      );
      return;
    }
    Alert.alert(i18n.t("archive.deleteTitle"), i18n.t("archive.deleteText"), [
      { text: i18n.t("archive.keep"), style: "cancel" },
      {
        text: i18n.t("common.delete"),
        style: "destructive",
        onPress: () =>
          void run(
            "delete",
            project,
            (item) => ({
              ...item,
              hiddenBy: [...without(item.hiddenBy), uid ?? ""],
              archivedBy: without(item.archivedBy),
            }),
            (me) =>
              declineInvitedProject(project, {
                uid: me,
                name: userName || "The specialist",
              }),
          ),
      },
    ]);
  };

  return { archive, restore, remove };
}

export function isVisibleTo(project: ProjectDetail, uid: string | undefined) {
  return !uid || !project.hiddenBy.includes(uid);
}

export function isArchivedBy(project: ProjectDetail, uid: string | undefined) {
  return Boolean(uid && project.archivedBy.includes(uid));
}

export function isOpenFor(project: ProjectDetail, uid: string | undefined) {
  return (
    project.state === "published" ||
    Boolean(
      uid && project.state === "in_progress" && project.contractorId === uid,
    )
  );
}
