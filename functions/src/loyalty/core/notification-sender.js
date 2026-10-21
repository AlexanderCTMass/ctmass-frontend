import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { logger } from "firebase-functions/v2";
import { randomUUID } from "node:crypto";

const ACTION_DISPLAY_NAMES = {
  REGISTER: "for signing up",
  COMPLETE_PROFILE: "for completing your profile",
  POST_PROJECT: "for posting a project",
  POST_PROJECT_WITH_PHOTOS: "for posting a project with photos",
  ADD_PORTFOLIO: "for adding a portfolio item",
  COMPLETE_PROJECT: "for completing a project",
  INVITE_HOMEOWNER_POSTS_PROJECT: "for your invited user posting a project",
  INVITE_CONTRACTOR_COMPLETES_JOB: "for your invited contractor completing a job",
  CONTRACTOR_INVITES_HOMEOWNER_POSTS: "for inviting a homeowner who posted a project",
  HOMEOWNER_REFERS_NEIGHBOR_HIRES: "for referring a neighbor who hired a contractor",
  BUG_REPORT: "for submitting a bug report",
  INVITE_USER_REGISTERS: "for inviting a new member to CTMASS",
};

const ADMIN_DISPLAY_NAMES = {
  REGISTER: "because a new member signed up",
  COMPLETE_PROFILE: "because a member completed their profile",
  POST_PROJECT: "because a new project was posted",
  POST_PROJECT_WITH_PHOTOS: "because a new project with photos was posted",
  COMPLETE_PROJECT: "because a project was completed",
  INVITE_CONTRACTOR_COMPLETES_JOB: "because an invited contractor completed a job",
  CONTRACTOR_INVITES_HOMEOWNER_POSTS: "because an invited homeowner posted a project",
  HOMEOWNER_REFERS_NEIGHBOR_HIRES: "because a referred neighbor hired a contractor",
  BUG_REPORT: "because a member submitted a bug report",
};

const FALLBACK_REASON = "for your activity on CTMASS";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const shortReasonFor = (actionType = "") => {
  if (actionType.startsWith("ADMIN_")) {
    return ADMIN_DISPLAY_NAMES[actionType.slice("ADMIN_".length)] || FALLBACK_REASON;
  }
  return ACTION_DISPLAY_NAMES[actionType] || FALLBACK_REASON;
};

const reasonFor = (actionType, metadata) => {
  if (actionType === "INVITE_USER_REGISTERS" && metadata?.refereeName) {
    return `because ${escapeHtml(metadata.refereeName)} joined CTMASS with your invite`;
  }
  return shortReasonFor(actionType);
};

const shopLink = '/loyalty-shop';

export class NotificationSender {
  static async sendCoinsEarnedNotification(userId, actionType, amount, metadata) {
    if (!userId || !amount || amount <= 0) return;
    try {
      const db = getFirestore();
      const profileRef = db.collection("profiles").doc(userId);

      const coins = `${amount.toLocaleString()} CTMASS Coins`;
      const reason = shortReasonFor(actionType);
      const title = `🎉 +${coins} ${reason}`;
      const text = `You just earned <strong>${coins}</strong> ${reasonFor(actionType, metadata)}. <br/>` +
        `Want to earn more? Explore all the ways to earn coins or spend them in our <a href="${shopLink}">CTMASS Coins Shop</a>.`;

      const notification = {
        id: randomUUID(),
        createdAt: Date.now(),
        read: false,
        title,
        text,
        type: "loyalty_coins_earned",
        actionType,
        amount,
        reason,
      };

      await profileRef.update({
        notificationList: FieldValue.arrayUnion(notification),
      });
    } catch (error) {
      logger.warn("NotificationSender: failed to send coins-earned notification", {
        userId,
        actionType,
        amount,
        error: error.message,
      });
    }
  }
}
