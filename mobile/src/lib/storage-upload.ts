import { getApp } from "@react-native-firebase/app";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  putFile,
  ref,
} from "@react-native-firebase/storage";

export async function uploadImage(
  localUri: string,
  path: string,
): Promise<string> {
  const storage = getStorage(getApp());
  const reference = ref(storage, path);
  await putFile(reference, localUri);
  return getDownloadURL(reference);
}

export async function deleteImage(url: string): Promise<void> {
  if (
    !url ||
    (!url.includes("firebasestorage.googleapis.com") &&
      !url.startsWith("gs://"))
  ) {
    return;
  }
  const storage = getStorage(getApp());
  await deleteObject(ref(storage, url));
}
