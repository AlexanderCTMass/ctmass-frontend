import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { logger } from "firebase-functions/v2";
import {
  createStepRunner,
  deleteProfileDocument,
  purgeUserData,
} from "./purge-user-data.js";

export const deleteMyAccount = onCall(
  {
    timeoutSeconds: 300,
    memory: "512MiB",
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be authenticated");
    }

    const userId = request.auth.uid;
    const db = getFirestore();

    const targetDoc = await db.collection("profiles").doc(userId).get();
    const targetData = targetDoc.exists ? targetDoc.data() : {};
    const displayName =
      targetData.name || targetData.businessName || targetData.email || "Deleted User";

    if (targetData.role === "ADMIN" || targetData.role === "admin") {
      throw new HttpsError(
        "failed-precondition",
        "Admin accounts cannot be self-deleted. Contact support.",
      );
    }

    const { reason, reasonDetails } = request.data ?? {};
    const { run, errors } = createStepRunner(logger, "deleteMyAccount", userId);

    await purgeUserData({
      db,
      run,
      userId,
      profile: targetData,
      deletedBy: userId,
      reviewNote: "[Account deleted]",
    });

    const cleanupStatus = errors.length === 0 ? "success" : "partial";

    await run("audit", async () => {
      await db.collection("deleted_users_audit").add({
        originalUserId: userId,
        originalEmail: targetData.email || null,
        originalDisplayName: displayName,
        originalRole: targetData.role || null,
        deletedByAdminId: null,
        selfService: true,
        deletionReason: reason || "user_requested",
        reasonDetails: reasonDetails || null,
        deletionTimestamp: FieldValue.serverTimestamp(),
        metadataSnapshot: {
          loyaltyBalance: targetData.loyaltyBalance || 0,
          createdAt: targetData.createdAt || null,
          role: targetData.role || null,
        },
        cleanupStatus,
        errorLog: errors,
      });
    });

    await deleteProfileDocument(db, run, userId);

    logger.info("deleteMyAccount completed", {
      userId,
      cleanupStatus,
      errorsCount: errors.length,
    });

    return {
      success: true,
      cleanupStatus,
      errors,
    };
  },
);
