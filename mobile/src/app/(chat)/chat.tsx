import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { SlideInLeft } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  CheckIcon,
  DoubleCheckIcon,
  ImageIcon,
  SendIcon,
} from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { BackButton } from "@/components/ui/back-button";
import { PressableScale } from "@/components/ui/pressable-scale";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Brand, Colors, Radius, Spacing } from "@/constants/theme";
import {
  type ChatMessage,
  getThread,
  markThreadRead,
  sendMessage,
  subscribeMessages,
} from "@/lib/chat";
import { timeShort } from "@/lib/format";
import { tapFeedback } from "@/lib/haptics";
import { pickImage } from "@/lib/media";
import { toHref } from "@/lib/navigation";
import { fetchProfileBrief } from "@/lib/profiles";
import {
  fetchProjectById,
  type ProjectDetail,
  selectSpecialist,
} from "@/lib/projects";
import { uploadImage } from "@/lib/storage-upload";
import { useAuthStore } from "@/store/use-auth-store";

type Peer = { name: string; avatar: string | null; uid: string };

function MessageBubble({
  message,
  mine,
}: {
  message: ChatMessage;
  mine: boolean;
}) {
  return (
    <Animated.View
      entering={mine ? undefined : SlideInLeft.duration(240)}
      style={[styles.bubbleRow, mine ? styles.bubbleRowMine : null]}
    >
      <View
        style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}
      >
        {message.attachments.map((attachment) => (
          <Image
            key={attachment.url}
            source={{ uri: attachment.url }}
            style={styles.bubbleImage}
            contentFit="cover"
            transition={150}
          />
        ))}
        {message.text ? (
          <Text
            style={[styles.bubbleText, mine ? styles.bubbleTextMine : null]}
          >
            {message.text}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          <Text style={[styles.metaTime, mine ? styles.metaTimeMine : null]}>
            {timeShort(message.createdAt)}
          </Text>
          {mine ? (
            message.isRead ? (
              <DoubleCheckIcon size={15} color="#04170D" strokeWidth={2.4} />
            ) : (
              <CheckIcon
                size={13}
                color="rgba(4,23,13,0.5)"
                strokeWidth={2.4}
              />
            )
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}

export default function ChatThreadScreen() {
  const params = useLocalSearchParams<{
    threadId?: string;
    peerName?: string;
    peerAvatar?: string;
  }>();
  const threadId = typeof params.threadId === "string" ? params.threadId : null;
  const initialPeerName =
    typeof params.peerName === "string" ? params.peerName : null;
  const initialPeerAvatar =
    typeof params.peerAvatar === "string" ? params.peerAvatar : null;
  const uid = useAuthStore((state) => state.user?.uid) ?? "";
  const queryClient = useQueryClient();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [peer, setPeer] = useState<Peer | null>(
    initialPeerName
      ? { name: initialPeerName, avatar: initialPeerAvatar, uid: "" }
      : null,
  );
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [justSelected, setJustSelected] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadingUri, setUploadingUri] = useState<string | null>(null);
  const [pendingImageId, setPendingImageId] = useState<string | null>(null);
  const [unread, setUnread] = useState<{
    firstId: string;
    count: number;
  } | null>(null);
  const unreadCapturedRef = useRef(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    if (!threadId) return;
    const unsubscribe = subscribeMessages(threadId, (msgs) => {
      if (!unreadCapturedRef.current && msgs.length > 0) {
        unreadCapturedRef.current = true;
        const incoming = msgs.filter(
          (item) => !item.isRead && item.senderId !== uid,
        );
        if (incoming.length > 0) {
          setUnread({ firstId: incoming[0].id, count: incoming.length });
        }
      }
      setMessages(msgs);
    });
    return unsubscribe;
  }, [threadId, uid]);

  useEffect(() => {
    if (!threadId || !uid) return;
    let active = true;
    void getThread(threadId).then(async (thread) => {
      if (!thread) return;
      const peerUid = thread.users.find((item) => item !== uid) ?? uid;
      const brief = await fetchProfileBrief(peerUid);
      if (active) {
        setPeer({ name: brief.name, avatar: brief.avatar, uid: peerUid });
      }
      if (thread.projectId) {
        const proj = await fetchProjectById(thread.projectId);
        if (active) setProject(proj);
      }
    });
    return () => {
      active = false;
    };
  }, [threadId, uid]);

  useEffect(() => {
    if (!threadId || !uid) return;
    void markThreadRead(threadId, uid);
  }, [threadId, uid, messages.length]);

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
    const participants = peer?.uid ? [uid, peer.uid] : [uid];
    try {
      await sendMessage(threadId, uid, text, participants);
    } catch {
      setDraft(text);
    } finally {
      setSending(false);
    }
  };

  const handleAttach = async () => {
    if (!threadId || !uid || sending) return;
    const uri = await pickImage();
    if (!uri) return;
    tapFeedback();
    setSending(true);
    setPendingImageId(null);
    setUploadingUri(uri);
    const participants = peer?.uid ? [uid, peer.uid] : [uid];
    try {
      const url = await uploadImage(uri, `chat/${threadId}/${Date.now()}.jpg`);
      const msgId = await sendMessage(threadId, uid, "", participants, [
        { url, type: "image" },
      ]);
      setPendingImageId(msgId);
    } catch {
      setUploadingUri(null);
    } finally {
      setSending(false);
    }
  };

  const renderUploading = () => {
    if (!uploadingUri) return null;
    if (pendingImageId && messages.some((item) => item.id === pendingImageId)) {
      return null;
    }
    return (
      <View style={[styles.bubbleRow, styles.bubbleRowMine]}>
        <View style={[styles.bubble, styles.bubbleMine]}>
          <Image
            source={{ uri: uploadingUri }}
            style={styles.bubbleImage}
            contentFit="cover"
          />
          <View style={styles.uploadingRow}>
            <ActivityIndicator size="small" color="#04170D" />
            <Text style={styles.uploadingText}>Sending…</Text>
          </View>
        </View>
      </View>
    );
  };

  const canSelect =
    !!project &&
    !!peer &&
    project.userId === uid &&
    project.state === "published" &&
    project.responders.some((item) => item.userId === peer.uid);

  const handleSelect = async () => {
    if (!project || !peer || !threadId || selecting) return;
    tapFeedback();
    setSelecting(true);
    try {
      await selectSpecialist(
        project.id,
        uid,
        { id: peer.uid, name: peer.name },
        threadId,
      );
      setProject({
        ...project,
        state: "in_progress",
        contractorId: peer.uid,
        contractorName: peer.name,
      });
      setJustSelected(true);
      void queryClient.invalidateQueries({ queryKey: ["my-projects"] });
      void queryClient.invalidateQueries({ queryKey: ["nearby-projects"] });
      void queryClient.invalidateQueries({ queryKey: ["project", project.id] });
    } catch {
      // ignore selection failure
    } finally {
      setSelecting(false);
    }
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <View style={styles.peerInfo}>
            <Avatar name={peer?.name ?? "Chat"} url={peer?.avatar} size={36} />
            <Text style={styles.peerName} numberOfLines={1}>
              {peer?.name ?? "Chat"}
            </Text>
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
        >
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <>
                {unread && item.id === unread.firstId ? (
                  <View style={styles.unreadDivider}>
                    <View style={styles.unreadLine} />
                    <Text style={styles.unreadText}>
                      {unread.count} new{" "}
                      {unread.count === 1 ? "message" : "messages"}
                    </Text>
                    <View style={styles.unreadLine} />
                  </View>
                ) : null}
                <MessageBubble message={item} mine={item.senderId === uid} />
              </>
            )}
            ListFooterComponent={renderUploading()}
            onContentSizeChange={scrollToEnd}
            showsVerticalScrollIndicator={false}
          />

          {justSelected ? (
            <View style={styles.selectedBanner}>
              <Text style={styles.selectedText}>
                {peer?.name} is now your specialist. Coordinate the work right
                here in chat.
              </Text>
              <PressableScale
                accessibilityLabel="Back to home"
                onPress={() => {
                  tapFeedback();
                  router.navigate(toHref("/home"));
                }}
              >
                <View style={styles.selectedButton}>
                  <Text style={styles.selectedButtonText}>Back to home</Text>
                </View>
              </PressableScale>
            </View>
          ) : canSelect ? (
            <View style={styles.selectBanner}>
              <Text style={styles.selectText}>
                Ready to select {peer?.name} for this project?
              </Text>
              <PressableScale
                accessibilityLabel="Confirm selection"
                onPress={() => void handleSelect()}
                disabled={selecting}
              >
                <View style={styles.selectButton}>
                  <Text style={styles.selectButtonText}>
                    {selecting ? "Selecting…" : "Confirm selection"}
                  </Text>
                </View>
              </PressableScale>
            </View>
          ) : null}

          <View style={styles.inputBar}>
            <PressableScale
              accessibilityLabel="Attach a photo"
              onPress={() => void handleAttach()}
              disabled={sending}
            >
              <View style={styles.attachButton}>
                <ImageIcon size={22} color={Colors.textSecondary} />
              </View>
            </PressableScale>
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
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  peerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  peerName: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    fontWeight: "700",
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
  bubbleImage: {
    width: 200,
    height: 150,
    borderRadius: Radius.sm,
    marginBottom: 6,
    backgroundColor: Colors.surface,
  },
  attachButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bubble: {
    maxWidth: "82%",
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
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginTop: 4,
  },
  metaTime: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  metaTimeMine: {
    color: "rgba(4,23,13,0.55)",
  },
  uploadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingTop: 2,
  },
  uploadingText: {
    color: "#04170D",
    fontSize: 12,
    fontWeight: "600",
  },
  selectBanner: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    padding: Spacing.base,
    borderRadius: Radius.md,
    backgroundColor: "rgba(255,193,7,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,193,7,0.32)",
    gap: Spacing.sm,
  },
  selectText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  selectButton: {
    height: 46,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.primary,
  },
  selectButtonText: {
    color: "#04170D",
    fontSize: 15,
    fontWeight: "700",
  },
  selectedBanner: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    padding: Spacing.base,
    borderRadius: Radius.md,
    backgroundColor: "rgba(22,179,100,0.14)",
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.35)",
    gap: Spacing.sm,
  },
  selectedText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  selectedButton: {
    height: 46,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.primary,
  },
  selectedButtonText: {
    color: "#04170D",
    fontSize: 15,
    fontWeight: "700",
  },
  unreadDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  unreadLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(22,179,100,0.3)",
  },
  unreadText: {
    color: Brand.primaryLight,
    fontSize: 12,
    fontWeight: "700",
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
