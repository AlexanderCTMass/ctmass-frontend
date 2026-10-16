import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions/v2";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { LoyaltyCore } from "../../core/index.js";

const ACTION_TYPE = "INVITE_USER_REGISTERS";

const isAlreadyExists = (error) =>
  error?.code === 6 || /already exists/i.test(error?.message || "");

const publicName = (profile) => {
  const emailPrefix = String(profile.email || "").split("@")[0].trim().toLowerCase();
  const rawName = String(profile.name || profile.businessName || "").trim();
  if (!rawName || rawName.includes("@") || rawName.toLowerCase() === emailPrefix) {
    return "";
  }
  return rawName.slice(0, 60);
};

export const onInvitedUserRegistered = onDocumentCreated(
  {
    document: "profiles/{userId}",
    timeoutSeconds: 30,
    memory: "256MiB",
  },
  async (event) => {
    try {
      const profile = event.data?.data() || {};
      const userId = event.params.userId;
      const inviterId =
        typeof profile.invitedBy === "string" ? profile.invitedBy.trim() : "";

      if (!inviterId || inviterId === userId) return;

      const db = getFirestore();
      const inviterSnap = await db.collection("profiles").doc(inviterId).get();
      if (!inviterSnap.exists) {
        logger.info("Loyalty: inviter profile not found", { userId, inviterId });
        return;
      }
      const inviter = inviterSnap.data() || {};

      const claimRef = db.collection("referral_rewards").doc(userId);
      try {
        await claimRef.create({
          inviterId,
          refereeId: userId,
          actionType: ACTION_TYPE,
          createdAt: FieldValue.serverTimestamp(),
        });
      } catch (error) {
        if (isAlreadyExists(error)) {
          logger.info("Loyalty: invite reward already processed", {
            userId,
            inviterId,
          });
          return;
        }
        throw error;
      }

      let awarded = 0;
      try {
        awarded = await LoyaltyCore.awardCoins(
          inviterId,
          inviter.role || "CUSTOMER",
          ACTION_TYPE,
          userId,
          {
            refereeId: userId,
            refereeName: publicName(profile),
            invitedVia: profile.invitedVia || null,
          },
        );
      } catch (error) {
        await claimRef.delete().catch(() => undefined);
        throw error;
      }

      if (awarded > 0) {
        await claimRef.update({ awarded }).catch(() => undefined);
      } else {
        await claimRef.delete().catch(() => undefined);
      }

      logger.info("Loyalty: invited user registered", {
        userId,
        inviterId,
        awarded,
      });
    } catch (error) {
      logger.error("Loyalty: error awarding INVITE_USER_REGISTERS coins", error);
    }
  },
);
