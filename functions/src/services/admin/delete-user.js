import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { logger } from "firebase-functions/v2";
import {
  createStepRunner,
  deleteProfileDocument,
  purgeUserData,
} from "../account/purge-user-data.js";

const ADMIN_EMAILS = ["alex.neu.ctmass@gmail.com", "george.ctmass@gmail.com"];

export const deleteUserAccount = onCall(
  {
    timeoutSeconds: 300,
    memory: "512MiB",
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be authenticated");
    }

    const callerUid = request.auth.uid;
    const db = getFirestore();

    const callerDoc = await db.collection("profiles").doc(callerUid).get();
    const callerProfile = callerDoc.exists ? callerDoc.data() : {};
    const tokenEmail = request.auth.token?.email_verified ? request.auth.token.email : null;
    const isCallerAdmin =
      callerProfile.role === "ADMIN" ||
      callerProfile.role === "admin" ||
      callerProfile.isAdmin === true ||
      ADMIN_EMAILS.includes(tokenEmail);
    if (!callerDoc.exists || !isCallerAdmin) {
      throw new HttpsError("permission-denied", "Must be an admin to delete accounts");
    }

    const { userId, reason, reasonDetails } = request.data;

    if (!userId || !reason) {
      throw new HttpsError("invalid-argument", "userId and reason are required");
    }

    if (userId === callerUid) {
      throw new HttpsError("failed-precondition", "Cannot delete your own account");
    }

    const targetDoc = await db.collection("profiles").doc(userId).get();
    if (!targetDoc.exists) {
      throw new HttpsError("not-found", "User not found");
    }
    const targetData = targetDoc.data();

    if (ADMIN_EMAILS.includes(targetData.email)) {
      throw new HttpsError("failed-precondition", "This admin account cannot be deleted");
    }

    if (targetData.role === "ADMIN" || targetData.role === "admin") {
      const adminsSnap = await db
        .collection("profiles")
        .where("role", "in", ["ADMIN", "admin"])
        .get();
      if (adminsSnap.size <= 1) {
        throw new HttpsError("failed-precondition", "Cannot delete the last admin account");
      }
    }

    const callerData = callerDoc.data();
    const { run, errors } = createStepRunner(logger, "deleteUserAccount", userId);

    await run("mark_deleted", async () => {
      await db.collection("profiles").doc(userId).update({
        isDeleted: true,
        deletedAt: FieldValue.serverTimestamp(),
        deletedBy: callerUid,
      });
    });

    await purgeUserData({
      db,
      run,
      userId,
      profile: targetData,
      deletedBy: callerUid,
      reviewNote: "[Account deleted by admin request]",
    });

    const cleanupStatus = errors.length === 0 ? "success" : "partial";

    await run("audit", async () => {
      await db.collection("deleted_users_audit").add({
        originalUserId: userId,
        originalEmail: targetData.email || null,
        originalDisplayName: targetData.name || targetData.businessName || targetData.email || null,
        originalRole: targetData.role || null,
        deletedByAdminId: callerUid,
        deletedByAdminEmail: callerData.email || null,
        deletionReason: reason,
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

    logger.info("deleteUserAccount completed", { userId, cleanupStatus, errorsCount: errors.length });

    return {
      success: true,
      email: targetData.email || null,
      cleanupStatus,
      errors,
    };
  },
);
