import { getApp } from "@react-native-firebase/app";
import {
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
