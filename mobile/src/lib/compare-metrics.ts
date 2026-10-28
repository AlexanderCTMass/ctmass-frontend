import { shortPlace } from "@/components/project/project-card";
import {
  RATE_BASIS_SHORT,
  RESPONSE_TIMES,
  crewSizeLabel,
  emergencyLabel,
  modelTakesRate,
  pricingModelLabel,
  warrantyLabel,
} from "@/constants/trade-options";
import { publicPhone } from "@/hooks/use-trade-contact";
import { yearsInBusiness } from "@/lib/business-profile";
import { formatMiles } from "@/lib/geo";
import { type Translate, translateData } from "@/lib/i18n";
import { isCredentialCurrent } from "@/lib/trade-details";
import {
  availabilityLine,
  priceSubline,
  rateAmount,
  shortDate,
} from "@/lib/trade-display";
import type { Specialist } from "@/lib/trades";

const MUTED_KEYS = [
  "compare.values.notProvided",
  "compare.values.notSpecified",
  "compare.values.notEstablished",
  "compare.values.noneYet",
  "compare.values.newOnCtmass",
  "compare.values.expired",
] as const;

export function isMutedValue(value: string, t: Translate): boolean {
  return MUTED_KEYS.some((key) => t(key) === value);
}

const notProvided = (t: Translate) => t("compare.values.notProvided");

export type MetricKey =
  | "rate"
  | "experience"
  | "response"
  | "license"
  | "insurance"
  | "rating"
  | "jobs";

type WinWord = "lowest" | "most" | "fastest" | "highest";

type Metric = {
  better: "low" | "high";
  winLabel: WinWord | null;
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
    winLabel: "lowest",
    score: (trade, all) => (sharedBasis(all) ? rateScore(trade) : null),
  },
  experience: {
    better: "high",
    winLabel: "most",
    score: (trade) => trade.details.experienceYears,
  },
  response: {
    better: "low",
    winLabel: "fastest",
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
    winLabel: "highest",
    score: (trade) => (trade.reviews > 0 ? trade.rating : null),
  },
  jobs: {
    better: "high",
    winLabel: "most",
    score: (trade) => trade.completedProjects,
  },
};

export type RankLabel =
  | { kind: "win"; word: WinWord }
  | { kind: "ordinal"; rank: number; total: number };

export type MetricRank = {
  rank: number;
  total: number;
  best: boolean;
  label: RankLabel | null;
};

export function rankLabelText(label: RankLabel, t: Translate): string {
  if (label.kind === "win") return t(`compare.win.${label.word}`);
  return t("compare.rankOf", {
    count: label.rank,
    ordinal: true,
    total: label.total,
  });
}

export function rankMetric(
  key: MetricKey,
  trades: Specialist[],
): Map<string, MetricRank> {
  const metric = METRICS[key];
  const scored = trades
    .map((trade) => ({ id: trade.tradeId, score: metric.score(trade, trades) }))
    .filter(
      (item): item is { id: string; score: number } => item.score !== null,
    );
  const result = new Map<string, MetricRank>();
  if (scored.length < 2) return result;
  const distinct = new Set(scored.map((item) => item.score));
  if (distinct.size < 2) return result;
  for (const item of scored) {
    const ahead = scored.filter((other) =>
      metric.better === "low"
        ? other.score < item.score
        : other.score > item.score,
    ).length;
    const rank = ahead + 1;
    const best = rank === 1;
    let label: RankLabel | null = null;
    if (metric.winLabel) {
      if (best) label = { kind: "win", word: metric.winLabel };
      else if (scored.length > 2) {
        label = { kind: "ordinal", rank, total: scored.length };
      }
    }
    result.set(item.id, { rank, total: scored.length, best, label });
  }
  return result;
}

export function rankAll(
  trades: Specialist[],
): Record<MetricKey, Map<string, MetricRank>> {
  return Object.fromEntries(
    (Object.keys(METRICS) as MetricKey[]).map((key) => [
      key,
      rankMetric(key, trades),
    ]),
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

export function rateValue(trade: Specialist, t: Translate): string {
  const rates = trade.details.rates;
  if (!rates || rates.model === "not_provided") return notProvided(t);
  if (rates.model === "quote") return t("compare.values.quoteOnly");
  const amount = rateAmount(rates);
  if (!amount) return pricingModelLabel(rates.model, t);
  return `${amount} / ${translateData(t, RATE_BASIS_SHORT[rates.basis])}`;
}

function credentialValue(
  credential: Specialist["details"]["license"],
  withState: boolean,
  t: Translate,
): string {
  if (!credential) return notProvided(t);
  if (!isCredentialCurrent(credential)) return t("compare.values.expired");
  const parts = [t("compare.values.provided")];
  if (withState && credential.state) parts.push(credential.state);
  if (credential.expiresAt) {
    parts.push(
      t("compare.values.thru", { date: shortDate(credential.expiresAt) }),
    );
  }
  return parts.join(" · ");
}

export function experienceValue(trade: Specialist, t: Translate): string {
  const years = trade.details.experienceYears;
  return years !== null
    ? t("compare.values.years", { count: years })
    : notProvided(t);
}

export function responseValue(trade: Specialist, t: Translate): string {
  const value = trade.details.responseTime;
  return value
    ? translateData(
        t,
        RESPONSE_TIMES.find((item) => item.value === value)?.label ?? "",
      ) || t("compare.values.notEstablished")
    : t("compare.values.notEstablished");
}

export function ratingValue(trade: Specialist, t: Translate): string {
  return trade.reviews > 0
    ? `★ ${trade.rating.toFixed(1)} (${trade.reviews})`
    : t("compare.values.newOnCtmass");
}

export function jobsValue(trade: Specialist, t: Translate): string {
  return trade.completedProjects > 0
    ? String(trade.completedProjects)
    : t("compare.values.noneYet");
}

export type CompareRow = {
  key: string;
  label: (t: Translate) => string;
  metric?: MetricKey;
  value: (trade: Specialist, distance: number | null, t: Translate) => string;
};

export const CARD_ROWS: CompareRow[] = [
  {
    key: "rate",
    label: (t) => t("compare.rows.rate"),
    metric: "rate",
    value: (trade, _d, t) => rateValue(trade, t),
  },
  {
    key: "experience",
    label: (t) => t("compare.rows.inThisTrade"),
    metric: "experience",
    value: (trade, _d, t) => experienceValue(trade, t),
  },
  {
    key: "response",
    label: (t) => t("compare.rows.replies"),
    metric: "response",
    value: (trade, _d, t) => responseValue(trade, t),
  },
  {
    key: "license",
    label: (t) => t("compare.rows.license"),
    metric: "license",
    value: (trade, _d, t) => credentialValue(trade.details.license, true, t),
  },
  {
    key: "insurance",
    label: (t) => t("compare.rows.insurance"),
    metric: "insurance",
    value: (trade, _d, t) => credentialValue(trade.details.insurance, false, t),
  },
  {
    key: "jobs",
    label: (t) => t("compare.rows.jobs"),
    metric: "jobs",
    value: (trade, _d, t) => jobsValue(trade, t),
  },
];

export const DETAIL_ROWS: CompareRow[] = [
  {
    key: "rate",
    label: (t) => t("compare.rows.rate"),
    metric: "rate",
    value: (trade, _d, t) => rateValue(trade, t),
  },
  {
    key: "experience",
    label: (t) => t("compare.rows.yearsInTrade"),
    metric: "experience",
    value: (trade, _d, t) => experienceValue(trade, t),
  },
  {
    key: "response",
    label: (t) => t("compare.rows.repliesSetBy"),
    metric: "response",
    value: (trade, _d, t) => responseValue(trade, t),
  },
  {
    key: "license",
    label: (t) => t("compare.rows.license"),
    metric: "license",
    value: (trade, _d, t) => credentialValue(trade.details.license, true, t),
  },
  {
    key: "insurance",
    label: (t) => t("compare.rows.insurance"),
    metric: "insurance",
    value: (trade, _d, t) => credentialValue(trade.details.insurance, false, t),
  },
  {
    key: "rating",
    label: (t) => t("compare.rows.rating"),
    metric: "rating",
    value: (trade, _d, t) => ratingValue(trade, t),
  },
  {
    key: "jobs",
    label: (t) => t("compare.rows.jobs"),
    metric: "jobs",
    value: (trade, _d, t) => jobsValue(trade, t),
  },
  {
    key: "business",
    label: (t) => t("compare.rows.yearsInBusiness"),
    value: (trade, _d, t) => {
      const years = trade.owner ? yearsInBusiness(trade.owner.business) : null;
      return years !== null
        ? t("compare.values.years", { count: years })
        : notProvided(t);
    },
  },
  {
    key: "fees",
    label: (t) => t("compare.rows.fees"),
    value: (trade, _d, t) =>
      priceSubline(trade.details.rates, t) || notProvided(t),
  },
  {
    key: "emergency",
    label: (t) => t("compare.rows.emergency"),
    value: (trade, _d, t) => {
      const availability = trade.details.availability;
      if (!availability || availability.emergency === "none") {
        return translateData(t, "No emergency service");
      }
      return [
        emergencyLabel(availability.emergency, t),
        trade.details.rates?.afterHours,
      ]
        .filter(Boolean)
        .join(" · ");
    },
  },
  {
    key: "availability",
    label: (t) => t("compare.rows.availability"),
    value: (trade, _d, t) =>
      availabilityLine(trade.details.availability, t) || notProvided(t),
  },
  {
    key: "area",
    label: (t) => t("compare.rows.serviceArea"),
    value: (trade, distance, t) => {
      const radius = trade.details.radiusMiles;
      const away = formatMiles(distance);
      const parts = [
        trade.placeName ? shortPlace(trade.placeName) : "",
        radius ? `+${radius} mi` : "",
      ].filter(Boolean);
      const area = parts.join(" ") || notProvided(t);
      return away ? t("compare.values.areaAway", { area, away }) : area;
    },
  },
  {
    key: "services",
    label: (t) => t("compare.rows.services"),
    value: (trade, _d, t) =>
      trade.details.services
        .map((service) => translateData(t, service))
        .join(", ") || notProvided(t),
  },
  {
    key: "crew",
    label: (t) => t("compare.rows.crew"),
    value: (trade, _d, t) => {
      const business = trade.owner?.business;
      if (!business?.crewSize) return notProvided(t);
      const crew = crewSizeLabel(business.crewSize, t);
      return business.usesSubcontractors
        ? `${crew} · ${t("compare.values.subs")}`
        : crew;
    },
  },
  {
    key: "warranty",
    label: (t) => t("compare.rows.warranty"),
    value: (trade, _d, t) => {
      const policy = trade.details.workPolicy;
      return policy.warranty
        ? warrantyLabel(policy.warranty, t)
        : t("compare.values.notSpecified");
    },
  },
  {
    key: "languages",
    label: (t) => t("compare.rows.languages"),
    value: (trade, _d, t) =>
      (trade.owner?.business.languages ?? [])
        .map((language) => translateData(t, language))
        .join(", ") || notProvided(t),
  },
  {
    key: "contact",
    label: (t) => t("compare.rows.contact"),
    value: (trade, _d, t) =>
      [
        t("compare.values.message"),
        publicPhone(trade.owner) ? t("compare.values.phone") : "",
        trade.owner?.email ? t("compare.values.email") : "",
      ]
        .filter(Boolean)
        .join(", "),
  },
];
