import type { ConfigContext, ExpoConfig } from "expo/config";

const APP_VARIANT = process.env.APP_VARIANT ?? "development";
const IS_PRODUCTION = APP_VARIANT === "production";
const IS_PREVIEW = APP_VARIANT === "preview";

const bundleId = IS_PRODUCTION ? "com.ctmass.app" : "com.ctmass.app.stage";

const appName = IS_PRODUCTION
  ? "CTMASS"
  : IS_PREVIEW
    ? "CTMASS: Homeowners & Pros"
    : "CTMASS: Homeowners & Pros";

const androidGoogleServices = IS_PRODUCTION
  ? "./google-services.json"
  : "./google-services.stage.json";

const iosGoogleServices = IS_PRODUCTION
  ? "./GoogleService-Info.plist"
  : "./GoogleService-Info.stage.plist";

const googleWebClientId = IS_PRODUCTION
  ? "175487937461-s0vslbp5628tbr5ccg58k146nljf5hd4.apps.googleusercontent.com"
  : "973370417522-t6u1d4l2lafggelv3shv7hdhig71q718.apps.googleusercontent.com";

const iosGoogleUrlScheme = IS_PRODUCTION
  ? "com.googleusercontent.apps.175487937461-0l8vgtl9kruv440vlcui997569qln3km"
  : "com.googleusercontent.apps.973370417522-iho8hrqfkqkvd1o4inqthflcqfvt75gc";

const webBaseUrl = IS_PRODUCTION
  ? "https://ctmass.com"
  : "https://ctmasstest.web.app";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: appName,
  slug: config.slug ?? "ctmass",
  plugins: [
    ...(config.plugins ?? []),
    [
      "@react-native-google-signin/google-signin",
      { iosUrlScheme: iosGoogleUrlScheme },
    ],
  ],
  ios: {
    ...config.ios,
    bundleIdentifier: bundleId,
    googleServicesFile: iosGoogleServices,
  },
  android: {
    ...config.android,
    package: bundleId,
    googleServicesFile: androidGoogleServices,
  },
  extra: {
    ...config.extra,
    googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID ?? googleWebClientId,
    mapboxToken: process.env.MAPBOX_TOKEN ?? null,
    webBaseUrl,
  },
});
