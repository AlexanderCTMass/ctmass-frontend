import { getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions/v2";

const ROLE_TO_LOYALTY_KEY = {
  CUSTOMER: "homeowner",
  HOMEOWNER: "homeowner",
  WORKER: "contractor",
  CONTRACTOR: "contractor",
  PARTNER: "partner",
};

const DEFAULT_CONFIG = [
  {
    actionType: "REGISTER",
    displayName: "Sign Up Bonus",
    description: "Sign Up and join the CTMASS platform.",
    category: "onboarding",
    sortOrder: 1,
    enabled: true,
    maxPerUser: 1,
    cooldownDays: null,
    archived: false,
    roleRules: {
      homeowner: { coins: 20, enabled: true },
      contractor: { coins: 20, enabled: true },
      partner: { coins: 20, enabled: true },
      default: { coins: 20 },
    },
  },
  {
    actionType: "COMPLETE_PROFILE",
    displayName: "Complete Your Profile",
    description: "Fill in all required profile fields: name, email, phone, and avatar.",
    category: "onboarding",
    sortOrder: 2,
    enabled: true,
    maxPerUser: 1,
    cooldownDays: null,
    archived: false,
    roleRules: {
      homeowner: { coins: 30, enabled: true },
      contractor: { coins: 30, enabled: true },
      partner: { coins: 30, enabled: true },
      default: { coins: 30 },
    },
  },
  {
    actionType: "POST_PROJECT",
    displayName: "Post a Project",
    description: "Create a project to find a contractor.",
    category: "project",
    sortOrder: 3,
    enabled: true,
    maxPerUser: null,
    cooldownDays: null,
    archived: false,
    roleRules: {
      homeowner: { coins: 10, enabled: true },
      contractor: { coins: 10, enabled: true },
      partner: { coins: 10, enabled: true },
      default: { coins: 10 },
    },
  },
  {
    actionType: "POST_PROJECT_WITH_PHOTOS",
    displayName: "Post a Project with Photos",
    description: "Create a project and attach photos for a bigger bonus.",
    category: "project",
    sortOrder: 4,
    enabled: true,
    maxPerUser: null,
    cooldownDays: null,
    archived: false,
    roleRules: {
      homeowner: { coins: 15, enabled: true },
      contractor: { coins: 15, enabled: true },
      partner: { coins: 15, enabled: true },
      default: { coins: 15 },
    },
  },
  {
    actionType: "ADD_PORTFOLIO",
    displayName: "Add Portfolio Item",
    description: "Showcase your work by adding a portfolio entry.",
    category: "engagement",
    sortOrder: 5,
    enabled: true,
    maxPerUser: null,
    cooldownDays: null,
    archived: false,
    roleRules: {
      homeowner: { coins: 0, enabled: false },
      contractor: { coins: 25, enabled: true },
      partner: { coins: 0, enabled: false },
      default: { coins: 25 },
    },
  },
  {
    actionType: "COMPLETE_PROJECT",
    displayName: "Complete a Project",
    description: "Invite a homeowner or contractor who then completes their first job.",
    category: "project",
    sortOrder: 6,
    enabled: true,
    maxPerUser: null,
    cooldownDays: null,
    archived: false,
    roleRules: {
      homeowner: { coins: 60, enabled: false },
      contractor: { coins: 60, enabled: true },
      partner: { coins: 60, enabled: false },
      default: { coins: 60 },
    },
  },
  {
    actionType: "INVITE_HOMEOWNER_POSTS_PROJECT",
    displayName: "Invited User Posts a Project",
    description: "Invite a homeowner or contractor who then creates their first project.",
    category: "referral",
    sortOrder: 7,
    enabled: true,
    maxPerUser: null,
    cooldownDays: null,
    archived: false,
    roleRules: {
      homeowner: { coins: 20, enabled: true },
      contractor: { coins: 20, enabled: true },
      partner: { coins: 20, enabled: true },
      default: { coins: 20 },
    },
  },
  {
    actionType: "INVITE_CONTRACTOR_COMPLETES_JOB",
    displayName: "Invited Contractor Fills Portfolio",
    description: "Invite a contractor who fills out their portfolio.",
    category: "referral",
    sortOrder: 8,
    enabled: true,
    maxPerUser: null,
    cooldownDays: null,
    archived: false,
    roleRules: {
      homeowner: { coins: 30, enabled: true },
      contractor: { coins: 30, enabled: true },
      partner: { coins: 30, enabled: true },
      default: { coins: 30 },
    },
  },
  {
    actionType: "CONTRACTOR_INVITES_HOMEOWNER_POSTS",
    displayName: "Contractor Invites Homeowner Who Posts",
    description: "Invite a homeowner who creates a project.",
    category: "referral",
    sortOrder: 9,
    enabled: true,
    maxPerUser: null,
    cooldownDays: null,
    archived: false,
    roleRules: {
      homeowner: { coins: 0, enabled: false },
      contractor: { coins: 30, enabled: true },
      partner: { coins: 30, enabled: false },
      default: { coins: 30 },
    },
  },
  {
    actionType: "HOMEOWNER_REFERS_NEIGHBOR_HIRES",
    displayName: "Referred Neighbor Hires a Contractor",
    description: "Refer your neighbor who ends up hiring a contractor.",
    category: "referral",
    sortOrder: 10,
    enabled: true,
    maxPerUser: null,
    cooldownDays: null,
    archived: false,
    roleRules: {
      homeowner: { coins: 100, enabled: true },
      contractor: { coins: 0, enabled: false },
      partner: { coins: 0, enabled: false },
      default: { coins: 100 },
    },
  },
  {
    actionType: "BUG_REPORT",
    displayName: "Submit Bug Report",
    description: "Submit a bug report or suggestion.",
    category: "engagement",
    sortOrder: 11,
    enabled: true,
    maxPerUser: null,
    cooldownDays: null,
    archived: false,
    roleRules: {
      homeowner: { coins: 5, enabled: true },
      contractor: { coins: 5, enabled: true },
      partner: { coins: 5, enabled: true },
      default: { coins: 5 },
    },
  },
];

let cachedConfig = null;
let cachedVersion = null;

export class LoyaltyConfig {
  static async getConfig() {
    const db = getFirestore();

    try {
      const metaDoc = await db
        .collection("loyalty_meta")
        .doc("config_version")
        .get();
      const currentVersion = metaDoc.exists ? metaDoc.data().version ?? 0 : 0;

      if (cachedConfig !== null && cachedVersion === currentVersion) {
        return cachedConfig;
      }

      const snapshot = await db
        .collection("loyalty_config")
        .where("archived", "!=", true)
        .orderBy("archived")
        .orderBy("sortOrder", "asc")
        .get();

      if (snapshot.empty) {
        await LoyaltyConfig.seedConfig();
        cachedConfig = DEFAULT_CONFIG;
      } else {
        cachedConfig = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      }

      cachedVersion = currentVersion;
    } catch (error) {
      logger.error("LoyaltyConfig: failed to load config from Firestore", error);
      if (cachedConfig) {
        return cachedConfig;
      }
      cachedConfig = DEFAULT_CONFIG;
    }

    return cachedConfig;
  }

  static async getActionConfig(actionType, userRole) {
    const config = await LoyaltyConfig.getConfig();
    const rule = config.find(
      (c) => c.actionType === actionType && c.enabled && c.archived !== true
    );
    if (!rule) return null;

    const loyaltyRoleKey = ROLE_TO_LOYALTY_KEY[userRole] || null;

    let coinsAwarded;
    let roleEnabled = true;

    if (rule.roleRules) {
      const roleRule = loyaltyRoleKey ? rule.roleRules[loyaltyRoleKey] : null;
      const defaultRule = rule.roleRules.default;

      if (roleRule !== null && roleRule !== undefined) {
        roleEnabled = roleRule.enabled !== false;
        coinsAwarded = roleRule.coins ?? 0;
      } else if (defaultRule) {
        coinsAwarded = defaultRule.coins ?? 0;
      } else {
        coinsAwarded = 0;
      }
    } else {
      coinsAwarded = rule.coinsAwarded ?? 0;
      if (rule.role && loyaltyRoleKey !== ROLE_TO_LOYALTY_KEY[rule.role]) {
        roleEnabled = false;
      }
    }

    if (!roleEnabled) return null;

    return {
      ...rule,
      coinsAwarded,
      maxPerUser: rule.maxPerUser ?? null,
      cooldownDays: rule.cooldownDays ?? null,
    };
  }

  static async seedConfig() {
    const db = getFirestore();
    const batch = db.batch();
    const now = new Date();

    for (const rule of DEFAULT_CONFIG) {
      const ref = db.collection("loyalty_config").doc(rule.actionType);
      batch.set(ref, { ...rule, createdAt: now, updatedAt: now });
    }

    await batch.commit();
    logger.info("LoyaltyConfig: seeded default config into Firestore");
  }

  static invalidateCache() {
    cachedConfig = null;
    cachedVersion = null;
  }
}
