import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "@/components/ui/avatar";
import { BackButton } from "@/components/ui/back-button";
import { PressableScale } from "@/components/ui/pressable-scale";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Brand, Colors, Radius, Spacing } from "@/constants/theme";
import { startChat } from "@/lib/chat";
import type { Friend } from "@/lib/friends";
import { tapFeedback } from "@/lib/haptics";
import { chatHref, toHref } from "@/lib/navigation";
import { useFriends } from "@/queries/use-friends";
import { useAuthStore } from "@/store/use-auth-store";

export default function FriendsScreen() {
  const uid = useAuthStore((state) => state.user?.uid);
  const { data: friends, isLoading } = useFriends(uid);

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Friends</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <Text style={styles.muted}>Loading…</Text>
          ) : !friends || friends.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No friends yet</Text>
              <Text style={styles.emptyText}>
                Invite people you know — once they join, they show up here.
              </Text>
              <PressableScale
                accessibilityLabel="Invite a friend"
                onPress={() => {
                  tapFeedback();
                  router.push(toHref("/invite"));
                }}
              >
                <View style={styles.inviteButton}>
                  <Text style={styles.inviteButtonText}>Invite a friend</Text>
                </View>
              </PressableScale>
            </View>
          ) : (
            <View style={styles.list}>
              {friends.map((friend, index) => (
                <View key={friend.uid}>
                  {index > 0 ? <View style={styles.divider} /> : null}
                  <FriendRow friend={friend} uid={uid as string} />
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

function FriendRow({ friend, uid }: { friend: Friend; uid: string }) {
  const [opening, setOpening] = useState(false);

  const message = async () => {
    if (opening) return;
    tapFeedback();
    setOpening(true);
    try {
      const threadId = await startChat(uid, friend.uid);
      router.push(chatHref(threadId, friend.name, friend.avatar));
    } finally {
      setOpening(false);
    }
  };

  return (
    <View style={styles.row}>
      <Avatar name={friend.name} url={friend.avatar} size={48} />
      <Text style={styles.name} numberOfLines={1}>
        {friend.name}
      </Text>
      <PressableScale
        accessibilityLabel={`Message ${friend.name}`}
        onPress={() => void message()}
        disabled={opening}
      >
        <View style={styles.messageButton}>
          <Text style={styles.messageButtonText}>
            {opening ? "Opening…" : "Message"}
          </Text>
        </View>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    color: Colors.text,
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  muted: {
    color: Colors.textSecondary,
    fontSize: 14,
    paddingTop: Spacing.lg,
  },
  list: {
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.base,
    padding: Spacing.base,
  },
  name: {
    flex: 1,
    color: Colors.text,
    fontSize: 15.5,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    marginLeft: Spacing.base + 48 + Spacing.base,
    backgroundColor: Colors.border,
  },
  messageButton: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(22,179,100,0.12)",
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.4)",
  },
  messageButtonText: {
    color: Brand.primaryLight,
    fontSize: 13,
    fontWeight: "700",
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
  inviteButton: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderRadius: Radius.pill,
    backgroundColor: Brand.primary,
  },
  inviteButtonText: {
    color: "#04170D",
    fontSize: 15,
    fontWeight: "700",
  },
});
