import { Image } from "expo-image";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
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
import { Brand, Colors, Radius, Spacing } from "@/constants/theme";
import { successFeedback, tapFeedback } from "@/lib/haptics";
import { pickImage } from "@/lib/media";
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

  const [introMessage] = useState(introText);
  const introShownRef = useRef(false);

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

  useEffect(() => {
    if (introShownRef.current) return;
    introShownRef.current = true;
    const timer = setTimeout(() => {
      setBotTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: "intro", from: "bot", text: introMessage },
      ]);
    }, 900);
    timers.current.push(timer);
    return () => clearTimeout(timer);
  }, [introMessage]);

  const handleSend = () => {
    const value = input.trim();
    if (!value || botTyping || phase === "done") return;

    if (dictation.recording) dictation.stop();
    tapFeedback();
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
        "Great — one last thing. Want to add a photo of the job? It helps specialists give accurate quotes. You can skip this.",
      );
    }
  };

  const finishAndMatch = useCallback(() => {
    setPhase("done");
    ensureRequestId();
    botSay(
      "Perfect — I'm matching you with the best local specialists right now…",
      () => {
        successFeedback();
        const go = setTimeout(() => router.push("/homeowner-specialists"), 550);
        timers.current.push(go);
      },
    );
  }, [botSay, ensureRequestId]);

  const handlePickPhoto = () => {
    tapFeedback();
    void pickImage().then((uri) => {
      if (!uri) return;
      setPhotoUri(uri);
      idRef.current += 1;
      setMessages((prev) => [
        ...prev,
        { id: `m${idRef.current}`, from: "user", text: "", image: uri },
      ]);
      finishAndMatch();
    });
  };

  const handleSkipPhoto = () => {
    tapFeedback();
    setPhotoUri(null);
    finishAndMatch();
  };

  const handleMic = () => {
    tapFeedback();
    if (dictation.recording) {
      dictation.stop();
      return;
    }
    setVoiceNotice(null);
    void dictation.start().then((ok) => {
      if (!ok) {
        setVoiceNotice(
          dictation.available
            ? "Microphone permission is needed for voice input."
            : "Voice input needs the latest build. Type your answer for now.",
        );
      }
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
                <Text style={styles.skipText}>Skip</Text>
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
                  placeholderTextColor={Colors.textMuted}
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

const styles = StyleSheet.create({
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
    borderBottomColor: Colors.border,
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
    color: Brand.primaryLight,
    fontSize: 13,
    fontWeight: "800",
  },
  botName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  botRole: {
    color: Colors.textSecondary,
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
    backgroundColor: Colors.surfaceStrong,
    borderTopLeftRadius: 6,
  },
  bubbleUser: {
    backgroundColor: "rgba(22,179,100,0.18)",
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.35)",
    borderTopRightRadius: 6,
  },
  bubbleTextBot: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  bubbleTextUser: {
    color: "#EAF6EF",
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
    backgroundColor: Colors.textSecondary,
  },
  voiceNotice: {
    color: Brand.coin,
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
    backgroundColor: Colors.surface,
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
    color: Colors.textSecondary,
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
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
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
    backgroundColor: Brand.danger,
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
    backgroundColor: Brand.danger,
  },
});
