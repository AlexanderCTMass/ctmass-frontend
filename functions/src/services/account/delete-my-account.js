import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import { logger } from "firebase-functions/v2";

const deleteBatch = async (db, query) => {
  const snapshot = await query.get();
  if (snapshot.empty) return 0;

  const batches = [];
  let batch = db.batch();
  let count = 0;

  snapshot.docs.forEach((docSnap) => {
    batch.delete(docSnap.ref);
    count++;
    if (count === 400) {
      batches.push(batch.commit());
      batch = db.batch();
      count = 0;
    }
  });
  if (count > 0) batches.push(batch.commit());

  await Promise.all(batches);
  return snapshot.size;
};

const updateBatch = async (db, query, updates) => {
  const snapshot = await query.get();
  if (snapshot.empty) return 0;

  const batches = [];
  let batch = db.batch();
  let count = 0;

  snapshot.docs.forEach((docSnap) => {
    batch.update(docSnap.ref, updates);
    count++;
    if (count === 400) {
      batches.push(batch.commit());
      batch = db.batch();
      count = 0;
    }
  });
  if (count > 0) batches.push(batch.commit());

  await Promise.all(batches);
  return snapshot.size;
};

export const deleteMyAccount = onCall(
  {
    timeoutSeconds: 120,
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
    const errors = [];

    const run = async (stepName, fn) => {
      try {
        await fn();
        logger.info(`deleteMyAccount [${stepName}] OK`, { userId });
      } catch (err) {
        logger.error(`deleteMyAccount [${stepName}] FAILED`, {
          userId,
          error: err.message,
        });
        errors.push({ step: stepName, error: err.message || String(err) });
      }
    };

    await run("loyalty_transactions", async () => {
      await deleteBatch(db, db.collection("loyalty_transactions").where("userId", "==", userId));
    });

    await run("admin_manual_transactions", async () => {
      await deleteBatch(db, db.collection("admin_manual_transactions").where("userId", "==", userId));
    });

    await run("notifications", async () => {
      await deleteBatch(db, db.collection("notifications").where("userId", "==", userId));
    });

    await run("user_sessions", async () => {
      await deleteBatch(db, db.collection("user_sessions").where("userId", "==", userId));
    });

    await run("projects", async () => {
      await updateBatch(db, db.collection("projects").where("userId", "==", userId), {
        status: "deleted",
        deletedAt: FieldValue.serverTimestamp(),
        deletedBy: userId,
        originalAuthorName: displayName,
      });
    });

    await run("reviews", async () => {
      await Promise.allSettled([
        updateBatch(db, db.collection("reviews").where("userId", "==", userId), {
          isActive: false,
          content: "[Account deleted]",
          deletedAuthorId: userId,
        }),
        updateBatch(db, db.collection("reviews").where("authorId", "==", userId), {
          isActive: false,
          content: "[Account deleted]",
          deletedAuthorId: userId,
        }),
      ]);
    });

    await run("referrals", async () => {
      await Promise.all([
        deleteBatch(db, db.collection("referrals").where("referredUserId", "==", userId)),
        updateBatch(db, db.collection("referrals").where("referrerId", "==", userId), {
          referrerId: null,
          referrerName: "Deleted User",
        }),
      ]);
    });

    await run("chat_messages", async () => {
      await updateBatch(db, db.collection("chat_messages").where("senderId", "==", userId), {
        senderName: "Deleted User",
        senderPhotoURL: null,
        senderId: null,
      });
    });

    await run("mobile_messages", async () => {
      await updateBatch(db, db.collectionGroup("messages").where("senderId", "==", userId), {
        senderName: "Deleted User",
        senderId: null,
      });
    });

    await run("connections", async () => {
      await deleteBatch(db, db.collection("connections").where("users", "array-contains", userId));
    });

    await run("friend_invites", async () => {
      await deleteBatch(db, db.collection("friendInvites").where("inviterId", "==", userId));
    });

    await run("user_specialties", async () => {
      await deleteBatch(db, db.collection("userSpecialties").where("user", "==", userId));
    });

    await run("user_services", async () => {
      await deleteBatch(db, db.collection("userServices").where("userId", "==", userId));
    });

    await run("storage", async () => {
      const bucket = getStorage().bucket();
      await Promise.all([
        bucket.deleteFiles({ prefix: `users/${userId}/` }),
        bucket.deleteFiles({ prefix: `avatars/${userId}/` }),
      ]);
    });

    await run("auth", async () => {
      await getAuth().deleteUser(userId);
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

    await run("profiles_delete", async () => {
      await db.collection("profiles").doc(userId).delete();
    });

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
