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
    displayName: "Registration Bonus",
    description: "Coins awarded when a new user registers",
    category: "onboarding",
    sortOrder: 1,
    enabled: true,
    maxPerUser: 1,
    cooldownDays: null,
    archived: false,
    roleRules: {
      homeowner: { coins: 50, enabled: true },
      contractor: { coins: 50, enabled: true },
      partner: { coins: 50, enabled: true },
      default: { coins: 50 },
    },
  },
  {
    actionType: "COMPLETE_PROFILE",
    displayName: "Profile Completion",
    description: "Coins awarded when a user completes their profile",
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
    description: "Coins awarded when a homeowner posts a project without photos",
    category: "project",
    sortOrder: 3,
    enabled: true,
    maxPerUser: null,
    cooldownDays: null,
    archived: false,
    roleRules: {
      homeowner: { coins: 20, enabled: true },
      contractor: { coins: 0, enabled: false },
      partner: { coins: 0, enabled: false },
      default: { coins: 20 },
    },
  },
  {
    actionType: "POST_PROJECT_WITH_PHOTOS",
    displayName: "Post a Project with Photos",
    description: "Coins awarded when a homeowner posts a project with photos",
    category: "project",
    sortOrder: 4,
    enabled: true,
    maxPerUser: null,
    cooldownDays: null,
    archived: false,
    roleRules: {
      homeowner: { coins: 35, enabled: true },
      contractor: { coins: 0, enabled: false },
      partner: { coins: 0, enabled: false },
      default: { coins: 35 },
    },
  },
  {
    actionType: "ADD_PORTFOLIO",
    displayName: "Add Portfolio Item",
    description: "Coins awarded when a contractor adds a portfolio item",
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
    actionType: "INVITE_HOMEOWNER_POSTS_PROJECT",
    displayName: "Invited Homeowner Posts Project",
    description: "Coins awarded when an invited homeowner posts their first project",
    category: "referral",
    sortOrder: 6,
    enabled: true,
    maxPerUser: null,
    cooldownDays: null,
    archived: false,
    roleRules: {
      homeowner: { coins: 40, enabled: true },
      contractor: { coins: 40, enabled: true },
      partner: { coins: 40, enabled: true },
      default: { coins: 40 },
    },
  },
  {
    actionType: "INVITE_CONTRACTOR_COMPLETES_JOB",
    displayName: "Invited Contractor Completes a Job",
    description: "Coins awarded when an invited contractor completes their first job",
    category: "referral",
    sortOrder: 7,
    enabled: true,
    maxPerUser: null,
    cooldownDays: null,
    archived: false,
    roleRules: {
      homeowner: { coins: 60, enabled: true },
      contractor: { coins: 60, enabled: true },
      partner: { coins: 60, enabled: true },
      default: { coins: 60 },
    },
  },
  {
    actionType: "CONTRACTOR_INVITES_HOMEOWNER_POSTS",
    displayName: "Contractor's Referred Homeowner Posts",
    description: "Coins for contractor when their referred homeowner posts a project",
    category: "referral",
    sortOrder: 8,
    enabled: true,
    maxPerUser: null,
    cooldownDays: null,
    archived: false,
    roleRules: {
      homeowner: { coins: 0, enabled: false },
      contractor: { coins: 40, enabled: true },
      partner: { coins: 0, enabled: false },
      default: { coins: 40 },
    },
  },
  {
    actionType: "HOMEOWNER_REFERS_NEIGHBOR_HIRES",
    displayName: "Referred Neighbor Hires a Contractor",
    description: "Coins awarded when a referred neighbor hires a contractor",
    category: "referral",
    sortOrder: 9,
    enabled: true,
    maxPerUser: null,
    cooldownDays: null,
    archived: false,
    roleRules: {
      homeowner: { coins: 50, enabled: true },
      contractor: { coins: 0, enabled: false },
      partner: { coins: 0, enabled: false },
      default: { coins: 50 },
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
