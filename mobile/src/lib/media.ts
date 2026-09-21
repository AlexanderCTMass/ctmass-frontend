import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export async function pickImage(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 0.7,
  });

  if (result.canceled) return null;
  return result.assets[0]?.uri ?? null;
}

export async function takePhoto(): Promise<string | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 0.7,
  });

  if (result.canceled) return null;
  return result.assets[0]?.uri ?? null;
}

export function choosePhoto(): Promise<string | null> {
  return new Promise((resolve) => {
    Alert.alert(
      "Add a photo",
      undefined,
      [
        {
          text: "Take photo",
          onPress: () => {
            void takePhoto().then(resolve);
          },
        },
        {
          text: "Choose from library",
          onPress: () => {
            void pickImage().then(resolve);
          },
        },
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => resolve(null),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(null) },
    );
  });
}

export type PickedVideo = { uri: string; durationMs: number | null };

const MAX_VIDEO_SECONDS = 90;

export async function pickVideo(): Promise<PickedVideo | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["videos"],
    videoMaxDuration: MAX_VIDEO_SECONDS,
    quality: 0.7,
  });

  if (result.canceled) return null;
  const asset = result.assets[0];
  if (!asset?.uri) return null;
  return { uri: asset.uri, durationMs: asset.duration ?? null };
}

export async function recordVideo(): Promise<PickedVideo | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["videos"],
    videoMaxDuration: MAX_VIDEO_SECONDS,
    quality: 0.7,
  });

  if (result.canceled) return null;
  const asset = result.assets[0];
  if (!asset?.uri) return null;
  return { uri: asset.uri, durationMs: asset.duration ?? null };
}

export function chooseVideo(): Promise<PickedVideo | null> {
  return new Promise((resolve) => {
    Alert.alert(
      "Add a video",
      "Videos can be up to 90 seconds.",
      [
        {
          text: "Record video",
          onPress: () => {
            void recordVideo().then(resolve);
          },
        },
        {
          text: "Choose from library",
          onPress: () => {
            void pickVideo().then(resolve);
          },
        },
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => resolve(null),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(null) },
    );
  });
}
