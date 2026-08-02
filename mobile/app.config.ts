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
});
