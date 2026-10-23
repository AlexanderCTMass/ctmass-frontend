import { getApp } from "@react-native-firebase/app";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";

import { getFirebaseAuth } from "@/lib/firebase";

const FUNCTIONS_REGION = "us-central1";

export const CALENDLY_URL =
  "https://calendly.com/ctmass-support/cutting-edge-software-development";

export type InquirySource =
  | "app"
  | "app-onboarding"
  | "app-shop"
  | "app-profile";

export const INQUIRY_SOURCES: InquirySource[] = [
  "app",
  "app-onboarding",
  "app-shop",
  "app-profile",
];

export type ServiceInquiry = {
  email: string;
  services: string[];
  message: string;
  name?: string;
  source?: InquirySource;
  booking?: boolean;
  meta?: InquiryMeta;
};

export type InquiryMeta = {
  formMs: number;
  signedIn: boolean;
  appVersion: string;
  platform: string;
  osVersion: string;
  deviceModel: string;
  deviceBrand: string;
  isDevice: boolean;
};

export function collectInquiryMeta(
  formOpenedAt: number,
  signedIn: boolean,
): InquiryMeta {
  return {
    formMs: Math.max(0, Date.now() - formOpenedAt),
    signedIn,
    appVersion: Constants.expoConfig?.version ?? "",
    platform: Platform.OS,
    osVersion: Device.osVersion ?? "",
    deviceModel: Device.modelName ?? "",
    deviceBrand: Device.brand ?? Device.manufacturer ?? "",
    isDevice: Device.isDevice,
  };
}

export function buildProjectDetails(
  services: string[],
  message: string,
): string {
  return [
    services.length ? `Services: ${services.join(", ")}` : "",
    message.trim(),
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildCalendlyUrl(input: {
  name?: string;
  email?: string;
  details?: string;
  source: InquirySource;
}): string {
  const params: Record<string, string> = {
    embed_domain: "ctmass.com",
    embed_type: "Inline",
    hide_gdpr_banner: "1",
    utm_source: "ctmass-app",
    utm_medium: input.source,
    utm_campaign: "it-consultation",
  };
  if (input.name?.trim()) params.name = input.name.trim();
  if (input.email?.trim()) params.email = input.email.trim();
  if (input.details?.trim()) params.a1 = input.details.trim().slice(0, 1500);
  const query = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  return `${CALENDLY_URL}?${query}`;
}

type CallableError = { error?: { message?: string } };

export async function sendServiceInquiry(input: ServiceInquiry): Promise<void> {
  const projectId = getApp().options.projectId;
  if (!projectId) throw new Error("Missing Firebase project configuration.");

  const url = `https://${FUNCTIONS_REGION}-${projectId}.cloudfunctions.net/sendServiceInquiry`;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const user = getFirebaseAuth().currentUser;
  if (user) {
    try {
      headers.Authorization = `Bearer ${await user.getIdToken()}`;
    } catch {
      // ignore — inquiry works without auth
    }
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      data: {
        email: input.email,
        services: input.services,
        message: input.message,
        name: input.name ?? "",
        source: input.source ?? "app",
        booking: input.booking === true,
        meta: input.meta ?? null,
      },
    }),
  });

  if (!response.ok) {
    let message = "We couldn't send your message. Please try again.";
    try {
      const body = (await response.json()) as CallableError;
      if (body.error?.message) message = body.error.message;
    } catch {
      // response had no JSON body — keep the default message
    }
    throw new Error(message);
  }
}
