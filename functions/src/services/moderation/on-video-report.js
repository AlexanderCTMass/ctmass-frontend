import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions/v2";
import { getFirestore } from "firebase-admin/firestore";

const REPORT_THRESHOLD = 3;

// Auto-hides a video (reels doc) once it has been reported by enough distinct
// users. Report doc ids are `${videoId}_${reporterId}`, so each user counts once.
export const onVideoReportCreated = onDocumentCreated(
  { document: "videoReports/{reportId}", timeoutSeconds: 60, memory: "256MiB" },
  async (event) => {
    try {
      const report = event.data?.data() || {};
      const videoId = String(report.videoId || "");
      if (!videoId) return;

      const db = getFirestore();
      const ref = db.collection("reels").doc(videoId);

      const result = await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists) return null;
        const count = (snap.data().reportsCount || 0) + 1;
        const hidden = count >= REPORT_THRESHOLD;
        tx.update(ref, { reportsCount: count, ...(hidden ? { hidden: true } : {}) });
        return { count, hidden };
      });

      if (result?.hidden) {
        logger.info(`Video ${videoId} auto-hidden after ${result.count} reports`);
      }
    } catch (error) {
      logger.error("onVideoReportCreated error", error);
    }
  },
);
