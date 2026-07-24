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
