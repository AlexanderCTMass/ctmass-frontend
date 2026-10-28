import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import i18n from "@/lib/i18n";

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
      i18n.t("media.addPhoto"),
      undefined,
      [
        {
          text: i18n.t("media.takePhoto"),
          onPress: () => {
            void takePhoto().then(resolve);
          },
        },
        {
          text: i18n.t("media.chooseLibrary"),
          onPress: () => {
            void pickImage().then(resolve);
          },
        },
        {
          text: i18n.t("common.cancel"),
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
      i18n.t("media.addVideo"),
      i18n.t("media.videoLimit", { count: MAX_VIDEO_SECONDS }),
      [
        {
          text: i18n.t("media.recordVideo"),
          onPress: () => {
            void recordVideo().then(resolve);
          },
        },
        {
          text: i18n.t("media.chooseLibrary"),
          onPress: () => {
            void pickVideo().then(resolve);
          },
        },
        {
          text: i18n.t("common.cancel"),
          style: "cancel",
          onPress: () => resolve(null),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(null) },
    );
  });
}
