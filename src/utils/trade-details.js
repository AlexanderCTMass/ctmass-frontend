import { AVAILABILITY_DAYS, PRICING_MODELS, PROJECT_TYPES, RATE_BASES, RESPONSE_TIMES, DEFAULT_SERVICE_RADIUS, defaultBasisFor, } from 'src/constants/trade-options';
import { groupOfTrade } from 'src/constants/trade-taxonomy';
const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;
function record(value) {
    return value && typeof value === "object" ? value : {};
}
function str(value) {
    return typeof value === "string" ? value : "";
}
function numOrNull(value) {
    if (typeof value === "number" && Number.isFinite(value))
        return value;
    if (typeof value === "string" && value.trim()) {
        const parsed = Number(value.replace(/[^0-9.]/g, ""));
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }
    return null;
}
function strings(value) {
    return Array.isArray(value)
        ? value.filter((item) => typeof item === "string" && item.length > 0)
        : [];
}
function oneOf(options, value) {
    return options.some((item) => item.value === value) ? value : null;
}
export function toDate(value) {
    if (!value)
        return null;
    if (value instanceof Date)
        return value;
    const raw = record(value);
    if (typeof raw.toDate === "function")
        return raw.toDate();
    if (typeof raw.seconds === "number")
        return new Date(raw.seconds * 1000);
    return null;
}
function readLegacyRates(pricing) {
    const type = str(pricing.type);
    const amount = numOrNull(pricing.amount);
    if (!type && amount === null)
        return null;
    const model = type === "project" ? "fixed" : type === "consultation" ? "fixed" : "hourly";
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
function readRates(data) {
    const raw = data.rates;
    if (!raw || typeof raw !== "object")
        return readLegacyRates(record(data.pricing));
    const rates = record(raw);
    const model = oneOf(PRICING_MODELS, rates.model);
    if (!model)
        return readLegacyRates(record(data.pricing));
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
function readAvailability(value) {
    if (!value || typeof value !== "object")
        return null;
    const raw = record(value);
    const days = strings(raw.days).filter((day) => AVAILABILITY_DAYS.some((item) => item.value === day));
    const emergency = str(raw.emergency);
    return {
        days,
        hours: str(raw.hours),
        acceptingWork: raw.acceptingWork !== false,
        emergency: emergency === "after_hours" || emergency === "24_7" ? emergency : "none",
        emergencyNote: str(raw.emergencyNote),
    };
}
function readCredential(value) {
    if (!value || typeof value !== "object")
        return null;
    const raw = record(value);
    return {
        state: str(raw.state),
        type: str(raw.type),
        number: str(raw.number),
        expiresAt: toDate(raw.expiresAt),
        documentUrl: str(raw.documentUrl),
    };
}
export function isCredentialCurrent(credential) {
    if (!credential)
        return false;
    return !credential.expiresAt || credential.expiresAt.getTime() >= Date.now();
}
function readExperience(value) {
    const raw = record(value);
    const years = numOrNull(raw.years) ?? (raw.years === 0 ? 0 : null);
    if (years === null)
        return null;
    const recordedAt = toDate(raw.recordedAt);
    const elapsed = recordedAt
        ? Math.max(0, Math.floor((Date.now() - recordedAt.getTime()) / YEAR_MS))
        : 0;
    return Math.round(years) + elapsed;
}
export function readTradeDetails(data) {
    const label = str(data.primarySpecialtyLabel) || str(data.subtitle);
    const groupId = (str(data.tradeGroupId) || groupOfTrade(label));
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
            projectTypes: strings(policy.projectTypes).filter((item) => PROJECT_TYPES.some((entry) => entry.value === item)),
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
function legacyPricing(rates) {
    const type = rates.model === "fixed"
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
export function tradeDetailsPayload(input, now, previous) {
    const rates = input.rates;
    const ratesChanged = !previous?.rates ||
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
        experience: previous && previous.experienceYears === input.experienceYears
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
export function stripUndefined(value) {
    const out = {};
    for (const [key, entry] of Object.entries(value)) {
        if (entry === undefined)
            continue;
        out[key] =
            entry && typeof entry === "object" && !Array.isArray(entry) && !(entry instanceof Date) && Object.getPrototypeOf(entry) === Object.prototype
                ? stripUndefined(entry)
                : entry;
    }
    return out;
}
export function tradeCompleteness(details, extras) {
    const items = [
        { key: "experience", label: "Years in this trade", done: details.experienceYears !== null },
        { key: "services", label: "Services you offer", done: details.services.length > 0 },
        { key: "pricing", label: "Pricing", done: Boolean(details.rates && !details.rates.legacy) },
        { key: "availability", label: "Working days", done: Boolean(details.availability?.days.length) },
        { key: "response", label: "Response time", done: Boolean(details.responseTime) },
        { key: "area", label: "Service radius", done: details.radiusMiles !== null },
        { key: "credentials", label: "License or insurance", done: Boolean(details.license || details.insurance) },
        { key: "about", label: "About your work", done: extras.about.trim().length > 0 },
    ];
    if (extras.portfolioCount !== undefined) {
        items.push({ key: "portfolio", label: "Portfolio photos", done: extras.portfolioCount > 0 });
    }
    return items;
}
export function emptyDetailsInput(groupId) {
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
export function detailsToInput(details) {
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
