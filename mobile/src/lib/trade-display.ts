import {
  RATE_BASIS_SHORT,
  availabilityDayLabel,
  responseShortLabel,
  workingHoursLabel,
} from "@/constants/trade-options";
import {
  type TradeAvailability,
  type TradeDetails,
  type TradeRates,
  isCredentialCurrent,
} from "@/lib/trade-details";

function money(value: number): string {
  return `$${value.toLocaleString("en-US")}`;
}

export function rateAmount(rates: TradeRates): string {
  if (rates.min !== null && rates.max !== null && rates.max > rates.min) {
    return `${money(rates.min)}–${money(rates.max)}`;
  }
  const value = rates.min ?? rates.max;
  return value !== null ? money(value) : "";
}

export function priceLine(rates: TradeRates | null): string {
  if (!rates || rates.model === "not_provided") {
    return "Rate not listed — request a quote";
  }
  if (rates.model === "quote") return "Quote only — request a quote";
  const amount = rateAmount(rates);
  const basis = RATE_BASIS_SHORT[rates.basis];
  if (!amount) {
    if (rates.model === "fixed") return "Fixed-price quotes";
    return "Rate not listed — request a quote";
  }
  if (rates.model === "fixed") return `From ${amount} / ${basis}`;
  return `${amount} / ${basis}`;
}

export function hasListedRate(rates: TradeRates | null): boolean {
  return Boolean(rates && rateAmount(rates) && rates.model !== "quote" && rates.model !== "not_provided");
}

export function priceSubline(rates: TradeRates | null): string {
  if (!rates) return "";
  const parts: string[] = [];
  if (rates.serviceCallFee !== null) {
    parts.push(
      `${money(rates.serviceCallFee)} service call${rates.serviceCallCredited ? " (credited)" : ""}`,
    );
  }
  if (rates.minimumCharge !== null) {
    parts.push(`${money(rates.minimumCharge)} minimum`);
  }
  return parts.join(" · ");
}

export function availabilityLine(availability: TradeAvailability | null): string {
  if (!availability) return "";
  if (!availability.acceptingWork) return "Not accepting new projects right now";
  const days = availability.days.map(availabilityDayLabel).filter(Boolean).join(", ");
  const hours = workingHoursLabel(availability.hours);
  return [days, hours].filter(Boolean).join(" · ");
}

export function responseLine(details: TradeDetails): string {
  return responseShortLabel(details.responseTime);
}

export type TrustItem = { key: "license" | "insurance"; label: string };

export function trustItems(details: TradeDetails): TrustItem[] {
  const items: TrustItem[] = [];
  if (details.license && isCredentialCurrent(details.license)) {
    items.push({
      key: "license",
      label: details.license.state
        ? `License provided · ${details.license.state}`
        : "License provided",
    });
  }
  if (details.insurance && isCredentialCurrent(details.insurance)) {
    items.push({ key: "insurance", label: "Insurance provided" });
  }
  return items;
}

export function servicesPreview(
  services: string[],
  limit = 3,
): { shown: string[]; more: number } {
  return {
    shown: services.slice(0, limit),
    more: Math.max(0, services.length - limit),
  };
}

export function shortDate(date: Date | null): string {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
