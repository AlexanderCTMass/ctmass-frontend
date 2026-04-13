import { getFirestore } from "firebase-admin/firestore";

const DEFAULT_CONFIG = [
  {
    actionType: "REGISTER",
    coinsAwarded: 50,
    role: null,
    maxPerUser: 1,
    cooldownDays: null,
    enabled: true,
    description: "Registration bonus",
  },
  {
    actionType: "COMPLETE_PROFILE",
    coinsAwarded: 30,
    role: null,
    maxPerUser: 1,
    cooldownDays: null,
    enabled: true,
    description: "Profile completion bonus",
  },
  {
    actionType: "POST_PROJECT",
    coinsAwarded: 20,
    role: "CUSTOMER",
    maxPerUser: null,
    cooldownDays: null,
    enabled: true,
    description: "Post a project without photos",
  },
  {
    actionType: "POST_PROJECT_WITH_PHOTOS",
    coinsAwarded: 35,
    role: "CUSTOMER",
    maxPerUser: null,
    cooldownDays: null,
    enabled: true,
    description: "Post a project with photos",
  },
  {
    actionType: "ADD_PORTFOLIO",
    coinsAwarded: 25,
    role: "WORKER",
    maxPerUser: null,
    cooldownDays: null,
    enabled: true,
    description: "Add portfolio item",
  },
  {
    actionType: "INVITE_HOMEOWNER_POSTS_PROJECT",
    coinsAwarded: 40,
    role: null,
    maxPerUser: null,
    cooldownDays: null,
    enabled: true,
    description: "Invited homeowner posted a project",
  },
  {
    actionType: "INVITE_CONTRACTOR_COMPLETES_JOB",
    coinsAwarded: 60,
    role: null,
    maxPerUser: null,
    cooldownDays: null,
    enabled: true,
    description: "Invited contractor completed a job",
  },
  {
    actionType: "CONTRACTOR_INVITES_HOMEOWNER_POSTS",
    coinsAwarded: 40,
    role: "WORKER",
    maxPerUser: null,
    cooldownDays: null,
    enabled: true,
    description: "Contractor invited homeowner who posted a project",
  },
  {
    actionType: "HOMEOWNER_REFERS_NEIGHBOR_HIRES",
    coinsAwarded: 50,
    role: "CUSTOMER",
    maxPerUser: null,
    cooldownDays: null,
    enabled: true,
    description: "Homeowner referred neighbor who hired a contractor",
  },
];

let cachedConfig = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

export class LoyaltyConfig {
  static async getConfig() {
    const now = Date.now();
    if (cachedConfig && now - cacheTimestamp < CACHE_TTL_MS) {
      return cachedConfig;
    }

    try {
      const db = getFirestore();
      const snapshot = await db.collection("loyalty_config").get();

      if (snapshot.empty) {
        await LoyaltyConfig.seedConfig();
        cachedConfig = DEFAULT_CONFIG;
      } else {
        cachedConfig = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      }
    } catch (error) {
      cachedConfig = DEFAULT_CONFIG;
    }

    cacheTimestamp = Date.now();
    return cachedConfig;
  }

  static async getActionConfig(actionType) {
    const config = await LoyaltyConfig.getConfig();
    return config.find((c) => c.actionType === actionType && c.enabled);
  }

  static async seedConfig() {
    const db = getFirestore();
    const batch = db.batch();

    for (const rule of DEFAULT_CONFIG) {
      const ref = db.collection("loyalty_config").doc(rule.actionType);
      batch.set(ref, rule);
    }

    await batch.commit();
  }

  static invalidateCache() {
    cachedConfig = null;
    cacheTimestamp = 0;
  }
}
