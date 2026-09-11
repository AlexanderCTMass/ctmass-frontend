import { FlashList } from "@shopify/flash-list";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "@/components/ui/avatar";
import { GuestGate } from "@/components/ui/guest-gate";
import { PressableScale } from "@/components/ui/pressable-scale";
import { ScreenBackground } from "@/components/ui/screen-background";
import {
  Brand,
  Radius,
  Spacing,
  makeStyles,
  useTheme,
} from "@/constants/theme";
import { analyticsEvents, errorMessage } from "@/lib/analytics-events";
import {
  type ChatThread,
  getLastMessage,
  getUnreadCount,
  startChat,
  subscribeThreads,
} from "@/lib/chat";
import { timeAgo } from "@/lib/format";
import { tapFeedback } from "@/lib/haptics";
import { chatHref } from "@/lib/navigation";
import {
  fetchAllPeople,
  fetchProfileBrief,
  filterPeople,
  type PersonResult,
  type ProfileBrief,
} from "@/lib/profiles";
import { useAuthStore } from "@/store/use-auth-store";

type ThreadRow = {
  id: string;
  peerUid: string;
  peerName: string;
  peerAvatar: string | null;
  lastText: string;
  lastAt: Date | null;
  unreadCount: number;
};

type ListItem =
  | { kind: "header"; id: string; title: string }
  | { kind: "thread"; id: string; row: ThreadRow }
  | { kind: "person"; id: string; person: PersonResult };

const profileCache = new Map<string, ProfileBrief>();

async function fetchProfileBriefCached(uid: string): Promise<ProfileBrief> {
  const cached = profileCache.get(uid);
  if (cached) return cached;
  const brief = await fetchProfileBrief(uid);
  profileCache.set(uid, brief);
  return brief;
}

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
      const peer = await fetchProfileBriefCached(peerUid);

      let lastText: string;
      let lastAt: Date | null;
      if (thread.hasMessageMeta) {
        lastText = thread.lastText
          ? previewText(thread.lastText)
          : thread.lastIsAttachment
            ? "Photo"
            : "No messages yet";
        lastAt = thread.updatedAt ?? null;
      } else {
        const last = await getLastMessage(thread.id);
        lastText = last?.text
          ? previewText(last.text)
          : last && last.attachments.length > 0
            ? "Photo"
            : "No messages yet";
        lastAt = last?.createdAt ?? thread.updatedAt ?? null;
      }

      const unreadCount = await getUnreadCount(thread.id, uid);

      return {
        id: thread.id,
        peerUid,
        peerName: peer.name,
        peerAvatar: peer.avatar,
        lastText,
        lastAt,
        unreadCount,
      };
    }),
  );
}

function Row({
  row,
  position,
  source,
}: {
  row: ThreadRow;
  position: number;
  source: "list" | "search";
}) {
  const styles = useStyles();
  return (
    <PressableScale
      accessibilityLabel={`Open chat with ${row.peerName}`}
      onPress={() => {
        tapFeedback();
        analyticsEvents.chatThreadOpened({
          thread_id: row.id,
          unread_count: row.unreadCount,
          position,
          source,
        });
        router.push(chatHref(row.id, row.peerName, row.peerAvatar));
      }}
    >
      <View style={styles.row}>
        <Avatar name={row.peerName} url={row.peerAvatar} size={48} />
        <View style={styles.rowBody}>
          <View style={styles.rowTop}>
            <Text style={styles.rowName} numberOfLines={1}>
              {row.peerName}
            </Text>
            <Text
              style={[
                styles.rowTime,
                row.unreadCount > 0 && styles.rowTimeUnread,
              ]}
            >
              {timeAgo(row.lastAt)}
            </Text>
          </View>
          <View style={styles.rowBottom}>
            <Text
              style={[
                styles.rowLast,
                row.unreadCount > 0 && styles.rowLastUnread,
              ]}
              numberOfLines={1}
            >
              {row.lastText}
            </Text>
            {row.unreadCount > 0 ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {row.unreadCount > 99 ? "99+" : row.unreadCount}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </PressableScale>
  );
}

function PersonRow({
  person,
  busy,
  onPress,
}: {
  person: PersonResult;
  busy: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <PressableScale
      accessibilityLabel={`Start a chat with ${person.name}`}
      onPress={onPress}
      disabled={busy}
    >
      <View style={styles.row}>
        <Avatar name={person.name} url={person.avatar} size={48} />
        <View style={styles.rowBody}>
          <Text style={styles.rowName} numberOfLines={1}>
            {person.name}
          </Text>
          {person.email ? (
            <Text style={styles.personEmail} numberOfLines={1}>
              {person.email}
            </Text>
          ) : null}
        </View>
        {busy ? <ActivityIndicator color={colors.accent} /> : null}
      </View>
    </PressableScale>
  );
}

function SectionHeader({ title }: { title: string }) {
  const styles = useStyles();
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function SkeletonRow() {
  const styles = useStyles();
  return (
    <View style={styles.skelRow}>
      <View style={styles.skelAvatar} />
      <View style={styles.skelBody}>
        <View style={styles.skelLineTop} />
        <View style={styles.skelLineBottom} />
      </View>
    </View>
  );
}

export default function ChatsTab() {
  const { colors } = useTheme();
  const styles = useStyles();
  const uid = useAuthStore((state) => state.user?.uid);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [rows, setRows] = useState<ThreadRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [people, setPeople] = useState<PersonResult[]>([]);
  const [peopleLoaded, setPeopleLoaded] = useState(false);
  const [starting, setStarting] = useState<string | null>(null);
  const threadsRef = useRef<ChatThread[]>([]);

  const applyThreads = useCallback(
    (threads: ChatThread[]) => {
      if (!uid) return;
      threadsRef.current = threads;
      void enrichThreads(threads, uid).then((next) => {
        setRows(next);
        setLoaded(true);
      });
    },
    [uid],
  );

  useEffect(() => {
    if (!uid) return;
    const unsubscribe = subscribeThreads(uid, applyThreads);
    return unsubscribe;
  }, [uid, applyThreads]);

  useFocusEffect(
    useCallback(() => {
      if (!uid || threadsRef.current.length === 0) return;
      void enrichThreads(threadsRef.current, uid).then(setRows);
    }, [uid]),
  );

  useEffect(() => {
    if (!search.trim() || peopleLoaded) return;
    let active = true;
    void fetchAllPeople().then((all) => {
      if (active) {
        setPeople(all);
        setPeopleLoaded(true);
      }
    });
    return () => {
      active = false;
    };
  }, [search, peopleLoaded]);

  const handleStartChat = async (person: PersonResult) => {
    if (!uid || starting) return;
    tapFeedback();
    setStarting(person.uid);
    try {
      const threadId = await startChat(uid, person.uid);
      analyticsEvents.chatNewConversationStarted({ peer_uid: person.uid });
      setSearch("");
      router.push(chatHref(threadId, person.name, person.avatar));
    } catch (error) {
      analyticsEvents.chatNewConversationFailed({
        peer_uid: person.uid,
        error_message: errorMessage(error),
      });
    } finally {
      setStarting(null);
    }
  };

  const query = search.trim();
  const searching = query.length > 0;

  let listData: ListItem[];
  if (!searching) {
    listData = rows.map((row) => ({
      kind: "thread" as const,
      id: `t:${row.id}`,
      row,
    }));
  } else {
    const lower = query.toLowerCase();
    const threadMatches = rows.filter((row) =>
      row.peerName.toLowerCase().includes(lower),
    );
    const exclude = new Set(rows.map((row) => row.peerUid));
    if (uid) exclude.add(uid);
    const peopleMatches = filterPeople(people, query, exclude);

    listData = [];
    if (threadMatches.length > 0) {
      listData.push({ kind: "header", id: "h:chats", title: "Chats" });
      for (const row of threadMatches) {
        listData.push({ kind: "thread", id: `t:${row.id}`, row });
      }
    }
    if (peopleMatches.length > 0) {
      listData.push({
        kind: "header",
        id: "h:people",
        title: "Start a new chat",
      });
      for (const person of peopleMatches) {
        listData.push({ kind: "person", id: `p:${person.uid}`, person });
      }
    }
  }

  const searchThreadsCount = searching
    ? listData.filter((item) => item.kind === "thread").length
    : 0;
  const searchPeopleCount = searching
    ? listData.filter((item) => item.kind === "person").length
    : 0;
  const showEmpty =
    loaded && listData.length === 0 && (!searching || peopleLoaded);

  useEffect(() => {
    if (!query || !peopleLoaded) return;
    const timer = setTimeout(() => {
      analyticsEvents.chatsSearchPerformed({
        query_length: query.length,
        threads_count: searchThreadsCount,
        people_count: searchPeopleCount,
      });
    }, 800);
    return () => clearTimeout(timer);
  }, [query, peopleLoaded, searchThreadsCount, searchPeopleCount]);

  useEffect(() => {
    if (showEmpty) analyticsEvents.chatsEmptyStateShown({ searching });
  }, [showEmpty, searching]);

  if (!isAuthenticated) {
    return (
      <GuestGate
        gate="chats"
        title="Sign in to message"
        text="Create a free account to start conversations and reply to people you connect with."
      />
    );
  }

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.heading}>Messages</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search people…"
            placeholderTextColor={colors.textMuted}
            style={styles.search}
          />
        </View>

        {!loaded ? (
          <View style={styles.skeletonList}>
            {[0, 1, 2, 3, 4, 5, 6].map((key) => (
              <SkeletonRow key={key} />
            ))}
          </View>
        ) : (
          <FlashList
            data={listData}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item, index }) => {
              if (item.kind === "header") {
                return <SectionHeader title={item.title} />;
              }
              if (item.kind === "person") {
                return (
                  <PersonRow
                    person={item.person}
                    busy={starting === item.person.uid}
                    onPress={() => void handleStartChat(item.person)}
                  />
                );
              }
              return (
                <Row
                  row={item.row}
                  position={index}
                  source={searching ? "search" : "list"}
                />
              );
            }}
            ItemSeparatorComponent={
              searching ? undefined : () => <View style={styles.separator} />
            }
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              searching && !peopleLoaded ? (
                <View style={styles.empty}>
                  <ActivityIndicator color={colors.accent} />
                </View>
              ) : (
                <Animated.View
                  entering={FadeIn.duration(360)}
                  style={styles.empty}
                >
                  {searching ? (
                    <>
                      <Text style={styles.emptyTitle}>Nothing found</Text>
                      <Text style={styles.emptyText}>
                        Try a different name or email to start a new chat.
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.emptyTitle}>No messages yet</Text>
                      <Text style={styles.emptyText}>
                        When you connect with someone, your chats appear here.
                      </Text>
                    </>
                  )}
                </Animated.View>
              )
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </ScreenBackground>
  );
}

const useStyles = makeStyles((t) => ({
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
    color: t.colors.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  search: {
    height: 44,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.base,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    color: t.colors.text,
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
  sectionHeader: {
    color: t.colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  personEmail: {
    color: t.colors.textSecondary,
    fontSize: 13,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  rowName: {
    flex: 1,
    color: t.colors.text,
    fontSize: 15.5,
    fontWeight: "700",
  },
  rowTime: {
    color: t.colors.textMuted,
    fontSize: 12,
  },
  rowTimeUnread: {
    color: t.colors.accent,
    fontWeight: "700",
  },
  rowBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  rowLast: {
    flex: 1,
    color: t.colors.textSecondary,
    fontSize: 13.5,
  },
  rowLastUnread: {
    color: t.colors.text,
    fontWeight: "600",
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.primary,
  },
  unreadBadgeText: {
    color: "#04170D",
    fontSize: 11.5,
    fontWeight: "800",
  },
  separator: {
    height: 1,
    backgroundColor: t.colors.border,
  },
  skeletonList: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  skelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.base,
    paddingVertical: Spacing.md,
  },
  skelAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: t.colors.surfaceStrong,
  },
  skelBody: {
    flex: 1,
    gap: Spacing.sm,
  },
  skelLineTop: {
    width: "45%",
    height: 12,
    borderRadius: 6,
    backgroundColor: t.colors.surfaceStrong,
  },
  skelLineBottom: {
    width: "75%",
    height: 11,
    borderRadius: 6,
    backgroundColor: t.isDark ? t.colors.surface : t.colors.skeleton,
  },
  empty: {
    alignItems: "center",
    paddingTop: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  emptyTitle: {
    color: t.colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  emptyText: {
    color: t.colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
}));
