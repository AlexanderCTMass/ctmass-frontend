import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "@react-native-firebase/firestore";

import { getDb } from "@/lib/firebase";
import type { Role } from "@/lib/roles";

export const SHOP_CATEGORIES = {
  MERCHANDISE: "Merchandise Shop",
  IT_SERVICES: "IT & Digital Services",
  CONSTRUCTION: "Construction Deals",
  SPECIAL_OFFER: "Special Offer",
} as const;

export const CATEGORY_COLORS: Record<string, string> = {
  [SHOP_CATEGORIES.MERCHANDISE]: "#F97316",
  [SHOP_CATEGORIES.IT_SERVICES]: "#38BDF8",
  [SHOP_CATEGORIES.CONSTRUCTION]: "#C08457",
  [SHOP_CATEGORIES.SPECIAL_OFFER]: "#84CC16",
};

export const FORM_CATEGORIES = new Set<string>([
  SHOP_CATEGORIES.MERCHANDISE,
  SHOP_CATEGORIES.IT_SERVICES,
  SHOP_CATEGORIES.CONSTRUCTION,
  SHOP_CATEGORIES.SPECIAL_OFFER,
]);

export type ShopPackage = {
  id: string;
  quantity: number;
  price: number;
  displayName: string;
  isRecommended: boolean;
};

export type ShopDiscount = {
  type: "percentage" | "fixed";
  value: number;
  validFrom?: unknown;
  validUntil?: unknown;
};

export type ShopPricing = {
  basePrice: number;
  currency: string;
  discount: ShopDiscount | null;
  packages: ShopPackage[] | null;
};

export type ShopAvailability = {
  roles: string[];
  requireVerified: boolean;
  minBalance: number;
};

export type ShopFeature = {
  id: string;
  featureKey: string;
  displayName: string;
  description: string;
  category: string;
  enabled: boolean;
  isOneTime: boolean;
  imageUrl1: string;
  imageUrl2: string;
  imageUrl3: string;
  pricing: ShopPricing;
  availability: ShopAvailability;
  metadata: { sizeOptions?: string[] };
  sortOrder: number;
};

export type ShopPurchase = {
  id: string;
  userId: string;
  featureKey: string;
  status: string;
};

export type OrderItem = { size: string; quantity: number };

export type PurchaseOptions = {
  formData?: Record<string, unknown> | null;
  ticketNumber?: string | null;
  totalPrice?: number | null;
  totalQuantity?: number;
};

const CONFIG_COLLECTION = "paid_features_config";
const PURCHASES_COLLECTION = "user_paid_features";
const TRANSACTIONS_COLLECTION = "loyalty_transactions";

const APPAREL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

export const DEFAULT_SHOP_ITEMS: ShopFeature[] = [
  {
    id: "TSHIRT",
    featureKey: "TSHIRT",
    displayName: "T-Shirt",
    description: "Shipping within Massachusetts is included.",
    category: SHOP_CATEGORIES.MERCHANDISE,
    enabled: true,
    isOneTime: false,
    imageUrl1:
      "https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2Ft-shirt2New.jpg?alt=media&token=2e44f493-395e-4923-91c6-65765d56ef6b",
    imageUrl2:
      "https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2Ft-shirtOldOne.jpg?alt=media&token=8b9adb08-3367-455a-a4a6-b06cd4609abc",
    imageUrl3: "",
    pricing: { basePrice: 2500, currency: "COINS", discount: null, packages: null },
    availability: {
      roles: ["homeowner", "contractor", "partner"],
      requireVerified: false,
      minBalance: 2500,
    },
    metadata: { sizeOptions: APPAREL_SIZES },
    sortOrder: 1,
  },
  {
    id: "BASEBALL_CAP",
    featureKey: "BASEBALL_CAP",
    displayName: "Baseball Cap",
    description: "Shipping within Massachusetts is included.",
    category: SHOP_CATEGORIES.MERCHANDISE,
    enabled: true,
    isOneTime: false,
    imageUrl1:
      "https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2FbaseballCapWorkerNew.jpg?alt=media&token=ad49aa17-9422-449b-91c2-17cdf789150a",
    imageUrl2:
      "https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2Fcap-white.jpg?alt=media&token=7eb1ade0-c66d-47b6-990c-fd5f460f5495",
    imageUrl3:
      "https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2FbaseballCapClean.jpg?alt=media&token=0764fe3e-9941-461d-825c-694ccd21c2b7",
    pricing: { basePrice: 2000, currency: "COINS", discount: null, packages: null },
    availability: {
      roles: ["homeowner", "contractor", "partner"],
      requireVerified: false,
      minBalance: 2000,
    },
    metadata: {
      sizeOptions: [
        "One Size (Adjustable)",
        "S/M",
        "L/XL",
        "7",
        "7 1/8",
        "7 1/4",
        "7 3/8",
        "7 1/2",
        "7 5/8",
        "7 3/4",
      ],
    },
    sortOrder: 2,
  },
  {
    id: "HOODIE",
    featureKey: "HOODIE",
    displayName: "Hoodie",
    description: "Shipping within Massachusetts is included.",
    category: SHOP_CATEGORIES.MERCHANDISE,
    enabled: true,
    isOneTime: false,
    imageUrl1:
      "https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2Fhoodie.jpg?alt=media&token=0ba4d0cc-c75f-4f8e-8771-6189e9f8be3a",
    imageUrl2: "",
    imageUrl3: "",
    pricing: { basePrice: 5000, currency: "COINS", discount: null, packages: null },
    availability: {
      roles: ["homeowner", "contractor", "partner"],
      requireVerified: false,
      minBalance: 5000,
    },
    metadata: { sizeOptions: APPAREL_SIZES },
    sortOrder: 3,
  },
  {
    id: "CUP",
    featureKey: "CUP",
    displayName: "Cup",
    description: "Shipping within Massachusetts is included.",
    category: SHOP_CATEGORIES.MERCHANDISE,
    enabled: true,
    isOneTime: false,
    imageUrl1:
      "https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2FcupNew.jpg?alt=media&token=4920d895-eb2b-4302-9a31-6fa7dbda67fa",
    imageUrl2:
      "https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2FcupOld.jpg?alt=media&token=09e83e90-a041-461d-af5f-13b3850f256e",
    imageUrl3:
      "https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2Fcup2New.jpg?alt=media&token=26dcc0fc-dc44-44bb-a301-7453ae0edfe8",
    pricing: { basePrice: 2000, currency: "COINS", discount: null, packages: null },
    availability: {
      roles: ["homeowner", "contractor", "partner"],
      requireVerified: false,
      minBalance: 2000,
    },
    metadata: { sizeOptions: [] },
    sortOrder: 4,
  },
  {
    id: "STRETCH_CEILING",
    featureKey: "STRETCH_CEILING",
    displayName: "Stretch Ceiling in the Bathroom",
    description:
      "For 5000 coins you'll get 50% discount on stretch ceiling installation in the bathroom.",
    category: SHOP_CATEGORIES.CONSTRUCTION,
    enabled: true,
    isOneTime: false,
    imageUrl1:
      "https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2Fceiling.jpg?alt=media&token=68322b36-cc33-4c71-af59-fc3dcd17c13d",
    imageUrl2: "",
    imageUrl3: "",
    pricing: { basePrice: 5000, currency: "COINS", discount: null, packages: null },
    availability: {
      roles: ["homeowner", "contractor", "partner"],
      requireVerified: false,
      minBalance: 5000,
    },
    metadata: {},
    sortOrder: 5,
  },
  {
    id: "LANDING_PAGE",
    featureKey: "LANDING_PAGE",
    displayName: "Landing Page",
    description:
      "For 8000 coins you'll get 50% discount on a landing page. Price range: 8000–20000 coins depending on scope.",
    category: SHOP_CATEGORIES.IT_SERVICES,
    enabled: true,
    isOneTime: false,
    imageUrl1:
      "https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2FlandingPage1.jpg?alt=media&token=19466b92-e576-4df4-a6a8-60a7dd5b734f",
    imageUrl2:
      "https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2FlandingPage2.jpg?alt=media&token=4eb84e08-e08a-47a3-a2fe-0ac687b59494",
    imageUrl3: "",
    pricing: {
      basePrice: 8000,
      currency: "COINS",
      discount: null,
      packages: [
        { id: "basic", quantity: 1, price: 8000, displayName: "Basic Landing Page", isRecommended: false },
        { id: "premium", quantity: 1, price: 20000, displayName: "Premium Landing Page", isRecommended: true },
      ],
    },
    availability: {
      roles: ["homeowner", "contractor", "partner"],
      requireVerified: false,
      minBalance: 8000,
    },
    metadata: {},
    sortOrder: 6,
  },
  {
    id: "MOBILE_APP",
    featureKey: "MOBILE_APP",
    displayName: "Mobile App Development",
    description:
      "Native and cross-platform iOS / Android apps for your business — booking apps, customer apps, contractor apps and more.",
    category: SHOP_CATEGORIES.IT_SERVICES,
    enabled: true,
    isOneTime: false,
    imageUrl1:
      "https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2Fmobile.jpg?alt=media&token=bf9aab4c-2406-4838-92b7-966783bfb7e0",
    imageUrl2: "",
    imageUrl3: "",
    pricing: {
      basePrice: 15000,
      currency: "COINS",
      discount: null,
      packages: [
        { id: "mvp", quantity: 1, price: 15000, displayName: "MVP App", isRecommended: false },
        { id: "full", quantity: 1, price: 40000, displayName: "Full-Featured App", isRecommended: true },
      ],
    },
    availability: {
      roles: ["homeowner", "contractor", "partner"],
      requireVerified: false,
      minBalance: 15000,
    },
    metadata: {},
    sortOrder: 7,
  },
  {
    id: "BACKEND_DB",
    featureKey: "BACKEND_DB",
    displayName: "Backend & Database Integration",
    description:
      "Custom backend, API integrations, database design and cloud setup to power your products.",
    category: SHOP_CATEGORIES.IT_SERVICES,
    enabled: true,
    isOneTime: false,
    imageUrl1:
      "https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2Fbackend.jpg?alt=media&token=7a87ec97-2ba6-4b7f-b775-56b2b07dd3ff",
    imageUrl2: "",
    imageUrl3: "",
    pricing: { basePrice: 22000, currency: "COINS", discount: null, packages: null },
    availability: {
      roles: ["homeowner", "contractor", "partner"],
      requireVerified: false,
      minBalance: 22000,
    },
    metadata: {},
    sortOrder: 8,
  },
  {
    id: "CRM_SYSTEM",
    featureKey: "CRM_SYSTEM",
    displayName: "Custom CRM System",
    description:
      "A tailor-made CRM to manage clients, jobs, invoices and pipelines — built around how your business actually works.",
    category: SHOP_CATEGORIES.IT_SERVICES,
    enabled: true,
    isOneTime: false,
    imageUrl1:
      "https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2FCRM.jpg?alt=media&token=35487c56-1b91-467f-ba43-8d7ffbac0b30",
    imageUrl2: "",
    imageUrl3: "",
    pricing: { basePrice: 24000, currency: "COINS", discount: null, packages: null },
    availability: {
      roles: ["homeowner", "contractor", "partner"],
      requireVerified: false,
      minBalance: 24000,
    },
    metadata: {},
    sortOrder: 9,
  },
  {
    id: "MINI_GAME",
    featureKey: "MINI_GAME",
    displayName: "Mini-Game / Interactive Experience",
    description:
      "Engaging mini-games, quizzes and interactive web experiences — great for marketing campaigns and customer engagement.",
    category: SHOP_CATEGORIES.IT_SERVICES,
    enabled: true,
    isOneTime: false,
    imageUrl1:
      "https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2Fmini-game.jpg?alt=media&token=1c23e6c6-ed77-4e65-8136-4d01ec89b851",
    imageUrl2: "",
    imageUrl3: "",
    pricing: { basePrice: 9000, currency: "COINS", discount: null, packages: null },
    availability: {
      roles: ["homeowner", "contractor", "partner"],
      requireVerified: false,
      minBalance: 9000,
    },
    metadata: {},
    sortOrder: 10,
  },
  {
    id: "AI_AUTOMATION",
    featureKey: "AI_AUTOMATION",
    displayName: "AI Automation & Chatbots",
    description:
      "Smart chatbots, AI assistants, workflow automation and integrations with OpenAI, Gemini, Anthropic, and more.",
    category: SHOP_CATEGORIES.IT_SERVICES,
    enabled: true,
    isOneTime: false,
    imageUrl1:
      "https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2Fchatbot.jpg?alt=media&token=def58143-1054-4466-947d-ddf0e6dfc19d",
    imageUrl2: "",
    imageUrl3: "",
    pricing: { basePrice: 7000, currency: "COINS", discount: null, packages: null },
    availability: {
      roles: ["homeowner", "contractor", "partner"],
      requireVerified: false,
      minBalance: 7000,
    },
    metadata: {},
    sortOrder: 11,
  },
  {
    id: "ECOMMERCE_STORE",
    featureKey: "ECOMMERCE_STORE",
    displayName: "E-Commerce Store Setup",
    description:
      "Full online store: catalog, payments, inventory, shipping integrations and admin panel.",
    category: SHOP_CATEGORIES.IT_SERVICES,
    enabled: true,
    isOneTime: false,
    imageUrl1:
      "https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2Fstore.jpg?alt=media&token=c86d4060-e4fc-496c-abaa-7d7f1c84f7e5",
    imageUrl2: "",
    imageUrl3: "",
    pricing: { basePrice: 30000, currency: "COINS", discount: null, packages: null },
    availability: {
      roles: ["homeowner", "contractor", "partner"],
      requireVerified: false,
      minBalance: 30000,
    },
    metadata: {},
    sortOrder: 12,
  },
  {
    id: "WEB_APP",
    featureKey: "WEB_APP",
    displayName: "Custom Web Application",
    description:
      "SaaS dashboards, internal tools and any complex web app tailored to your workflow.",
    category: SHOP_CATEGORIES.IT_SERVICES,
    enabled: true,
    isOneTime: false,
    imageUrl1:
      "https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2FcustomWebApp.jpg?alt=media&token=c4caadee-8aec-4c0b-92d4-da144119d4ca",
    imageUrl2: "",
    imageUrl3: "",
    pricing: { basePrice: 11000, currency: "COINS", discount: null, packages: null },
    availability: {
      roles: ["homeowner", "contractor", "partner"],
      requireVerified: false,
      minBalance: 11000,
    },
    metadata: {},
    sortOrder: 13,
  },
  {
    id: "TECH_SUPPORT",
    featureKey: "TECH_SUPPORT",
    displayName: "Tech Support & Maintenance",
    description:
      "Ongoing technical support, bug fixes, performance tuning and feature updates for your existing systems.",
    category: SHOP_CATEGORIES.IT_SERVICES,
    enabled: true,
    isOneTime: false,
    imageUrl1:
      "https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2Ftech-support.jpg?alt=media&token=4ac9f4f1-cc39-45f2-a313-f8041218bee6",
    imageUrl2: "",
    imageUrl3: "",
    pricing: { basePrice: 3000, currency: "COINS", discount: null, packages: null },
    availability: {
      roles: ["homeowner", "contractor", "partner"],
      requireVerified: false,
      minBalance: 3000,
    },
    metadata: {},
    sortOrder: 14,
  },
  {
    id: "GROUPON",
    featureKey: "GROUPON",
    displayName: "Add Your Offer",
    description:
      "Post affordable local services, products, or quick deals for homeowners and contractors in your community.",
    category: SHOP_CATEGORIES.SPECIAL_OFFER,
    enabled: true,
    isOneTime: false,
    imageUrl1:
      "https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2Fgroupon.jpg?alt=media&token=6d7d6159-763d-4e80-96ea-01f3e2a1acb5",
    imageUrl2: "",
    imageUrl3: "",
    pricing: { basePrice: 0, currency: "COINS", discount: null, packages: null },
    availability: {
      roles: ["homeowner", "contractor", "partner"],
      requireVerified: false,
      minBalance: 0,
    },
    metadata: {},
    sortOrder: 15,
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

function asStrArr(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function toDateMaybe(value: unknown): Date | null {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }
  return null;
}

function normalizePackages(value: unknown): ShopPackage[] | null {
  if (!Array.isArray(value)) return null;
  const list = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const raw = item as Raw;
      return {
        id: asStr(raw.id),
        quantity: asNum(raw.quantity, 1),
        price: asNum(raw.price),
        displayName: asStr(raw.displayName),
        isRecommended: asBool(raw.isRecommended),
      };
    })
    .filter((item): item is ShopPackage => item !== null && item.id.length > 0);
  return list.length > 0 ? list : null;
}

function normalizeDiscount(value: unknown): ShopDiscount | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Raw;
  const type = raw.type === "fixed" ? "fixed" : raw.type === "percentage" ? "percentage" : null;
  if (!type) return null;
  return {
    type,
    value: asNum(raw.value),
    validFrom: raw.validFrom,
    validUntil: raw.validUntil,
  };
}

function normalizeFeature(id: string, data: Raw): ShopFeature {
  const pricingRaw = (data.pricing as Raw) ?? {};
  const availabilityRaw = (data.availability as Raw) ?? {};
  const metadataRaw = (data.metadata as Raw) ?? {};
  return {
    id: asStr(data.featureKey) || id,
    featureKey: asStr(data.featureKey) || id,
    displayName: asStr(data.displayName),
    description: asStr(data.description),
    category: asStr(data.category),
    enabled: asBool(data.enabled, true),
    isOneTime: asBool(data.isOneTime),
    imageUrl1: asStr(data.imageUrl1) || asStr(data.imageUrl),
    imageUrl2: asStr(data.imageUrl2),
    imageUrl3: asStr(data.imageUrl3),
    pricing: {
      basePrice: asNum(pricingRaw.basePrice),
      currency: asStr(pricingRaw.currency, "COINS"),
      discount: normalizeDiscount(pricingRaw.discount),
      packages: normalizePackages(pricingRaw.packages),
    },
    availability: {
      roles: asStrArr(availabilityRaw.roles),
      requireVerified: asBool(availabilityRaw.requireVerified),
      minBalance: asNum(availabilityRaw.minBalance),
    },
    metadata: { sizeOptions: asStrArr(metadataRaw.sizeOptions) },
    sortOrder: asNum(data.sortOrder, 999),
  };
}

export function getFeatureImages(feature: ShopFeature): string[] {
  const list = [feature.imageUrl1, feature.imageUrl2, feature.imageUrl3].filter(
    (url) => typeof url === "string" && url.trim().length > 0,
  );
  return Array.from(new Set(list));
}

export function getEffectivePrice(feature: ShopFeature): number {
  const { basePrice, discount } = feature.pricing;
  if (!discount) return basePrice;
  const now = new Date();
  const from = toDateMaybe(discount.validFrom);
  const until = toDateMaybe(discount.validUntil);
  if (from && now < from) return basePrice;
  if (until && now > until) return basePrice;
  if (discount.type === "percentage") {
    return Math.round(basePrice * (1 - discount.value / 100));
  }
  if (discount.type === "fixed") {
    return Math.max(0, basePrice - discount.value);
  }
  return basePrice;
}

export function isRoleAllowed(role: Role | null | undefined, feature: ShopFeature): boolean {
  const roleKey = (role ?? "").toLowerCase();
  if (roleKey === "admin") return true;
  const roles = feature.availability?.roles ?? [];
  if (roles.length === 0) return true;
  if (roleKey === "customer") return roles.includes("homeowner");
  if (roleKey === "worker") return roles.includes("contractor");
  return roles.includes(roleKey);
}

export function minPaidPrice(
  features: ShopFeature[],
  role: Role | null | undefined,
): number {
  let min = Infinity;
  for (const feature of features) {
    if (!isRoleAllowed(role, feature)) continue;
    const price = getEffectivePrice(feature);
    if (price > 0 && price < min) min = price;
  }
  return min === Infinity ? 0 : min;
}

export async function fetchShopFeatures(): Promise<ShopFeature[]> {
  const db = getDb();
  try {
    const snapshot = await getDocs(
      query(collection(db, CONFIG_COLLECTION), orderBy("sortOrder", "asc")),
    );
    const items = snapshot.docs
      .map((docSnap) => normalizeFeature(docSnap.id, docSnap.data()))
      .filter((feature) => feature.enabled);
    if (items.length > 0) return items;
    return DEFAULT_SHOP_ITEMS.filter((feature) => feature.enabled);
  } catch {
    return DEFAULT_SHOP_ITEMS.filter((feature) => feature.enabled);
  }
}

export async function fetchUserPurchases(userId: string): Promise<ShopPurchase[]> {
  const db = getDb();
  const snapshot = await getDocs(
    query(collection(db, PURCHASES_COLLECTION), where("userId", "==", userId)),
  );
  return snapshot.docs.map((docSnap) => {
    const data: Raw = docSnap.data();
    return {
      id: docSnap.id,
      userId: asStr(data.userId),
      featureKey: asStr(data.featureKey),
      status: asStr(data.status),
    };
  });
}

function buildInitialUsageData(
  feature: ShopFeature,
  selectedPackage: ShopPackage | null,
): Record<string, unknown> {
  if (feature.featureKey === "CUSTOM_PROFILE_URL") {
    return { customSlug: null, previousSlug: null, changedAt: null, changeCount: 0 };
  }
  if (feature.featureKey === "AI_AVATAR_GENERATION") {
    const qty = selectedPackage ? selectedPackage.quantity : 1;
    return {
      totalPurchased: qty,
      usedPurchased: 0,
      remainingPurchased: qty,
    };
  }
  return {};
}

export async function purchaseShopFeature(
  userId: string,
  userRole: Role | null,
  feature: ShopFeature,
  selectedPackage: ShopPackage | null,
  options: PurchaseOptions = {},
): Promise<{ transactionId: string; price: number; ticketNumber: string | null }> {
  const db = getDb();
  const { formData = null, ticketNumber = null, totalPrice = null, totalQuantity = 1 } = options;
  const unitPrice = selectedPackage ? selectedPackage.price : feature.pricing.basePrice;
  const price = totalPrice !== null && totalPrice !== undefined ? totalPrice : unitPrice;

  return runTransaction(db, async (transaction) => {
    const profileRef = doc(db, "profiles", userId);
    const profileSnap = await transaction.get(profileRef);
    if (!profileSnap.exists()) throw new Error("User profile not found");

    const profileData: Raw = profileSnap.data() ?? {};
    const balance = asNum(profileData.loyaltyBalance);
    if (balance < price) throw new Error("Insufficient coin balance");

    const txRef = doc(collection(db, TRANSACTIONS_COLLECTION));
    const purchaseRef = doc(
      db,
      PURCHASES_COLLECTION,
      feature.isOneTime ? `${userId}_${feature.featureKey}` : txRef.id,
    );
    const existingPurchase = await transaction.get(purchaseRef);

    if (feature.isOneTime && existingPurchase.exists()) {
      const existingData: Raw = existingPurchase.data() ?? {};
      if (existingData.status === "active") {
        throw new Error("This feature is already purchased");
      }
    }

    if (price > 0) {
      transaction.update(profileRef, { loyaltyBalance: balance - price });
    }

    transaction.set(txRef, {
      userId,
      userRole,
      actionType: "PURCHASE_FEATURE",
      transactionType: "spending",
      featureKey: feature.featureKey,
      packageId: selectedPackage?.id ?? null,
      amount: -price,
      processed: true,
      ticketNumber: ticketNumber ?? null,
      createdAt: serverTimestamp(),
    });

    const purchaseDetails = {
      transactionId: txRef.id,
      price,
      unitPrice,
      totalQuantity,
      packageId: selectedPackage?.id ?? null,
      discountApplied: null,
      ticketNumber: ticketNumber ?? null,
      formData: formData ?? null,
    };

    const usageData = buildInitialUsageData(feature, selectedPackage);

    if (feature.isOneTime && existingPurchase.exists()) {
      transaction.update(purchaseRef, {
        status: "active",
        purchasedAt: serverTimestamp(),
        purchaseDetails,
        usageData,
        lastUsedAt: null,
        updatedAt: serverTimestamp(),
      });
    } else {
      transaction.set(purchaseRef, {
        userId,
        featureKey: feature.featureKey,
        purchasedAt: serverTimestamp(),
        expiresAt: null,
        status: "active",
        purchaseDetails,
        usageData,
        lastUsedAt: null,
        metadata: {},
      });
    }

    return { transactionId: txRef.id, price, ticketNumber: ticketNumber ?? null };
  });
}

export function generateTicketNumber(): string {
  const d = new Date();
  const y = String(d.getFullYear()).slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `${y}${m}${day}-${rand}`;
}

export function formatCoins(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
