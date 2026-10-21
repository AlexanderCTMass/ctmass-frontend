import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const isNative = Platform.OS === "ios" || Platform.OS === "android";

export function tapFeedback() {
  if (!isNative) return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function selectFeedback() {
  if (!isNative) return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export function successFeedback() {
  if (!isNative) return;
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export function warningFeedback() {
  if (!isNative) return;
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}

export function errorFeedback() {
  if (!isNative) return;
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

export function tickFeedback() {
  if (!isNative) return;
  void Haptics.selectionAsync();
}

export function likeFeedback() {
  if (!isNative) return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  setTimeout(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, 110);
}

export function archiveFeedback() {
  if (!isNative) return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
}
