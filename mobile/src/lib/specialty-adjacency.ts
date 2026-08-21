const SPECIALTY_ADJACENCY: Record<string, string[]> = {
  Plumber: ["General Contractor", "Tiler", "Electrician"],
  Electrician: ["General Contractor", "Plumber", "Carpenter"],
  Carpenter: ["General Contractor", "Mason", "Painter"],
  Painter: ["General Contractor", "Carpenter", "Tiler"],
  Roofer: ["General Contractor", "Carpenter", "Mason"],
  Tiler: ["Mason", "Plumber", "Painter"],
  Mason: ["General Contractor", "Tiler", "Carpenter"],
  "General Contractor": ["Carpenter", "Mason", "Plumber", "Electrician"],
  "Interior Designer": ["General Contractor", "Painter", "Carpenter"],
  "Home Appraiser": ["General Contractor", "Interior Designer"],
};

export function adjacentLabels(label: string): string[] {
  return SPECIALTY_ADJACENCY[label] ?? [];
}
