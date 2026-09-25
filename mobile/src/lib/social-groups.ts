import { doc, serverTimestamp, setDoc } from "@react-native-firebase/firestore";

import {
  SOCIAL_GROUP_OPTION_MAP,
  type SocialGroupOption,
  humanizeSocialGroupValue,
} from "@/constants/social-groups";
import { getDb } from "@/lib/firebase";

export type SocialGroup = SocialGroupOption;

function optionFor(value: string): SocialGroup {
  const fallback = SOCIAL_GROUP_OPTION_MAP[value];
  return {
    value,
    label: fallback?.label || humanizeSocialGroupValue(value),
    icon: fallback?.icon || "🌟",
    description: fallback?.description || "",
  };
}

export function normalizeSocialGroups(raw: unknown): SocialGroup[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: SocialGroup[] = [];
  for (const item of raw) {
    let value = "";
    let label = "";
    let icon = "";
    let description = "";
    if (typeof item === "string") {
      value = item;
    } else if (item && typeof item === "object") {
      const record = item as Record<string, unknown>;
      value = typeof record.value === "string" ? record.value : "";
      label = typeof record.label === "string" ? record.label : "";
      icon = typeof record.icon === "string" ? record.icon : "";
      description =
        typeof record.description === "string" ? record.description : "";
    }
    if (!value || seen.has(value)) continue;
    seen.add(value);
    const fallback = optionFor(value);
    out.push({
      value,
      label: label || fallback.label,
      icon: icon || fallback.icon,
      description: description || fallback.description,
    });
  }
  return out;
}

export function buildSocialGroupPayload(values: string[]): SocialGroup[] {
  const seen = new Set<string>();
  const out: SocialGroup[] = [];
  for (const value of values) {
    if (!value || seen.has(value)) continue;
    seen.add(value);
    out.push(optionFor(value));
  }
  return out;
}

export async function updateSocialGroups(
  uid: string,
  groups: SocialGroup[],
): Promise<void> {
  const db = getDb();
  await setDoc(
    doc(db, "profiles", uid),
    { socialGroups: groups, socialGroupsUpdatedAt: serverTimestamp() },
    { merge: true },
  );
}
