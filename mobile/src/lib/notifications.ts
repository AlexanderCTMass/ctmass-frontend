import { getApp } from "@react-native-firebase/app";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "@react-native-firebase/firestore";
import {
  AuthorizationStatus,
  getInitialNotification,
  getMessaging,
  getToken,
  hasPermission,
  onNotificationOpenedApp,
  onTokenRefresh,
  requestPermission,
} from "@react-native-firebase/messaging";

import { getDb } from "@/lib/firebase";

export type NotificationPrefs = {
  messages: boolean;
  projectResponses: boolean;
  newProjects: boolean;
  inactivity: boolean;
};

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  messages: true,
  projectResponses: true,
  newProjects: true,
  inactivity: true,
};

function messaging() {
  return getMessaging(getApp());
}

function isGranted(status: number): boolean {
  return (
    status === AuthorizationStatus.AUTHORIZED ||
    status === AuthorizationStatus.PROVISIONAL
  );
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const status = await requestPermission(messaging());
    return isGranted(status);
  } catch {
    return false;
  }
}

export async function hasNotificationPermission(): Promise<boolean> {
  try {
    const status = await hasPermission(messaging());
    return isGranted(status);
  } catch {
    return false;
  }
}

async function addToken(uid: string, token: string): Promise<void> {
  await updateDoc(doc(getDb(), "profiles", uid), {
    fcmTokens: arrayUnion(token),
  });
}

export async function registerFcmToken(uid: string): Promise<void> {
  try {
    if (!(await hasNotificationPermission())) return;
    const token = await getToken(messaging());
    if (token) await addToken(uid, token);
  } catch (error) {
    console.warn("registerFcmToken error", error);
  }
}

export async function unregisterFcmToken(uid: string): Promise<void> {
  try {
    const token = await getToken(messaging());
    if (token) {
      await updateDoc(doc(getDb(), "profiles", uid), {
        fcmTokens: arrayRemove(token),
      });
    }
  } catch {
    // ignore
  }
}

export function subscribeTokenRefresh(
  uid: string,
  onError?: (error: unknown) => void,
): () => void {
  return onTokenRefresh(messaging(), (token) => {
    addToken(uid, token).catch((error) => onError?.(error));
  });
}

export type PushData = Record<string, string> | undefined;

export function subscribeNotificationOpen(
  onOpen: (data: PushData) => void,
): () => void {
  return onNotificationOpenedApp(messaging(), (message) => {
    onOpen(message?.data as PushData);
  });
}

export async function getInitialNotificationData(): Promise<PushData> {
  const message = await getInitialNotification(messaging());
  return message?.data as PushData;
}

export async function updateLastSeen(uid: string): Promise<void> {
  try {
    await updateDoc(doc(getDb(), "profiles", uid), {
      lastSeen: serverTimestamp(),
    });
  } catch {
    // ignore
  }
}

export async function fetchNotificationPrefs(
  uid: string,
): Promise<NotificationPrefs> {
  try {
    const snapshot = await getDoc(doc(getDb(), "profiles", uid));
    const raw = snapshot.exists() ? snapshot.data() : undefined;
    const prefs =
      raw && typeof raw === "object"
        ? (raw as Record<string, unknown>).notificationPrefs
        : undefined;
    if (prefs && typeof prefs === "object") {
      const p = prefs as Record<string, unknown>;
      return {
        messages: p.messages !== false,
        projectResponses: p.projectResponses !== false,
        newProjects: p.newProjects !== false,
        inactivity: p.inactivity !== false,
      };
    }
  } catch {
    // fall through to defaults
  }
  return { ...DEFAULT_NOTIFICATION_PREFS };
}

export async function updateNotificationPrefs(
  uid: string,
  prefs: NotificationPrefs,
): Promise<void> {
  await updateDoc(doc(getDb(), "profiles", uid), { notificationPrefs: prefs });
}
