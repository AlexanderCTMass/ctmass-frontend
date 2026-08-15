import type { ConfigContext, ExpoConfig } from "expo/config";

const APP_VARIANT = process.env.APP_VARIANT ?? "development";
const IS_PRODUCTION = APP_VARIANT === "production";
const IS_PREVIEW = APP_VARIANT === "preview";

const bundleId = IS_PRODUCTION ? "com.ctmass.app" : "com.ctmass.app.stage";

const appName = IS_PRODUCTION
  ? "CTMASS"
  : IS_PREVIEW
    ? "CTMASS (Preview)"
    : "CTMASS (Dev)";

const androidGoogleServices = IS_PRODUCTION
  ? "./google-services.json"
  : "./google-services.stage.json";

const iosGoogleServices = IS_PRODUCTION
  ? "./GoogleService-Info.plist"
  : "./GoogleService-Info.stage.plist";

const googleWebClientId = IS_PRODUCTION
  ? "175487937461-s0vslbp5628tbr5ccg58k146nljf5hd4.apps.googleusercontent.com"
  : "973370417522-t6u1d4l2lafggelv3shv7hdhig71q718.apps.googleusercontent.com";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: appName,
  slug: config.slug ?? "ctmass",
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
  },
});
