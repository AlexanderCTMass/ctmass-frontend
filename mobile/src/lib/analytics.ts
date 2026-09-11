import * as amplitude from "@amplitude/analytics-react-native";
import * as Clarity from "@microsoft/react-native-clarity";
import {
  getAnalytics,
  logScreenView,
  setUserId as setAnalyticsUserId,
  setUserProperties,
} from "@react-native-firebase/analytics";
import {
  getCrashlytics,
  recordError,
  setAttributes,
  setCrashlyticsCollectionEnabled,
  setUserId as setCrashlyticsUserId,
} from "@react-native-firebase/crashlytics";
import { getPerformance } from "@react-native-firebase/perf";
import Constants from "expo-constants";

export type AnalyticsUser = {
  uid: string;
  role: string | null;
  provider: string;
};

export type EventPropertyValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | string[]
  | number[];

export type EventProperties = Record<string, EventPropertyValue>;

function readExtra(key: string): string | undefined {
  const raw: unknown = Constants.expoConfig?.extra?.[key];
  return typeof raw === "string" && raw.length > 0 ? raw : undefined;
}

let initialized = false;
let identifiedUid: string | null = null;
let currentScreen: string | null = null;

export function initAnalytics(): void {
  if (initialized) return;
  initialized = true;

  const collectDiagnostics = !__DEV__;
  void setCrashlyticsCollectionEnabled(getCrashlytics(), collectDiagnostics);
  const performance = getPerformance();
  performance.dataCollectionEnabled = collectDiagnostics;
  performance.instrumentationEnabled = collectDiagnostics;

  const clarityProjectId = readExtra("clarityProjectId");
  if (clarityProjectId) {
    Clarity.initialize(clarityProjectId, {
      logLevel: __DEV__ ? Clarity.LogLevel.Verbose : Clarity.LogLevel.None,
    });
  } else {
    console.warn("Clarity project ID missing — session recording disabled");
  }

  const amplitudeApiKey = readExtra("amplitudeApiKey");
  if (amplitudeApiKey) {
    void amplitude.init(amplitudeApiKey, undefined, { autocapture: true })
      .promise;
  } else {
    console.warn("Amplitude API key missing — analytics disabled");
  }
}

export function identifyUser(user: AnalyticsUser | null): void {
  const analytics = getAnalytics();
  const crashlytics = getCrashlytics();

  if (!user) {
    if (identifiedUid) amplitude.reset();
    identifiedUid = null;
    void setAnalyticsUserId(analytics, null);
    void setCrashlyticsUserId(crashlytics, "");
    return;
  }

  const role = user.role ?? "none";
  identifiedUid = user.uid;

  void setAnalyticsUserId(analytics, user.uid);
  void setUserProperties(analytics, {
    role,
    auth_provider: user.provider,
  });

  void setCrashlyticsUserId(crashlytics, user.uid);
  void setAttributes(crashlytics, { role, auth_provider: user.provider });

  amplitude.setUserId(user.uid);
  const identity = new amplitude.Identify()
    .set("role", role)
    .set("auth_provider", user.provider);
  void amplitude.identify(identity).promise;

  void Clarity.setCustomUserId(user.uid);
  void Clarity.setCustomTag("role", role);
}

export function setAnalyticsUserProperties(
  properties: Record<string, string>,
): void {
  const identity = new amplitude.Identify();
  for (const [key, value] of Object.entries(properties)) {
    identity.set(key, value);
  }
  void amplitude.identify(identity).promise;
  void setUserProperties(getAnalytics(), properties);
  for (const [key, value] of Object.entries(properties)) {
    void Clarity.setCustomTag(key, value);
  }
}

export function getCurrentScreen(): string {
  return currentScreen ?? "unknown";
}

export function trackScreen(name: string): void {
  if (name === currentScreen) return;
  const previous = currentScreen;
  currentScreen = name;
  void logScreenView(getAnalytics(), {
    screen_name: name,
    screen_class: name,
  });
  void amplitude.track("screen_viewed", {
    screen: name,
    previous_screen: previous,
  }).promise;
  void Clarity.setCurrentScreenName(name);
}

export function trackEvent(name: string, properties?: EventProperties): void {
  void amplitude.track(name, properties).promise;
}

export function reportError(error: Error, context: string): void {
  recordError(getCrashlytics(), error, context);
}
