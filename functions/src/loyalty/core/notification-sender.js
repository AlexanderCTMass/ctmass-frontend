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
  INVITE_CONTRACTOR_COMPLETES_JOB: "for your invited contractor filling a portfolio",
  CONTRACTOR_INVITES_HOMEOWNER_POSTS: "for inviting a homeowner who posted a project",
  HOMEOWNER_REFERS_NEIGHBOR_HIRES: "for referring a neighbor who hired a contractor",
  BUG_REPORT: "for submitting a bug report",
};

const shopLink = '/loyalty-shop';

export class NotificationSender {
  static async sendCoinsEarnedNotification(userId, actionType, amount) {
    if (!userId || !amount || amount <= 0) return;
    try {
      const db = getFirestore();
      const profileRef = db.collection("profiles").doc(userId);

      const reasonSuffix = ACTION_DISPLAY_NAMES[actionType] || "";
      const title = `🎉 Congratulations! You earned ${amount.toLocaleString()} CTMASS Coins${reasonSuffix ? "" : ""}`;
      const text = `You just earned <strong>${amount.toLocaleString()} CTMASS Coins</strong> ${reasonSuffix}.<br/>` +
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
