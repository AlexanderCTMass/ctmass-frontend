import { FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

const BATCH_LIMIT = 400;

const STORAGE_FOLDERS = [
  "users",
  "avatars",
  "portfolio",
  "certificates",
  "trades",
  "reels",
  "projects",
  "userServices",
  "photos",
  "videos",
  "temp/ai-reference",
];

const STORAGE_FLAT_FOLDERS = ["avatars", "avatar", "cover", "portfolio", "diplomas"];

const FLAT_NAME_AFTER_UID = /^(-|_|[0-9a-f]{8}-[0-9a-f]{4}-)/i;

const deleteStorageFiles = async (userId) => {
  const bucket = getStorage().bucket();
  await Promise.all(
    STORAGE_FOLDERS.map((folder) => bucket.deleteFiles({ prefix: `${folder}/${userId}/` })),
  );
  for (const folder of STORAGE_FLAT_FOLDERS) {
    const prefix = `${folder}/${userId}`;
    const [files] = await bucket.getFiles({ prefix });
    const owned = files.filter((file) => FLAT_NAME_AFTER_UID.test(file.name.slice(prefix.length)));
    await Promise.all(owned.map((file) => file.delete({ ignoreNotFound: true })));
  }
};

const commitInChunks = async (db, docs, apply) => {
  for (let index = 0; index < docs.length; index += BATCH_LIMIT) {
    const batch = db.batch();
    docs.slice(index, index + BATCH_LIMIT).forEach((docSnap) => apply(batch, docSnap));
    await batch.commit();
  }
  return docs.length;
};

export const deleteBatch = async (db, query) => {
  const snapshot = await query.get();
  return commitInChunks(db, snapshot.docs, (batch, docSnap) => batch.delete(docSnap.ref));
};

export const updateBatch = async (db, query, updates) => {
  const snapshot = await query.get();
  return commitInChunks(db, snapshot.docs, (batch, docSnap) => batch.update(docSnap.ref, updates));
};

const recursiveDeleteAll = async (db, query) => {
  const snapshot = await query.get();
  for (const docSnap of snapshot.docs) {
    await db.recursiveDelete(docSnap.ref);
  }
  return snapshot.size;
};

export const createStepRunner = (logger, label, userId) => {
  const errors = [];
  const run = async (stepName, fn) => {
    try {
      await fn();
      logger.info(`${label} [${stepName}] OK`, { userId });
    } catch (err) {
      logger.error(`${label} [${stepName}] FAILED`, { userId, error: err.message });
      errors.push({ step: stepName, error: err.message || String(err) });
    }
  };
  return { run, errors };
};

export const purgeUserData = async ({ db, run, userId, profile, deletedBy, reviewNote }) => {
  const displayName = profile.name || profile.businessName || profile.email || "Deleted User";
  const email = typeof profile.email === "string" ? profile.email.trim().toLowerCase() : "";

  await run("loyalty_transactions", () =>
    deleteBatch(db, db.collection("loyalty_transactions").where("userId", "==", userId)));

  await run("admin_manual_transactions", () =>
    deleteBatch(db, db.collection("admin_manual_transactions").where("userId", "==", userId)));

  await run("notifications", () =>
    deleteBatch(db, db.collection("notifications").where("userId", "==", userId)));

  await run("user_sessions", () =>
    deleteBatch(db, db.collection("user_sessions").where("userId", "==", userId)));

  await run("projects", () =>
    updateBatch(db, db.collection("projects").where("userId", "==", userId), {
      status: "deleted",
      state: "deleted",
      deletedAt: FieldValue.serverTimestamp(),
      deletedBy,
      originalAuthorName: displayName,
    }));

  await run("trades", () =>
    recursiveDeleteAll(db, db.collection("trades").where("ownerId", "==", userId)));

  await run("videos", () =>
    deleteBatch(db, db.collection("reels").where("userId", "==", userId)));

  await run("specialist_posts", () =>
    deleteBatch(db, db.collection("specialistPosts").where("userId", "==", userId)));

  await run("completed_works", () =>
    deleteBatch(db, db.collection("completedWorks").where("authorId", "==", userId)));

  await run("user_specialties", () =>
    deleteBatch(db, db.collection("userSpecialties").where("user", "==", userId)));

  await run("user_services", () =>
    deleteBatch(db, db.collection("userServices").where("userId", "==", userId)));

  await run("connections", () =>
    Promise.all([
      deleteBatch(db, db.collection("connections").where("users", "array-contains", userId)),
      deleteBatch(db, db.collection("connections").where("user1", "==", userId)),
      deleteBatch(db, db.collection("connections").where("user2", "==", userId)),
    ]));

  await run("friend_invites", () =>
    Promise.all([
      deleteBatch(db, db.collection("friendInvites").where("inviterId", "==", userId)),
      email ? deleteBatch(db, db.collection("friendInvites").where("email", "==", email)) : 0,
    ]));

  await run("temp_profiles", () =>
    email ? deleteBatch(db, db.collection("tempProfiles").where("email", "==", profile.email)) : 0);

  await run("chats", () =>
    recursiveDeleteAll(db, db.collection("Chat").where("users", "array-contains", userId)));

  await run("reviews", async () => {
    await Promise.all([
      updateBatch(db, db.collection("reviews").where("userId", "==", userId), {
        isActive: false,
        content: reviewNote,
        deletedAuthorId: userId,
      }),
      updateBatch(db, db.collection("reviews").where("authorId", "==", userId), {
        isActive: false,
        content: reviewNote,
        deletedAuthorId: userId,
      }),
    ]);
  });

  await run("referrals", () =>
    Promise.all([
      deleteBatch(db, db.collection("referrals").where("referredUserId", "==", userId)),
      updateBatch(db, db.collection("referrals").where("referrerId", "==", userId), {
        referrerId: null,
        referrerName: "Deleted User",
      }),
    ]));

  await run("chat_messages", () =>
    updateBatch(db, db.collection("chat_messages").where("senderId", "==", userId), {
      senderName: "Deleted User",
      senderPhotoURL: null,
      senderId: null,
    }));

  await run("storage", () => deleteStorageFiles(userId));

  await run("auth", async () => {
    try {
      await getAuth().deleteUser(userId);
    } catch (err) {
      if (err?.code !== "auth/user-not-found") throw err;
    }
  });
};

export const deleteProfileDocument = (db, run, userId) =>
  run("profiles_delete", () => db.recursiveDelete(db.collection("profiles").doc(userId)));
