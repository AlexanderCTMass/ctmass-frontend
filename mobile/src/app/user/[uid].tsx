import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "@/components/ui/avatar";
import { BackButton } from "@/components/ui/back-button";
import { PressableScale } from "@/components/ui/pressable-scale";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Brand, Colors, Radius, Spacing } from "@/constants/theme";
import { tapFeedback } from "@/lib/haptics";
import {
  type BlockState,
  blockUser,
  fetchBlockState,
  unblockUser,
} from "@/lib/moderation";
import { toHref } from "@/lib/navigation";
import { fetchPublicProfile, type PublicProfile } from "@/lib/public-profile";
import { useAuthStore } from "@/store/use-auth-store";

function roleLabel(role: string | null): string {
  if (role === "WORKER") return "Contractor";
  if (role === "CUSTOMER") return "Homeowner";
  return "Member";
}

export default function PublicProfileScreen() {
  const params = useLocalSearchParams<{ uid?: string; name?: string }>();
  const targetId = typeof params.uid === "string" ? params.uid : "";
  const fallbackName = typeof params.name === "string" ? params.name : "User";
  const uid = useAuthStore((state) => state.user?.uid) ?? "";

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [block, setBlock] = useState<BlockState>({
    iBlocked: false,
    blockedMe: false,
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!targetId) return;
    let active = true;
    void fetchPublicProfile(targetId).then((data) => {
      if (active) {
        setProfile(data);
        setLoading(false);
      }
    });
    if (uid) {
      void fetchBlockState(uid, targetId).then((state) => {
        if (active) setBlock(state);
      });
    }
    return () => {
      active = false;
    };
  }, [targetId, uid]);

  const isContractor = profile?.role === "WORKER";
  const name = profile?.name || fallbackName;

  const goReport = () => {
    tapFeedback();
    router.push(
      toHref(
        `/report?uid=${encodeURIComponent(targetId)}&name=${encodeURIComponent(name)}`,
      ),
    );
  };

  const runBlock = async () => {
    if (!uid || !targetId || busy) return;
    setBusy(true);
    try {
      await blockUser(uid, targetId);
      setBlock((prev) => ({ ...prev, iBlocked: true }));
    } catch {
      Alert.alert("Couldn't block", "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const runUnblock = async () => {
    if (!uid || !targetId || busy) return;
    setBusy(true);
    try {
      await unblockUser(uid, targetId);
      setBlock((prev) => ({ ...prev, iBlocked: false }));
    } catch {
      Alert.alert("Couldn't unblock", "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleBlockToggle = () => {
    if (block.iBlocked) {
      void runUnblock();
      return;
    }
    tapFeedback();
    Alert.alert(
      `Block ${name}?`,
      "They won't be able to message you, and you won't see their messages.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: () => void runBlock(),
        },
      ],
    );
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.spacer} />
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={Brand.primaryLight} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.topCard}>
              <Avatar name={name} url={profile?.avatar ?? null} size={84} />
              <Text style={styles.name} numberOfLines={1}>
                {name}
              </Text>
              <Text style={styles.role}>{roleLabel(profile?.role ?? null)}</Text>
              {profile?.address ? (
                <Text style={styles.address} numberOfLines={2}>
                  {profile.address}
                </Text>
              ) : null}
            </View>

            {isContractor &&
            (profile?.businessName ||
              profile?.professionalRole ||
              profile?.shortBio) ? (
              <View style={styles.infoCard}>
                {profile?.businessName ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Business</Text>
                    <Text style={styles.infoValue}>{profile.businessName}</Text>
                  </View>
                ) : null}
                {profile?.professionalRole ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Role</Text>
                    <Text style={styles.infoValue}>
                      {profile.professionalRole}
                    </Text>
                  </View>
                ) : null}
                {profile?.shortBio ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>About</Text>
                    <Text style={styles.infoValue}>{profile.shortBio}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            {block.blockedMe && !block.iBlocked ? (
              <View style={styles.noticeCard}>
                <Text style={styles.noticeText}>
                  This user has restricted messaging with you.
                </Text>
              </View>
            ) : null}

            <View style={styles.actions}>
              <PressableScale
                accessibilityLabel={`Report ${name}`}
                onPress={goReport}
                scaleTo={0.98}
              >
                <View style={styles.reportButton}>
                  <Text style={styles.reportText}>Report</Text>
                </View>
              </PressableScale>

              <PressableScale
                accessibilityLabel={block.iBlocked ? "Unblock" : "Block"}
                onPress={handleBlockToggle}
                disabled={busy}
                scaleTo={0.98}
              >
                <View
                  style={[
                    styles.blockButton,
                    block.iBlocked && styles.unblockButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.blockText,
                      block.iBlocked && styles.unblockText,
                    ]}
                  >
                    {busy
                      ? "…"
                      : block.iBlocked
                        ? "Unblock user"
                        : "Block user"}
                  </Text>
                </View>
              </PressableScale>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  spacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xxl,
    gap: Spacing.base,
  },
  topCard: {
    alignItems: "center",
    gap: 6,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.base,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  name: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginTop: Spacing.sm,
  },
  role: {
    color: Brand.primaryLight,
    fontSize: 13.5,
    fontWeight: "700",
  },
  address: {
    color: Colors.textSecondary,
    fontSize: 13.5,
    textAlign: "center",
    marginTop: 4,
  },
  infoCard: {
    padding: Spacing.base,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  infoRow: {
    gap: 2,
  },
  infoLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  infoValue: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 21,
  },
  noticeCard: {
    padding: Spacing.base,
    borderRadius: Radius.md,
    backgroundColor: "rgba(240,68,56,0.1)",
    borderWidth: 1,
    borderColor: "rgba(240,68,56,0.3)",
  },
  noticeText: {
    color: "#FCA5A5",
    fontSize: 13.5,
    fontWeight: "600",
  },
  actions: {
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  reportButton: {
    height: 52,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reportText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  blockButton: {
    height: 52,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(220,38,38,0.1)",
    borderWidth: 1,
    borderColor: "rgba(220,38,38,0.35)",
  },
  blockText: {
    color: "#F87171",
    fontSize: 15,
    fontWeight: "700",
  },
  unblockButton: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  unblockText: {
    color: Colors.text,
  },
});
