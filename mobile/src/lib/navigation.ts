import type { Href } from "expo-router";

export function toHref(path: string): Href {
  return path as Href;
}
