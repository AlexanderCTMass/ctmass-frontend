export const AD_PLACEMENTS = {
  HomeTop: "HomeTopAdPlace",
  ContractorHomeBetweenRequests: "ContractorHomeBetweenRequestAdPlace",
  HomeownerHomeBetweenRequests: "HomeownerHomeBetweenRequestAdPlace",
  Shop: "ShopAdPlace",
} as const;

export type AdPlacement = (typeof AD_PLACEMENTS)[keyof typeof AD_PLACEMENTS];

export type AdPlacementKind = "carousel" | "inline";

export type AdPlacementSettings = {
  enabled: boolean;
  maxItems: number;
  autoplayMs: number;
  every: number;
};

export const AD_PLACEMENT_KIND: Record<AdPlacement, AdPlacementKind> = {
  [AD_PLACEMENTS.HomeTop]: "carousel",
  [AD_PLACEMENTS.ContractorHomeBetweenRequests]: "inline",
  [AD_PLACEMENTS.HomeownerHomeBetweenRequests]: "inline",
  [AD_PLACEMENTS.Shop]: "inline",
};

export const DEFAULT_AD_PLACEMENT_SETTINGS: Record<
  AdPlacement,
  AdPlacementSettings
> = {
  [AD_PLACEMENTS.HomeTop]: {
    enabled: true,
    maxItems: 5,
    autoplayMs: 3000,
    every: 0,
  },
  [AD_PLACEMENTS.ContractorHomeBetweenRequests]: {
    enabled: true,
    maxItems: 5,
    autoplayMs: 0,
    every: 3,
  },
  [AD_PLACEMENTS.HomeownerHomeBetweenRequests]: {
    enabled: true,
    maxItems: 5,
    autoplayMs: 0,
    every: 3,
  },
  [AD_PLACEMENTS.Shop]: {
    enabled: true,
    maxItems: 5,
    autoplayMs: 0,
    every: 3,
  },
};

export const ALL_AD_PLACEMENTS = Object.values(AD_PLACEMENTS) as AdPlacement[];

export function isAdPlacement(value: string): value is AdPlacement {
  return (ALL_AD_PLACEMENTS as string[]).includes(value);
}
