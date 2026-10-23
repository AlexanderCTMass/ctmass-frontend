export type TradeGroupId =
  | "electrical"
  | "plumbing"
  | "hvac"
  | "masonry"
  | "carpentry"
  | "exterior"
  | "interior"
  | "remodeling"
  | "outdoor"
  | "restoration"
  | "inspection"
  | "maintenance"
  | "other";

export type TradeItem = {
  id: string;
  label: string;
  groupId: TradeGroupId;
  aliases: string[];
};

export type TradeGroup = {
  id: TradeGroupId;
  label: string;
  items: TradeItem[];
};

type ItemSeed = string | { label: string; aliases: string[] };

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function group(id: TradeGroupId, label: string, seeds: ItemSeed[]): TradeGroup {
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

export const TRADE_GROUPS: TradeGroup[] = [
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

export const TRADE_ITEMS: TradeItem[] = TRADE_GROUPS.flatMap(
  (item) => item.items,
);

const LEGACY_IDS: Record<string, string> = {
  plumbing: "plumber",
  electrician: "electrician",
  handyman: "handyman",
  carpenter: "carpenter",
  hvac: "hvac-technician",
};

const BY_KEY = new Map<string, TradeItem>();
for (const item of TRADE_ITEMS) {
  BY_KEY.set(item.id, item);
  BY_KEY.set(item.label.toLowerCase(), item);
  for (const alias of item.aliases) BY_KEY.set(alias.toLowerCase(), item);
}

export function findTrade(value: string | null | undefined): TradeItem | null {
  if (!value) return null;
  const key = value.trim().toLowerCase();
  return BY_KEY.get(key) ?? BY_KEY.get(LEGACY_IDS[key] ?? "") ?? null;
}

export function findGroup(id: string | null | undefined): TradeGroup | null {
  return TRADE_GROUPS.find((item) => item.id === id) ?? null;
}

export function groupOfTrade(value: string | null | undefined): TradeGroupId {
  return findTrade(value)?.groupId ?? "other";
}

export function tradeQueryLabels(item: TradeItem): string[] {
  return [item.label, ...item.aliases];
}

export function siblingTrades(item: TradeItem): TradeItem[] {
  return (findGroup(item.groupId)?.items ?? []).filter(
    (entry) => entry.id !== item.id,
  );
}

export function canonicalTradeLabel(value: string): string {
  return findTrade(value)?.label ?? value;
}
