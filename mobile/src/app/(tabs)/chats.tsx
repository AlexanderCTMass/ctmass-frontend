import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "@/components/ui/avatar";
import { PressableScale } from "@/components/ui/pressable-scale";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { type ChatThread, getLastMessage, subscribeThreads } from "@/lib/chat";
import { timeAgo } from "@/lib/format";
import { tapFeedback } from "@/lib/haptics";
import { toHref } from "@/lib/navigation";
import { fetchProfileBrief } from "@/lib/profiles";
import { useAuthStore } from "@/store/use-auth-store";

type ThreadRow = {
  id: string;
  peerName: string;
  peerAvatar: string | null;
  lastText: string;
  lastAt: Date | null;
};

function previewText(text: string): string {
  if (!text) return "No messages yet";
  if (text.startsWith("%HTML:")) return "Attachment";
  if (text.startsWith("%INFO:")) return text.replace(/%INFO:/g, " ").trim();
  return text;
}

async function enrichThreads(
  threads: ChatThread[],
  uid: string,
): Promise<ThreadRow[]> {
  return Promise.all(
    threads.map(async (thread) => {
      const peerUid = thread.users.find((item) => item !== uid) ?? uid;
      const [peer, last] = await Promise.all([
        fetchProfileBrief(peerUid),
        getLastMessage(thread.id),
      ]);
      const lastText = last?.text
        ? previewText(last.text)
        : last && last.attachments.length > 0
          ? "Photo"
          : "No messages yet";
      return {
        id: thread.id,
        peerName: peer.name,
        peerAvatar: peer.avatar,
        lastText,
        lastAt: last?.createdAt ?? thread.updatedAt ?? null,
      };
    }),
  );
}

function Row({ row }: { row: ThreadRow }) {
  return (
    <PressableScale
      accessibilityLabel={`Open chat with ${row.peerName}`}
      onPress={() => {
        tapFeedback();
        router.push(toHref(`/chat?threadId=${encodeURIComponent(row.id)}`));
      }}
    >
      <View style={styles.row}>
        <Avatar name={row.peerName} url={row.peerAvatar} size={48} />
        <View style={styles.rowBody}>
          <View style={styles.rowTop}>
            <Text style={styles.rowName} numberOfLines={1}>
              {row.peerName}
            </Text>
            <Text style={styles.rowTime}>{timeAgo(row.lastAt)}</Text>
          </View>
          <Text style={styles.rowLast} numberOfLines={1}>
            {row.lastText}
          </Text>
        </View>
      </View>
    </PressableScale>
  );
}

export default function ChatsTab() {
  const uid = useAuthStore((state) => state.user?.uid);
  const [rows, setRows] = useState<ThreadRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!uid) return;
    const unsubscribe = subscribeThreads(uid, (threads) => {
      void enrichThreads(threads, uid).then((next) => {
        setRows(next);
        setLoaded(true);
      });
    });
    return unsubscribe;
  }, [uid]);

  const filtered = search.trim()
    ? rows.filter((row) =>
        row.peerName.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : rows;

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.heading}>Messages</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search people…"
            placeholderTextColor={Colors.textMuted}
            style={styles.search}
          />
        </View>

        <FlashList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Row row={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            loaded ? (
              <Animated.View
                entering={FadeIn.duration(360)}
                style={styles.empty}
              >
                <Text style={styles.emptyTitle}>No messages yet</Text>
                <Text style={styles.emptyText}>
                  When you connect with someone, your chats appear here.
                </Text>
              </Animated.View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
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
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
    gap: Spacing.md,
  },
  heading: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  search: {
    height: 44,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.base,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 15,
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
  rowBody: {
    flex: 1,
    gap: 3,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  rowName: {
    flex: 1,
    color: Colors.text,
    fontSize: 15.5,
    fontWeight: "700",
  },
  rowTime: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  rowLast: {
    color: Colors.textSecondary,
    fontSize: 13.5,
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
