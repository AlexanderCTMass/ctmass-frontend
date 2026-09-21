import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AwardIcon,
  CloseIcon,
  MapPinIcon,
  PlayIcon,
  ReviewIcon,
} from "@/components/icons";
import { ProfileShareActions } from "@/components/profile/profile-share-actions";
import { Avatar } from "@/components/ui/avatar";
import { BackButton } from "@/components/ui/back-button";
import { PressableScale } from "@/components/ui/pressable-scale";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { analyticsEvents } from "@/lib/analytics-events";
import { clearPendingInviterRef, setPendingInviterRef } from "@/lib/deep-links";
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
import { type VideoStory, fetchUserVideos } from "@/lib/videos";
import { VideoStoryViewer } from "@/components/video/video-story-viewer";
import { useAppStore } from "@/store/use-app-store";
import { useAuthStore } from "@/store/use-auth-store";

function roleLabel(role: string | null): string {
  if (role === "WORKER") return "Contractor";
  if (role === "CUSTOMER") return "Homeowner";
  return "Member";
}

export default function PublicProfileScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
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
  const [videos, setVideos] = useState<VideoStory[]>([]);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
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
      fetchUserVideos(targetId).catch(() => [] as VideoStory[]),
    ])
      .then(([profileData, tradeList, certList, videoList]) => {
        if (!active) return;
        setProfile(profileData);
        setTrades(tradeList);
        setCertificates(certList);
        setVideos(videoList);
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

  const viewedRef = useRef(false);
  useEffect(() => {
    if (loading || !targetId || viewedRef.current) return;
    viewedRef.current = true;
    analyticsEvents.publicProfileViewed({
      target_uid: targetId,
      is_own: isOwnProfile,
      target_role: profile?.role ?? null,
      trades_count: trades.length,
      certificates_count: certificates.length,
      via_invite: wantsConnect,
      is_blocked: block.iBlocked || block.blockedMe,
    });
  }, [
    loading,
    targetId,
    isOwnProfile,
    profile?.role,
    trades.length,
    certificates.length,
    wantsConnect,
    block.iBlocked,
    block.blockedMe,
  ]);

  const goReport = () => {
    analyticsEvents.reportUserTapped({ target_uid: targetId });
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
      analyticsEvents.userBlocked({ target_uid: targetId });
      setBlock((prev) => ({ ...prev, iBlocked: true }));
    } catch {
      analyticsEvents.blockToggleFailed({
        target_uid: targetId,
        action: "block",
      });
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
      analyticsEvents.userUnblocked({ target_uid: targetId });
      setBlock((prev) => ({ ...prev, iBlocked: false }));
    } catch {
      analyticsEvents.blockToggleFailed({
        target_uid: targetId,
        action: "unblock",
      });
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
    analyticsEvents.blockUserTapped({ target_uid: targetId });
    Alert.alert(
      `Block ${name}?`,
      "They won't be able to message you, and you won't see their messages.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () =>
            analyticsEvents.blockUserCancelled({ target_uid: targetId }),
        },
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
      analyticsEvents.friendInviteAccepted({ inviter_uid: targetId });
      setFriendDone(true);
    } catch {
      analyticsEvents.friendInviteAcceptFailed({ inviter_uid: targetId });
      Alert.alert("Couldn't add friend", "Please try again.");
    } finally {
      setFriendBusy(false);
    }
  };

  const handleAcceptInvite = () => {
    tapFeedback();
    analyticsEvents.friendInviteAcceptTapped({
      inviter_uid: targetId,
      is_authenticated: isAuthenticated,
    });
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
    analyticsEvents.friendInviteExploreTapped({ inviter_uid: targetId });
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
            <ActivityIndicator color={colors.accent} />
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
              <Text style={styles.role}>
                {roleLabel(profile?.role ?? null)}
              </Text>
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
                  {trades.map((trade, index) => (
                    <PressableScale
                      key={trade.tradeId}
                      accessibilityLabel={`Open ${trade.name}`}
                      onPress={() => {
                        tapFeedback();
                        analyticsEvents.publicProfileTradeOpened({
                          target_uid: targetId,
                          trade_id: trade.tradeId,
                          position: index,
                        });
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
                                color={colors.textSecondary}
                              />
                              <Text style={styles.tradeMeta} numberOfLines={1}>
                                {trade.placeName}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                        {trade.rating > 0 ? (
                          <View style={styles.tradeRating}>
                            <ReviewIcon size={13} color={colors.coin} />
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
                  <AwardIcon size={18} color={colors.accent} />
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
                              analyticsEvents.publicProfileCertificateOpened({
                                target_uid: targetId,
                                certificate_id: cert.id,
                              });
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

            {profile?.plan === "Pro" && videos.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <PlayIcon size={18} color={colors.accent} />
                  <Text style={styles.sectionTitle}>Videos</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.videoRow}
                >
                  {videos.map((video, index) => (
                    <PressableScale
                      key={video.id}
                      accessibilityLabel={`Play ${video.title || "video"}`}
                      onPress={() => {
                        tapFeedback();
                        analyticsEvents.videoViewerOpened({
                          target_uid: targetId,
                          videos_count: videos.length,
                          position: index,
                        });
                        setViewerIndex(index);
                      }}
                      scaleTo={0.97}
                    >
                      <View style={styles.videoCard}>
                        <Image
                          source={{ uri: video.preview }}
                          style={styles.videoCardImage}
                          contentFit="cover"
                          transition={150}
                        />
                        <View style={styles.videoCardBadge}>
                          <PlayIcon size={14} color="#FFFFFF" filled />
                        </View>
                        {video.title ? (
                          <View style={styles.videoCardCaption}>
                            <Text
                              style={styles.videoCardTitle}
                              numberOfLines={1}
                            >
                              {video.title}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </PressableScale>
                  ))}
                </ScrollView>
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
                targetUid={targetId}
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

      <VideoStoryViewer
        visible={viewerIndex !== null}
        stories={videos}
        initialIndex={viewerIndex ?? 0}
        viewerId={uid}
        canInteract={isAuthenticated}
        onClose={() => setViewerIndex(null)}
      />

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

const useStyles = makeStyles((t) => ({
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
    color: t.colors.text,
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
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  name: {
    color: t.colors.text,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginTop: Spacing.sm,
  },
  role: {
    color: t.colors.accent,
    fontSize: 13.5,
    fontWeight: "700",
  },
  address: {
    color: t.colors.textSecondary,
    fontSize: 13.5,
    textAlign: "center",
    marginTop: 4,
  },
  infoCard: {
    padding: Spacing.base,
    borderRadius: Radius.md,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    gap: Spacing.md,
  },
  infoRow: {
    gap: 2,
  },
  infoLabel: {
    color: t.colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  infoValue: {
    color: t.colors.text,
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
    color: t.colors.text,
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
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  tradeBody: {
    flex: 1,
    gap: 2,
  },
  tradeName: {
    color: t.colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  tradeSpecialty: {
    color: t.colors.accent,
    fontSize: 13,
    fontWeight: "600",
  },
  tradeMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tradeMeta: {
    color: t.colors.textSecondary,
    fontSize: 12.5,
  },
  tradeRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tradeRatingText: {
    color: t.colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  certList: {
    gap: Spacing.md,
  },
  certCard: {
    padding: Spacing.base,
    borderRadius: Radius.md,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    gap: Spacing.sm,
  },
  certTitle: {
    color: t.colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  certSub: {
    color: t.colors.textSecondary,
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
    backgroundColor: t.colors.background,
  },
  videoRow: {
    gap: Spacing.sm,
    paddingRight: Spacing.base,
  },
  videoCard: {
    width: 132,
    height: 196,
    borderRadius: Radius.md,
    overflow: "hidden",
    backgroundColor: t.colors.surface,
  },
  videoCardImage: {
    width: "100%",
    height: "100%",
  },
  videoCardBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  videoCardCaption: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: Spacing.sm,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  videoCardTitle: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "700",
  },
  noticeCard: {
    padding: Spacing.base,
    borderRadius: Radius.md,
    backgroundColor: "rgba(240,68,56,0.1)",
    borderWidth: 1,
    borderColor: "rgba(240,68,56,0.3)",
  },
  noticeText: {
    color: t.colors.dangerText,
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
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  reportText: {
    color: t.colors.text,
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
    color: t.colors.destructive,
    fontSize: 15,
    fontWeight: "700",
  },
  unblockButton: {
    backgroundColor: t.colors.surface,
    borderColor: t.colors.border,
  },
  unblockText: {
    color: t.colors.text,
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
    backgroundColor: t.colors.background,
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
  },
  ctaSecondary: {
    color: t.colors.textSecondary,
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
}));
