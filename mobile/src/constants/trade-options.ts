import { type Translate, translateData } from "@/lib/i18n";

export type Option<T extends string = string> = { value: T; label: string };

function labelOf<T extends string>(
  options: Option<T>[],
  value: string,
  t: Translate,
): string {
  return translateData(
    t,
    options.find((item) => item.value === value)?.label ?? "",
  );
}

export type ExperienceTierId =
  | "starter"
  | "skilled"
  | "pro"
  | "expert"
  | "veteran";

export type ExperienceTier = {
  id: ExperienceTierId;
  label: string;
  min: number;
  max: number | null;
  color: string;
};

export const EXPERIENCE_TIERS: ExperienceTier[] = [
  { id: "starter", label: "Starter", min: 0, max: 2, color: "#8FD694" },
  { id: "skilled", label: "Skilled", min: 3, max: 5, color: "#2BB3C0" },
  { id: "pro", label: "Pro", min: 6, max: 10, color: "#16B364" },
  { id: "expert", label: "Expert", min: 11, max: 19, color: "#F5A524" },
  { id: "veteran", label: "Veteran", min: 20, max: null, color: "#8B5CF6" },
];

export const MAX_EXPERIENCE_YEARS = 60;

export function tierFor(years: number): ExperienceTier {
  return (
    EXPERIENCE_TIERS.find(
      (tier) => years >= tier.min && (tier.max === null || years <= tier.max),
    ) ?? EXPERIENCE_TIERS[0]
  );
}

export function yearsLabel(years: number, t: Translate): string {
  return t("trade.yearsShort", { count: years });
}

export function tierBadgeLabel(years: number, t: Translate): string {
  return `${translateData(t, tierFor(years).label).toUpperCase()} · ${yearsLabel(years, t).toUpperCase()}`;
}

export type PricingModel =
  | "hourly"
  | "fixed"
  | "per_unit"
  | "service_call_hourly"
  | "quote"
  | "not_provided";

export const PRICING_MODELS: Option<PricingModel>[] = [
  { value: "hourly", label: "Hourly labor" },
  { value: "service_call_hourly", label: "Service call + hourly" },
  { value: "fixed", label: "Fixed-price quotes" },
  { value: "per_unit", label: "Per unit" },
  { value: "quote", label: "Quote only" },
  { value: "not_provided", label: "Not provided" },
];

export const pricingModelLabel = (value: string, t: Translate) =>
  labelOf(PRICING_MODELS, value, t);

export function modelTakesRate(model: string): boolean {
  return (
    model === "hourly" ||
    model === "service_call_hourly" ||
    model === "per_unit" ||
    model === "fixed"
  );
}

export type RateBasis =
  | "technician_hour"
  | "crew_hour"
  | "visit"
  | "unit"
  | "project";

export const RATE_BASES: Option<RateBasis>[] = [
  { value: "technician_hour", label: "per technician-hour" },
  { value: "crew_hour", label: "per crew-hour" },
  { value: "visit", label: "per visit" },
  { value: "unit", label: "per unit" },
  { value: "project", label: "per project" },
];

export const RATE_BASIS_SHORT: Record<RateBasis, string> = {
  technician_hour: "tech-hour",
  crew_hour: "crew-hour",
  visit: "visit",
  unit: "unit",
  project: "project",
};

export function defaultBasisFor(model: string): RateBasis {
  if (model === "fixed") return "project";
  if (model === "per_unit") return "unit";
  return "technician_hour";
}

export type ResponseTime = "15m" | "1h" | "4h" | "24h" | "next_day";

export const RESPONSE_TIMES: Option<ResponseTime>[] = [
  { value: "15m", label: "Within 15 min" },
  { value: "1h", label: "Within 1 hour" },
  { value: "4h", label: "Within 4 hours" },
  { value: "24h", label: "Within 24 hours" },
  { value: "next_day", label: "Next business day" },
];

const RESPONSE_SHORT: Record<ResponseTime, string> = {
  "15m": "Replies within 15 min",
  "1h": "Replies within 1 hr",
  "4h": "Replies within 4 hrs",
  "24h": "Replies within 24 hrs",
  next_day: "Replies next business day",
};

export function responseShortLabel(value: string, t: Translate): string {
  return translateData(t, RESPONSE_SHORT[value as ResponseTime] ?? "");
}

export type AvailabilityDay =
  | "mon_fri"
  | "mon_sat"
  | "weekends"
  | "by_appointment";

export const AVAILABILITY_DAYS: Option<AvailabilityDay>[] = [
  { value: "mon_fri", label: "Mon–Fri" },
  { value: "mon_sat", label: "Mon–Sat" },
  { value: "weekends", label: "Weekends" },
  { value: "by_appointment", label: "By appointment" },
];

export const WORKING_HOURS: Option[] = [
  { value: "7-16", label: "7am–4pm" },
  { value: "8-17", label: "8am–5pm" },
  { value: "9-18", label: "9am–6pm" },
  { value: "8-20", label: "8am–8pm" },
  { value: "flexible", label: "Flexible hours" },
];

export const availabilityDayLabel = (value: string, t: Translate) =>
  labelOf(AVAILABILITY_DAYS, value, t);
export const workingHoursLabel = (value: string, t: Translate) =>
  labelOf(WORKING_HOURS, value, t);

export type EmergencyService = "none" | "after_hours" | "24_7";

export const EMERGENCY_OPTIONS: Option<EmergencyService>[] = [
  { value: "none", label: "No emergency service" },
  { value: "after_hours", label: "After-hours calls" },
  { value: "24_7", label: "24/7 emergency" },
];

export const emergencyLabel = (value: string, t: Translate) =>
  labelOf(EMERGENCY_OPTIONS, value, t);

export const SERVICE_RADII = [10, 25, 50, 100] as const;

export const DEFAULT_SERVICE_RADIUS = 25;

export type ProjectType =
  | "residential"
  | "commercial"
  | "multi_family"
  | "industrial";

export const PROJECT_TYPES: Option<ProjectType>[] = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "multi_family", label: "Multi-family" },
  { value: "industrial", label: "Industrial" },
];

export const projectTypeLabel = (value: string, t: Translate) =>
  labelOf(PROJECT_TYPES, value, t);

export type EstimatePolicy = "free" | "paid" | "diagnostic" | "";

export const ESTIMATE_POLICIES: Option<Exclude<EstimatePolicy, "">>[] = [
  { value: "free", label: "Free estimate" },
  { value: "paid", label: "Paid estimate" },
  { value: "diagnostic", label: "Paid diagnostic visit" },
];

export const estimateLabel = (value: string, t: Translate) =>
  labelOf(ESTIMATE_POLICIES, value, t);

export const WARRANTY_OPTIONS: Option[] = [
  { value: "none", label: "No written warranty" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "1y", label: "1 year" },
  { value: "2y", label: "2+ years" },
];

export const warrantyLabel = (value: string, t: Translate) =>
  labelOf(WARRANTY_OPTIONS, value, t);

export type PermitsPolicy = "yes" | "no" | "depends" | "";

export const PERMIT_OPTIONS: Option<Exclude<PermitsPolicy, "">>[] = [
  { value: "yes", label: "Handles permits" },
  { value: "depends", label: "Depends on the job" },
  { value: "no", label: "Homeowner pulls permits" },
];

export const permitsLabel = (value: string, t: Translate) =>
  labelOf(PERMIT_OPTIONS, value, t);

export type WorkBy = "owner" | "employees" | "subcontractors" | "mixed";

export const WORK_BY_OPTIONS: Option<WorkBy>[] = [
  { value: "owner", label: "The owner" },
  { value: "employees", label: "Employees" },
  { value: "subcontractors", label: "Subcontractors" },
  { value: "mixed", label: "Mixed crew" },
];

export const workByLabel = (value: string, t: Translate) =>
  labelOf(WORK_BY_OPTIONS, value, t);

export type BusinessStructure =
  | "sole_proprietor"
  | "llc"
  | "corporation"
  | "partnership"
  | "other"
  | "undisclosed";

export const BUSINESS_STRUCTURES: Option<BusinessStructure>[] = [
  { value: "sole_proprietor", label: "Sole Proprietor" },
  { value: "llc", label: "LLC" },
  { value: "corporation", label: "Corporation" },
  { value: "partnership", label: "Partnership" },
  { value: "other", label: "Other" },
  { value: "undisclosed", label: "Prefer not to say" },
];

export const businessStructureLabel = (value: string, t: Translate) =>
  value === "undisclosed" ? "" : labelOf(BUSINESS_STRUCTURES, value, t);

export type CrewSize = "solo" | "2_5" | "6_15" | "16_plus";

export const CREW_SIZES: Option<CrewSize>[] = [
  { value: "solo", label: "Solo" },
  { value: "2_5", label: "2–5 people" },
  { value: "6_15", label: "6–15 people" },
  { value: "16_plus", label: "16+ people" },
];

export const crewSizeLabel = (value: string, t: Translate) =>
  labelOf(CREW_SIZES, value, t);

export type BusinessRole =
  | "owner"
  | "partner"
  | "manager"
  | "technician"
  | "subcontractor"
  | "apprentice";

export const BUSINESS_ROLES: Option<BusinessRole>[] = [
  { value: "owner", label: "Owner / Founder" },
  { value: "partner", label: "Partner" },
  { value: "manager", label: "Manager / Foreman" },
  { value: "technician", label: "Technician / Employee" },
  { value: "subcontractor", label: "Subcontractor" },
  { value: "apprentice", label: "Apprentice" },
];

export const businessRoleLabel = (value: string, t: Translate) =>
  labelOf(BUSINESS_ROLES, value, t);

export const LANGUAGES: string[] = [
  "English",
  "Spanish",
  "Portuguese",
  "Haitian Creole",
  "French",
  "Polish",
  "Russian",
  "Ukrainian",
  "Chinese",
  "Vietnamese",
  "Arabic",
];

export const PAYMENT_METHODS: Option[] = [
  { value: "cash", label: "Cash" },
  { value: "check", label: "Check" },
  { value: "card", label: "Credit / debit card" },
  { value: "bank", label: "Bank transfer" },
  { value: "digital", label: "Zelle / Venmo" },
  { value: "financing", label: "Financing" },
];

export const paymentMethodLabel = (value: string, t: Translate) =>
  labelOf(PAYMENT_METHODS, value, t);

export type PreferredContact = "message" | "phone" | "email";

export const PREFERRED_CONTACTS: Option<PreferredContact>[] = [
  { value: "message", label: "CTMASS message" },
  { value: "phone", label: "Phone call" },
  { value: "email", label: "Email" },
];

export const US_STATE_CODES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "DC",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
] as const;

export const PROJECT_COST_RANGES: Option[] = [
  { value: "under_1k", label: "Under $1,000" },
  { value: "1k_5k", label: "$1,000–$5,000" },
  { value: "5k_15k", label: "$5,000–$15,000" },
  { value: "15k_50k", label: "$15,000–$50,000" },
  { value: "50k_plus", label: "$50,000+" },
];

export const projectCostLabel = (value: string, t: Translate) =>
  labelOf(PROJECT_COST_RANGES, value, t);

export const PROJECT_DURATIONS: Option[] = [
  { value: "1d", label: "1 day" },
  { value: "2_3d", label: "2–3 days" },
  { value: "1w", label: "About a week" },
  { value: "2_4w", label: "2–4 weeks" },
  { value: "1_3m", label: "1–3 months" },
  { value: "3m_plus", label: "3+ months" },
];

export const projectDurationLabel = (value: string, t: Translate) =>
  labelOf(PROJECT_DURATIONS, value, t);

export const PRICE_DISCLAIMER =
  "Prices are provided by the contractor. The final price may change after a site visit, scope, access, parts, permits or hidden conditions.";

export const RESPONSE_SOURCE_NOTE = "Set by contractor";
