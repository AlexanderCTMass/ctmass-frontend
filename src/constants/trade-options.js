function labelOf(options, value) {
    return options.find((item) => item.value === value)?.label ?? "";
}
export const EXPERIENCE_TIERS = [
    { id: "starter", label: "Starter", min: 0, max: 2, color: "#8FD694" },
    { id: "skilled", label: "Skilled", min: 3, max: 5, color: "#2BB3C0" },
    { id: "pro", label: "Pro", min: 6, max: 10, color: "#16B364" },
    { id: "expert", label: "Expert", min: 11, max: 19, color: "#F5A524" },
    { id: "veteran", label: "Veteran", min: 20, max: null, color: "#8B5CF6" },
];
export const MAX_EXPERIENCE_YEARS = 60;
export function tierFor(years) {
    return (EXPERIENCE_TIERS.find((tier) => years >= tier.min && (tier.max === null || years <= tier.max)) ?? EXPERIENCE_TIERS[0]);
}
export function yearsLabel(years) {
    return `${years} ${years === 1 ? "yr" : "yrs"}`;
}
export function tierBadgeLabel(years) {
    return `${tierFor(years).label.toUpperCase()} · ${yearsLabel(years).toUpperCase()}`;
}
export const PRICING_MODELS = [
    { value: "hourly", label: "Hourly labor" },
    { value: "service_call_hourly", label: "Service call + hourly" },
    { value: "fixed", label: "Fixed-price quotes" },
    { value: "per_unit", label: "Per unit" },
    { value: "quote", label: "Quote only" },
    { value: "not_provided", label: "Not provided" },
];
export const pricingModelLabel = (value) => labelOf(PRICING_MODELS, value);
export function modelTakesRate(model) {
    return model === "hourly" || model === "service_call_hourly" || model === "per_unit" || model === "fixed";
}
export const RATE_BASES = [
    { value: "technician_hour", label: "per technician-hour" },
    { value: "crew_hour", label: "per crew-hour" },
    { value: "visit", label: "per visit" },
    { value: "unit", label: "per unit" },
    { value: "project", label: "per project" },
];
export const RATE_BASIS_SHORT = {
    technician_hour: "tech-hour",
    crew_hour: "crew-hour",
    visit: "visit",
    unit: "unit",
    project: "project",
};
export function defaultBasisFor(model) {
    if (model === "fixed")
        return "project";
    if (model === "per_unit")
        return "unit";
    return "technician_hour";
}
export const RESPONSE_TIMES = [
    { value: "15m", label: "Within 15 min" },
    { value: "1h", label: "Within 1 hour" },
    { value: "4h", label: "Within 4 hours" },
    { value: "24h", label: "Within 24 hours" },
    { value: "next_day", label: "Next business day" },
];
const RESPONSE_SHORT = {
    "15m": "Replies within 15 min",
    "1h": "Replies within 1 hr",
    "4h": "Replies within 4 hrs",
    "24h": "Replies within 24 hrs",
    next_day: "Replies next business day",
};
export function responseShortLabel(value) {
    return RESPONSE_SHORT[value] ?? "";
}
export const AVAILABILITY_DAYS = [
    { value: "mon_fri", label: "Mon–Fri" },
    { value: "mon_sat", label: "Mon–Sat" },
    { value: "weekends", label: "Weekends" },
    { value: "by_appointment", label: "By appointment" },
];
export const WORKING_HOURS = [
    { value: "7-16", label: "7am–4pm" },
    { value: "8-17", label: "8am–5pm" },
    { value: "9-18", label: "9am–6pm" },
    { value: "8-20", label: "8am–8pm" },
    { value: "flexible", label: "Flexible hours" },
];
export const availabilityDayLabel = (value) => labelOf(AVAILABILITY_DAYS, value);
export const workingHoursLabel = (value) => labelOf(WORKING_HOURS, value);
export const EMERGENCY_OPTIONS = [
    { value: "none", label: "No emergency service" },
    { value: "after_hours", label: "After-hours calls" },
    { value: "24_7", label: "24/7 emergency" },
];
export const emergencyLabel = (value) => labelOf(EMERGENCY_OPTIONS, value);
export const SERVICE_RADII = [10, 25, 50, 100];
export const DEFAULT_SERVICE_RADIUS = 25;
export const PROJECT_TYPES = [
    { value: "residential", label: "Residential" },
    { value: "commercial", label: "Commercial" },
    { value: "multi_family", label: "Multi-family" },
    { value: "industrial", label: "Industrial" },
];
export const projectTypeLabel = (value) => labelOf(PROJECT_TYPES, value);
export const ESTIMATE_POLICIES = [
    { value: "free", label: "Free estimate" },
    { value: "paid", label: "Paid estimate" },
    { value: "diagnostic", label: "Paid diagnostic visit" },
];
export const estimateLabel = (value) => labelOf(ESTIMATE_POLICIES, value);
export const WARRANTY_OPTIONS = [
    { value: "none", label: "No written warranty" },
    { value: "30d", label: "30 days" },
    { value: "90d", label: "90 days" },
    { value: "1y", label: "1 year" },
    { value: "2y", label: "2+ years" },
];
export const warrantyLabel = (value) => labelOf(WARRANTY_OPTIONS, value);
export const PERMIT_OPTIONS = [
    { value: "yes", label: "Handles permits" },
    { value: "depends", label: "Depends on the job" },
    { value: "no", label: "Homeowner pulls permits" },
];
export const permitsLabel = (value) => labelOf(PERMIT_OPTIONS, value);
export const WORK_BY_OPTIONS = [
    { value: "owner", label: "The owner" },
    { value: "employees", label: "Employees" },
    { value: "subcontractors", label: "Subcontractors" },
    { value: "mixed", label: "Mixed crew" },
];
export const workByLabel = (value) => labelOf(WORK_BY_OPTIONS, value);
export const BUSINESS_STRUCTURES = [
    { value: "sole_proprietor", label: "Sole Proprietor" },
    { value: "llc", label: "LLC" },
    { value: "corporation", label: "Corporation" },
    { value: "partnership", label: "Partnership" },
    { value: "other", label: "Other" },
    { value: "undisclosed", label: "Prefer not to say" },
];
export const businessStructureLabel = (value) => value === "undisclosed" ? "" : labelOf(BUSINESS_STRUCTURES, value);
export const CREW_SIZES = [
    { value: "solo", label: "Solo" },
    { value: "2_5", label: "2–5 people" },
    { value: "6_15", label: "6–15 people" },
    { value: "16_plus", label: "16+ people" },
];
export const crewSizeLabel = (value) => labelOf(CREW_SIZES, value);
export const BUSINESS_ROLES = [
    { value: "owner", label: "Owner / Founder" },
    { value: "partner", label: "Partner" },
    { value: "manager", label: "Manager / Foreman" },
    { value: "technician", label: "Technician / Employee" },
    { value: "subcontractor", label: "Subcontractor" },
    { value: "apprentice", label: "Apprentice" },
];
export const businessRoleLabel = (value) => labelOf(BUSINESS_ROLES, value);
export const LANGUAGES = [
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
export const PAYMENT_METHODS = [
    { value: "cash", label: "Cash" },
    { value: "check", label: "Check" },
    { value: "card", label: "Credit / debit card" },
    { value: "bank", label: "Bank transfer" },
    { value: "digital", label: "Zelle / Venmo" },
    { value: "financing", label: "Financing" },
];
export const paymentMethodLabel = (value) => labelOf(PAYMENT_METHODS, value);
export const PREFERRED_CONTACTS = [
    { value: "message", label: "CTMASS message" },
    { value: "phone", label: "Phone call" },
    { value: "email", label: "Email" },
];
export const US_STATE_CODES = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID",
    "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO",
    "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA",
    "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];
export const PROJECT_COST_RANGES = [
    { value: "under_1k", label: "Under $1,000" },
    { value: "1k_5k", label: "$1,000–$5,000" },
    { value: "5k_15k", label: "$5,000–$15,000" },
    { value: "15k_50k", label: "$15,000–$50,000" },
    { value: "50k_plus", label: "$50,000+" },
];
export const projectCostLabel = (value) => labelOf(PROJECT_COST_RANGES, value);
export const PROJECT_DURATIONS = [
    { value: "1d", label: "1 day" },
    { value: "2_3d", label: "2–3 days" },
    { value: "1w", label: "About a week" },
    { value: "2_4w", label: "2–4 weeks" },
    { value: "1_3m", label: "1–3 months" },
    { value: "3m_plus", label: "3+ months" },
];
export const projectDurationLabel = (value) => labelOf(PROJECT_DURATIONS, value);
export const PRICE_DISCLAIMER = "Prices are provided by the contractor. The final price may change after a site visit, scope, access, parts, permits or hidden conditions.";
export const RESPONSE_SOURCE_NOTE = "Set by contractor";
