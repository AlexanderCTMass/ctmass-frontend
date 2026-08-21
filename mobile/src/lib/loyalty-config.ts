import {
  collection,
  getDocs,
  orderBy,
  query,
} from "@react-native-firebase/firestore";

import { getDb } from "@/lib/firebase";
import type { Role } from "@/lib/roles";

export type LoyaltyRoleKey = "homeowner" | "contractor" | "partner";

export type LoyaltyRoleRule = { coins: number; enabled: boolean };

export type LoyaltyRule = {
  actionType: string;
  displayName: string;
  description: string;
  category: string;
  sortOrder: number;
  enabled: boolean;
  archived: boolean;
  maxPerUser: number | null;
  coinsAwarded: number | null;
  roleRules: {
    homeowner?: LoyaltyRoleRule;
    contractor?: LoyaltyRoleRule;
    partner?: LoyaltyRoleRule;
    default?: { coins: number };
  } | null;
};

export const LOYALTY_CATEGORY_COLORS: Record<string, string> = {
  onboarding: "#3FC79A",
  project: "#FB923C",
  review: "#38BDF8",
  referral: "#C084FC",
  engagement: "#22D3EE",
  admin: "#F87171",
};

const CONFIG_COLLECTION = "loyalty_config";

export const DEFAULT_LOYALTY_RULES: LoyaltyRule[] = [
  {
    actionType: "REGISTER",
    displayName: "Sign Up Bonus",
    description: "Sign up and join the CTMASS platform.",
    category: "onboarding",
    sortOrder: 1,
    enabled: true,
    archived: false,
    maxPerUser: 1,
    coinsAwarded: null,
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
    description: "Fill in your name, email, phone, and avatar.",
    category: "onboarding",
    sortOrder: 2,
    enabled: true,
    archived: false,
    maxPerUser: 1,
    coinsAwarded: null,
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
    archived: false,
    maxPerUser: null,
    coinsAwarded: null,
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
    archived: false,
    maxPerUser: null,
    coinsAwarded: null,
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
    archived: false,
    maxPerUser: null,
    coinsAwarded: null,
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
    description: "Finish your first job on the platform.",
    category: "project",
    sortOrder: 6,
    enabled: true,
    archived: false,
    maxPerUser: null,
    coinsAwarded: null,
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
    description: "Invite a friend who then creates their first project.",
    category: "referral",
    sortOrder: 7,
    enabled: true,
    archived: false,
    maxPerUser: null,
    coinsAwarded: null,
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
    archived: false,
    maxPerUser: null,
    coinsAwarded: null,
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
    archived: false,
    maxPerUser: null,
    coinsAwarded: null,
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
    archived: false,
    maxPerUser: null,
    coinsAwarded: null,
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
    archived: false,
    maxPerUser: null,
    coinsAwarded: null,
    roleRules: {
      homeowner: { coins: 5, enabled: true },
      contractor: { coins: 5, enabled: true },
      partner: { coins: 5, enabled: true },
      default: { coins: 5 },
    },
  },
];

type Raw = Record<string, unknown>;

function asStr(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNum(value: unknown, fallback = 0): number {
  return typeof value === "number" ? value : fallback;
}

function asBool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeRoleRule(value: unknown): LoyaltyRoleRule | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Raw;
  return { coins: asNum(raw.coins), enabled: asBool(raw.enabled) };
}

function normalizeRule(data: Raw): LoyaltyRule {
  const roleRulesRaw = data.roleRules;
  let roleRules: LoyaltyRule["roleRules"] = null;
  if (roleRulesRaw && typeof roleRulesRaw === "object") {
    const raw = roleRulesRaw as Raw;
    const defaultRaw = raw.default;
    roleRules = {
      homeowner: normalizeRoleRule(raw.homeowner),
      contractor: normalizeRoleRule(raw.contractor),
      partner: normalizeRoleRule(raw.partner),
      default:
        defaultRaw && typeof defaultRaw === "object"
          ? { coins: asNum((defaultRaw as Raw).coins) }
          : undefined,
    };
  }
  const maxPerUserRaw = data.maxPerUser;
  return {
    actionType: asStr(data.actionType),
    displayName: asStr(data.displayName) || asStr(data.actionType),
    description: asStr(data.description),
    category: asStr(data.category),
    sortOrder: asNum(data.sortOrder, 999),
    enabled: asBool(data.enabled, true),
    archived: asBool(data.archived),
    maxPerUser: typeof maxPerUserRaw === "number" ? maxPerUserRaw : null,
    coinsAwarded: typeof data.coinsAwarded === "number" ? data.coinsAwarded : null,
    roleRules,
  };
}

export async function fetchLoyaltyRules(): Promise<LoyaltyRule[]> {
  const db = getDb();
  try {
    const snapshot = await getDocs(
      query(collection(db, CONFIG_COLLECTION), orderBy("sortOrder", "asc")),
    );
    const rules = snapshot.docs
      .map((docSnap) => normalizeRule(docSnap.data()))
      .filter((rule) => rule.enabled && !rule.archived);
    if (rules.length > 0) return rules;
    return DEFAULT_LOYALTY_RULES.filter((rule) => rule.enabled);
  } catch {
    return DEFAULT_LOYALTY_RULES.filter((rule) => rule.enabled);
  }
}

export function loyaltyRoleKey(role: Role | null | undefined): LoyaltyRoleKey {
  const key = (role ?? "").toLowerCase();
  if (key === "worker") return "contractor";
  if (key === "partner") return "partner";
  return "homeowner";
}

export function isRuleEnabledForRole(rule: LoyaltyRule, key: LoyaltyRoleKey): boolean {
  if (!rule.roleRules) return true;
  return rule.roleRules[key]?.enabled === true;
}

export function coinsForRole(rule: LoyaltyRule, key: LoyaltyRoleKey): number {
  if (rule.roleRules) {
    const roleRule = rule.roleRules[key];
    if (roleRule?.enabled) return roleRule.coins;
    return rule.roleRules.default?.coins ?? 0;
  }
  return rule.coinsAwarded ?? 0;
}
