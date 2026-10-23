import { shortPlace } from "@/components/project/project-card";
import {
  RATE_BASIS_SHORT,
  RESPONSE_TIMES,
  crewSizeLabel,
  emergencyLabel,
  modelTakesRate,
  pricingModelLabel,
  responseShortLabel,
  warrantyLabel,
} from "@/constants/trade-options";
import { publicPhone } from "@/hooks/use-trade-contact";
import { yearsInBusiness } from "@/lib/business-profile";
import { formatMiles } from "@/lib/geo";
import { isCredentialCurrent } from "@/lib/trade-details";
import {
  availabilityLine,
  priceSubline,
  rateAmount,
  shortDate,
} from "@/lib/trade-display";
import type { Specialist } from "@/lib/trades";

export const NOT_PROVIDED = "Not provided";

const MUTED_VALUES = new Set([
  NOT_PROVIDED,
  "Not specified",
  "Not yet established",
  "None yet",
  "New on CTMASS",
  "Expired",
]);

export function isMutedValue(value: string): boolean {
  return MUTED_VALUES.has(value);
}

export type MetricKey =
  | "rate"
  | "experience"
  | "response"
  | "license"
  | "insurance"
  | "rating"
  | "jobs";

type Metric = {
  better: "low" | "high";
  winLabel: string | null;
  score: (trade: Specialist, all: Specialist[]) => number | null;
};

function rateScore(trade: Specialist): number | null {
  const rates = trade.details.rates;
  if (!rates || !modelTakesRate(rates.model)) return null;
  return rates.min ?? rates.max;
}

function sharedBasis(all: Specialist[]): boolean {
  const bases = new Set(
    all
      .filter((trade) => rateScore(trade) !== null)
      .map((trade) => trade.details.rates?.basis),
  );
  return bases.size <= 1;
}

function credentialScore(credential: Specialist["details"]["license"]): number {
  return credential && isCredentialCurrent(credential) ? 1 : 0;
}

const METRICS: Record<MetricKey, Metric> = {
  rate: {
    better: "low",
    winLabel: "Lowest",
    score: (trade, all) => (sharedBasis(all) ? rateScore(trade) : null),
  },
  experience: {
    better: "high",
    winLabel: "Most",
    score: (trade) => trade.details.experienceYears,
  },
  response: {
    better: "low",
    winLabel: "Fastest",
    score: (trade) => {
      const index = RESPONSE_TIMES.findIndex(
        (item) => item.value === trade.details.responseTime,
      );
      return index >= 0 ? index : null;
    },
  },
  license: {
    better: "high",
    winLabel: null,
    score: (trade) => credentialScore(trade.details.license),
  },
  insurance: {
    better: "high",
    winLabel: null,
    score: (trade) => credentialScore(trade.details.insurance),
  },
  rating: {
    better: "high",
    winLabel: "Highest",
    score: (trade) => (trade.reviews > 0 ? trade.rating : null),
  },
  jobs: {
    better: "high",
    winLabel: "Most",
    score: (trade) => trade.completedProjects,
  },
};

export type MetricRank = {
  rank: number;
  total: number;
  best: boolean;
  label: string | null;
};

const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th"];

export function rankMetric(
  key: MetricKey,
  trades: Specialist[],
): Map<string, MetricRank> {
  const metric = METRICS[key];
  const scored = trades
    .map((trade) => ({ id: trade.tradeId, score: metric.score(trade, trades) }))
    .filter((item): item is { id: string; score: number } => item.score !== null);
  const result = new Map<string, MetricRank>();
  if (scored.length < 2) return result;
  const distinct = new Set(scored.map((item) => item.score));
  if (distinct.size < 2) return result;
  for (const item of scored) {
    const ahead = scored.filter((other) =>
      metric.better === "low" ? other.score < item.score : other.score > item.score,
    ).length;
    const rank = ahead + 1;
    const best = rank === 1;
    let label: string | null = null;
    if (metric.winLabel) {
      if (best) label = metric.winLabel;
      else if (scored.length > 2) label = `${ORDINALS[rank - 1] ?? `${rank}th`} of ${scored.length}`;
    }
    result.set(item.id, { rank, total: scored.length, best, label });
  }
  return result;
}

export function rankAll(trades: Specialist[]): Record<MetricKey, Map<string, MetricRank>> {
  return Object.fromEntries(
    (Object.keys(METRICS) as MetricKey[]).map((key) => [key, rankMetric(key, trades)]),
  ) as Record<MetricKey, Map<string, MetricRank>>;
}

export function leadsCount(
  trade: Specialist,
  other: Specialist,
): { wins: number; total: number } {
  let wins = 0;
  let total = 0;
  for (const key of Object.keys(METRICS) as MetricKey[]) {
    const ranks = rankMetric(key, [trade, other]);
    const mine = ranks.get(trade.tradeId);
    if (!mine || !ranks.get(other.tradeId)) continue;
    total += 1;
    if (mine.best) wins += 1;
  }
  return { wins, total };
}

function plural(value: number, word: string): string {
  return `${value} ${word}${value === 1 ? "" : "s"}`;
}

export function rateValue(trade: Specialist): string {
  const rates = trade.details.rates;
  if (!rates || rates.model === "not_provided") return NOT_PROVIDED;
  if (rates.model === "quote") return "Quote only";
  const amount = rateAmount(rates);
  if (!amount) return pricingModelLabel(rates.model);
  return `${amount} / ${RATE_BASIS_SHORT[rates.basis]}`;
}

function credentialValue(
  credential: Specialist["details"]["license"],
  withState: boolean,
): string {
  if (!credential) return NOT_PROVIDED;
  if (!isCredentialCurrent(credential)) return "Expired";
  const parts = ["Provided"];
  if (withState && credential.state) parts.push(credential.state);
  if (credential.expiresAt) parts.push(`thru ${shortDate(credential.expiresAt)}`);
  return parts.join(" · ");
}

export function experienceValue(trade: Specialist): string {
  const years = trade.details.experienceYears;
  return years !== null ? plural(years, "year") : NOT_PROVIDED;
}

export function responseValue(trade: Specialist): string {
  const label = responseShortLabel(trade.details.responseTime);
  return label ? label.replace(/^Replies /, "") : "Not yet established";
}

export function ratingValue(trade: Specialist): string {
  return trade.reviews > 0
    ? `★ ${trade.rating.toFixed(1)} (${trade.reviews})`
    : "New on CTMASS";
}

export function jobsValue(trade: Specialist): string {
  return trade.completedProjects > 0 ? String(trade.completedProjects) : "None yet";
}

export type CompareRow = {
  key: string;
  label: string;
  metric?: MetricKey;
  value: (trade: Specialist, distance: number | null) => string;
};

export const CARD_ROWS: CompareRow[] = [
  { key: "rate", label: "Rate", metric: "rate", value: rateValue },
  { key: "experience", label: "In this trade", metric: "experience", value: experienceValue },
  { key: "response", label: "Replies", metric: "response", value: responseValue },
  {
    key: "license",
    label: "License",
    metric: "license",
    value: (trade) => credentialValue(trade.details.license, true),
  },
  {
    key: "insurance",
    label: "Insurance",
    metric: "insurance",
    value: (trade) => credentialValue(trade.details.insurance, false),
  },
  { key: "jobs", label: "Jobs on CTMASS", metric: "jobs", value: jobsValue },
];

export const DETAIL_ROWS: CompareRow[] = [
  { key: "rate", label: "Rate", metric: "rate", value: rateValue },
  {
    key: "experience",
    label: "Years in this trade",
    metric: "experience",
    value: experienceValue,
  },
  { key: "response", label: "Replies (set by contractor)", metric: "response", value: responseValue },
  {
    key: "license",
    label: "License",
    metric: "license",
    value: (trade) => credentialValue(trade.details.license, true),
  },
  {
    key: "insurance",
    label: "Insurance",
    metric: "insurance",
    value: (trade) => credentialValue(trade.details.insurance, false),
  },
  { key: "rating", label: "Rating", metric: "rating", value: ratingValue },
  { key: "jobs", label: "Jobs on CTMASS", metric: "jobs", value: jobsValue },
  {
    key: "business",
    label: "Years in business",
    value: (trade) => {
      const years = trade.owner ? yearsInBusiness(trade.owner.business) : null;
      return years !== null ? plural(years, "year") : NOT_PROVIDED;
    },
  },
  {
    key: "fees",
    label: "Minimum & service call",
    value: (trade) => priceSubline(trade.details.rates) || NOT_PROVIDED,
  },
  {
    key: "emergency",
    label: "Emergency",
    value: (trade) => {
      const availability = trade.details.availability;
      if (!availability || availability.emergency === "none") return "No emergency service";
      return [emergencyLabel(availability.emergency), trade.details.rates?.afterHours]
        .filter(Boolean)
        .join(" · ");
    },
  },
  {
    key: "availability",
    label: "Availability",
    value: (trade) => availabilityLine(trade.details.availability) || NOT_PROVIDED,
  },
  {
    key: "area",
    label: "Service area",
    value: (trade, distance) => {
      const radius = trade.details.radiusMiles;
      const away = formatMiles(distance);
      const parts = [
        trade.placeName ? shortPlace(trade.placeName) : "",
        radius ? `+${radius} mi` : "",
      ].filter(Boolean);
      const area = parts.join(" ") || NOT_PROVIDED;
      return away ? `${area} · ${away} away` : area;
    },
  },
  {
    key: "services",
    label: "Services",
    value: (trade) => trade.details.services.join(", ") || NOT_PROVIDED,
  },
  {
    key: "crew",
    label: "Crew",
    value: (trade) => {
      const business = trade.owner?.business;
      if (!business?.crewSize) return NOT_PROVIDED;
      return `${crewSizeLabel(business.crewSize)}${business.usesSubcontractors ? " · subs" : ""}`;
    },
  },
  {
    key: "warranty",
    label: "Warranty",
    value: (trade) => {
      const policy = trade.details.workPolicy;
      return policy.warranty ? warrantyLabel(policy.warranty) : "Not specified";
    },
  },
  {
    key: "languages",
    label: "Languages",
    value: (trade) => trade.owner?.business.languages.join(", ") || NOT_PROVIDED,
  },
  {
    key: "contact",
    label: "Contact options",
    value: (trade) =>
      ["Message", publicPhone(trade.owner) ? "Phone" : "", trade.owner?.email ? "Email" : ""]
        .filter(Boolean)
        .join(", "),
  },
];
