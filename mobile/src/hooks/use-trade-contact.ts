import { router } from "expo-router";
import { useState } from "react";
import { Alert, Linking } from "react-native";

import { useRequireAuth } from "@/hooks/use-require-auth";
import { type TradeActionSource, analyticsEvents } from "@/lib/analytics-events";
import type { OwnerPublic } from "@/lib/business-profile";
import { startChat } from "@/lib/chat";
import { tapFeedback } from "@/lib/haptics";
import { chatHref, toHref } from "@/lib/navigation";
import { useAuthStore } from "@/store/use-auth-store";
import { useProjectDraftStore } from "@/store/use-project-draft-store";

export type ContactTarget = {
  tradeId: string;
  ownerId: string;
  name: string;
  specialtyLabel: string;
  avatarUrl: string;
  owner: OwnerPublic | null;
};

export function phoneDigits(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

export function publicPhone(
  owner: OwnerPublic | null,
  tradePhone = "",
): string {
  if (owner && !owner.contact.showPhone) return "";
  const phone = tradePhone || owner?.phone || "";
  return phoneDigits(phone).length >= 7 ? phone : "";
}

export function useTradeContact(source: TradeActionSource) {
  const uid = useAuthStore((state) => state.user?.uid);
  const requireAuth = useRequireAuth();
  const [opening, setOpening] = useState(false);

  const message = async (target: ContactTarget, projectId?: string) => {
    analyticsEvents.tradeProfileMessageTapped({
      owner_id: target.ownerId,
      trade_id: target.tradeId || null,
      project_id: projectId ?? null,
      source,
    });
    if (!requireAuth()) return;
    if (!uid || !target.ownerId || opening || uid === target.ownerId) return;
    tapFeedback();
    setOpening(true);
    try {
      const threadId = await startChat(uid, target.ownerId, projectId);
      router.push(chatHref(threadId, target.name, target.avatarUrl || null));
    } catch {
      Alert.alert("Couldn't open the chat", "Please try again.");
    } finally {
      setOpening(false);
    }
  };

  const call = (target: ContactTarget, phone: string) => {
    if (!phone) return;
    tapFeedback();
    analyticsEvents.tradeProfileCallTapped({
      owner_id: target.ownerId,
      trade_id: target.tradeId,
      source,
    });
    void Linking.openURL(`tel:${phoneDigits(phone)}`).catch(() =>
      Alert.alert("Can't place a call", phone),
    );
  };

  const requestQuote = (target: ContactTarget) => {
    analyticsEvents.tradeProfileRequestTapped({
      owner_id: target.ownerId,
      trade_id: target.tradeId,
      specialty: target.specialtyLabel,
      source,
    });
    if (!requireAuth()) return;
    if (uid === target.ownerId) return;
    tapFeedback();
    const draft = useProjectDraftStore.getState();
    draft.reset();
    draft.setSpecialty(target.specialtyLabel || target.name);
    draft.setTargetSpecialist(
      target.ownerId,
      target.owner?.name || target.name,
      target.tradeId,
    );
    router.push(toHref("/homeowner-brief"));
  };

  return { message, call, requestQuote, opening, isSelf: (ownerId: string) => uid === ownerId };
}
