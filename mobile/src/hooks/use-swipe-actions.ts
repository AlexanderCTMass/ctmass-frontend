import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { Alert } from "react-native";

import { analyticsEvents, errorMessage } from "@/lib/analytics-events";
import {
  archiveFeedback,
  errorFeedback,
  likeFeedback,
  successFeedback,
  tapFeedback,
} from "@/lib/haptics";
import {
  type SwipeRecord,
  type SwipeTarget,
  type SwipeValue,
  buildSwipeIndex,
  clearSwipe,
  saveSwipe,
  swipeId,
  topicKey,
} from "@/lib/swipes";
import { swipesKey, useSwipes } from "@/queries/use-swipes";

export type SwipeSubject = {
  targetType: SwipeTarget;
  targetId: string;
  topic: string;
};

export type SwipeSource = "swipe" | "tap" | "menu" | "undo";

type Action = "like" | "unlike" | "archive" | "restore";

export function useSwipeActions(uid: string | undefined, screen: string) {
  const queryClient = useQueryClient();
  const swipes = useSwipes(uid);
  const records = useMemo(() => swipes.data ?? [], [swipes.data]);
  const key = swipesKey(uid);

  const projectIndex = useMemo(
    () => buildSwipeIndex(records, "project"),
    [records],
  );
  const specialistIndex = useMemo(
    () => buildSwipeIndex(records, "specialist"),
    [records],
  );

  const apply = async (
    action: Action,
    subject: SwipeSubject,
    source: SwipeSource,
    next: SwipeValue | null,
  ) => {
    if (!uid || !subject.targetId) return;
    const id = swipeId(subject.targetType, subject.targetId);
    const topic = topicKey(subject.topic);
    queryClient.setQueryData<SwipeRecord[]>(key, (current) => {
      const rest = (current ?? []).filter((item) => item.id !== id);
      return next
        ? [
            ...rest,
            {
              id,
              targetType: subject.targetType,
              targetId: subject.targetId,
              value: next,
              topic,
            },
          ]
        : rest;
    });
    if (action === "like") likeFeedback();
    else if (action === "archive") archiveFeedback();
    else if (action === "restore") successFeedback();
    else tapFeedback();
    analyticsEvents.cardSwipeAction({
      target_type: subject.targetType,
      target_id: subject.targetId,
      action,
      screen,
      source,
    });
    try {
      if (next) {
        await saveSwipe(uid, {
          targetType: subject.targetType,
          targetId: subject.targetId,
          value: next,
          topic,
        });
      } else {
        await clearSwipe(uid, subject.targetType, subject.targetId);
      }
    } catch (error) {
      errorFeedback();
      analyticsEvents.cardSwipeFailed({
        target_type: subject.targetType,
        action,
        error_message: errorMessage(error),
      });
      void queryClient.invalidateQueries({ queryKey: key });
      Alert.alert("Something went wrong", "Please try again.");
    }
  };

  const indexFor = (targetType: SwipeTarget) =>
    targetType === "project" ? projectIndex : specialistIndex;

  const isLiked = (subject: SwipeSubject) =>
    indexFor(subject.targetType).liked.has(subject.targetId);

  return {
    isReady: !uid || swipes.isFetched,
    projectIndex,
    specialistIndex,
    isLiked,
    isArchived: (subject: SwipeSubject) =>
      indexFor(subject.targetType).archived.has(subject.targetId),
    like: (subject: SwipeSubject, source: SwipeSource = "swipe") =>
      void apply("like", subject, source, "like"),
    unlike: (subject: SwipeSubject, source: SwipeSource = "swipe") =>
      void apply("unlike", subject, source, null),
    toggleLike: (subject: SwipeSubject, source: SwipeSource = "tap") =>
      isLiked(subject)
        ? void apply("unlike", subject, source, null)
        : void apply("like", subject, source, "like"),
    archive: (subject: SwipeSubject, source: SwipeSource = "swipe") => {
      const wasLiked = isLiked(subject);
      void apply("archive", subject, source, "archive");
      return () =>
        void apply("restore", subject, "undo", wasLiked ? "like" : null);
    },
    restore: (subject: SwipeSubject, source: SwipeSource = "menu") =>
      void apply("restore", subject, source, null),
  };
}

export function projectSubject(project: {
  id: string;
  specialtyLabel: string;
}): SwipeSubject {
  return {
    targetType: "project",
    targetId: project.id,
    topic: project.specialtyLabel,
  };
}

export function specialistSubject(specialist: {
  tradeId: string;
  specialtyLabel: string;
}): SwipeSubject {
  return {
    targetType: "specialist",
    targetId: specialist.tradeId,
    topic: specialist.specialtyLabel,
  };
}
