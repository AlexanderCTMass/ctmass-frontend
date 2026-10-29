import {
  type AvailabilityDay,
  AVAILABILITY_DAYS,
  type EmergencyService,
  type PricingModel,
  PRICING_MODELS,
  type ProjectType,
  PROJECT_TYPES,
  type RateBasis,
  RATE_BASES,
  type ResponseTime,
  RESPONSE_TIMES,
  DEFAULT_SERVICE_RADIUS,
  defaultBasisFor,
} from "@/constants/trade-options";
import { type TradeGroupId, groupOfTrade } from "@/constants/trade-taxonomy";

export type TradeRates = {
  model: PricingModel;
  min: number | null;
  max: number | null;
  basis: RateBasis;
  minimumCharge: number | null;
  serviceCallFee: number | null;
  serviceCallCredited: boolean;
  travelFee: string;
  afterHours: string;
  materials: string;
  note: string;
  updatedAt: Date | null;
  legacy: boolean;
};

export type TradeAvailability = {
  days: AvailabilityDay[];
  hours: string;
  acceptingWork: boolean;
  emergency: EmergencyService;
  emergencyNote: string;
};

export type TradeCredential = {
  state: string;
  type: string;
  number: string;
  expiresAt: Date | null;
  documentUrl: string;
};

export type TradeWorkPolicy = {
  projectTypes: ProjectType[];
  estimate: string;
  estimateNote: string;
  warranty: string;
  warrantyTerms: string;
  permits: string;
  workBy: string;
};

export type TradeDetails = {
  groupId: TradeGroupId;
  services: string[];
  experienceYears: number | null;
  rates: TradeRates | null;
  availability: TradeAvailability | null;
  responseTime: ResponseTime | "";
  radiusMiles: number | null;
  areas: string[];
  workPolicy: TradeWorkPolicy;
  license: TradeCredential | null;
  insurance: TradeCredential | null;
};

type Raw = Record<string, unknown>;

const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;

function record(value: unknown): Raw {
  return value && typeof value === "object" ? (value as Raw) : {};
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function numOrNull(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/[^0-9.]/g, ""));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }
  return null;
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.length > 0)
    : [];
}

function oneOf<T extends string>(
  options: { value: T }[],
  value: unknown,
): T | null {
  return options.some((item) => item.value === value) ? (value as T) : null;
}

export function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  const raw = record(value);
  if (typeof raw.toDate === "function") return (raw.toDate as () => Date)();
  if (typeof raw.seconds === "number") return new Date(raw.seconds * 1000);
  return null;
}

function readLegacyRates(pricing: Raw): TradeRates | null {
  const type = str(pricing.type);
  const amount = numOrNull(pricing.amount);
  if (!type && amount === null) return null;
  const model: PricingModel =
    type === "project" ? "fixed" : type === "consultation" ? "fixed" : "hourly";
  return {
    model,
    min: amount,
    max: null,
    basis: type === "consultation" ? "visit" : defaultBasisFor(model),
    minimumCharge: null,
    serviceCallFee: null,
    serviceCallCredited: false,
    travelFee: "",
    afterHours: "",
    materials: "",
    note: "",
    updatedAt: null,
    legacy: true,
  };
}

function readRates(data: Raw): TradeRates | null {
  const raw = data.rates;
  if (!raw || typeof raw !== "object") return readLegacyRates(record(data.pricing));
  const rates = record(raw);
  const model = oneOf(PRICING_MODELS, rates.model);
  if (!model) return readLegacyRates(record(data.pricing));
  return {
    model,
    min: numOrNull(rates.min),
    max: numOrNull(rates.max),
    basis: oneOf(RATE_BASES, rates.basis) ?? defaultBasisFor(model),
    minimumCharge: numOrNull(rates.minimumCharge),
    serviceCallFee: numOrNull(rates.serviceCallFee),
    serviceCallCredited: rates.serviceCallCredited === true,
    travelFee: str(rates.travelFee),
    afterHours: str(rates.afterHours),
    materials: str(rates.materials),
    note: str(rates.note),
    updatedAt: toDate(rates.updatedAt),
    legacy: false,
  };
}

function readAvailability(value: unknown): TradeAvailability | null {
  if (!value || typeof value !== "object") return null;
  const raw = record(value);
  const days = strings(raw.days).filter((day): day is AvailabilityDay =>
    AVAILABILITY_DAYS.some((item) => item.value === day),
  );
  const emergency = str(raw.emergency);
  return {
    days,
    hours: str(raw.hours),
    acceptingWork: raw.acceptingWork !== false,
    emergency:
      emergency === "after_hours" || emergency === "24_7" ? emergency : "none",
    emergencyNote: str(raw.emergencyNote),
  };
}

function readCredential(value: unknown): TradeCredential | null {
  if (!value || typeof value !== "object") return null;
  const raw = record(value);
  return {
    state: str(raw.state),
    type: str(raw.type),
    number: str(raw.number),
    expiresAt: toDate(raw.expiresAt),
    documentUrl: str(raw.documentUrl),
  };
}

export function isCredentialCurrent(credential: TradeCredential | null): boolean {
  if (!credential) return false;
  return !credential.expiresAt || credential.expiresAt.getTime() >= Date.now();
}

function readExperience(value: unknown): number | null {
  const raw = record(value);
  const years = numOrNull(raw.years) ?? (raw.years === 0 ? 0 : null);
  if (years === null) return null;
  const recordedAt = toDate(raw.recordedAt);
  const elapsed = recordedAt
    ? Math.max(0, Math.floor((Date.now() - recordedAt.getTime()) / YEAR_MS))
    : 0;
  return Math.round(years) + elapsed;
}

export function readTradeDetails(data: Raw): TradeDetails {
  const label = str(data.primarySpecialtyLabel) || str(data.subtitle);
  const groupId = (str(data.tradeGroupId) || groupOfTrade(label)) as TradeGroupId;
  const area = record(data.serviceArea);
  const policy = record(data.workPolicy);
  const credentials = record(data.credentials);
  const response = oneOf(RESPONSE_TIMES, record(data.response).time);
  return {
    groupId,
    services: strings(data.services),
    experienceYears: readExperience(data.experience),
    rates: readRates(data),
    availability: readAvailability(data.availability),
    responseTime: response ?? "",
    radiusMiles: numOrNull(area.radiusMiles),
    areas: strings(area.areas),
    workPolicy: {
      projectTypes: strings(policy.projectTypes).filter(
        (item): item is ProjectType =>
          PROJECT_TYPES.some((entry) => entry.value === item),
      ),
      estimate: str(policy.estimate),
      estimateNote: str(policy.estimateNote),
      warranty: str(policy.warranty),
      warrantyTerms: str(policy.warrantyTerms),
      permits: str(policy.permits),
      workBy: str(policy.workBy),
    },
    license: readCredential(credentials.license),
    insurance: readCredential(credentials.insurance),
  };
}

export type TradeDetailsInput = {
  groupId: TradeGroupId;
  services: string[];
  experienceYears: number | null;
  rates: Omit<TradeRates, "updatedAt" | "legacy">;
  availability: TradeAvailability;
  responseTime: ResponseTime | "";
  radiusMiles: number;
  areas: string[];
  workPolicy: TradeWorkPolicy;
};

function legacyPricing(rates: TradeDetailsInput["rates"]) {
  const type =
    rates.model === "fixed"
      ? rates.basis === "visit"
        ? "consultation"
        : "project"
      : rates.model === "hourly" || rates.model === "service_call_hourly"
        ? "hourly"
        : "";
  return {
    type,
    amount: type && rates.min !== null ? String(rates.min) : "",
  };
}

export function tradeDetailsPayload(
  input: TradeDetailsInput,
  now: unknown,
  previous?: TradeDetails | null,
): Raw {
  const rates = input.rates;
  const ratesChanged =
    !previous?.rates ||
    previous.rates.legacy ||
    previous.rates.model !== rates.model ||
    previous.rates.min !== rates.min ||
    previous.rates.max !== rates.max ||
    previous.rates.basis !== rates.basis ||
    previous.rates.minimumCharge !== rates.minimumCharge ||
    previous.rates.serviceCallFee !== rates.serviceCallFee;
  return {
    tradeGroupId: input.groupId,
    services: input.services,
    experience:
      previous && previous.experienceYears === input.experienceYears
        ? undefined
        : input.experienceYears === null
          ? null
          : { years: input.experienceYears, recordedAt: now },
    rates: {
      ...rates,
      updatedAt: ratesChanged ? now : (previous?.rates?.updatedAt ?? now),
    },
    pricing: legacyPricing(rates),
    availability: input.availability,
    response: { time: input.responseTime, source: "contractor" },
    serviceArea: { radiusMiles: input.radiusMiles, areas: input.areas },
    workPolicy: input.workPolicy,
    detailsUpdatedAt: now,
  };
}

export function stripUndefined<T extends Raw>(value: T): T {
  const out: Raw = {};
  for (const [key, entry] of Object.entries(value)) {
    if (entry === undefined) continue;
    out[key] =
      entry && typeof entry === "object" && !Array.isArray(entry) && !(entry instanceof Date) && Object.getPrototypeOf(entry) === Object.prototype
        ? stripUndefined(entry as Raw)
        : entry;
  }
  return out as T;
}

export type CompletenessItem = { key: string; label: string; done: boolean };

export function tradeCompleteness(
  details: TradeDetails,
  extras: { about: string; portfolioCount?: number; hasCertificates?: boolean },
): CompletenessItem[] {
  const items: CompletenessItem[] = [
    { key: "experience", label: "Years in this trade", done: details.experienceYears !== null },
    { key: "services", label: "Services you offer", done: details.services.length > 0 },
    { key: "pricing", label: "Pricing", done: Boolean(details.rates && !details.rates.legacy) },
    { key: "availability", label: "Working days", done: Boolean(details.availability?.days.length) },
    { key: "response", label: "Response time", done: Boolean(details.responseTime) },
    { key: "area", label: "Service radius", done: details.radiusMiles !== null },
    { key: "credentials", label: "License or insurance", done: Boolean(details.license || details.insurance || extras.hasCertificates) },
    { key: "about", label: "About your work", done: extras.about.trim().length > 0 },
  ];
  if (extras.portfolioCount !== undefined) {
    items.push({ key: "portfolio", label: "Portfolio photos", done: extras.portfolioCount > 0 });
  }
  return items;
}

export function emptyDetailsInput(groupId: TradeGroupId): TradeDetailsInput {
  return {
    groupId,
    services: [],
    experienceYears: null,
    rates: {
      model: "not_provided",
      min: null,
      max: null,
      basis: "technician_hour",
      minimumCharge: null,
      serviceCallFee: null,
      serviceCallCredited: false,
      travelFee: "",
      afterHours: "",
      materials: "",
      note: "",
    },
    availability: {
      days: [],
      hours: "",
      acceptingWork: true,
      emergency: "none",
      emergencyNote: "",
    },
    responseTime: "",
    radiusMiles: DEFAULT_SERVICE_RADIUS,
    areas: [],
    workPolicy: {
      projectTypes: [],
      estimate: "",
      estimateNote: "",
      warranty: "",
      warrantyTerms: "",
      permits: "",
      workBy: "",
    },
  };
}

export function detailsToInput(details: TradeDetails): TradeDetailsInput {
  const empty = emptyDetailsInput(details.groupId);
  const rates = details.rates;
  return {
    ...empty,
    services: details.services,
    experienceYears: details.experienceYears,
    rates: rates
      ? {
          model: rates.model,
          min: rates.min,
          max: rates.max,
          basis: rates.basis,
          minimumCharge: rates.minimumCharge,
          serviceCallFee: rates.serviceCallFee,
          serviceCallCredited: rates.serviceCallCredited,
          travelFee: rates.travelFee,
          afterHours: rates.afterHours,
          materials: rates.materials,
          note: rates.note,
        }
      : empty.rates,
    availability: details.availability ?? empty.availability,
    responseTime: details.responseTime,
    radiusMiles: details.radiusMiles ?? empty.radiusMiles,
    areas: details.areas,
    workPolicy: details.workPolicy,
  };
}
