import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions/v2";
import { getFirestore } from "firebase-admin/firestore";
import { appendAppNotification } from "./app-notifications.js";

const collectOwners = (snapshot, target) => {
  snapshot.forEach((doc) => {
    const trade = doc.data() || {};
    if (trade.status !== "rejected" && trade.ownerId) {
      target.add(trade.ownerId);
    }
  });
};

// Notifies contractors when a new project matching their specialty (or contractors
// with an "Other"/custom specialty, who are open to any project) is posted.
export const onProjectCreatedNotify = onDocumentCreated(
  { document: "projects/{projectId}", timeoutSeconds: 120, memory: "256MiB" },
  async (event) => {
    try {
      const project = event.data?.data() || {};
      const ownerId = project.userId;
      const specialtyLabel = String(project.specialtyLabel || "").trim();
      const projectId = event.params.projectId;
      const db = getFirestore();

      const recipients = new Set();

      if (specialtyLabel) {
        const matchSnap = await db
          .collection("trades")
          .where("primarySpecialtyLabel", "==", specialtyLabel)
          .get();
        collectOwners(matchSnap, recipients);
      }

      const otherSnap = await db
        .collection("trades")
        .where("other", "==", true)
        .get();
      collectOwners(otherSnap, recipients);

      if (ownerId) recipients.delete(ownerId);
      if (recipients.size === 0) return;

      const label = specialtyLabel || "new";

      for (const contractorId of recipients) {
        await appendAppNotification(
          contractorId,
          {
            title: "New project for you",
            text: `A new ${label} project was just posted. Open the app to respond.`,
            type: "new_project",
            appLink: "/home",
            projectId,
          },
          "newProjects",
        );
      }
    } catch (error) {
      logger.error("onProjectCreatedNotify error", error);
    }
  },
);
