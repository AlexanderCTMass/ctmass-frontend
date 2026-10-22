import { RATE_BASIS_SHORT, availabilityDayLabel, responseShortLabel, workingHoursLabel, } from 'src/constants/trade-options';
import { isCredentialCurrent, } from 'src/utils/trade-details';
function money(value) {
    return `$${value.toLocaleString("en-US")}`;
}
export function rateAmount(rates) {
    if (rates.min !== null && rates.max !== null && rates.max > rates.min) {
        return `${money(rates.min)}–${money(rates.max)}`;
    }
    const value = rates.min ?? rates.max;
    return value !== null ? money(value) : "";
}
export function priceLine(rates) {
    if (!rates || rates.model === "not_provided") {
        return "Rate not listed — request a quote";
    }
    if (rates.model === "quote")
        return "Quote only — request a quote";
    const amount = rateAmount(rates);
    const basis = RATE_BASIS_SHORT[rates.basis];
    if (!amount) {
        if (rates.model === "fixed")
            return "Fixed-price quotes";
        return "Rate not listed — request a quote";
    }
    if (rates.model === "fixed")
        return `From ${amount} / ${basis}`;
    return `${amount} / ${basis}`;
}
export function hasListedRate(rates) {
    return Boolean(rates && rateAmount(rates) && rates.model !== "quote" && rates.model !== "not_provided");
}
export function priceSubline(rates) {
    if (!rates)
        return "";
    const parts = [];
    if (rates.serviceCallFee !== null) {
        parts.push(`${money(rates.serviceCallFee)} service call${rates.serviceCallCredited ? " (credited)" : ""}`);
    }
    if (rates.minimumCharge !== null) {
        parts.push(`${money(rates.minimumCharge)} minimum`);
    }
    return parts.join(" · ");
}
export function availabilityLine(availability) {
    if (!availability)
        return "";
    if (!availability.acceptingWork)
        return "Not accepting new projects right now";
    const days = availability.days.map(availabilityDayLabel).filter(Boolean).join(", ");
    const hours = workingHoursLabel(availability.hours);
    return [days, hours].filter(Boolean).join(" · ");
}
export function responseLine(details) {
    return responseShortLabel(details.responseTime);
}
export function trustItems(details) {
    const items = [];
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
export function servicesPreview(services, limit = 3) {
    return {
        shown: services.slice(0, limit),
        more: Math.max(0, services.length - limit),
    };
}
export function shortDate(date) {
    if (!date)
        return "";
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}
