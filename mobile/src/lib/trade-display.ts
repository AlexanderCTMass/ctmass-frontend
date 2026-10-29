import {
  RATE_BASIS_SHORT,
  availabilityDayLabel,
  responseShortLabel,
  workingHoursLabel,
} from "@/constants/trade-options";
import type { OwnerPublic } from "@/lib/business-profile";
import { type Translate, dateLocale, translateData } from "@/lib/i18n";
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

export function priceLine(rates: TradeRates | null, t: Translate): string {
  if (!rates || rates.model === "not_provided") {
    return t("trade.price.notListed");
  }
  if (rates.model === "quote") return t("trade.price.quoteOnly");
  const amount = rateAmount(rates);
  const basis = translateData(t, RATE_BASIS_SHORT[rates.basis]);
  if (!amount) {
    if (rates.model === "fixed") return t("trade.price.fixedQuotes");
    return t("trade.price.notListed");
  }
  if (rates.model === "fixed")
    return t("trade.price.fromPer", { amount, basis });
  return `${amount} / ${basis}`;
}

export function hasListedRate(rates: TradeRates | null): boolean {
  return Boolean(
    rates &&
      rateAmount(rates) &&
      rates.model !== "quote" &&
      rates.model !== "not_provided",
  );
}

export function priceSubline(rates: TradeRates | null, t: Translate): string {
  if (!rates) return "";
  const parts: string[] = [];
  if (rates.serviceCallFee !== null) {
    const fee = money(rates.serviceCallFee);
    parts.push(
      rates.serviceCallCredited
        ? t("trade.price.serviceCallCredited", { fee })
        : t("trade.price.serviceCall", { fee }),
    );
  }
  if (rates.minimumCharge !== null) {
    parts.push(
      t("trade.price.minimum", { amount: money(rates.minimumCharge) }),
    );
  }
  return parts.join(" · ");
}

export function availabilityLine(
  availability: TradeAvailability | null,
  t: Translate,
): string {
  if (!availability) return "";
  if (!availability.acceptingWork) return t("trade.notAccepting");
  const days = availability.days
    .map((day) => availabilityDayLabel(day, t))
    .filter(Boolean)
    .join(", ");
  const hours = workingHoursLabel(availability.hours, t);
  return [days, hours].filter(Boolean).join(" · ");
}

export function responseLine(details: TradeDetails, t: Translate): string {
  return responseShortLabel(details.responseTime, t);
}

export type TrustKey = "license" | "insurance" | "estimate";

export type TrustItem = { key: TrustKey; label: string };

export function isLicensed(
  details: TradeDetails,
  owner: OwnerPublic | null | undefined,
): boolean {
  return (
    Boolean(details.license && isCredentialCurrent(details.license)) ||
    Boolean(owner?.hasCertificates)
  );
}

export function isInsured(details: TradeDetails): boolean {
  return Boolean(details.insurance && isCredentialCurrent(details.insurance));
}

export function offersFreeEstimate(details: TradeDetails): boolean {
  return details.workPolicy.estimate === "free";
}

export function trustItems(
  details: TradeDetails,
  owner: OwnerPublic | null | undefined,
  t: Translate,
): TrustItem[] {
  const items: TrustItem[] = [];
  if (isLicensed(details, owner)) {
    const state =
      details.license && isCredentialCurrent(details.license)
        ? details.license.state
        : "";
    items.push({
      key: "license",
      label: state
        ? t("trade.trust.licenseState", { state })
        : t("trade.trust.license"),
    });
  }
  if (isInsured(details)) {
    items.push({ key: "insurance", label: t("trade.trust.insurance") });
  }
  if (offersFreeEstimate(details)) {
    items.push({ key: "estimate", label: t("trade.trust.freeEstimate") });
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
  return date.toLocaleDateString(dateLocale(), {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
