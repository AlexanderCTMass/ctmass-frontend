import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions/v2";
import { appendAppNotification } from "./app-notifications.js";

const responderIds = (value) =>
  new Set(
    (Array.isArray(value) ? value : [])
      .map((item) => item?.userId)
      .filter(Boolean),
  );

// Notifies the project owner when a new specialist responds to their project.
export const onProjectResponseNotify = onDocumentUpdated(
  { document: "projects/{projectId}", timeoutSeconds: 60, memory: "256MiB" },
  async (event) => {
    try {
      const before = event.data?.before?.data() || {};
      const after = event.data?.after?.data() || {};

      const beforeIds = responderIds(before.respondedSpecialists);
      const afterList = Array.isArray(after.respondedSpecialists)
        ? after.respondedSpecialists
        : [];
      const added = afterList.filter(
        (item) => item?.userId && !beforeIds.has(item.userId),
      );
      if (added.length === 0) return;

      const ownerId = after.userId;
      if (!ownerId) return;

      const projectTitle = after.title || after.specialtyLabel || "your project";

      for (const responder of added) {
        const name = responder.userName || "A specialist";
        await appendAppNotification(
          ownerId,
          {
            title: "New response to your project",
            text: `${name} responded to "${projectTitle}".`,
            type: "project_response",
            appLink: responder.threadId
              ? `/chat?threadId=${responder.threadId}`
              : "/chats",
            threadId: responder.threadId || null,
            projectId: event.params.projectId,
          },
          "projectResponses",
        );
      }
    } catch (error) {
      logger.error("onProjectResponseNotify error", error);
    }
  },
);
