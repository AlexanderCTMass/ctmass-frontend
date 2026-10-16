import { useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

import { analyticsEvents, errorMessage } from "@/lib/analytics-events";
import { successFeedback } from "@/lib/haptics";
import {
  type ProjectDetail,
  declineInvitedProject,
  setProjectArchived,
} from "@/lib/projects";
import { useAuthStore } from "@/store/use-auth-store";

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
      successFeedback();
      analyticsEvents.invitedProjectAction({ project_id: project.id, action });
      if (action === "delete") {
        void queryClient.invalidateQueries({ queryKey: ["project", project.id] });
        void queryClient.invalidateQueries({ queryKey: ["nearby-projects"] });
      }
    } catch (error) {
      analyticsEvents.invitedProjectActionFailed({
        project_id: project.id,
        action,
        error_message: errorMessage(error),
      });
      void queryClient.invalidateQueries({ queryKey: key });
      Alert.alert("Something went wrong", "Please try again.");
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
        "This job is in progress",
        "You've been selected for this project. Cancel it in the chat first, then you can delete it.",
      );
      return;
    }
    Alert.alert(
      "Delete this request?",
      "It will be removed from your list, and the homeowner will be told you declined.",
      [
        { text: "Keep", style: "cancel" },
        {
          text: "Delete",
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
      ],
    );
  };

  return { archive, restore, remove };
}

export function isVisibleTo(project: ProjectDetail, uid: string | undefined) {
  return !uid || !project.hiddenBy.includes(uid);
}

export function isArchivedBy(project: ProjectDetail, uid: string | undefined) {
  return Boolean(uid && project.archivedBy.includes(uid));
}
