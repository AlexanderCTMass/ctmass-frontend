import { getLocales } from "expo-localization";
import i18n, { type TFunction } from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";

import { en } from "@/locales/en";
import { es } from "@/locales/es";
import { esData } from "@/locales/es/data";

export const SUPPORTED_LANGUAGES = ["en", "es"] as const;

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export type Translate = TFunction;

const DATE_LOCALES: Record<AppLanguage, string> = {
  en: "en-US",
  es: "es-US",
};

export function isAppLanguage(value: unknown): value is AppLanguage {
  return SUPPORTED_LANGUAGES.includes(value as AppLanguage);
}

export function detectDeviceLanguage(): AppLanguage {
  for (const locale of getLocales()) {
    const code = (locale.languageCode ?? locale.languageTag)
      .split(/[-_]/)[0]
      ?.toLowerCase();
    if (isAppLanguage(code)) return code;
  }
  return "en";
}

export function initI18n(language: AppLanguage): void {
  if (i18n.isInitialized) {
    if (i18n.language !== language) void i18n.changeLanguage(language);
    return;
  }
  void i18n.use(initReactI18next).init({
    compatibilityJSON: "v4",
    resources: {
      en: { translation: en, data: {} },
      es: { translation: es, data: esData },
    },
    ns: ["translation", "data"],
    defaultNS: "translation",
    lng: language,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    returnNull: false,
  });
}

type LooseTranslate = (key: string, options: Record<string, unknown>) => string;

export function translateData(t: Translate, value: string): string {
  if (!value) return value;
  return (t as unknown as LooseTranslate)(value, {
    ns: "data",
    keySeparator: false,
    nsSeparator: false,
    defaultValue: value,
  });
}

export function translateKey(t: Translate, key: string | undefined): string {
  if (!key) return "";
  if (!i18n.exists(key)) return key;
  return (t as unknown as LooseTranslate)(key, {});
}

export function useT() {
  const { t, i18n: instance } = useTranslation();
  const language: AppLanguage = isAppLanguage(instance.language)
    ? instance.language
    : "en";
  const tx = (value: string) => translateData(t, value);
  return { t, tx, language, locale: DATE_LOCALES[language] };
}

export function currentLanguage(): AppLanguage {
  return isAppLanguage(i18n.language) ? i18n.language : "en";
}

export function dateLocale(language: AppLanguage = currentLanguage()): string {
  return DATE_LOCALES[language];
}

export default i18n;
