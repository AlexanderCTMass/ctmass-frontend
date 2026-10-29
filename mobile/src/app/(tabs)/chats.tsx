import { FlashList } from "@shopify/flash-list";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { CheckIcon, CloseIcon, TrashIcon } from "@/components/icons";
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
import { clearMessageNotification } from "@/lib/app-notifications";
import {
  type ChatThread,
  deleteThreadsForUser,
  getLastMessage,
  getUnreadCount,
  hasMessagesAfter,
  parseMessageBody,
  translateChatText,
  startChat,
  subscribeThreads,
} from "@/lib/chat";
import { timeAgo } from "@/lib/format";
import { selectFeedback, tapFeedback } from "@/lib/haptics";
import { type Translate, useT } from "@/lib/i18n";
import { chatHref } from "@/lib/navigation";
import { fetchProjectById } from "@/lib/projects";
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
  projectTitle: string | null;
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

const projectTitleCache = new Map<string, string | null>();

async function fetchProjectTitleCached(
  projectId: string | undefined,
): Promise<string | null> {
  if (!projectId) return null;
  if (projectTitleCache.has(projectId)) {
    return projectTitleCache.get(projectId) ?? null;
  }
  try {
    const project = await fetchProjectById(projectId);
    const title = project?.title.trim() || null;
    projectTitleCache.set(projectId, title);
    return title;
  } catch {
    return null;
  }
}

const PREVIEW_EMPTY = "\u0000empty";
const PREVIEW_PHOTO = "\u0000photo";
const PREVIEW_ATTACHMENT = "\u0000attachment";

function previewText(text: string, mine: boolean): string {
  if (!text) return PREVIEW_EMPTY;
  return (
    parseMessageBody(text, mine).text.replace(/\s+/g, " ").trim() ||
    PREVIEW_ATTACHMENT
  );
}

function previewLabel(value: string, t: Translate): string {
  if (value === PREVIEW_EMPTY) return t("chats.noMessages");
  if (value === PREVIEW_PHOTO) return t("chats.photo");
  if (value === PREVIEW_ATTACHMENT) return t("chats.attachment");
  return translateChatText(t, value);
}

async function enrichThreads(
  threads: ChatThread[],
  uid: string,
): Promise<ThreadRow[]> {
  const rows = await Promise.all(
    threads.map(async (thread) => {
      if (
        thread.needsRevivalCheck &&
        thread.clearedAt &&
        !(await hasMessagesAfter(thread.id, thread.clearedAt))
      ) {
        return null;
      }
      const unreadCount = await getUnreadCount(
        thread.id,
        uid,
        thread.clearedAt,
      );

      const peerUid = thread.users.find((item) => item !== uid) ?? uid;
      const peer = await fetchProfileBriefCached(peerUid);
      const projectTitle = await fetchProjectTitleCached(thread.projectId);

      let lastText: string;
      let lastAt: Date | null;
      if (thread.hasMessageMeta && !thread.needsRevivalCheck) {
        lastText = thread.lastText
          ? previewText(thread.lastText, thread.lastSenderId === uid)
          : thread.lastIsAttachment
            ? PREVIEW_PHOTO
            : PREVIEW_EMPTY;
        lastAt = thread.updatedAt ?? null;
      } else {
        const last = await getLastMessage(thread.id);
        lastText = last?.text
          ? previewText(last.text, last.senderId === uid)
          : last && last.attachments.length > 0
            ? PREVIEW_PHOTO
            : PREVIEW_EMPTY;
        lastAt = last?.createdAt ?? thread.updatedAt ?? null;
      }

      return {
        id: thread.id,
        peerUid,
        peerName: peer.name,
        peerAvatar: peer.avatar,
        projectTitle,
        lastText,
        lastAt,
        unreadCount,
      };
    }),
  );
  return rows.filter((row): row is ThreadRow => row !== null);
}

function Row({
  row,
  selecting,
  selected,
  onPress,
  onLongPress,
}: {
  row: ThreadRow;
  selecting: boolean;
  selected: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const styles = useStyles();
  const { t, tx } = useT();
  return (
    <PressableScale
      accessibilityLabel={
        selecting
          ? selected
            ? t("chats.deselectA11y", { name: row.peerName })
            : t("chats.selectA11y", { name: row.peerName })
          : t("chats.openA11y", { name: row.peerName })
      }
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={[styles.row, selected && styles.rowSelected]}>
        <View>
          <Avatar name={row.peerName} url={row.peerAvatar} size={48} />
          {selected ? (
            <View style={styles.selectedMark}>
              <CheckIcon size={12} color="#04170D" strokeWidth={3} />
            </View>
          ) : null}
        </View>
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
              {timeAgo(row.lastAt, t)}
            </Text>
          </View>
          {row.projectTitle ? (
            <Text style={styles.rowProject} numberOfLines={1}>
              {tx(row.projectTitle)}
            </Text>
          ) : null}
          <View style={styles.rowBottom}>
            <Text
              style={[
                styles.rowLast,
                row.unreadCount > 0 && styles.rowLastUnread,
              ]}
              numberOfLines={1}
            >
              {previewLabel(row.lastText, t)}
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
  const { t } = useT();
  return (
    <PressableScale
      accessibilityLabel={t("chats.startA11y", { name: person.name })}
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
  const { t } = useT();
  const uid = useAuthStore((state) => state.user?.uid);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [rows, setRows] = useState<ThreadRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [people, setPeople] = useState<PersonResult[]>([]);
  const [peopleLoaded, setPeopleLoaded] = useState(false);
  const [starting, setStarting] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const threadsRef = useRef<ChatThread[]>([]);
  const enrichSeqRef = useRef(0);

  const applyThreads = useCallback(
    (threads: ChatThread[]) => {
      if (!uid) return;
      threadsRef.current = threads;
      const seq = ++enrichSeqRef.current;
      void enrichThreads(threads, uid).then((next) => {
        if (seq !== enrichSeqRef.current) return;
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
      const seq = ++enrichSeqRef.current;
      void enrichThreads(threadsRef.current, uid).then((next) => {
        if (seq === enrichSeqRef.current) setRows(next);
      });
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

  const selected = selectedIds.filter((id) =>
    rows.some((row) => row.id === id),
  );
  const selecting = selected.length > 0;

  useFocusEffect(
    useCallback(() => {
      return () => setSelectedIds([]);
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      if (!selecting) return;
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          setSelectedIds([]);
          return true;
        },
      );
      return () => subscription.remove();
    }, [selecting]),
  );

  const toggleSelected = (threadId: string) => {
    setSelectedIds((current) =>
      current.includes(threadId)
        ? current.filter((id) => id !== threadId)
        : [...current, threadId],
    );
  };

  const handleRowPress = (
    row: ThreadRow,
    position: number,
    source: "list" | "search",
  ) => {
    if (selecting) {
      toggleSelected(row.id);
      return;
    }
    analyticsEvents.chatThreadOpened({
      thread_id: row.id,
      unread_count: row.unreadCount,
      position,
      source,
    });
    router.push(chatHref(row.id, row.peerName, row.peerAvatar));
  };

  const handleRowLongPress = (row: ThreadRow) => {
    selectFeedback();
    if (!selecting) {
      analyticsEvents.chatsSelectionStarted({ thread_id: row.id });
    }
    toggleSelected(row.id);
  };

  const deleteSelected = async () => {
    if (!uid || selected.length === 0) return;
    const ids = selected;
    const peerUids = [
      ...new Set(
        rows.filter((row) => ids.includes(row.id)).map((row) => row.peerUid),
      ),
    ];
    setSelectedIds([]);
    enrichSeqRef.current += 1;
    setRows((current) => current.filter((row) => !ids.includes(row.id)));
    try {
      await deleteThreadsForUser(ids, uid);
      analyticsEvents.chatsDeleted({ count: ids.length });
      for (const peerUid of peerUids) {
        await clearMessageNotification(uid, peerUid);
      }
    } catch (error) {
      analyticsEvents.chatsDeleteFailed({
        count: ids.length,
        error_message: errorMessage(error),
      });
      applyThreads(threadsRef.current);
      Alert.alert(t("tradePage.deleteFailed"), t("common.pleaseTryAgain"));
    }
  };

  const confirmDelete = () => {
    tapFeedback();
    const many = selected.length > 1;
    Alert.alert(
      many
        ? t("chats.deleteManyTitle", { count: selected.length })
        : t("chats.deleteOneTitle"),
      many ? t("chats.deleteManyText") : t("chats.deleteOneText"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => void deleteSelected(),
        },
      ],
    );
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
      listData.push({ kind: "header", id: "h:chats", title: t("chats.chats") });
      for (const row of threadMatches) {
        listData.push({ kind: "thread", id: `t:${row.id}`, row });
      }
    }
    if (peopleMatches.length > 0) {
      listData.push({
        kind: "header",
        id: "h:people",
        title: t("chats.startNew"),
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
        title={t("chats.guestTitle")}
        text={t("chats.guestText")}
      />
    );
  }

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          {selecting ? (
            <View style={styles.selectionBar}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("chats.cancelSelection")}
                hitSlop={8}
                style={styles.selectionButton}
                onPress={() => {
                  tapFeedback();
                  setSelectedIds([]);
                }}
              >
                <CloseIcon size={20} color={colors.text} />
              </Pressable>
              <Text style={styles.selectionCount}>
                {t("chats.selected", { count: selected.length })}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("chats.deleteSelected")}
                hitSlop={8}
                style={styles.selectionButton}
                onPress={confirmDelete}
              >
                <TrashIcon size={20} color={colors.danger} />
              </Pressable>
            </View>
          ) : (
            <Text style={styles.heading}>{t("chats.title")}</Text>
          )}
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t("chats.search")}
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
            extraData={selected}
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
                  selecting={selecting}
                  selected={selected.includes(item.row.id)}
                  onPress={() =>
                    handleRowPress(
                      item.row,
                      index,
                      searching ? "search" : "list",
                    )
                  }
                  onLongPress={() => handleRowLongPress(item.row)}
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
                      <Text style={styles.emptyTitle}>
                        {t("chats.nothingFound")}
                      </Text>
                      <Text style={styles.emptyText}>
                        {t("chats.nothingFoundText")}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.emptyTitle}>
                        {t("chats.noMessages")}
                      </Text>
                      <Text style={styles.emptyText}>
                        {t("chats.emptyText")}
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
  selectionBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  selectionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  selectionCount: {
    flex: 1,
    color: t.colors.text,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
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
  rowSelected: {
    marginHorizontal: -Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: t.isDark
      ? "rgba(22,179,100,0.18)"
      : "rgba(22,179,100,0.14)",
  },
  selectedMark: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.primary,
    borderWidth: 2,
    borderColor: t.colors.background,
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
  rowProject: {
    color: t.colors.accent,
    fontSize: 12,
    fontWeight: "600",
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
