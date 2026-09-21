import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "@react-native-firebase/firestore";

import { getDb } from "@/lib/firebase";
import { deleteImage, uploadFile } from "@/lib/storage-upload";

export type VideoMediaType = "image" | "video";

export type VideoContentItem = {
  type: VideoMediaType;
  url: string;
  path: string;
};

export type VideoStory = {
  id: string;
  userId: string;
  title: string;
  description: string;
  preview: string;
  previewPath: string;
  content: VideoContentItem[];
  views: number;
  likes: number;
  likedBy: string[];
  hidden: boolean;
  createdAtSeconds: number;
};

export type NewVideoItem = { type: VideoMediaType; uri: string };

export type NewVideo = {
  title: string;
  description: string;
  previewUri: string;
  content: NewVideoItem[];
};

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function num(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function mapContent(value: unknown): VideoContentItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item): VideoContentItem => {
      const raw =
        item && typeof item === "object"
          ? (item as Record<string, unknown>)
          : {};
      return {
        type: raw.type === "video" ? "video" : "image",
        url: str(raw.url),
        path: str(raw.path),
      };
    })
    .filter((item) => item.url.length > 0);
}

function mapVideo(id: string, data: Record<string, unknown>): VideoStory {
  const createdAt = data.createdAt;
  const seconds =
    createdAt && typeof createdAt === "object"
      ? num((createdAt as Record<string, unknown>).seconds)
      : 0;
  return {
    id,
    userId: str(data.userId),
    title: str(data.title),
    description: str(data.description),
    preview: str(data.preview),
    previewPath: str(data.previewPath),
    content: mapContent(data.content),
    views: num(data.views),
    likes: num(data.likes),
    likedBy: Array.isArray(data.likedBy)
      ? data.likedBy.filter((item): item is string => typeof item === "string")
      : [],
    hidden: data.hidden === true,
    createdAtSeconds: seconds,
  };
}

export async function fetchUserVideos(
  userId: string,
  includeHidden = false,
): Promise<VideoStory[]> {
  if (!userId) return [];
  const db = getDb();
  const snapshot = await getDocs(
    query(collection(db, "reels"), where("userId", "==", userId)),
  );
  return snapshot.docs
    .map((docSnap) =>
      mapVideo(docSnap.id, (docSnap.data() ?? {}) as Record<string, unknown>),
    )
    .filter((video) => includeHidden || !video.hidden)
    .filter((video) => video.preview.length > 0 && video.content.length > 0)
    .sort((a, b) => b.createdAtSeconds - a.createdAtSeconds);
}

export function getVideoMediaUrls(video: VideoStory): string[] {
  const urls = [video.preview, ...video.content.map((item) => item.url)];
  return urls.filter((url) => url.length > 0);
}

async function uploadVideoAsset(
  userId: string,
  kind: "preview" | "content",
  index: number,
  item: NewVideoItem,
): Promise<{ url: string; path: string }> {
  const ext = item.type === "video" ? "mp4" : "jpg";
  const path = `reels/${userId}/${kind}/${Date.now()}_${index}.${ext}`;
  const url = await uploadFile(item.uri, path);
  return { url, path };
}

export async function addVideo(
  userId: string,
  input: NewVideo,
): Promise<VideoStory> {
  const db = getDb();
  const ref = doc(collection(db, "reels"));

  const preview = await uploadVideoAsset(userId, "preview", 0, {
    type: "image",
    uri: input.previewUri,
  });

  const content: VideoContentItem[] = [];
  for (let i = 0; i < input.content.length; i += 1) {
    const uploaded = await uploadVideoAsset(userId, "content", i, input.content[i]);
    content.push({
      type: input.content[i].type,
      url: uploaded.url,
      path: uploaded.path,
    });
  }

  const payload = {
    userId,
    title: input.title,
    description: input.description,
    preview: preview.url,
    previewPath: preview.path,
    content,
    views: 0,
    likes: 0,
    likedBy: [] as string[],
    hidden: false,
    reportsCount: 0,
    source: "mobile",
    createdAt: serverTimestamp(),
  };

  await setDoc(ref, payload);

  return {
    id: ref.id,
    userId,
    title: input.title,
    description: input.description,
    preview: preview.url,
    previewPath: preview.path,
    content,
    views: 0,
    likes: 0,
    likedBy: [],
    hidden: false,
    createdAtSeconds: Math.floor(Date.now() / 1000),
  };
}

export async function deleteVideo(video: VideoStory): Promise<void> {
  const urls = getVideoMediaUrls(video);
  await Promise.all(urls.map((url) => deleteImage(url).catch(() => undefined)));
  const db = getDb();
  await deleteDoc(doc(db, "reels", video.id));
}

export async function incrementVideoViews(id: string): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, "reels", id), { views: increment(1) });
}

export async function toggleVideoLike(
  id: string,
  userId: string,
  liked: boolean,
): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, "reels", id), {
    likes: increment(liked ? 1 : -1),
    likedBy: liked ? arrayUnion(userId) : arrayRemove(userId),
  });
}

export async function reportVideo(
  videoId: string,
  ownerId: string,
  reporterId: string,
  reason: string,
): Promise<void> {
  const db = getDb();
  await setDoc(doc(db, "videoReports", `${videoId}_${reporterId}`), {
    videoId,
    ownerId,
    reporterId,
    reason,
    source: "mobile",
    createdAt: serverTimestamp(),
  });
}
