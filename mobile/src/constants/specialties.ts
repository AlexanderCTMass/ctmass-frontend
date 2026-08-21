export const SPECIALTIES = [
  "Interior Designer",
  "Home Appraiser",
  "General Contractor",
  "Plumber",
  "Electrician",
  "Carpenter",
  "Painter",
  "Roofer",
  "Tiler",
  "Mason",
] as const;

export type Specialty = (typeof SPECIALTIES)[number];

export const OTHER_SPECIALTY = "Other";
