import { type Href, Redirect, router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { ResponsesIcon } from "@/components/icons";
import { PressableScale } from "@/components/ui/pressable-scale";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Brand, Colors, Spacing } from "@/constants/theme";
import { type ChatThread, subscribeThreads } from "@/lib/chat";
import { tapFeedback } from "@/lib/haptics";
import { useAuthStore } from "@/store/use-auth-store";

function threadTitle(thread: ChatThread): string {
  return thread.type === "project" ? "Project chat" : "Direct message";
}

function formatUpdated(date: Date | null | undefined): string {
  if (!date) return "";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function ThreadRow({ thread }: { thread: ChatThread }) {
  return (
    <PressableScale
      accessibilityLabel={`Open ${threadTitle(thread)}`}
      onPress={() => {
        tapFeedback();
        router.push(`/chat?threadId=${encodeURIComponent(thread.id)}` as Href);
      }}
    >
      <View style={styles.row}>
        <View style={styles.rowIcon}>
          <ResponsesIcon size={18} color={Brand.primaryLight} />
        </View>
        <View style={styles.rowBody}>
          <Text style={styles.rowTitle}>{threadTitle(thread)}</Text>
          <Text style={styles.rowSubtitle} numberOfLines={1}>
            Tap to open the conversation
          </Text>
        </View>
        <Text style={styles.rowMeta}>{formatUpdated(thread.updatedAt)}</Text>
      </View>
    </PressableScale>
  );
}

export default function ChatOverviewScreen() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const uid = useAuthStore((state) => state.user?.uid);

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!uid) return;
    const unsubscribe = subscribeThreads(uid, (next) => {
      setThreads(next);
      setLoaded(true);
    });
    return unsubscribe;
  }, [uid]);

  if (!isAuthenticated) {
    return <Redirect href="/auth" />;
  }

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Text style={styles.heading}>Messages</Text>
          <Text style={styles.subheading}>
            Your conversations with specialists and customers.
          </Text>
        </View>

        <FlatList
          data={threads}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <ThreadRow thread={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            loaded ? (
              <Animated.View
                entering={FadeIn.duration(360)}
                style={styles.empty}
              >
                <Text style={styles.emptyTitle}>No messages yet</Text>
                <Text style={styles.emptyText}>
                  When you connect with a specialist, your chats appear here.
                </Text>
              </Animated.View>
            ) : null
          }
        />
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.base,
  },
  heading: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subheading: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.base,
    paddingVertical: Spacing.md,
  },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(22,179,100,0.14)",
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.3)",
  },
  rowBody: {
    flex: 1,
  },
  rowTitle: {
    color: Colors.text,
    fontSize: 15.5,
    fontWeight: "700",
  },
  rowSubtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  rowMeta: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
  },
  empty: {
    alignItems: "center",
    paddingTop: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
