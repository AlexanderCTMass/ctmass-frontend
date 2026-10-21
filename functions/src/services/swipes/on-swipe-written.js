import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions/v2";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const isProjectLike = (data) =>
  Boolean(data && data.targetType === "project" && data.value === "like" && data.targetId);

export const onSwipeWritten = onDocumentWritten(
  { document: "profiles/{userId}/swipes/{swipeId}", timeoutSeconds: 30, memory: "256MiB" },
  async (event) => {
    try {
      const before = event.data?.before?.data();
      const after = event.data?.after?.data();
      const delta = (isProjectLike(after) ? 1 : 0) - (isProjectLike(before) ? 1 : 0);
      if (delta === 0) return;

      const projectId = String((after || before).targetId);
      const db = getFirestore();
      const project = await db.collection("projects").doc(projectId).get();
      if (!project.exists) return;
      const ownerId = String(project.data().userId || "");
      if (!ownerId || ownerId === event.params.userId) return;

      const statsRef = db
        .collection("profiles")
        .doc(ownerId)
        .collection("projectStats")
        .doc(projectId);

      await db.runTransaction(async (tx) => {
        const snap = await tx.get(statsRef);
        const current = snap.exists ? Number(snap.data().likeCount) || 0 : 0;
        tx.set(
          statsRef,
          { likeCount: Math.max(0, current + delta), updatedAt: FieldValue.serverTimestamp() },
          { merge: true },
        );
      });
    } catch (error) {
      logger.error("onSwipeWritten error", error);
    }
  },
);
