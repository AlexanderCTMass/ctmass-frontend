import {
  addDoc,
  collection,
  getDocs,
  limit,
  query,
  serverTimestamp,
  where,
} from "@react-native-firebase/firestore";

import { SPECIALTIES } from "@/constants/specialties";
import { getDb } from "@/lib/firebase";

const COLLECTION = "trades";
const MAX_IN = 10;
const RECENT_LIMIT = 12;

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
  return snapshot.docs
    .map((docSnap) => mapTrade(docSnap.id, asRecord(docSnap.data())))
    .filter((specialist) => keepSpecialist(specialist, excludeOwnerId));
}

export async function fetchRecentSpecialists(
  excludeOwnerId?: string,
): Promise<Specialist[]> {
  const db = getDb();
  const q = query(collection(db, COLLECTION), limit(RECENT_LIMIT));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((docSnap) => mapTrade(docSnap.id, asRecord(docSnap.data())))
    .filter((specialist) => keepSpecialist(specialist, excludeOwnerId));
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
  return mapTradeProfile(docSnap.id, asRecord(docSnap.data()));
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
