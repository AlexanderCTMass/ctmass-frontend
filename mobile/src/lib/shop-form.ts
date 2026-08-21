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

export function getCategoryConfig(category: string): CategoryConfig {
  switch (category) {
    case SHOP_CATEGORIES.SPECIAL_OFFER:
      return {
        showAddress: true,
        showItems: false,
        title: "Submit Your Offer",
        intro:
          "Tell us about the deal you want to post. Our team will reach out to confirm details and publish it.",
        submitLabel: "Submit Offer",
        messageLabel: "Your Offer / Message",
        messagePlaceholder:
          "Describe your service, product, or quick deal — pricing, terms, availability...",
        messageRequired: true,
      };
    case SHOP_CATEGORIES.MERCHANDISE:
      return {
        showAddress: true,
        showItems: true,
        title: "Place Your Order",
        intro:
          "Choose sizes and quantities for your order. Our team will confirm shipping details with you.",
        submitLabel: "Confirm Order",
        messageLabel: "Additional Notes (optional)",
        messagePlaceholder: "Anything you want us to know about your order?",
        messageRequired: false,
      };
    case SHOP_CATEGORIES.CONSTRUCTION:
      return {
        showAddress: true,
        showItems: false,
        title: "Request This Construction Deal",
        intro:
          "Tell us a bit about your project — preferred dates, site details, any photos. We will reach out shortly.",
        submitLabel: "Confirm Order",
        messageLabel: "Project Details / Message",
        messagePlaceholder: "Describe your project, preferred dates, address details...",
        messageRequired: true,
      };
    case SHOP_CATEGORIES.IT_SERVICES:
      return {
        showAddress: false,
        showItems: false,
        title: "Request This Service",
        intro:
          "Share your idea — goals, scope, reference links. Our team will get back to you to scope it out.",
        submitLabel: "Confirm Order",
        messageLabel: "Project Brief / Message",
        messagePlaceholder: "Goals, scope, deadlines, reference links...",
        messageRequired: true,
      };
    default:
      return {
        showAddress: true,
        showItems: false,
        title: "Confirm Purchase",
        intro: "Please review your order details.",
        submitLabel: "Confirm Order",
        messageLabel: "Message (optional)",
        messagePlaceholder: "Anything we should know?",
        messageRequired: false,
      };
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
