import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SendIcon } from "@/components/icons";
import { BackButton } from "@/components/ui/back-button";
import { PressableScale } from "@/components/ui/pressable-scale";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Brand, Colors, Radius, Spacing } from "@/constants/theme";
import { type ChatMessage, sendMessage, subscribeMessages } from "@/lib/chat";
import { tapFeedback } from "@/lib/haptics";
import { useAuthStore } from "@/store/use-auth-store";

function MessageBubble({
  message,
  mine,
}: {
  message: ChatMessage;
  mine: boolean;
}) {
  return (
    <View style={[styles.bubbleRow, mine ? styles.bubbleRowMine : null]}>
      <View
        style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}
      >
        <Text style={[styles.bubbleText, mine ? styles.bubbleTextMine : null]}>
          {message.text}
        </Text>
      </View>
    </View>
  );
}

export default function ChatThreadScreen() {
  const params = useLocalSearchParams<{ threadId?: string }>();
  const threadId = typeof params.threadId === "string" ? params.threadId : null;
  const uid = useAuthStore((state) => state.user?.uid) ?? "";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    if (!threadId) return;
    const unsubscribe = subscribeMessages(threadId, setMessages);
    return unsubscribe;
  }, [threadId]);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() =>
      listRef.current?.scrollToEnd({ animated: true }),
    );
  }, []);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !threadId || !uid || sending) return;
    tapFeedback();
    setDraft("");
    setSending(true);
    try {
      await sendMessage(threadId, uid, text, [uid]);
    } catch {
      setDraft(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Chat</Text>
          <View style={styles.headerSpacer} />
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
        >
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <MessageBubble message={item} mine={item.senderId === uid} />
            )}
            onContentSizeChange={scrollToEnd}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.inputBar}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Write a message"
              placeholderTextColor={Colors.textMuted}
              style={styles.input}
              multiline
            />
            <PressableScale
              accessibilityLabel="Send message"
              onPress={() => void handleSend()}
              disabled={draft.trim().length === 0 || sending}
            >
              <View
                style={[
                  styles.sendButton,
                  draft.trim().length === 0 && styles.sendButtonDisabled,
                ]}
              >
                <SendIcon size={18} color="#04170D" />
              </View>
            </PressableScale>
          </View>
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
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    color: Colors.text,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.base,
    gap: Spacing.sm,
  },
  bubbleRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  bubbleRowMine: {
    justifyContent: "flex-end",
  },
  bubble: {
    maxWidth: "80%",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  bubbleTheirs: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 6,
  },
  bubbleMine: {
    backgroundColor: Brand.primary,
    borderBottomRightRadius: 6,
  },
  bubbleText: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 21,
  },
  bubbleTextMine: {
    color: "#04170D",
    fontWeight: "600",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.base,
    paddingTop: Platform.OS === "ios" ? 12 : 8,
    paddingBottom: Platform.OS === "ios" ? 12 : 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 15,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.primary,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
