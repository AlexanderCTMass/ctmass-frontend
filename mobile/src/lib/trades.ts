import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "@react-native-firebase/firestore";

import { findGroup, findTrade } from "@/constants/trade-taxonomy";
import {
  type OwnerPublic,
  readOwnerPublic,
} from "@/lib/business-profile";
import { getDb } from "@/lib/firebase";
import { type Review, fetchReviews, reviewSummary } from "@/lib/reviews";
import {
  type TradeDetails,
  type TradeDetailsInput,
  readTradeDetails,
  stripUndefined,
  tradeDetailsPayload,
} from "@/lib/trade-details";

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
  lat: number | null;
  lng: number | null;
  primarySpecialtyId: string;
  coverUrl: string;
  completedProjects: number;
  details: TradeDetails;
  owner: OwnerPublic | null;
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

function readCoords(
  addressLocation: Record<string, unknown>,
): { lat: number | null; lng: number | null } {
  const center = addressLocation.center;
  const geometry = asRecord(addressLocation.geometry);
  const coordinates = geometry.coordinates;
  const source = Array.isArray(center)
    ? center
    : Array.isArray(coordinates)
      ? coordinates
      : null;
  if (!source || source.length < 2) return { lat: null, lng: null };
  const lng = Number(source[0]);
  const lat = Number(source[1]);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    return { lat: null, lng: null };
  }
  return { lat, lng };
}

function tradeCenter(
  addressLocation: Record<string, unknown>,
): [number, number] | null {
  const coords = readCoords(addressLocation);
  return coords.lat !== null && coords.lng !== null
    ? [coords.lng, coords.lat]
    : null;
}

function mapTrade(id: string, data: Record<string, unknown>): Specialist {
  const contact = asRecord(data.contact);
  const location = asRecord(data.location);
  const addressLocation = asRecord(location.addressLocation);
  const coords = readCoords(addressLocation);
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
    lat: coords.lat,
    lng: coords.lng,
    primarySpecialtyId: str(data.primarySpecialtyId),
    coverUrl: firstImage(data.attach),
    completedProjects: num(data.completedProjects),
    details: readTradeDetails(data),
    owner: null,
  };
}

function firstImage(value: unknown): string {
  if (!Array.isArray(value)) return "";
  const url = value.find(
    (item): item is string => typeof item === "string" && item.startsWith("http"),
  );
  return url ?? "";
}

export type RatingSummary = { average: number; count: number };

export function tradeRating(
  reviews: Review[],
  tradeId: string,
): RatingSummary & { scope: "trade" | "all" } {
  const own = reviews.filter((review) => review.tradeId === tradeId);
  if (own.length > 0) return { ...reviewSummary(own), scope: "trade" };
  return { ...reviewSummary(reviews), scope: "all" };
}

type OwnerData = { reviews: Review[]; owner: OwnerPublic | null };

async function fetchOwnerData(ownerId: string): Promise<OwnerData> {
  const [reviews, owner] = await Promise.all([
    fetchReviews(ownerId).catch(() => [] as Review[]),
    getDoc(doc(getDb(), "profiles", ownerId))
      .then((snapshot) =>
        snapshot.exists()
          ? readOwnerPublic(ownerId, asRecord(snapshot.data()))
          : null,
      )
      .catch(() => null),
  ]);
  return { reviews, owner };
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

async function withRatings(list: Specialist[]): Promise<Specialist[]> {
  const owners = [...new Set(list.map((item) => item.ownerId).filter(Boolean))];
  if (owners.length === 0) return list;
  const entries = await Promise.all(
    owners.map(async (id) => [id, await fetchOwnerData(id)] as const),
  );
  const byOwner = new Map(entries);
  return list.map((item) => {
    const data = byOwner.get(item.ownerId);
    if (!data) return item;
    const summary = tradeRating(data.reviews, item.tradeId);
    const rated =
      summary.count > 0
        ? { rating: summary.average, reviews: summary.count }
        : {};
    return {
      ...item,
      ...rated,
      avatarUrl: item.avatarUrl || data.owner?.avatar || "",
      owner: data.owner,
    };
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

export async function fetchSpecialistsByService(
  label: string,
  excludeOwnerId?: string,
): Promise<Specialist[]> {
  if (!label) return [];
  const db = getDb();
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTION),
      where("services", "array-contains", label),
      limit(POOL_LIMIT),
    ),
  );
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
  const out = snapshot.docs
    .map((docSnap) => mapTrade(docSnap.id, asRecord(docSnap.data())))
    .filter((specialist) => keepSpecialist(specialist, excludeOwnerId));
  return withRatings(out);
}

export async function fetchSpecialistsByIds(
  tradeIds: string[],
  excludeOwnerId?: string,
): Promise<Specialist[]> {
  const db = getDb();
  const snapshots = await Promise.all(
    [...new Set(tradeIds)].map((id) =>
      getDoc(doc(db, COLLECTION, id)).catch(() => null),
    ),
  );
  const list = snapshots
    .filter((snapshot) => snapshot?.exists())
    .map((snapshot) => mapTrade(snapshot?.id ?? "", asRecord(snapshot?.data())))
    .filter((specialist) => keepSpecialist(specialist, excludeOwnerId));
  return withRatings(list);
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

export function tradesByOwner(list: Specialist[]): Map<string, Specialist[]> {
  const map = new Map<string, Specialist[]>();
  for (const item of list) {
    const bucket = map.get(item.ownerId);
    if (bucket) bucket.push(item);
    else map.set(item.ownerId, [item]);
  }
  return map;
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
    specialist.specialtyLabel.toLowerCase().includes(q) ||
    specialist.details.services.some((service) =>
      service.toLowerCase().includes(q),
    ) ||
    (findGroup(specialist.details.groupId)?.label.toLowerCase().includes(q) ??
      false)
  );
}

export type TradeProfile = {
  tradeId: string;
  ownerId: string;
  name: string;
  specialtyLabel: string;
  rating: number;
  reviews: number;
  ratingScope: "trade" | "all";
  placeName: string;
  about: string;
  avatarUrl: string;
  priceType: string;
  price: string;
  gallery: string[];
  center: [number, number] | null;
  addressLocation: Record<string, unknown> | null;
  primarySpecialtyId: string;
  businessName: string;
  professionalRole: string;
  shortDescription: string;
  phone: string;
  useProfilePhone: boolean;
  commuteMode: string;
  commuteDuration: number;
  status: string;
  completedProjects: number;
  createdAt: Date | null;
  details: TradeDetails;
  owner: OwnerPublic | null;
};

function timestampToDate(value: unknown): Date | null {
  const seconds = num(asRecord(value).seconds);
  return seconds > 0 ? new Date(seconds * 1000) : null;
}

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
    ratingScope: "all",
    placeName: str(addressLocation.place_name) || str(location.address),
    about: str(story.about) || str(data.description),
    avatarUrl: str(data.avatarUrl),
    priceType: str(pricing.type),
    price: str(pricing.amount),
    gallery,
    center: tradeCenter(addressLocation),
    addressLocation:
      location.addressLocation && typeof location.addressLocation === "object"
        ? addressLocation
        : null,
    primarySpecialtyId: str(data.primarySpecialtyId),
    businessName: str(contact.businessName),
    professionalRole: str(contact.professionalRole),
    shortDescription: str(story.shortDescription),
    phone: str(contact.phone),
    useProfilePhone: contact.useProfilePhone !== false,
    commuteMode: str(location.commuteMode) || "driving",
    commuteDuration: num(location.commuteDuration),
    status: str(data.status, "on_review"),
    completedProjects: num(data.completedProjects),
    createdAt: timestampToDate(data.createdAt),
    details: readTradeDetails(data),
    owner: null,
  };
}

async function withOwnerData(profile: TradeProfile): Promise<TradeProfile> {
  if (!profile.ownerId) return profile;
  const data = await fetchOwnerData(profile.ownerId);
  const summary = tradeRating(data.reviews, profile.tradeId);
  return {
    ...profile,
    ...(summary.count > 0
      ? { rating: summary.average, reviews: summary.count }
      : {}),
    ratingScope: summary.scope,
    avatarUrl: profile.avatarUrl || data.owner?.avatar || "",
    owner: data.owner,
  };
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
  return withOwnerData(mapTradeProfile(docSnap.id, asRecord(docSnap.data())));
}

export async function fetchTradeById(
  tradeId: string,
): Promise<TradeProfile | null> {
  if (!tradeId) return null;
  const db = getDb();
  const snapshot = await getDoc(doc(db, COLLECTION, tradeId));
  if (!snapshot.exists()) return null;
  return withOwnerData(mapTradeProfile(snapshot.id, asRecord(snapshot.data())));
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
  return withRatings(list);
}

export type TradeLocation = {
  address: string;
  addressLocation: Record<string, unknown> | null;
  commuteMode: string;
  commuteDuration: number;
};

export type TradeIdentity = {
  title: string;
  primarySpecialtyLabel: string;
  about: string;
};

export type CreateTradeInput = TradeIdentity & {
  location: TradeLocation;
  details: TradeDetailsInput;
};

function identityFields(input: TradeIdentity) {
  const label = input.primarySpecialtyLabel.trim();
  const known = findTrade(label);
  return {
    title: input.title || "My Trade",
    subtitle: known?.label ?? label,
    description: input.about || "",
    primarySpecialtyId: known?.id ?? "",
    primarySpecialtyLabel: known?.label ?? label,
    primarySpecialtyPath: known ? "" : label,
    other: !known && label.length > 0,
  };
}

const SAVE_ACK_TIMEOUT_MS = 4000;

export async function createTrade(
  ownerId: string,
  input: CreateTradeInput,
): Promise<string> {
  const db = getDb();
  const now = serverTimestamp();
  const docRef = doc(collection(db, COLLECTION));
  const write = setDoc(
    docRef,
    stripUndefined({
      ownerId,
      ...identityFields(input),
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
      contact: {
        businessName: input.title || "",
        professionalRole: "",
        phone: "",
        useProfilePhone: true,
      },
      location: {
        address: input.location.address || "",
        addressLocation: input.location.addressLocation ?? null,
        commuteMode: input.location.commuteMode || "driving",
        commuteDuration: input.location.commuteDuration || 20,
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
      ...tradeDetailsPayload(input.details, now),
      source: "mobile",
      createdAt: now,
      updatedAt: now,
    }),
  );
  write.catch(() => undefined);
  await Promise.race([
    write,
    new Promise<void>((resolve) => setTimeout(resolve, SAVE_ACK_TIMEOUT_MS)),
  ]);
  return docRef.id;
}

export type UpdateTradeInput = TradeIdentity & {
  location: TradeLocation | null;
  details: TradeDetailsInput;
};

export async function updateTrade(
  trade: TradeProfile,
  input: UpdateTradeInput,
): Promise<void> {
  if (!trade.tradeId) return;
  const db = getDb();
  const now = serverTimestamp();
  const location = input.location
    ? {
        "location.address": input.location.address || "",
        "location.addressLocation": input.location.addressLocation ?? null,
      }
    : {};
  await updateDoc(
    doc(db, COLLECTION, trade.tradeId),
    stripUndefined({
      ...identityFields(input),
      "contact.businessName": input.title || "",
      "story.about": input.about || "",
      ...location,
      ...tradeDetailsPayload(input.details, now, trade.details),
      updatedAt: now,
    }),
  );
}

export async function deleteTrade(tradeId: string): Promise<void> {
  if (!tradeId) return;
  const db = getDb();
  await deleteDoc(doc(db, COLLECTION, tradeId));
}
