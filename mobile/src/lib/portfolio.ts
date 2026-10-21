import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "@react-native-firebase/firestore";

import { getDb } from "@/lib/firebase";
import { deleteImage, uploadImage } from "@/lib/storage-upload";

export const MAX_PORTFOLIO_TAGS = 4;

export type PortfolioImage = { url: string; type: string };

export type PortfolioItem = {
  id: string;
  ownerId: string;
  tradeId: string;
  title: string;
  date: Date | null;
  location: string;
  shortDescription: string;
  specialtyId: string;
  tags: string[];
  images: PortfolioImage[];
  beforeImage: string | null;
  afterImage: string | null;
  cover: string | null;
  isPublic: boolean;
  isFavorite: boolean;
  order: number;
};

export type PortfolioInput = {
  title: string;
  date: Date | null;
  location: string;
  shortDescription: string;
  specialtyId: string;
  tags: string[];
  beforeUri: string | null;
  afterUri: string;
};

type Raw = Record<string, unknown>;

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function isHttp(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("http");
}

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

function mapImages(value: unknown): PortfolioImage[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const record = item && typeof item === "object" ? (item as Raw) : {};
      return { url: str(record.url), type: str(record.type) || "image" };
    })
    .filter((image) => isHttp(image.url));
}

function mapItem(ownerId: string, id: string, data: Raw): PortfolioItem {
  const images = mapImages(data.images);
  const before = isHttp(data.beforeImage) ? data.beforeImage : null;
  const after = isHttp(data.afterImage)
    ? data.afterImage
    : (images[images.length - 1]?.url ?? (isHttp(data.thumbnail) ? data.thumbnail : null));
  const cover = after ?? (isHttp(data.thumbnail) ? data.thumbnail : null) ?? images[0]?.url ?? null;
  return {
    id,
    ownerId,
    tradeId: str(data.tradeId),
    title: str(data.title) || "Project",
    date: toDate(data.date),
    location: str(data.location),
    shortDescription: str(data.shortDescription),
    specialtyId: str(data.specialtyId),
    tags: Array.isArray(data.tags)
      ? data.tags.filter((tag): tag is string => typeof tag === "string")
      : [],
    images,
    beforeImage: before && after && before !== after ? before : null,
    afterImage: after,
    cover,
    isPublic: data.public !== false,
    isFavorite: data.isFavorite === true,
    order: typeof data.order === "number" ? data.order : 0,
  };
}

function sortItems(items: PortfolioItem[]): PortfolioItem[] {
  return [...items].sort(
    (a, b) =>
      Number(b.isFavorite) - Number(a.isFavorite) ||
      a.order - b.order ||
      (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0),
  );
}

function portfolioCollection(ownerId: string) {
  return collection(getDb(), "profiles", ownerId, "portfolio");
}

export async function fetchTradePortfolio(
  ownerId: string,
  tradeId: string,
  options: { publicOnly: boolean },
): Promise<PortfolioItem[]> {
  if (!ownerId || !tradeId) return [];
  const snapshot = await getDocs(
    query(portfolioCollection(ownerId), where("tradeId", "==", tradeId)),
  );
  const items = snapshot.docs
    .map((docSnap) => mapItem(ownerId, docSnap.id, docSnap.data() ?? {}))
    .filter((item) => item.cover)
    .filter((item) => !options.publicOnly || item.isPublic);
  return sortItems(items);
}

export async function fetchPortfolioItem(
  ownerId: string,
  id: string,
): Promise<PortfolioItem | null> {
  if (!ownerId || !id) return null;
  const snapshot = await getDoc(doc(portfolioCollection(ownerId), id));
  if (!snapshot.exists()) return null;
  return mapItem(ownerId, snapshot.id, snapshot.data() ?? {});
}

export function normalizeTag(tag: string): string {
  return tag.replace(/^#/, "").trim().toLowerCase();
}

async function resolveUpload(
  ownerId: string,
  uri: string | null,
  suffix: string,
): Promise<string | null> {
  if (!uri) return null;
  if (isHttp(uri)) return uri;
  return uploadImage(
    uri,
    `portfolio/${ownerId}/${Date.now()}_${suffix}.jpg`,
  );
}

function buildImages(
  before: string | null,
  after: string,
  extras: PortfolioImage[] = [],
): PortfolioImage[] {
  return [
    ...extras,
    ...(before ? [{ url: before, type: "image" }] : []),
    { url: after, type: "image" },
  ];
}

async function uploadPair(
  ownerId: string,
  input: PortfolioInput,
): Promise<{ before: string | null; after: string }> {
  const [beforeResult, afterResult] = await Promise.allSettled([
    resolveUpload(ownerId, input.beforeUri, "before"),
    resolveUpload(ownerId, input.afterUri, "after"),
  ]);
  const uploaded = (result: PromiseSettledResult<string | null>, uri: string | null) =>
    result.status === "fulfilled" && result.value && result.value !== uri
      ? result.value
      : null;
  if (
    beforeResult.status === "rejected" ||
    afterResult.status === "rejected" ||
    !afterResult.value
  ) {
    const orphans = [
      uploaded(beforeResult, input.beforeUri),
      uploaded(afterResult, input.afterUri),
    ].filter((url): url is string => Boolean(url));
    await Promise.all(orphans.map((url) => deleteImage(url).catch(() => undefined)));
    throw beforeResult.status === "rejected"
      ? beforeResult.reason
      : afterResult.status === "rejected"
        ? afterResult.reason
        : new Error("After photo upload failed");
  }
  return { before: beforeResult.value, after: afterResult.value };
}

function baseFields(input: PortfolioInput) {
  return {
    title: input.title.trim(),
    date: input.date,
    location: input.location.trim(),
    shortDescription: input.shortDescription.trim(),
    specialtyId: input.specialtyId,
    tags: input.tags.map(normalizeTag).filter(Boolean).slice(0, MAX_PORTFOLIO_TAGS),
  };
}

export async function createPortfolioItem(
  ownerId: string,
  tradeId: string,
  input: PortfolioInput,
): Promise<string> {
  const ref = doc(portfolioCollection(ownerId));
  const { before, after } = await uploadPair(ownerId, input);
  await setDoc(ref, {
    id: ref.id,
    ...baseFields(input),
    tradeId,
    beforeImage: before,
    afterImage: after,
    thumbnail: after,
    images: buildImages(before, after),
    public: true,
    isFavorite: false,
    source: "mobile",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function updatePortfolioItem(
  item: PortfolioItem,
  input: PortfolioInput,
): Promise<void> {
  const { before, after } = await uploadPair(item.ownerId, input);
  const previous = [item.beforeImage, item.afterImage].filter(
    (url): url is string => Boolean(url),
  );
  const extras = item.images.filter((image) => !previous.includes(image.url));
  const images = buildImages(before, after, extras);
  await setDoc(
    doc(portfolioCollection(item.ownerId), item.id),
    {
      ...baseFields(input),
      beforeImage: before,
      afterImage: after,
      thumbnail: after,
      images,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
  const kept = new Set(images.map((image) => image.url));
  const removed = previous.filter((url) => !kept.has(url));
  await Promise.all(removed.map((url) => deleteImage(url).catch(() => undefined)));
}

export async function setPortfolioVisibility(
  item: PortfolioItem,
  isPublic: boolean,
): Promise<void> {
  await setDoc(
    doc(portfolioCollection(item.ownerId), item.id),
    { public: isPublic, updatedAt: new Date().toISOString() },
    { merge: true },
  );
}

export async function setPortfolioFavorite(
  item: PortfolioItem,
  isFavorite: boolean,
): Promise<void> {
  await setDoc(
    doc(portfolioCollection(item.ownerId), item.id),
    { isFavorite, updatedAt: new Date().toISOString() },
    { merge: true },
  );
}

export async function deletePortfolioItem(item: PortfolioItem): Promise<void> {
  const db = getDb();
  const reviews = await getDocs(
    query(
      collection(db, "profiles", item.ownerId, "reviews"),
      where("projectId", "==", item.id),
    ),
  ).catch(() => null);
  if (reviews) {
    await Promise.all(
      reviews.docs.map((docSnap) => deleteDoc(docSnap.ref).catch(() => undefined)),
    );
  }
  await deleteDoc(doc(portfolioCollection(item.ownerId), item.id));
  await Promise.all(
    item.images.map((image) => deleteImage(image.url).catch(() => undefined)),
  );
}
