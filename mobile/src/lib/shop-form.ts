import type { Translate } from "@/lib/i18n";
import { SHOP_CATEGORIES, type ShopFeature } from "@/lib/shop";

const APPAREL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

export type CategoryConfig = {
  showAddress: boolean;
  showItems: boolean;
  title: string;
  intro: string;
  submitLabel: string;
  messageLabel: string;
  messagePlaceholder: string;
  messageRequired: boolean;
};

function configFor(
  kind: "offer" | "merch" | "construction" | "it" | "default",
  showAddress: boolean,
  showItems: boolean,
  messageRequired: boolean,
  t: Translate,
): CategoryConfig {
  return {
    showAddress,
    showItems,
    title: t(`shop.form.${kind}.title`),
    intro: t(`shop.form.${kind}.intro`),
    submitLabel: t(`shop.form.${kind}.submit`),
    messageLabel: t(`shop.form.${kind}.messageLabel`),
    messagePlaceholder: t(`shop.form.${kind}.messagePlaceholder`),
    messageRequired,
  };
}

export function getCategoryConfig(
  category: string,
  t: Translate,
): CategoryConfig {
  switch (category) {
    case SHOP_CATEGORIES.SPECIAL_OFFER:
      return configFor("offer", true, false, true, t);
    case SHOP_CATEGORIES.MERCHANDISE:
      return configFor("merch", true, true, false, t);
    case SHOP_CATEGORIES.CONSTRUCTION:
      return configFor("construction", true, false, true, t);
    case SHOP_CATEGORIES.IT_SERVICES:
      return configFor("it", false, false, true, t);
    default:
      return configFor("default", true, false, false, t);
  }
}

export function getSizeOptions(feature: ShopFeature): string[] {
  const raw = feature.metadata?.sizeOptions;
  if (Array.isArray(raw)) return raw;
  return APPAREL_SIZES;
}

export function isValidUSPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return true;
  return digits.length === 11 && digits.startsWith("1");
}
