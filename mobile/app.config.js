const APP_VARIANT = process.env.APP_VARIANT ?? "development";
const IS_PRODUCTION = APP_VARIANT === "production";
const IS_PREVIEW = APP_VARIANT === "preview";

const IOS_VERSION = "1.1.0";
const ANDROID_VERSION = "1.0.0";
const appVersion =
  process.env.EAS_BUILD_PLATFORM === "android" ? ANDROID_VERSION : IOS_VERSION;

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

const clarityProjectId = IS_PRODUCTION ? "ygatc0nqri" : "ygaubhpifs";

const amplitudeApiKey = "8b7d29a4ff83204a256b894c280e30e5";

module.exports = ({ config }) => ({
  ...config,
  version: appVersion,
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
    infoPlist: {
      ...(config.ios?.infoPlist ?? {}),
      ITSAppUsesNonExemptEncryption: false,
    },
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
    clarityProjectId: process.env.CLARITY_PROJECT_ID ?? clarityProjectId,
    amplitudeApiKey: process.env.AMPLITUDE_API_KEY ?? amplitudeApiKey,
  },
});
