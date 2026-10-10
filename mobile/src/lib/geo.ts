const EARTH_RADIUS_MILES = 3958.8;

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

// Great-circle distance between two [lat, lng] points, in miles.
export function distanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return EARTH_RADIUS_MILES * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function distanceBetweenCenters(
  from: [number, number] | null | undefined,
  to: [number, number] | null | undefined,
): number | null {
  if (!from || !to) return null;
  return distanceMiles(from[1], from[0], to[1], to[0]);
}

export function formatMiles(miles: number | null): string {
  if (miles === null) return "";
  if (miles < 0.1) return "< 0.1 mi";
  if (miles < 10) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles).toLocaleString("en-US")} mi`;
}
