import { doc, getDoc } from "@react-native-firebase/firestore";

import {
  BUSINESS_ROLES,
  BUSINESS_STRUCTURES,
  CREW_SIZES,
  type PreferredContact,
} from "@/constants/trade-options";
import { getDb } from "@/lib/firebase";

export type BusinessDetails = {
  structure: string;
  crewSize: string;
  usesSubcontractors: boolean;
  role: string;
  foundedYear: number | null;
  languages: string[];
  website: string;
  paymentMethods: string[];
};

export type ContactSettings = {
  showPhone: boolean;
  showEmail: boolean;
  preferred: PreferredContact;
};

export type OwnerPublic = {
  uid: string;
  name: string;
  avatar: string;
  businessName: string;
  business: BusinessDetails;
  contact: ContactSettings;
  phone: string;
  email: string;
};

type Raw = Record<string, unknown>;

function record(value: unknown): Raw {
  return value && typeof value === "object" ? (value as Raw) : {};
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.length > 0)
    : [];
}

function pick(options: { value: string }[], value: unknown): string {
  return options.some((item) => item.value === value) ? (value as string) : "";
}

export const EMPTY_BUSINESS: BusinessDetails = {
  structure: "",
  crewSize: "",
  usesSubcontractors: false,
  role: "",
  foundedYear: null,
  languages: [],
  website: "",
  paymentMethods: [],
};

export function readBusiness(data: Raw): BusinessDetails {
  const raw = record(data.business);
  const founded = raw.foundedYear;
  return {
    structure: pick(BUSINESS_STRUCTURES, raw.structure),
    crewSize: pick(CREW_SIZES, raw.crewSize),
    usesSubcontractors: raw.usesSubcontractors === true,
    role: pick(BUSINESS_ROLES, raw.role),
    foundedYear:
      typeof founded === "number" && Number.isFinite(founded) ? founded : null,
    languages: strings(raw.languages),
    website: str(raw.website),
    paymentMethods: strings(raw.paymentMethods),
  };
}

export function readContactSettings(data: Raw): ContactSettings {
  const raw = data.contactSettings;
  if (!raw || typeof raw !== "object") {
    return { showPhone: true, showEmail: false, preferred: "message" };
  }
  const settings = record(raw);
  const preferred = str(settings.preferred);
  return {
    showPhone: settings.showPhone === true,
    showEmail: settings.showEmail === true,
    preferred:
      preferred === "phone" || preferred === "email" ? preferred : "message",
  };
}

export function yearsInBusiness(business: BusinessDetails): number | null {
  if (!business.foundedYear) return null;
  return Math.max(0, new Date().getFullYear() - business.foundedYear);
}

export function readOwnerPublic(uid: string, data: Raw): OwnerPublic {
  const contact = readContactSettings(data);
  const phone = str(data.phone) || str(data.phoneNumber);
  const email = str(data.email);
  return {
    uid,
    name: str(data.name) || str(data.businessName),
    avatar: str(data.avatar),
    businessName: str(data.businessName),
    business: readBusiness(data),
    contact,
    phone: contact.showPhone ? phone : "",
    email: contact.showEmail ? email : "",
  };
}

export async function fetchOwnerPublic(uid: string): Promise<OwnerPublic | null> {
  if (!uid) return null;
  const snapshot = await getDoc(doc(getDb(), "profiles", uid));
  if (!snapshot.exists()) return null;
  return readOwnerPublic(uid, record(snapshot.data()));
}

export function normalizeWebsite(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function websiteHost(value: string): string {
  return value.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}
