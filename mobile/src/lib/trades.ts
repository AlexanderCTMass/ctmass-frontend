import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "@react-native-firebase/firestore";

import { SPECIALTIES } from "@/constants/specialties";
import { getDb } from "@/lib/firebase";
import { fetchOwnerRating } from "@/lib/reviews";

const COLLECTION = "trades";
const MAX_IN = 10;
const RECENT_LIMIT = 12;
const POOL_LIMIT = 150;
const RECENT_WINDOW_SECONDS = 45 * 24 * 60 * 60;

export type Specialist = {
  tradeId: string;
  ownerId: string;
  name: string;
  specialtyLabel: string;
  rating: number;
  reviews: number;
  avatarUrl: string;
  placeName: string;
  status: string;
  createdAtSeconds: number;
};

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function num(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function mapTrade(id: string, data: Record<string, unknown>): Specialist {
  const contact = asRecord(data.contact);
  const location = asRecord(data.location);
  const addressLocation = asRecord(location.addressLocation);
  return {
    tradeId: id,
    ownerId: str(data.ownerId) || str(data.userId),
    name: str(data.title) || str(contact.businessName) || "Specialist",
    specialtyLabel: str(data.primarySpecialtyLabel) || str(data.subtitle),
    rating: num(data.rating),
    reviews: num(data.reviews),
    avatarUrl: str(data.avatarUrl),
    placeName: str(addressLocation.place_name) || str(location.address),
    status: str(data.status, "on_review"),
    createdAtSeconds: num(asRecord(data.createdAt).seconds),
  };
}

function keepSpecialist(
  specialist: Specialist,
  excludeOwnerId?: string,
): boolean {
  if (!specialist.ownerId) return false;
  if (excludeOwnerId && specialist.ownerId === excludeOwnerId) return false;
  if (specialist.status === "rejected") return false;
  return true;
}

// Overrides the stored trades.rating with a live rating computed from each
// owner's reviews subcollection (deduped by owner), matching the web search.
async function withRatings(list: Specialist[]): Promise<Specialist[]> {
  const owners = [...new Set(list.map((item) => item.ownerId).filter(Boolean))];
  if (owners.length === 0) return list;
  const entries = await Promise.all(
    owners.map(
      async (id) =>
        [id, await fetchOwnerRating(id).catch(() => null)] as const,
    ),
  );
  const byOwner = new Map(entries);
  return list.map((item) => {
    const summary = byOwner.get(item.ownerId);
    if (summary && summary.count > 0) {
      return { ...item, rating: summary.average, reviews: summary.count };
    }
    return item;
  });
}

export async function fetchSpecialistsByLabels(
  labels: string[],
  excludeOwnerId?: string,
): Promise<Specialist[]> {
  if (labels.length === 0) return [];
  const db = getDb();
  const q = query(
    collection(db, COLLECTION),
    where("primarySpecialtyLabel", "in", labels.slice(0, MAX_IN)),
  );
  const snapshot = await getDocs(q);
  const list = snapshot.docs
    .map((docSnap) => mapTrade(docSnap.id, asRecord(docSnap.data())))
    .filter((specialist) => keepSpecialist(specialist, excludeOwnerId));
  return withRatings(list);
}

export async function fetchRecentSpecialists(
  excludeOwnerId?: string,
): Promise<Specialist[]> {
  const db = getDb();
  const q = query(collection(db, COLLECTION), limit(RECENT_LIMIT));
  const snapshot = await getDocs(q);
  const list = snapshot.docs
    .map((docSnap) => mapTrade(docSnap.id, asRecord(docSnap.data())))
    .filter((specialist) => keepSpecialist(specialist, excludeOwnerId));
  return withRatings(list);
}

// A capped pool of specialists that the search screen filters and groups
// client-side (Firestore has no text search).
export async function fetchSpecialistPool(
  excludeOwnerId?: string,
): Promise<Specialist[]> {
  const db = getDb();
  const q = query(collection(db, COLLECTION), limit(POOL_LIMIT));
  const snapshot = await getDocs(q);
  const seen = new Set<string>();
  const out: Specialist[] = [];
  for (const docSnap of snapshot.docs) {
    const specialist = mapTrade(docSnap.id, asRecord(docSnap.data()));
    if (!keepSpecialist(specialist, excludeOwnerId)) continue;
    // one row per specialist (a person can own several trades)
    if (seen.has(specialist.ownerId)) continue;
    seen.add(specialist.ownerId);
    out.push(specialist);
  }
  return withRatings(out);
}

// Exact-match lookup by owner email (profiles.email) → their trades.
export async function fetchSpecialistsByEmail(
  email: string,
  excludeOwnerId?: string,
): Promise<Specialist[]> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return [];
  const db = getDb();
  const snapshot = await getDocs(
    query(collection(db, "profiles"), where("email", "==", trimmed), limit(5)),
  );
  const ownerIds = snapshot.docs.map((docSnap) => docSnap.id);
  if (ownerIds.length === 0) return [];
  const lists = await Promise.all(
    ownerIds.map((ownerId) => fetchTradesByOwner(ownerId).catch(() => [])),
  );
  return withRatings(
    lists
      .flat()
      .filter((specialist) => keepSpecialist(specialist, excludeOwnerId)),
  );
}

export type SpecialistGroups = {
  topRated: Specialist[];
  recent: Specialist[];
  more: Specialist[];
};

export function groupSpecialists(list: Specialist[]): SpecialistGroups {
  const topRated = list
    .filter((item) => item.rating > 0)
    .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);

  const rest = list.filter((item) => item.rating <= 0);
  const nowSeconds = Date.now() / 1000;
  const recent = rest
    .filter(
      (item) =>
        item.createdAtSeconds > 0 &&
        nowSeconds - item.createdAtSeconds <= RECENT_WINDOW_SECONDS,
    )
    .sort((a, b) => b.createdAtSeconds - a.createdAtSeconds);
  const recentIds = new Set(recent.map((item) => item.tradeId));
  const more = rest
    .filter((item) => !recentIds.has(item.tradeId))
    .sort((a, b) => b.createdAtSeconds - a.createdAtSeconds);

  return { topRated, recent, more };
}

export function matchesSpecialistQuery(
  specialist: Specialist,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    specialist.name.toLowerCase().includes(q) ||
    specialist.specialtyLabel.toLowerCase().includes(q)
  );
}

export type TradeProfile = {
  tradeId: string;
  ownerId: string;
  name: string;
  specialtyLabel: string;
  rating: number;
  reviews: number;
  placeName: string;
  about: string;
  avatarUrl: string;
  priceType: string;
  price: string;
  gallery: string[];
};

function mapTradeProfile(
  id: string,
  data: Record<string, unknown>,
): TradeProfile {
  const contact = asRecord(data.contact);
  const story = asRecord(data.story);
  const pricing = asRecord(data.pricing);
  const location = asRecord(data.location);
  const addressLocation = asRecord(location.addressLocation);
  const gallery = Array.isArray(data.attach)
    ? data.attach.filter((item): item is string => typeof item === "string")
    : [];
  return {
    tradeId: id,
    ownerId: str(data.ownerId) || str(data.userId),
    name: str(data.title) || str(contact.businessName) || "Specialist",
    specialtyLabel: str(data.primarySpecialtyLabel) || str(data.subtitle),
    rating: num(data.rating),
    reviews: num(data.reviews),
    placeName: str(addressLocation.place_name) || str(location.address),
    about: str(story.about) || str(data.description),
    avatarUrl: str(data.avatarUrl),
    priceType: str(pricing.type),
    price: str(pricing.amount),
    gallery,
  };
}

async function withProfileRating(
  profile: TradeProfile,
): Promise<TradeProfile> {
  const summary = await fetchOwnerRating(profile.ownerId).catch(() => null);
  if (summary && summary.count > 0) {
    return { ...profile, rating: summary.average, reviews: summary.count };
  }
  return profile;
}

export async function fetchTradeByOwner(
  ownerId: string,
): Promise<TradeProfile | null> {
  const db = getDb();
  const q = query(
    collection(db, COLLECTION),
    where("ownerId", "==", ownerId),
    limit(1),
  );
  const snapshot = await getDocs(q);
  const docSnap = snapshot.docs[0];
  if (!docSnap) return null;
  return withProfileRating(mapTradeProfile(docSnap.id, asRecord(docSnap.data())));
}

export async function fetchTradeById(
  tradeId: string,
): Promise<TradeProfile | null> {
  if (!tradeId) return null;
  const db = getDb();
  const snapshot = await getDoc(doc(db, COLLECTION, tradeId));
  if (!snapshot.exists()) return null;
  return withProfileRating(mapTradeProfile(snapshot.id, asRecord(snapshot.data())));
}

export async function fetchTradesByOwner(
  ownerId: string,
): Promise<Specialist[]> {
  if (!ownerId) return [];
  const db = getDb();
  const q = query(collection(db, COLLECTION), where("ownerId", "==", ownerId));
  const snapshot = await getDocs(q);
  const list = snapshot.docs
    .map((docSnap) => mapTrade(docSnap.id, asRecord(docSnap.data())))
    .filter((specialist) => specialist.status !== "rejected");
  const summary = await fetchOwnerRating(ownerId).catch(() => null);
  if (summary && summary.count > 0) {
    return list.map((item) => ({
      ...item,
      rating: summary.average,
      reviews: summary.count,
    }));
  }
  return list;
}

export type TradeLocation = {
  address: string;
  addressLocation: Record<string, unknown> | null;
  commuteMode: string;
  commuteDuration: number;
};

export type CreateTradeInput = {
  title: string;
  primarySpecialtyId: string;
  primarySpecialtyLabel: string;
  about: string;
  priceType: string;
  price: string;
  phone: string;
  location: TradeLocation;
};

export async function createTrade(
  ownerId: string,
  input: CreateTradeInput,
): Promise<string> {
  const db = getDb();
  const now = serverTimestamp();
  const isCustomSpecialty =
    input.primarySpecialtyLabel.length > 0 &&
    !(SPECIALTIES as readonly string[]).includes(input.primarySpecialtyLabel);
  const docRef = await addDoc(collection(db, COLLECTION), {
    ownerId,
    title: input.title || "My Trade",
    subtitle: input.primarySpecialtyLabel || "",
    description: input.about || "",
    avatarUrl: "",
    rating: 0,
    views: 0,
    viewsThisWeek: 0,
    reviews: 0,
    completedProjects: 0,
    projectsInProgress: 0,
    status: "on_review",
    statusDetails: "",
    statusUpdatedAt: now,
    newOrders: 0,
    primarySpecialtyId: input.primarySpecialtyId || "",
    primarySpecialtyLabel: input.primarySpecialtyLabel || "",
    primarySpecialtyPath: isCustomSpecialty ? input.primarySpecialtyLabel : "",
    other: isCustomSpecialty,
    contact: {
      businessName: input.title || "",
      professionalRole: "",
      phone: input.phone || "",
      useProfilePhone: !input.phone,
    },
    location: {
      address: input.location.address || "",
      addressLocation: input.location.addressLocation ?? null,
      commuteMode: input.location.commuteMode || "driving",
      commuteDuration: input.location.commuteDuration || 20,
    },
    pricing: {
      type: input.priceType || "",
      amount: input.price || "",
    },
    story: {
      about: input.about || "",
      shortDescription: "",
    },
    metrics: {
      viewsThisWeek: 0,
      totalViews: 0,
      updatedAt: now,
    },
    source: "mobile",
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

export type UpdateTradeInput = {
  title: string;
  primarySpecialtyId: string;
  primarySpecialtyLabel: string;
  about: string;
  priceType: string;
  price: string;
};

export async function updateTrade(
  tradeId: string,
  input: UpdateTradeInput,
): Promise<void> {
  if (!tradeId) return;
  const db = getDb();
  const isCustomSpecialty =
    input.primarySpecialtyLabel.length > 0 &&
    !(SPECIALTIES as readonly string[]).includes(input.primarySpecialtyLabel);
  await updateDoc(doc(db, COLLECTION, tradeId), {
    title: input.title || "My Trade",
    subtitle: input.primarySpecialtyLabel || "",
    description: input.about || "",
    primarySpecialtyId: input.primarySpecialtyId || "",
    primarySpecialtyLabel: input.primarySpecialtyLabel || "",
    primarySpecialtyPath: isCustomSpecialty ? input.primarySpecialtyLabel : "",
    other: isCustomSpecialty,
    "contact.businessName": input.title || "",
    "pricing.type": input.priceType || "",
    "pricing.amount": input.price || "",
    "story.about": input.about || "",
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTrade(tradeId: string): Promise<void> {
  if (!tradeId) return;
  const db = getDb();
  await deleteDoc(doc(db, COLLECTION, tradeId));
}
