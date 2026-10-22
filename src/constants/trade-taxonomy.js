function slug(value) {
    return value
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}
function group(id, label, seeds) {
    return {
        id,
        label,
        items: seeds.map((seed) => {
            const itemLabel = typeof seed === "string" ? seed : seed.label;
            return {
                id: slug(itemLabel),
                label: itemLabel,
                groupId: id,
                aliases: typeof seed === "string" ? [] : seed.aliases,
            };
        }),
    };
}
export const TRADE_GROUPS = [
    group("electrical", "Electrical", [
        "Electrician",
        "Low Voltage/Data",
        "Security & Cameras",
        "Fire Alarm",
        "Solar",
        "EV Charger",
        "Generator",
        "Lighting",
    ]),
    group("plumbing", "Plumbing & Gas", [
        "Plumber",
        "Gas Fitter",
        "Pipefitter",
        "Water Heater",
        "Drain & Sewer",
        "Well & Pump",
        "Septic",
        "Backflow Tester",
    ]),
    group("hvac", "HVAC & Mechanical", [
        { label: "HVAC Technician", aliases: ["HVAC Tech"] },
        "Heat Pump/Mini-Split",
        "Boiler/Hydronic",
        "Oil Burner",
        "Refrigeration",
        "Sheet Metal/Ductwork",
        "Duct Cleaning",
        "Chimney",
    ]),
    group("masonry", "Foundation, Concrete & Masonry", [
        "Foundation Repair",
        "Concrete/Flatwork",
        { label: "Masonry/Brick", aliases: ["Mason"] },
        "Stone & Hardscape",
        "Basement Waterproofing",
        "Crawlspace",
        "Excavation",
    ]),
    group("carpentry", "Carpentry", [
        "Carpenter",
        "Framer",
        "Finish Carpenter",
        "Cabinet Maker",
        "Decks & Porches",
        "Stairs & Railings",
    ]),
    group("exterior", "Exterior & Envelope", [
        "Roofer",
        "Siding",
        "Gutters",
        "Windows & Doors",
        "Insulation",
        "Spray Foam",
        "Weatherization",
    ]),
    group("interior", "Interior Finishes", [
        "Drywall",
        "Plaster",
        "Painter",
        "Flooring",
        { label: "Tile", aliases: ["Tiler"] },
        "Hardwood Refinishing",
        "Countertops",
    ]),
    group("remodeling", "Remodeling & Building", [
        "General Contractor",
        "Home Builder",
        "Kitchen Remodeling",
        "Bathroom Remodeling",
        "Basement Finishing",
        "Additions",
        "Handyman",
    ]),
    group("outdoor", "Outdoor & Site", [
        "Landscaping",
        "Lawn Care",
        "Tree Service",
        "Fencing",
        "Paving/Asphalt",
        "Pools & Spas",
        "Irrigation",
        "Snow Removal",
    ]),
    group("restoration", "Restoration & Environmental", [
        "Water/Fire Damage",
        "Mold",
        "Asbestos & Lead Abatement",
        "Radon",
        "Pest Control",
        "Demolition",
        "Junk Removal",
    ]),
    group("inspection", "Inspection & Design", [
        "Home Inspector",
        "Energy Auditor",
        "Architect",
        "Structural Engineer",
        "Interior Designer",
        "Surveyor",
        "Home Appraiser",
    ]),
    group("maintenance", "Maintenance & Specialty", [
        "Maintenance Tech",
        "Building Engineer",
        "Appliance Repair",
        "Locksmith",
        "Glazier",
        "Welder",
        "Garage Doors",
        "Cleaning",
    ]),
];
export const OTHER_TRADE_LABEL = "Other";
export const TRADE_ITEMS = TRADE_GROUPS.flatMap((item) => item.items);
const LEGACY_IDS = {
    plumbing: "plumber",
    electrician: "electrician",
    handyman: "handyman",
    carpenter: "carpenter",
    hvac: "hvac-technician",
};
const BY_KEY = new Map();
for (const item of TRADE_ITEMS) {
    BY_KEY.set(item.id, item);
    BY_KEY.set(item.label.toLowerCase(), item);
    for (const alias of item.aliases)
        BY_KEY.set(alias.toLowerCase(), item);
}
export function findTrade(value) {
    if (!value)
        return null;
    const key = value.trim().toLowerCase();
    return BY_KEY.get(key) ?? BY_KEY.get(LEGACY_IDS[key] ?? "") ?? null;
}
export function findGroup(id) {
    return TRADE_GROUPS.find((item) => item.id === id) ?? null;
}
export function groupOfTrade(value) {
    return findTrade(value)?.groupId ?? "other";
}
export function tradeQueryLabels(item) {
    return [item.label, ...item.aliases];
}
export function siblingTrades(item) {
    return (findGroup(item.groupId)?.items ?? []).filter((entry) => entry.id !== item.id);
}
export function canonicalTradeLabel(value) {
    return findTrade(value)?.label ?? value;
}
