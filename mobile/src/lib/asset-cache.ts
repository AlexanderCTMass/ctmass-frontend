import { Directory, File, Paths } from "expo-file-system";

type Namespace = "ads" | "shop";

const ROOT = "asset-cache";
const resolved = new Map<string, string>();
const inflight = new Map<string, Promise<string | null>>();

function hash(input: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function extensionOf(url: string): string {
  const path = safeDecode(url.split("?")[0]);
  const match = /\.(jpe?g|png|webp|gif|avif|heic)$/i.exec(path);
  return match ? `.${match[1].toLowerCase()}` : ".img";
}

function fileName(url: string): string {
  return `${hash(url)}${extensionOf(url)}`;
}

function directory(namespace: Namespace): Directory {
  const dir = new Directory(Paths.cache, ROOT, namespace);
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

function isRemote(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export function resolveAssetUri(
  namespace: Namespace,
  url: string | null | undefined,
): string | null {
  if (!url) return null;
  if (!isRemote(url)) return url;
  const key = `${namespace}:${url}`;
  const hit = resolved.get(key);
  if (hit) return hit;
  try {
    const file = new File(Paths.cache, ROOT, namespace, fileName(url));
    if (file.exists && (file.size ?? 0) > 0) {
      resolved.set(key, file.uri);
      return file.uri;
    }
    return url;
  } catch {
    return url;
  }
}

function removeQuietly(file: File) {
  try {
    if (file.exists) file.delete();
  } catch {
    return;
  }
}

function download(namespace: Namespace, url: string): Promise<string | null> {
  const key = `${namespace}:${url}`;
  const cached = resolved.get(key);
  if (cached) return Promise.resolve(cached);
  const pending = inflight.get(key);
  if (pending) return pending;

  const task = (async () => {
    const dir = directory(namespace);
    const target = new File(dir, fileName(url));
    if (target.exists && (target.size ?? 0) > 0) {
      resolved.set(key, target.uri);
      return target.uri;
    }
    const temp = new File(dir, `${fileName(url)}.part`);
    try {
      removeQuietly(temp);
      await File.downloadFileAsync(url, temp, { idempotent: true });
      await temp.move(target, { overwrite: true });
      resolved.set(key, target.uri);
      return target.uri;
    } catch {
      removeQuietly(temp);
      return null;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, task);
  return task;
}

export async function cacheAssets(
  namespace: Namespace,
  urls: string[],
  { prune = false }: { prune?: boolean } = {},
): Promise<void> {
  const unique = Array.from(
    new Set(urls.filter((url) => url && isRemote(url))),
  );
  const queue = [...unique];
  const workers = Array.from(
    { length: Math.min(3, queue.length) },
    async () => {
      while (queue.length > 0) {
        const next = queue.shift();
        if (next) await download(namespace, next);
      }
    },
  );
  await Promise.all(workers);
  if (prune) pruneAssets(namespace, unique);
}

function pruneAssets(namespace: Namespace, keepUrls: string[]) {
  try {
    const keep = new Set(keepUrls.map(fileName));
    const dir = directory(namespace);
    for (const entry of dir.list()) {
      if (entry instanceof File && !keep.has(entry.name)) removeQuietly(entry);
    }
    for (const key of Array.from(resolved.keys())) {
      if (!key.startsWith(`${namespace}:`)) continue;
      const url = key.slice(namespace.length + 1);
      if (!keep.has(fileName(url))) resolved.delete(key);
    }
  } catch {
    resolved.clear();
  }
}
