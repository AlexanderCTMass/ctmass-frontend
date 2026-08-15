import Constants from "expo-constants";

import { externalApi } from "@/lib/http";

export type GeoPlace = {
  id: string;
  place_name: string;
  text: string;
  center: [number, number];
  geometry: { type: "Point"; coordinates: [number, number] };
};

function getToken(): string {
  const raw: unknown = Constants.expoConfig?.extra?.mapboxToken;
  return typeof raw === "string" ? raw : "";
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function toCenter(value: unknown): [number, number] | null {
  if (!Array.isArray(value) || value.length < 2) return null;
  const lng = Number(value[0]);
  const lat = Number(value[1]);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
  return [lng, lat];
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
        country: "us",
        autocomplete: true,
        limit: 6,
        access_token: token,
      },
    });
    const features = asRecord(response.data).features;
    if (!Array.isArray(features)) return [];
    return features
      .map(mapFeature)
      .filter((place): place is GeoPlace => place !== null);
  } catch {
    return [];
  }
}

export function staticMapUrl(
  center: [number, number],
  width = 600,
  height = 220,
): string {
  const token = getToken();
  const [lng, lat] = center;
  const marker = `pin-l+16b364(${lng},${lat})`;
  return (
    `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${marker}/` +
    `${lng},${lat},12,0/${width}x${height}@2x?access_token=${token}`
  );
}
