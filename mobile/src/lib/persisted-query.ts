import { storage } from "@/lib/storage";

type Envelope<T> = { savedAt: number; data: T };

const PREFIX = "query-cache.";

export function readPersisted<T>(key: string): Envelope<T> | undefined {
  try {
    const raw = storage.getString(`${PREFIX}${key}`);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as Envelope<T>;
    if (!parsed || typeof parsed.savedAt !== "number") return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

export function writePersisted<T>(key: string, data: T): void {
  try {
    const envelope: Envelope<T> = { savedAt: Date.now(), data };
    storage.set(`${PREFIX}${key}`, JSON.stringify(envelope));
  } catch {
    storage.remove(`${PREFIX}${key}`);
  }
}
