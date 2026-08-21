import Constants from "expo-constants";

import { externalApi } from "@/lib/http";

export type GeoPlace = {
  id: string;
  place_name: string;
  text: string;
  center: [number, number];
  geometry: { type: "Point"; coordinates: [number, number] };
};

export const US_COUNTRY_CODE = "us";

export const US_MAP_MAX_BOUNDS: [[number, number], [number, number]] = [
  [-179.9, 15.0],
  [-63.0, 72.0],
];

export const US_ONLY_LOCATION_MESSAGE =
  "CTMASS is available in the United States only. Please pick a US address.";

function getToken(): string {
  const raw: unknown = Constants.expoConfig?.extra?.mapboxToken;
  return typeof raw === "string" ? raw : "";
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function toArray(value: unknown): unknown[] {
  return Array.isArray(value) ? (value as unknown[]) : [];
}

function toCenter(value: unknown): [number, number] | null {
  if (!Array.isArray(value) || value.length < 2) return null;
  const lng = Number(value[0]);
  const lat = Number(value[1]);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
  return [lng, lat];
}

function isUsCountryCode(value: unknown): boolean {
  const code = typeof value === "string" ? value.trim().toLowerCase() : "";
  return code === US_COUNTRY_CODE || code.startsWith(`${US_COUNTRY_CODE}-`);
}

function isUsFeature(feature: unknown): boolean {
  const data = asRecord(feature);

  const context = toArray(data.context);
  const countryContext = context.find((item) => {
    const entry = asRecord(item);
    return typeof entry.id === "string" && entry.id.startsWith("country");
  });
  if (countryContext) {
    return isUsCountryCode(asRecord(countryContext).short_code);
  }

  const shortCode = asRecord(data.properties).short_code;
  if (shortCode) {
    return isUsCountryCode(shortCode);
  }

  const placeName = typeof data.place_name === "string" ? data.place_name : "";
  return /(^|,\s*)united states$/i.test(placeName.trim());
}

function mapFeature(feature: unknown): GeoPlace | null {
  const data = asRecord(feature);
  const center = toCenter(data.center);
  if (!center) return null;
  const placeName = typeof data.place_name === "string" ? data.place_name : "";
  const text = typeof data.text === "string" ? data.text : placeName;
  const id =
    typeof data.id === "string" ? data.id : `manual-${placeName || text}`;
  return {
    id,
    place_name: placeName || text,
    text: text || placeName,
    center,
    geometry: { type: "Point", coordinates: center },
  };
}

export async function searchPlaces(queryText: string): Promise<GeoPlace[]> {
  const token = getToken();
  const trimmed = queryText.trim();
  if (!token || trimmed.length < 3) return [];

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(trimmed)}.json`;

  try {
    const response = await externalApi.get<unknown>(url, {
      params: {
        country: US_COUNTRY_CODE,
        autocomplete: true,
        limit: 6,
        access_token: token,
      },
    });
    const features = toArray(asRecord(response.data).features);
    return features
      .filter(isUsFeature)
      .map(mapFeature)
      .filter((place): place is GeoPlace => place !== null);
  } catch {
    return [];
  }
}

export async function reverseGeocode(
  lng: number,
  lat: number,
): Promise<GeoPlace | null> {
  const token = getToken();
  if (!token) return null;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`;

  try {
    const response = await externalApi.get<unknown>(url, {
      params: { country: US_COUNTRY_CODE, limit: 1, access_token: token },
    });
    const features = toArray(asRecord(response.data).features);
    const match = features.find(isUsFeature);
    if (!match) return null;
    return mapFeature(match);
  } catch {
    return null;
  }
}

export function getMapboxToken(): string {
  return getToken();
}
