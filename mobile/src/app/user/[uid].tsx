import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AwardIcon, CloseIcon, MapPinIcon, ReviewIcon } from "@/components/icons";
import { ProfileShareActions } from "@/components/profile/profile-share-actions";
import { Avatar } from "@/components/ui/avatar";
import { BackButton } from "@/components/ui/back-button";
import { PressableScale } from "@/components/ui/pressable-scale";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Brand, Colors, Radius, Spacing } from "@/constants/theme";
import { useRequireAuth } from "@/hooks/use-require-auth";
import {
  clearPendingInviterRef,
  setPendingInviterRef,
} from "@/lib/deep-links";
import { confirmFriendship, fetchFriendIds } from "@/lib/friends";
import { tapFeedback } from "@/lib/haptics";
import {
  type BlockState,
  blockUser,
  fetchBlockState,
  unblockUser,
} from "@/lib/moderation";
import { type Certificate, fetchPublicCertificates } from "@/lib/certificates";
import { toHref } from "@/lib/navigation";
import {
  fetchPublicProfile,
  profileShareUrl,
  type PublicProfile,
} from "@/lib/public-profile";
import { fetchTradesByOwner, type Specialist } from "@/lib/trades";
import { useAppStore } from "@/store/use-app-store";
import { useAuthStore } from "@/store/use-auth-store";

function roleLabel(role: string | null): string {
  if (role === "WORKER") return "Contractor";
  if (role === "CUSTOMER") return "Homeowner";
  return "Member";
}

export default function PublicProfileScreen() {
  const params = useLocalSearchParams<{
    uid?: string;
    name?: string;
    connect?: string;
  }>();
  const targetId = typeof params.uid === "string" ? params.uid : "";
  const fallbackName = typeof params.name === "string" ? params.name : "User";
  const wantsConnect = params.connect === "1";
  const uid = useAuthStore((state) => state.user?.uid) ?? "";
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasCompletedOnboarding = useAppStore(
    (state) => state.hasCompletedOnboarding,
  );
  const requireAuth = useRequireAuth();

  const isOwnProfile = Boolean(uid && uid === targetId);

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [trades, setTrades] = useState<Specialist[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [block, setBlock] = useState<BlockState>({
    iBlocked: false,
    blockedMe: false,
  });
  const [busy, setBusy] = useState(false);
  const [viewerUri, setViewerUri] = useState<string | null>(null);

  const [alreadyFriend, setAlreadyFriend] = useState(false);
  const [friendBusy, setFriendBusy] = useState(false);
  const [friendDone, setFriendDone] = useState(false);
  const [ctaDismissed, setCtaDismissed] = useState(false);

  useEffect(() => {
    if (!targetId) return;
    let active = true;

    void Promise.all([
      fetchPublicProfile(targetId),
      fetchTradesByOwner(targetId).catch(() => [] as Specialist[]),
      fetchPublicCertificates(targetId).catch(() => [] as Certificate[]),
    ])
      .then(([profileData, tradeList, certList]) => {
        if (!active) return;
        setProfile(profileData);
        setTrades(tradeList);
        setCertificates(certList);
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    if (uid && uid !== targetId) {
      void fetchBlockState(uid, targetId)
        .then((state) => {
          if (active) setBlock(state);
        })
        .catch(() => undefined);
      void fetchFriendIds(uid)
        .then((ids) => {
          if (active) setAlreadyFriend(ids.includes(targetId));
        })
        .catch(() => undefined);
    }

    return () => {
      active = false;
    };
  }, [targetId, uid]);

  const isContractor = profile?.role === "WORKER";
  const name = profile?.name || fallbackName;

  const goReport = () => {
    if (!requireAuth()) return;
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
    if (!requireAuth()) return;
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

  const acceptNow = async () => {
    if (!uid || friendBusy) return;
    setFriendBusy(true);
    try {
      await confirmFriendship(targetId, uid);
      setFriendDone(true);
    } catch {
      Alert.alert("Couldn't add friend", "Please try again.");
    } finally {
      setFriendBusy(false);
    }
  };

  const handleAcceptInvite = () => {
    tapFeedback();
    if (isAuthenticated && uid) {
      void acceptNow();
      return;
    }
    setPendingInviterRef(targetId);
    if (!hasCompletedOnboarding) {
      router.replace(toHref("/welcome"));
    } else {
      const next = encodeURIComponent(`/user/${targetId}`);
      router.push(toHref(`/auth?next=${next}`));
    }
  };

  const handleExplore = () => {
    tapFeedback();
    clearPendingInviterRef();
    if (!hasCompletedOnboarding) {
      router.replace(toHref("/welcome"));
      return;
    }
    setCtaDismissed(true);
  };

  const showInviteCta =
    wantsConnect &&
    !isOwnProfile &&
    !alreadyFriend &&
    !friendDone &&
    !ctaDismissed;

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.headerTitle}>
            {isOwnProfile ? "Your public profile" : "Profile"}
          </Text>
          <View style={styles.spacer} />
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={Brand.primaryLight} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[
              styles.content,
              showInviteCta && styles.contentWithCta,
            ]}
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

            {trades.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Trades</Text>
                <View style={styles.tradesList}>
                  {trades.map((trade) => (
                    <PressableScale
                      key={trade.tradeId}
                      accessibilityLabel={`Open ${trade.name}`}
                      onPress={() => {
                        tapFeedback();
                        router.push(
                          toHref(
                            `/trade/${encodeURIComponent(trade.ownerId)}?tradeId=${encodeURIComponent(trade.tradeId)}`,
                          ),
                        );
                      }}
                      scaleTo={0.98}
                    >
                      <View style={styles.tradeRow}>
                        <Avatar
                          name={trade.name}
                          url={trade.avatarUrl || null}
                          size={44}
                        />
                        <View style={styles.tradeBody}>
                          <Text style={styles.tradeName} numberOfLines={1}>
                            {trade.name}
                          </Text>
                          {trade.specialtyLabel ? (
                            <Text
                              style={styles.tradeSpecialty}
                              numberOfLines={1}
                            >
                              {trade.specialtyLabel}
                            </Text>
                          ) : null}
                          {trade.placeName ? (
                            <View style={styles.tradeMetaRow}>
                              <MapPinIcon
                                size={12}
                                color={Colors.textSecondary}
                              />
                              <Text
                                style={styles.tradeMeta}
                                numberOfLines={1}
                              >
                                {trade.placeName}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                        {trade.rating > 0 ? (
                          <View style={styles.tradeRating}>
                            <ReviewIcon size={13} color={Brand.coin} />
                            <Text style={styles.tradeRatingText}>
                              {trade.rating.toFixed(1)}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </PressableScale>
                  ))}
                </View>
              </View>
            ) : null}

            {certificates.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <AwardIcon size={18} color={Brand.primaryLight} />
                  <Text style={styles.sectionTitle}>
                    Certificates &amp; documents
                  </Text>
                </View>
                <View style={styles.certList}>
                  {certificates.map((cert) => (
                    <View key={cert.id} style={styles.certCard}>
                      {cert.institution || cert.documentType ? (
                        <Text style={styles.certTitle} numberOfLines={2}>
                          {cert.institution || cert.documentType}
                        </Text>
                      ) : null}
                      {cert.documentType && cert.institution ? (
                        <Text style={styles.certSub} numberOfLines={1}>
                          {cert.documentType}
                          {cert.year ? ` · ${cert.year}` : ""}
                        </Text>
                      ) : null}
                      <View style={styles.certPhotos}>
                        {cert.files.map((file) => (
                          <PressableScale
                            key={file.id}
                            accessibilityLabel={`Open ${file.name}`}
                            onPress={() => {
                              tapFeedback();
                              setViewerUri(file.url);
                            }}
                            scaleTo={0.97}
                          >
                            <Image
                              source={{ uri: file.url }}
                              style={styles.certPhoto}
                              contentFit="cover"
                              transition={150}
                            />
                          </PressableScale>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {block.blockedMe && !block.iBlocked ? (
              <View style={styles.noticeCard}>
                <Text style={styles.noticeText}>
                  This user has restricted messaging with you.
                </Text>
              </View>
            ) : null}

            {isOwnProfile ? (
              <ProfileShareActions
                url={profileShareUrl(targetId)}
                name={name}
              />
            ) : (
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
            )}
          </ScrollView>
        )}

        {showInviteCta ? (
          <View style={styles.ctaBar}>
            <PrimaryButton
              label={friendBusy ? "Adding…" : "Accept friend invite"}
              withArrow={false}
              loading={friendBusy}
              disabled={friendBusy}
              onPress={handleAcceptInvite}
            />
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={handleExplore}
            >
              <Text style={styles.ctaSecondary}>I&apos;m just exploring</Text>
            </Pressable>
          </View>
        ) : null}
      </SafeAreaView>

      <Modal
        visible={viewerUri !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setViewerUri(null)}
      >
        <View style={styles.viewer}>
          <SafeAreaView style={styles.viewerSafe} edges={["top"]}>
            <View style={styles.viewerHeader}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                hitSlop={12}
                onPress={() => setViewerUri(null)}
                style={styles.viewerClose}
              >
                <CloseIcon size={26} color="#FFFFFF" />
              </Pressable>
            </View>
          </SafeAreaView>
          {viewerUri ? (
            <Image
              source={{ uri: viewerUri }}
              style={styles.viewerImage}
              contentFit="contain"
              transition={150}
            />
          ) : null}
        </View>
      </Modal>
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
  contentWithCta: {
    paddingBottom: 140,
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
  section: {
    gap: Spacing.md,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  tradesList: {
    gap: Spacing.sm,
  },
  tradeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tradeBody: {
    flex: 1,
    gap: 2,
  },
  tradeName: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  tradeSpecialty: {
    color: Brand.primaryLight,
    fontSize: 13,
    fontWeight: "600",
  },
  tradeMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tradeMeta: {
    color: Colors.textSecondary,
    fontSize: 12.5,
  },
  tradeRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tradeRatingText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  certList: {
    gap: Spacing.md,
  },
  certCard: {
    padding: Spacing.base,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  certTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  certSub: {
    color: Colors.textSecondary,
    fontSize: 12.5,
  },
  certPhotos: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: 2,
  },
  certPhoto: {
    width: 84,
    height: 84,
    borderRadius: Radius.sm,
    backgroundColor: Colors.background,
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
  ctaBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  ctaSecondary: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 4,
  },
  viewer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.94)",
  },
  viewerSafe: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  viewerHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  viewerClose: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  viewerImage: {
    flex: 1,
    width: "100%",
  },
});
