import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
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

import { ImageIcon, MicIcon, SendIcon } from "@/components/icons";
import { BackButton } from "@/components/ui/back-button";
import { PressableScale } from "@/components/ui/pressable-scale";
import { ScreenBackground } from "@/components/ui/screen-background";
import { VoiceWaveform } from "@/components/ui/voice-waveform";
import {
  Brand,
  Radius,
  Spacing,
  makeStyles,
  useTheme,
} from "@/constants/theme";
import { analyticsEvents } from "@/lib/analytics-events";
import { findObjectionable } from "@/lib/content-filter";
import { successFeedback, tapFeedback } from "@/lib/haptics";
import { choosePhoto } from "@/lib/media";
import { useDictation } from "@/lib/speech";
import { useProjectDraftStore } from "@/store/use-project-draft-store";

type ChatMessage = {
  id: string;
  from: "bot" | "user";
  text: string;
  image?: string;
};

type Phase = "intro" | "location" | "photo" | "done";

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

export default function BriefScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const specialty = useProjectDraftStore((state) => state.specialty);
  const setName = useProjectDraftStore((state) => state.setName);
  const setLocation = useProjectDraftStore((state) => state.setLocation);
  const setPhotoUri = useProjectDraftStore((state) => state.setPhotoUri);
  const ensureRequestId = useProjectDraftStore(
    (state) => state.ensureRequestId,
  );

  const introText = specialty
    ? `You're looking for a ${specialty}. Tell me a bit about the job — and what should I call you? You can type or tap the mic to talk.`
    : "Tell me about your project — and what should I call you? You can type or tap the mic to talk.";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("intro");
  const [botTyping, setBotTyping] = useState(true);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

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
      duration_ms: voiceStartedAt.current
        ? Date.now() - voiceStartedAt.current
        : 0,
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
  }, [messages, botTyping]);

  const nextId = () => {
    idRef.current += 1;
    return `m${idRef.current}`;
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
    if (!value || botTyping || phase === "done") return;

    if (findObjectionable(value)) {
      stopDictation();
      analyticsEvents.contentFilterBlocked({
        screen: "project_brief",
        fields: [phase === "intro" ? "description" : "location"],
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
      step: phase === "intro" ? "description" : "location",
      text: value,
      text_length: value.length,
      input_method: usedVoice.current ? "voice" : "typed",
      specialty,
    });
    usedVoice.current = false;
    setMessages((prev) => [
      ...prev,
      { id: nextId(), from: "user", text: value },
    ]);
    setInput("");

    if (phase === "intro") {
      setName(value);
      setPhase("location");
      botSay(
        "Great to meet you! And where is the project located? Please share your city and state.",
      );
      return;
    }

    if (phase === "location") {
      setLocation(value);
      setPhase("photo");
      botSay(
        "Great — one last thing. Want to add a photo of the job? It helps specialists give accurate quotes. You can also publish your request without a photo.",
      );
    }
  };

  const finishAndMatch = useCallback(
    (hasPhoto: boolean) => {
      analyticsEvents.projectBriefCompleted({
        specialty,
        has_photo: hasPhoto,
        location: useProjectDraftStore.getState().location,
      });
      setPhase("done");
      ensureRequestId();
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
    },
    [botSay, ensureRequestId, specialty],
  );

  const handlePickPhoto = () => {
    tapFeedback();
    void choosePhoto().then((uri) => {
      if (!uri) {
        analyticsEvents.projectBriefPhotoPickerCancelled();
        return;
      }
      analyticsEvents.projectBriefPhotoAdded({ specialty });
      setPhotoUri(uri);
      idRef.current += 1;
      setMessages((prev) => [
        ...prev,
        { id: `m${idRef.current}`, from: "user", text: "", image: uri },
      ]);
      finishAndMatch(true);
    });
  };

  const handleSkipPhoto = () => {
    tapFeedback();
    analyticsEvents.projectBriefPhotoSkipped({ specialty });
    setPhotoUri(null);
    finishAndMatch(false);
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

          {phase === "photo" ? (
            <View style={styles.photoActions}>
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
                <Text style={styles.skipText}>Publish without a photo</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.inputBar}>
              {recording ? (
                <View style={styles.waveWrap}>
                  <VoiceWaveform samples={dictation.samples} />
                </View>
              ) : (
                <TextInput
                  value={input}
                  onChangeText={setInput}
                  placeholder="Your reply…"
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                  multiline
                  onSubmitEditing={handleSend}
                  editable={phase !== "done"}
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
                  accessibilityLabel={
                    recording ? "Stop recording" : "Voice input"
                  }
                  onPress={handleMic}
                  style={[
                    styles.actionButton,
                    recording && styles.actionButtonRecording,
                  ]}
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
          )}
        </KeyboardAvoidingView>
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
