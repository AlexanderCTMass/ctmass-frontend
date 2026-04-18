import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { firestore } from 'src/libs/firebase';

const CONFIG_COLLECTION = 'loyalty_config';
const AUDIT_COLLECTION = 'loyalty_config_audit';
const META_COLLECTION = 'loyalty_meta';

export const DEFAULT_LOYALTY_RULES = [
  {
    actionType: 'REGISTER',
    displayName: 'Registration Bonus',
    description: 'Coins awarded when a new user registers',
    category: 'onboarding',
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
    actionType: 'COMPLETE_PROFILE',
    displayName: 'Profile Completion',
    description: 'Coins awarded when a user completes their profile',
    category: 'onboarding',
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
    actionType: 'POST_PROJECT',
    displayName: 'Post a Project',
    description: 'Coins awarded when a homeowner posts a project without photos',
    category: 'project',
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
    actionType: 'POST_PROJECT_WITH_PHOTOS',
    displayName: 'Post a Project with Photos',
    description: 'Coins awarded when a homeowner posts a project with photos',
    category: 'project',
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
    actionType: 'ADD_PORTFOLIO',
    displayName: 'Add Portfolio Item',
    description: 'Coins awarded when a contractor adds a portfolio item',
    category: 'engagement',
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
    actionType: 'INVITE_HOMEOWNER_POSTS_PROJECT',
    displayName: 'Invited Homeowner Posts Project',
    description: 'Coins awarded when an invited homeowner posts their first project',
    category: 'referral',
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
    actionType: 'INVITE_CONTRACTOR_COMPLETES_JOB',
    displayName: 'Invited Contractor Completes a Job',
    description: 'Coins awarded when an invited contractor completes their first job',
    category: 'referral',
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
    actionType: 'CONTRACTOR_INVITES_HOMEOWNER_POSTS',
    displayName: "Contractor's Referred Homeowner Posts",
    description: "Coins for contractor when their referred homeowner posts a project",
    category: 'referral',
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
    actionType: 'HOMEOWNER_REFERS_NEIGHBOR_HIRES',
    displayName: 'Referred Neighbor Hires a Contractor',
    description: 'Coins awarded when a referred neighbor hires a contractor',
    category: 'referral',
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

const computeChanges = (before, after) => {
  const changes = [];
  const allKeys = new Set([
    ...Object.keys(before || {}),
    ...Object.keys(after || {}),
  ]);
  for (const key of allKeys) {
    if (key === 'updatedAt' || key === 'createdAt') continue;
    const oldVal = before ? before[key] : undefined;
    const newVal = after ? after[key] : undefined;
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes.push({ field: key, oldValue: oldVal ?? null, newValue: newVal ?? null });
    }
  }
  return changes;
};

const writeAudit = async (configId, action, before, after, adminEmail, adminId) => {
  const changes = computeChanges(before, after);
  await addDoc(collection(firestore, AUDIT_COLLECTION), {
    configId,
    action,
    changedBy: adminEmail || 'system',
    changedById: adminId || 'system',
    timestamp: serverTimestamp(),
    before: before || null,
    after: after || null,
    changes,
  });
};

const bumpConfigVersion = async () => {
  const metaRef = doc(firestore, META_COLLECTION, 'config_version');
  const snap = await getDoc(metaRef);
  const current = snap.exists() ? (snap.data().version || 0) : 0;
  await setDoc(metaRef, { version: current + 1, lastUpdated: serverTimestamp() });
};

const isOldFormat = (rule) => !rule.roleRules;

export const loyaltyAdminApi = {
  async getRules() {
    const snapshot = await getDocs(collection(firestore, CONFIG_COLLECTION));
    const all = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    const active = all.filter((r) => r.archived !== true);
    active.sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
    return active;
  },

  async seedDefaultRules(adminEmail, adminId) {
    const batch = writeBatch(firestore);
    const now = serverTimestamp();
    for (const rule of DEFAULT_LOYALTY_RULES) {
      const ref = doc(firestore, CONFIG_COLLECTION, rule.actionType);
      batch.set(ref, { ...rule, createdAt: now, updatedAt: now });
    }
    await batch.commit();
    await bumpConfigVersion();
    for (const rule of DEFAULT_LOYALTY_RULES) {
      await writeAudit(rule.actionType, 'create', null, rule, adminEmail || 'system', adminId || 'system');
    }
  },

  async migrateOldRules(rules) {
    const batch = writeBatch(firestore);
    const now = serverTimestamp();
    const OLD_ROLE_MAP = {
      CUSTOMER: 'homeowner',
      WORKER: 'contractor',
      PARTNER: 'partner',
    };
    for (const rule of rules) {
      if (!isOldFormat(rule)) continue;
      const defaultRule = DEFAULT_LOYALTY_RULES.find((d) => d.actionType === rule.actionType);
      if (!defaultRule) continue;
      const coinsAwarded = rule.coinsAwarded ?? 0;
      const targetRole = rule.role ? OLD_ROLE_MAP[rule.role] : null;
      const roleRules = {
        homeowner: { coins: targetRole === 'homeowner' || !targetRole ? coinsAwarded : 0, enabled: targetRole === 'homeowner' || !targetRole },
        contractor: { coins: targetRole === 'contractor' || !targetRole ? coinsAwarded : 0, enabled: targetRole === 'contractor' || !targetRole },
        partner: { coins: targetRole === 'partner' || !targetRole ? coinsAwarded : 0, enabled: targetRole === 'partner' || !targetRole },
        default: { coins: coinsAwarded },
      };
      const ref = doc(firestore, CONFIG_COLLECTION, rule.id);
      batch.set(ref, {
        actionType: rule.actionType,
        displayName: defaultRule.displayName,
        description: defaultRule.description,
        category: defaultRule.category,
        sortOrder: defaultRule.sortOrder,
        enabled: rule.enabled !== false,
        maxPerUser: rule.maxPerUser ?? null,
        cooldownDays: rule.cooldownDays ?? null,
        archived: false,
        roleRules,
        createdAt: rule.createdAt || now,
        updatedAt: now,
      });
    }
    await batch.commit();
    await bumpConfigVersion();
  },

  async createRule(data, adminEmail, adminId) {
    const now = serverTimestamp();
    const ruleData = { ...data, actionType: data.actionType, createdAt: now, updatedAt: now, archived: false };
    const ref = doc(firestore, CONFIG_COLLECTION, data.actionType);
    await setDoc(ref, ruleData);
    await writeAudit(data.actionType, 'create', null, ruleData, adminEmail, adminId);
    await bumpConfigVersion();
    return { id: data.actionType, ...ruleData };
  },

  async updateRule(id, data, before, adminEmail, adminId) {
    const now = serverTimestamp();
    const updateData = { ...data, updatedAt: now };
    await updateDoc(doc(firestore, CONFIG_COLLECTION, id), updateData);
    await writeAudit(id, 'update', before, { ...before, ...updateData }, adminEmail, adminId);
    await bumpConfigVersion();
  },

  async toggleRule(id, enabled, before, adminEmail, adminId) {
    const now = serverTimestamp();
    await updateDoc(doc(firestore, CONFIG_COLLECTION, id), { enabled, updatedAt: now });
    await writeAudit(id, 'toggle', before, { ...before, enabled }, adminEmail, adminId);
    await bumpConfigVersion();
  },

  async archiveRule(id, before, adminEmail, adminId) {
    const now = serverTimestamp();
    await updateDoc(doc(firestore, CONFIG_COLLECTION, id), { archived: true, updatedAt: now });
    await writeAudit(id, 'delete', before, null, adminEmail, adminId);
    await bumpConfigVersion();
  },

  async duplicateRule(original, adminEmail, adminId) {
    const newId = `${original.actionType}_COPY`;
    const now = serverTimestamp();
    const ruleData = {
      ...original,
      actionType: newId,
      displayName: original.displayName ? `${original.displayName} (copy)` : undefined,
      sortOrder: (original.sortOrder || 0) + 1,
      createdAt: now,
      updatedAt: now,
      archived: false,
    };
    delete ruleData.id;
    const ref = doc(firestore, CONFIG_COLLECTION, newId);
    await setDoc(ref, ruleData);
    await writeAudit(newId, 'create', null, ruleData, adminEmail, adminId);
    await bumpConfigVersion();
    return { id: newId, ...ruleData };
  },

  async updateSortOrder(updates) {
    const batch = writeBatch(firestore);
    for (const { id, sortOrder } of updates) {
      batch.update(doc(firestore, CONFIG_COLLECTION, id), { sortOrder, updatedAt: serverTimestamp() });
    }
    await batch.commit();
    await bumpConfigVersion();
  },

  async getAuditHistory(configId) {
    const { query, where, orderBy } = await import('firebase/firestore');
    const q = query(
      collection(firestore, AUDIT_COLLECTION),
      where('configId', '==', configId),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async checkActionTypeUnique(actionType) {
    const snap = await getDoc(doc(firestore, CONFIG_COLLECTION, actionType));
    return !snap.exists();
  },
};
