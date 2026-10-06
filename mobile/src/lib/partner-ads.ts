import {
  get,
  getDatabase,
  increment,
  ref,
  update,
} from "@react-native-firebase/database";
import * as WebBrowser from "expo-web-browser";
import { AppState, Linking } from "react-native";

import {
  ALL_AD_PLACEMENTS,
  type AdPlacement,
  type AdPlacementSettings,
  DEFAULT_AD_PLACEMENT_SETTINGS,
  isAdPlacement,
} from "@/lib/ad-placements";
import { analyticsEvents } from "@/lib/analytics-events";
import { getFirebaseApp } from "@/lib/firebase";

export type AdLayout = "split" | "cover" | "image";

export type PartnerAd = {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  targetUrl: string;
  layout: AdLayout;
  imageUrl: string;
  imageDarkUrl: string | null;
  placements: AdPlacement[];
  startAt: number;
  endAt: number;
  priority: number;
  partnerName: string;
  updatedAt: number;
};

export type PartnerAdsConfig = {
  banners: PartnerAd[];
  settings: Record<AdPlacement, AdPlacementSettings>;
};

const PUBLIC_PATH = "partnerAds/public";
const STATS_PATH = "partnerAdStats";
const IMPRESSION_DEDUP_MS = 5 * 60 * 1000;
const FLUSH_DELAY_MS = 4000;

type Raw = Record<string, unknown>;

function asStr(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asNum(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asLayout(value: unknown): AdLayout {
  return value === "cover" || value === "image" ? value : "split";
}

function normalizePlacements(value: unknown): AdPlacement[] {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is AdPlacement =>
        typeof item === "string" && isAdPlacement(item),
    );
  }
  if (value && typeof value === "object") {
    return Object.entries(value as Raw)
      .filter(([key, enabled]) => enabled === true && isAdPlacement(key))
      .map(([key]) => key as AdPlacement);
  }
  return [];
}

function normalizeBanner(id: string, raw: Raw): PartnerAd | null {
  const imageUrl = asStr(raw.imageUrl);
  const placements = normalizePlacements(raw.placements);
  if (!imageUrl || placements.length === 0) return null;
  return {
    id: asStr(raw.id) || id,
    title: asStr(raw.title),
    subtitle: asStr(raw.subtitle),
    ctaLabel: asStr(raw.ctaLabel),
    targetUrl: asStr(raw.targetUrl),
    layout: asLayout(raw.layout),
    imageUrl,
    imageDarkUrl: asStr(raw.imageDarkUrl) || null,
    placements,
    startAt: asNum(raw.startAt),
    endAt: asNum(raw.endAt, Number.MAX_SAFE_INTEGER),
    priority: asNum(raw.priority),
    partnerName: asStr(raw.partnerName),
    updatedAt: asNum(raw.updatedAt),
  };
}

function normalizeSettings(value: unknown): PartnerAdsConfig["settings"] {
  const raw = value && typeof value === "object" ? (value as Raw) : {};
  const result = { ...DEFAULT_AD_PLACEMENT_SETTINGS };
  for (const placement of ALL_AD_PLACEMENTS) {
    const item = raw[placement];
    if (!item || typeof item !== "object") continue;
    const entry = item as Raw;
    const base = DEFAULT_AD_PLACEMENT_SETTINGS[placement];
    result[placement] = {
      enabled:
        typeof entry.enabled === "boolean" ? entry.enabled : base.enabled,
      maxItems: Math.max(1, Math.round(asNum(entry.maxItems, base.maxItems))),
      autoplayMs: Math.max(
        0,
        Math.round(asNum(entry.autoplayMs, base.autoplayMs)),
      ),
      every: Math.max(1, Math.round(asNum(entry.every, base.every || 1))),
    };
  }
  return result;
}

function database() {
  return getDatabase(getFirebaseApp());
}

export async function fetchPartnerAdsConfig(): Promise<PartnerAdsConfig> {
  const snapshot = await get(ref(database(), PUBLIC_PATH));
  const value = (snapshot.val() ?? {}) as Raw;
  const bannersRaw =
    value.banners && typeof value.banners === "object"
      ? (value.banners as Raw)
      : {};
  const banners = Object.entries(bannersRaw)
    .map(([id, item]) =>
      item && typeof item === "object"
        ? normalizeBanner(id, item as Raw)
        : null,
    )
    .filter((item): item is PartnerAd => item !== null);
  return { banners, settings: normalizeSettings(value.settings) };
}

export function isAdLive(ad: PartnerAd, now = Date.now()): boolean {
  return now >= ad.startAt && now < ad.endAt;
}

export function adsForPlacement(
  config: PartnerAdsConfig | undefined,
  placement: AdPlacement,
  now = Date.now(),
): PartnerAd[] {
  if (!config) return [];
  const settings = config.settings[placement];
  if (!settings?.enabled) return [];
  return config.banners
    .filter((ad) => ad.placements.includes(placement) && isAdLive(ad, now))
    .sort((a, b) => b.priority - a.priority || a.startAt - b.startAt)
    .slice(0, settings.maxItems);
}

export function adAssetUrls(config: PartnerAdsConfig): string[] {
  return config.banners.flatMap((ad) =>
    [ad.imageUrl, ad.imageDarkUrl].filter((url): url is string => Boolean(url)),
  );
}

const pending = new Map<string, number>();
const lastImpression = new Map<string, number>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let appStateBound = false;

function dayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function bump(path: string) {
  pending.set(path, (pending.get(path) ?? 0) + 1);
}

function flushStats() {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (pending.size === 0) return;
  const byBanner = new Map<string, Record<string, object>>();
  for (const [path, count] of pending) {
    const bannerId = path.split("/")[1];
    const updates = byBanner.get(bannerId) ?? {};
    updates[path] = increment(count);
    byBanner.set(bannerId, updates);
  }
  pending.clear();
  const root = ref(database());
  for (const updates of byBanner.values()) {
    void update(root, updates).catch(() => undefined);
  }
}

function scheduleFlush() {
  if (!appStateBound) {
    appStateBound = true;
    AppState.addEventListener("change", (state) => {
      if (state !== "active") flushStats();
    });
  }
  if (!flushTimer) flushTimer = setTimeout(flushStats, FLUSH_DELAY_MS);
}

function record(
  ad: PartnerAd,
  placement: AdPlacement,
  metric: "impressions" | "clicks",
) {
  const base = `${STATS_PATH}/${ad.id}`;
  bump(`${base}/${metric}`);
  bump(`${base}/placements/${placement}/${metric}`);
  bump(`${base}/daily/${dayKey()}/${metric}`);
  scheduleFlush();
}

export function trackAdImpression(
  ad: PartnerAd,
  placement: AdPlacement,
  position: number,
) {
  const key = `${ad.id}:${placement}`;
  const now = Date.now();
  const last = lastImpression.get(key);
  if (last && now - last < IMPRESSION_DEDUP_MS) return;
  lastImpression.set(key, now);
  record(ad, placement, "impressions");
  analyticsEvents.adBannerImpression({
    banner_id: ad.id,
    placement,
    position,
    partner: ad.partnerName,
  });
}

export async function openAd(
  ad: PartnerAd,
  placement: AdPlacement,
  position: number,
) {
  record(ad, placement, "clicks");
  flushStats();
  analyticsEvents.adBannerClicked({
    banner_id: ad.id,
    placement,
    position,
    partner: ad.partnerName,
    has_url: Boolean(ad.targetUrl),
  });
  const url = ad.targetUrl;
  if (!url) return;
  if (/^https?:\/\//i.test(url)) {
    const opened = await WebBrowser.openBrowserAsync(url).then(
      () => true,
      () => false,
    );
    if (opened) return;
  }
  await Linking.openURL(url).catch(() => undefined);
}
