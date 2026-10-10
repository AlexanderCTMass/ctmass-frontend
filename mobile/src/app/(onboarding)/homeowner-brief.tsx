import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { ImageIcon, MapPinIcon, MicIcon, SendIcon } from "@/components/icons";
import { ContactPreferencesForm } from "@/components/project/contact-preferences-form";
import { BackButton } from "@/components/ui/back-button";
import { LocationPickerModal } from "@/components/ui/location-picker";
import { PressableScale } from "@/components/ui/pressable-scale";
import { ScreenBackground } from "@/components/ui/screen-background";
import { VoiceWaveform } from "@/components/ui/voice-waveform";
import {
  type ContactPreferences,
  START_OPTIONS,
  type StartOption,
  bestTimeLabel,
  contactMethodLabel,
  formatBudget,
  parseBudget,
} from "@/constants/project-request";
import {
  Brand,
  Radius,
  Spacing,
  makeStyles,
  useTheme,
} from "@/constants/theme";
import {
  analyticsEvents,
  errorMessage,
  locationProps,
} from "@/lib/analytics-events";
import { findObjectionable } from "@/lib/content-filter";
import { selectFeedback, successFeedback, tapFeedback } from "@/lib/haptics";
import type { GeoPlace } from "@/lib/mapbox";
import { choosePhoto } from "@/lib/media";
import { chatHref } from "@/lib/navigation";
import { createDirectedRequest, requestDetailsFromDraft } from "@/lib/projects";
import { useDictation } from "@/lib/speech";
import { uploadImage } from "@/lib/storage-upload";
import { useProfile } from "@/queries/use-profile";
import { useAuthStore } from "@/store/use-auth-store";
import { useProjectDraftStore } from "@/store/use-project-draft-store";

type ChatMessage = {
  id: string;
  from: "bot" | "user";
  text: string;
  image?: string;
};

type Phase =
  | "intro"
  | "start"
  | "budget"
  | "location"
  | "photo"
  | "contact"
  | "done";

const BUDGET_QUESTION =
  "Got it. What's your maximum budget for this job? Type an amount in USD — or tap “Not sure yet”.";
const LOCATION_QUESTION =
  "Where should the work be done? Pick the exact address on the map so nearby specialists can find your request.";
const PHOTO_QUESTION =
  "Want to add a photo of the job? It helps specialists give accurate quotes.";
const CONTACT_QUESTION =
  "Last step — how should contractors contact you? And when is the best time to reach you?";

function Dot({ index }: { index: number }) {
  const styles = useStyles();
  const value = useSharedValue(0);

  useEffect(() => {
    value.value = withDelay(
      index * 160,
      withRepeat(
        withTiming(1, { duration: 560, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      ),
    );
  }, [value, index]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.35 + value.value * 0.55,
    transform: [{ translateY: -value.value * 3 }],
  }));

  return <Animated.View style={[styles.typingDot, style]} />;
}

function TypingBubble() {
  const styles = useStyles();
  return (
    <Animated.View
      entering={FadeIn.duration(240)}
      style={[styles.row, styles.rowBot]}
    >
      <View style={[styles.bubble, styles.bubbleBot, styles.typingBubble]}>
        <Dot index={0} />
        <Dot index={1} />
        <Dot index={2} />
      </View>
    </Animated.View>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const styles = useStyles();
  const isBot = message.from === "bot";
  return (
    <Animated.View
      entering={FadeIn.duration(260)}
      style={[styles.row, isBot ? styles.rowBot : styles.rowUser]}
    >
      <View
        style={[styles.bubble, isBot ? styles.bubbleBot : styles.bubbleUser]}
      >
        {message.image ? (
          <Image
            source={{ uri: message.image }}
            style={styles.bubbleImage}
            contentFit="cover"
            transition={150}
          />
        ) : null}
        {message.text ? (
          <Text style={isBot ? styles.bubbleTextBot : styles.bubbleTextUser}>
            {message.text}
          </Text>
        ) : null}
      </View>
    </Animated.View>
  );
}

function RecordingPulse() {
  const styles = useStyles();
  const value = useSharedValue(0);

  useEffect(() => {
    value.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
  }, [value]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.5 - value.value * 0.5,
    transform: [{ scale: 1 + value.value * 0.7 }],
  }));

  return <Animated.View style={[styles.pulse, style]} />;
}

function elapsedSince(startedAt: number | null): number {
  return startedAt ? Date.now() - startedAt : 0;
}

function contactSummary(preferences: ContactPreferences): string {
  const methods = preferences.methods.map(contactMethodLabel).join(", ");
  return `${methods} · ${bestTimeLabel(preferences.bestTime)}`;
}

export default function BriefScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const specialty = useProjectDraftStore((state) => state.specialty);
  const targetSpecialistId = useProjectDraftStore(
    (state) => state.targetSpecialistId,
  );
  const targetSpecialistName = useProjectDraftStore(
    (state) => state.targetSpecialistName,
  );
  const draftLocation = useProjectDraftStore((state) => state.location);
  const setName = useProjectDraftStore((state) => state.setName);
  const setLocation = useProjectDraftStore((state) => state.setLocation);
  const setStartOptionKey = useProjectDraftStore(
    (state) => state.setStartOptionKey,
  );
  const setBudget = useProjectDraftStore((state) => state.setBudget);
  const setContact = useProjectDraftStore((state) => state.setContact);
  const setPhotoUri = useProjectDraftStore((state) => state.setPhotoUri);
  const resetDraft = useProjectDraftStore((state) => state.reset);
  const ensureRequestId = useProjectDraftStore(
    (state) => state.ensureRequestId,
  );
  const uid = useAuthStore((state) => state.user?.uid);
  const userName = useAuthStore((state) => state.user?.name);
  const userEmail = useAuthStore((state) => state.user?.email);
  const { data: profile } = useProfile(uid);

  const introText = targetSpecialistId
    ? `You're requesting ${specialty ?? "services"} from ${targetSpecialistName ?? "this specialist"}. Tell me about the job — and what should I call you? You can type or tap the mic to talk.`
    : specialty
      ? `You're looking for a ${specialty}. Tell me a bit about the job — and what should I call you? You can type or tap the mic to talk.`
      : "Tell me about your project — and what should I call you? You can type or tap the mic to talk.";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("intro");
  const [botTyping, setBotTyping] = useState(true);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const idRef = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const dictation = useDictation({ onTranscript: setInput });
  const voiceStartedAt = useRef<number | null>(null);
  const usedVoice = useRef(false);

  const stopDictation = () => {
    if (!dictation.recording) return;
    dictation.stop();
    analyticsEvents.voiceInputStopped({
      screen: "project_brief",
      duration_ms: elapsedSince(voiceStartedAt.current),
      transcript_length: input.trim().length,
    });
    voiceStartedAt.current = null;
  };

  useEffect(() => {
    const captured = timers.current;
    return () => {
      for (const timer of captured) clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(
      () => scrollRef.current?.scrollToEnd({ animated: true }),
      60,
    );
    return () => clearTimeout(timer);
  }, [messages, botTyping, phase]);

  const nextId = () => {
    idRef.current += 1;
    return `m${idRef.current}`;
  };

  const userSay = (text: string, image?: string) => {
    setMessages((prev) => [
      ...prev,
      { id: nextId(), from: "user", text, image },
    ]);
  };

  const botSay = useCallback((text: string, after: () => void = () => {}) => {
    setBotTyping(true);
    const typing = setTimeout(() => {
      setBotTyping(false);
      idRef.current += 1;
      const id = `b${idRef.current}`;
      setMessages((prev) => [...prev, { id, from: "bot", text }]);
      after();
    }, 900);
    timers.current.push(typing);
  }, []);

  const ask = useCallback(
    (next: Phase, text: string) => {
      botSay(text, () => setPhase(next));
    },
    [botSay],
  );

  useFocusEffect(
    useCallback(() => {
      analyticsEvents.projectBriefViewed({ specialty });
      for (const timer of timers.current) clearTimeout(timer);
      timers.current.length = 0;
      idRef.current = 0;
      setInput("");
      setVoiceNotice(null);
      setPhase("intro");
      setBotTyping(true);
      setMessages([]);

      const timer = setTimeout(() => {
        setBotTyping(false);
        setMessages([{ id: "intro", from: "bot", text: introText }]);
      }, 900);
      timers.current.push(timer);

      return () => {
        for (const pending of timers.current) clearTimeout(pending);
        timers.current.length = 0;
      };
    }, [introText, specialty]),
  );

  const handleSend = () => {
    const value = input.trim();
    if (!value || botTyping) return;
    if (phase !== "intro" && phase !== "budget") return;

    if (findObjectionable(value)) {
      stopDictation();
      analyticsEvents.contentFilterBlocked({
        screen: "project_brief",
        fields: [phase === "intro" ? "description" : "budget"],
      });
      setVoiceNotice(
        "Please keep it respectful — remove any inappropriate language.",
      );
      return;
    }

    setVoiceNotice(null);
    stopDictation();
    tapFeedback();
    analyticsEvents.projectBriefMessageSent({
      step: phase === "intro" ? "description" : "budget",
      text: value,
      text_length: value.length,
      input_method: usedVoice.current ? "voice" : "typed",
      specialty,
    });
    usedVoice.current = false;
    setInput("");

    if (phase === "intro") {
      userSay(value);
      setName(value);
      setPhase("start");
      ask("start", "Thanks! When would you like the work to start?");
      return;
    }

    const budget = parseBudget(value);
    userSay(budget === null ? value : formatBudget(budget));
    if (budget === null) {
      analyticsEvents.projectBriefBudgetInvalid({ text_length: value.length });
      botSay(
        "I couldn't catch an amount — try something like 1500, or tap “Not sure yet”.",
      );
      return;
    }
    analyticsEvents.projectBriefBudgetSet({ specialty, budget, skipped: false });
    setBudget(budget);
    Keyboard.dismiss();
    setPhase("location");
    ask("location", LOCATION_QUESTION);
  };

  const handleStartSelect = (option: StartOption) => {
    if (botTyping || phase !== "start") return;
    selectFeedback();
    analyticsEvents.projectBriefStartSelected({
      specialty,
      start_option: option.key,
    });
    setStartOptionKey(option.key);
    userSay(option.label);
    setPhase("budget");
    ask("budget", BUDGET_QUESTION);
  };

  const handleBudgetSkip = () => {
    if (botTyping || phase !== "budget") return;
    tapFeedback();
    stopDictation();
    setInput("");
    analyticsEvents.projectBriefBudgetSet({
      specialty,
      budget: null,
      skipped: true,
    });
    setBudget(null);
    userSay("Not sure yet");
    Keyboard.dismiss();
    setPhase("location");
    ask("location", LOCATION_QUESTION);
  };

  const handleOpenMap = () => {
    tapFeedback();
    analyticsEvents.locationPickerOpened({
      context: "project_brief",
      has_value: (draftLocation ?? profile?.location ?? null) !== null,
    });
    setMapOpen(true);
  };

  const handleLocationConfirm = (place: GeoPlace) => {
    setMapOpen(false);
    analyticsEvents.projectBriefLocationSet({
      specialty,
      ...locationProps(place),
      used_profile_location:
        Boolean(profile?.location) &&
        profile?.location?.place_name === place.place_name,
    });
    setLocation(place);
    userSay(place.place_name);
    setPhase("photo");
    ask("photo", PHOTO_QUESTION);
  };

  const sendDirectedRequest = useCallback(async () => {
    const draft = useProjectDraftStore.getState();
    if (!uid || !draft.targetSpecialistId) return;
    const specialistName = draft.targetSpecialistName ?? "Specialist";
    let attach: string[] = [];
    if (draft.photoUri) {
      try {
        const url = await uploadImage(
          draft.photoUri,
          `projects/${uid}/${Date.now()}.jpg`,
        );
        attach = [url];
      } catch {
        // proceed without the photo if upload fails
      }
    }
    const rid = draft.requestId ?? ensureRequestId();
    try {
      const { projectId, threadId } = await createDirectedRequest(
        uid,
        { id: draft.targetSpecialistId, name: specialistName },
        {
          title: draft.specialty ?? "Service request",
          specialtyLabel: draft.specialty ?? "",
          description: draft.name ?? "",
          ...requestDetailsFromDraft(draft, userEmail),
          requestId: rid,
          customerName: userName ?? "",
          customerMail: userEmail ?? "",
          attach,
          requesterName: userName ?? "A client",
        },
      );
      analyticsEvents.directedRequestCreated({
        project_id: projectId,
        specialist_uid: draft.targetSpecialistId,
      });
      successFeedback();
      resetDraft();
      router.replace(chatHref(threadId, specialistName));
    } catch (error) {
      analyticsEvents.directedRequestFailed({
        error_message: errorMessage(error),
      });
      setVoiceNotice("Couldn't send your request. Please try again.");
      setPhase("contact");
    }
  }, [uid, userName, userEmail, ensureRequestId, resetDraft]);

  const finishAndMatch = useCallback(() => {
    const draft = useProjectDraftStore.getState();
    analyticsEvents.projectBriefCompleted({
      specialty,
      has_photo: Boolean(draft.photoUri),
      ...locationProps(draft.location),
      has_budget: draft.budget !== null,
      start_option: draft.startOptionKey,
      contact_methods: draft.contactPreferences?.methods ?? [],
    });
    setPhase("done");
    ensureRequestId();
    if (targetSpecialistId && uid) {
      botSay(
        `Perfect — sending your request to ${targetSpecialistName ?? "the specialist"} now…`,
        () => {
          void sendDirectedRequest();
        },
      );
      return;
    }
    botSay(
      "Perfect — I'm matching you with the best local specialists right now…",
      () => {
        successFeedback();
        const go = setTimeout(
          () => router.push("/homeowner-specialists"),
          550,
        );
        timers.current.push(go);
      },
    );
  }, [
    botSay,
    ensureRequestId,
    specialty,
    targetSpecialistId,
    targetSpecialistName,
    uid,
    sendDirectedRequest,
  ]);

  const goToContact = () => {
    setPhase("contact");
    ask("contact", CONTACT_QUESTION);
  };

  const handlePickPhoto = () => {
    tapFeedback();
    void choosePhoto().then((uri) => {
      if (!uri) {
        analyticsEvents.projectBriefPhotoPickerCancelled();
        return;
      }
      analyticsEvents.projectBriefPhotoAdded({ specialty });
      setPhotoUri(uri);
      userSay("", uri);
      goToContact();
    });
  };

  const handleSkipPhoto = () => {
    tapFeedback();
    analyticsEvents.projectBriefPhotoSkipped({ specialty });
    setPhotoUri(null);
    userSay("No photo for now");
    goToContact();
  };

  const handleContactSubmit = (
    preferences: ContactPreferences,
    phone: string | null,
  ) => {
    if (botTyping) return;
    tapFeedback();
    setVoiceNotice(null);
    analyticsEvents.projectBriefContactSet({
      specialty,
      methods: preferences.methods,
      best_time: preferences.bestTime,
      phone_filled: Boolean(phone),
    });
    setContact(preferences, phone);
    userSay(contactSummary(preferences));
    finishAndMatch();
  };

  const handleMic = () => {
    tapFeedback();
    if (dictation.recording) {
      stopDictation();
      return;
    }
    setVoiceNotice(null);
    void dictation.start().then((ok) => {
      if (ok) {
        usedVoice.current = true;
        voiceStartedAt.current = Date.now();
        analyticsEvents.voiceInputStarted({ screen: "project_brief" });
        return;
      }
      analyticsEvents.voiceInputFailed({
        screen: "project_brief",
        reason: dictation.available ? "permission_denied" : "unavailable",
      });
      setVoiceNotice(
        dictation.available
          ? "Microphone permission is needed for voice input."
          : "Voice input needs the latest build. Type your answer for now.",
      );
    });
  };

  const hasText = input.trim().length > 0;
  const send = useSharedValue(0);

  useEffect(() => {
    send.value = withTiming(hasText ? 1 : 0, { duration: 180 });
  }, [hasText, send]);

  const micStyle = useAnimatedStyle(() => ({
    opacity: 1 - send.value,
    transform: [{ scale: 1 - send.value * 0.4 }],
  }));
  const sendStyle = useAnimatedStyle(() => ({
    opacity: send.value,
    transform: [{ scale: 0.6 + send.value * 0.4 }],
  }));

  const recording = dictation.recording;
  const waitingForBot = botTyping;

  const renderInputBar = () => (
    <View style={styles.inputBar}>
      {recording ? (
        <View style={styles.waveWrap}>
          <VoiceWaveform samples={dictation.samples} />
        </View>
      ) : (
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder={
            phase === "budget" ? "Max budget, e.g. 1500" : "Your reply…"
          }
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          multiline={phase !== "budget"}
          keyboardType={phase === "budget" ? "number-pad" : "default"}
          onSubmitEditing={handleSend}
          editable={phase === "intro" || phase === "budget"}
        />
      )}
      {hasText && !recording ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send"
          onPress={handleSend}
          style={styles.actionButton}
        >
          <View style={styles.iconStack}>
            <Animated.View style={[styles.iconLayer, sendStyle]}>
              <SendIcon size={22} color="#04170D" />
            </Animated.View>
          </View>
        </Pressable>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={recording ? "Stop recording" : "Voice input"}
          onPress={handleMic}
          style={[styles.actionButton, recording && styles.actionButtonRecording]}
        >
          {recording ? <RecordingPulse /> : null}
          {recording ? (
            <View style={styles.stopSquare} />
          ) : (
            <View style={styles.iconStack}>
              <Animated.View style={[styles.iconLayer, micStyle]}>
                <MicIcon size={22} color="#04170D" />
              </Animated.View>
            </View>
          )}
        </Pressable>
      )}
    </View>
  );

  const renderActions = () => {
    if (waitingForBot && phase !== "intro" && phase !== "done") {
      return null;
    }

    switch (phase) {
      case "start":
        return (
          <Animated.View entering={FadeIn.duration(220)} style={styles.options}>
            {START_OPTIONS.map((option) => (
              <PressableScale
                key={option.key}
                accessibilityLabel={option.label}
                onPress={() => handleStartSelect(option)}
              >
                <View style={styles.option}>
                  <Text style={styles.optionText}>{option.label}</Text>
                </View>
              </PressableScale>
            ))}
          </Animated.View>
        );
      case "budget":
        return (
          <Animated.View entering={FadeIn.duration(220)}>
            <View style={styles.quickRow}>
              <PressableScale
                accessibilityLabel="Not sure yet"
                onPress={handleBudgetSkip}
              >
                <View style={styles.option}>
                  <Text style={styles.optionText}>Not sure yet</Text>
                </View>
              </PressableScale>
            </View>
            {renderInputBar()}
          </Animated.View>
        );
      case "location":
        return (
          <Animated.View
            entering={FadeIn.duration(220)}
            style={styles.photoActions}
          >
            <PressableScale
              accessibilityLabel="Choose location on map"
              onPress={handleOpenMap}
            >
              <View style={styles.photoButton}>
                <MapPinIcon size={20} color="#04170D" />
                <Text style={styles.photoButtonText}>Choose on map</Text>
              </View>
            </PressableScale>
          </Animated.View>
        );
      case "photo":
        return (
          <Animated.View
            entering={FadeIn.duration(220)}
            style={styles.photoActions}
          >
            <PressableScale
              accessibilityLabel="Add a photo"
              onPress={handlePickPhoto}
            >
              <View style={styles.photoButton}>
                <ImageIcon size={20} color="#04170D" />
                <Text style={styles.photoButtonText}>Add a photo</Text>
              </View>
            </PressableScale>
            <Pressable
              accessibilityRole="button"
              hitSlop={10}
              onPress={handleSkipPhoto}
            >
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          </Animated.View>
        );
      case "contact":
        return (
          <ContactPreferencesForm
            initialPhone={profile?.phone ?? ""}
            onSubmit={handleContactSubmit}
          />
        );
      case "done":
        return null;
      default:
        return renderInputBar();
    }
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <View style={styles.identity}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AI</Text>
            </View>
            <View>
              <Text style={styles.botName}>Brief bot</Text>
              <Text style={styles.botRole}>Helps build your request</Text>
            </View>
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={styles.messages}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {botTyping ? <TypingBubble /> : null}
          </ScrollView>

          {voiceNotice ? (
            <Text style={styles.voiceNotice}>{voiceNotice}</Text>
          ) : null}

          {renderActions()}
        </KeyboardAvoidingView>

        <LocationPickerModal
          visible={mapOpen}
          initial={draftLocation ?? profile?.location ?? null}
          analyticsContext="project_brief"
          onCancel={() => setMapOpen(false)}
          onConfirm={handleLocationConfirm}
        />
      </SafeAreaView>
    </ScreenBackground>
  );
}

const useStyles = makeStyles((t) => ({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.base,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.border,
  },
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(22,179,100,0.16)",
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.4)",
  },
  avatarText: {
    color: t.colors.accent,
    fontSize: 13,
    fontWeight: "800",
  },
  botName: {
    color: t.colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  botRole: {
    color: t.colors.textSecondary,
    fontSize: 12,
    marginTop: 1,
  },
  messages: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.base,
    gap: Spacing.md,
  },
  row: {
    flexDirection: "row",
  },
  rowBot: {
    justifyContent: "flex-start",
  },
  rowUser: {
    justifyContent: "flex-end",
  },
  bubble: {
    maxWidth: "82%",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  bubbleBot: {
    backgroundColor: t.colors.surfaceStrong,
    borderTopLeftRadius: 6,
  },
  bubbleUser: {
    backgroundColor: "rgba(22,179,100,0.18)",
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.35)",
    borderTopRightRadius: 6,
  },
  bubbleTextBot: {
    color: t.colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  bubbleTextUser: {
    color: t.isDark ? "#EAF6EF" : t.colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingVertical: Spacing.base,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: t.colors.textSecondary,
  },
  voiceNotice: {
    color: t.colors.coin,
    fontSize: 12.5,
    textAlign: "center",
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  waveWrap: {
    flex: 1,
    minHeight: 50,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.base,
    justifyContent: "center",
    backgroundColor: "rgba(22,179,100,0.10)",
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.32)",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  quickRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xs,
  },
  option: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 11,
    borderRadius: Radius.pill,
    backgroundColor: t.isDark ? "rgba(22,179,100,0.10)" : t.colors.surface,
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.45)",
  },
  optionText: {
    color: t.colors.accent,
    fontSize: 15,
    fontWeight: "700",
  },
  bubbleImage: {
    width: 200,
    height: 150,
    borderRadius: Radius.sm,
    marginBottom: 6,
    backgroundColor: t.colors.surface,
  },
  photoActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.lg,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    height: 50,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.pill,
    backgroundColor: Brand.primary,
  },
  photoButtonText: {
    color: "#04170D",
    fontSize: 15,
    fontWeight: "700",
  },
  skipText: {
    color: t.colors.textSecondary,
    fontSize: 15,
    fontWeight: "600",
    paddingVertical: Spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 50,
    maxHeight: 120,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.base,
    paddingTop: Platform.OS === "ios" ? 14 : 10,
    paddingBottom: Platform.OS === "ios" ? 14 : 10,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    color: t.colors.text,
    fontSize: 16,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.primary,
  },
  actionButtonRecording: {
    backgroundColor: t.colors.danger,
  },
  iconStack: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  iconLayer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  stopSquare: {
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  pulse: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: t.colors.danger,
  },
}));
