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

export async function reverseGeocode(
  lng: number,
  lat: number,
): Promise<GeoPlace | null> {
  const token = getToken();
  if (!token) return null;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`;

  try {
    const response = await externalApi.get<unknown>(url, {
      params: { limit: 1, access_token: token },
    });
    const features = asRecord(response.data).features;
    if (!Array.isArray(features) || features.length === 0) {
      return {
        id: `manual-${lng},${lat}`,
        place_name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        text: "Selected location",
        center: [lng, lat],
        geometry: { type: "Point", coordinates: [lng, lat] },
      };
    }
    return mapFeature(features[0]);
  } catch {
    return null;
  }
}

export function getMapboxToken(): string {
  return getToken();
}
