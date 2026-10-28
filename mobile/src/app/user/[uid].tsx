import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";

import {
  AwardIcon,
  BuildingIcon,
  MapPinIcon,
  PlayIcon,
  ReviewIcon,
  UsersIcon,
} from "@/components/icons";
import { CommunityBadges } from "@/components/profile/community-badges";
import { ProfileShareActions } from "@/components/profile/profile-share-actions";
import { TierAvatar } from "@/components/trade/tier-badge";
import {
  BusinessPanel,
  hasBusinessDetails,
} from "@/components/trade/trade-sections";
import { Avatar } from "@/components/ui/avatar";
import { BackButton } from "@/components/ui/back-button";
import { ImageViewerModal } from "@/components/ui/image-viewer-modal";
import { PressableScale } from "@/components/ui/pressable-scale";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import {
  Brand,
  Radius,
  Spacing,
  makeStyles,
  useTheme,
} from "@/constants/theme";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { analyticsEvents } from "@/lib/analytics-events";
import {
  clearPendingInviterRef,
  setPendingInviterRef,
  setPendingReferrer,
} from "@/lib/deep-links";
import { notifyFriendAdded } from "@/lib/app-notifications";
import { confirmFriendship, fetchFriendIds } from "@/lib/friends";
import { tapFeedback } from "@/lib/haptics";
import { type Translate, useT } from "@/lib/i18n";
import {
  type BlockState,
  blockUser,
  fetchBlockState,
  unblockUser,
} from "@/lib/moderation";
import {
  type Certificate,
  certificateSubtitle,
  certificateTitle,
  fetchPublicCertificates,
} from "@/lib/certificates";
import { toHref } from "@/lib/navigation";
import { fetchProfileBrief } from "@/lib/profiles";
import {
  fetchPublicProfile,
  profileShareUrl,
  type PublicProfile,
} from "@/lib/public-profile";
import { fetchReviews, reviewSummary, type Review } from "@/lib/reviews";
import { priceLine } from "@/lib/trade-display";
import { fetchTradesByOwner, type Specialist } from "@/lib/trades";
import { type VideoStory, fetchUserVideos } from "@/lib/videos";
import { VideoStoryViewer } from "@/components/video/video-story-viewer";
import { useAppStore } from "@/store/use-app-store";
import { useAuthStore } from "@/store/use-auth-store";
import { useProjectDraftStore } from "@/store/use-project-draft-store";

function roleLabel(role: string | null, t: Translate): string {
  if (role === "WORKER") return t("common.roles.contractor");
  if (role === "CUSTOMER") return t("common.roles.homeowner");
  return t("common.roles.member");
}

export default function PublicProfileScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t, tx } = useT();
  const certNumber = (number: string) =>
    t("trade.sections.licenseNumber", { number });
  const params = useLocalSearchParams<{
    uid?: string;
    name?: string;
    connect?: string;
  }>();
  const targetId = typeof params.uid === "string" ? params.uid : "";
  const fallbackName =
    typeof params.name === "string" ? params.name : t("publicProfile.user");
  const wantsConnect = params.connect === "1";
  const uid = useAuthStore((state) => state.user?.uid) ?? "";
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authReady = useAuthStore((state) => !state.isInitializing);
  const myName = useAuthStore((state) => state.user?.name ?? "");
  const myRole = useAuthStore((state) => state.user?.role ?? null);
  const queryClient = useQueryClient();
  const hasCompletedOnboarding = useAppStore(
    (state) => state.hasCompletedOnboarding,
  );
  const requireAuth = useRequireAuth();

  const isOwnProfile = Boolean(uid && uid === targetId);

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [trades, setTrades] = useState<Specialist[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [videos, setVideos] = useState<VideoStory[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewAuthors, setReviewAuthors] = useState<
    Record<string, { name: string; avatar: string | null }>
  >({});
  const [showAllReviews, setShowAllReviews] = useState(false);
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
  const [friendChecked, setFriendChecked] = useState(false);
  const [ctaDismissed, setCtaDismissed] = useState(false);

  useEffect(() => {
    if (!wantsConnect || !targetId || !authReady || isAuthenticated) return;
    setPendingReferrer(targetId);
    analyticsEvents.referralCaptured({ referrer_uid: targetId });
  }, [wantsConnect, targetId, authReady, isAuthenticated]);

  useEffect(() => {
    if (!targetId) return;
    let active = true;

    void Promise.all([
      fetchPublicProfile(targetId),
      fetchTradesByOwner(targetId).catch(() => [] as Specialist[]),
      fetchPublicCertificates(targetId).catch(() => [] as Certificate[]),
      fetchUserVideos(targetId).catch(() => [] as VideoStory[]),
      fetchReviews(targetId).catch(() => [] as Review[]),
    ])
      .then(
        async ([profileData, tradeList, certList, videoList, reviewList]) => {
          if (!active) return;
          setProfile(profileData);
          setTrades(tradeList);
          setCertificates(certList);
          setVideos(videoList);
          setReviews(reviewList);
          setLoading(false);

          const authorIds = [
            ...new Set(
              reviewList.map((review) => review.authorId).filter(Boolean),
            ),
          ];
          if (authorIds.length > 0) {
            const briefs = await Promise.all(
              authorIds.map((id) =>
                fetchProfileBrief(id)
                  .then(
                    (brief) =>
                      [id, { name: brief.name, avatar: brief.avatar }] as const,
                  )
                  .catch(() => [id, { name: "", avatar: null }] as const),
              ),
            );
            if (active) setReviewAuthors(Object.fromEntries(briefs));
          }
        },
      )
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
        .catch(() => undefined)
        .finally(() => {
          if (active) setFriendChecked(true);
        });
    }

    return () => {
      active = false;
    };
  }, [targetId, uid]);

  const isContractor = profile?.role === "WORKER";
  const name = profile?.name || fallbackName;
  const summary = reviewSummary(reviews);
  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 5);

  const resetDraft = useProjectDraftStore((state) => state.reset);
  const setDraftSpecialty = useProjectDraftStore((state) => state.setSpecialty);
  const setTargetSpecialist = useProjectDraftStore(
    (state) => state.setTargetSpecialist,
  );

  const startRequest = (trade: Specialist) => {
    resetDraft();
    setDraftSpecialty(trade.specialtyLabel || trade.name);
    setTargetSpecialist(targetId, name);
    analyticsEvents.requestServicesTradeSelected({
      target_uid: targetId,
      specialty: trade.specialtyLabel || trade.name,
    });
    router.push(toHref("/homeowner-brief"));
  };

  const handleRequestServices = () => {
    if (!requireAuth()) return;
    tapFeedback();
    analyticsEvents.requestServicesTapped({
      target_uid: targetId,
      trades_count: trades.length,
    });
    if (trades.length === 1) {
      startRequest(trades[0]);
      return;
    }
    Alert.alert(
      t("publicProfile.requestServices"),
      t("publicProfile.whichService"),
      [
        ...trades.slice(0, 6).map((trade) => ({
          text: tx(trade.specialtyLabel) || trade.name,
          onPress: () => startRequest(trade),
        })),
        { text: t("common.cancel"), style: "cancel" as const },
      ],
    );
  };

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
      Alert.alert(t("publicProfile.blockFailed"), t("common.pleaseTryAgain"));
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
      Alert.alert(t("publicProfile.unblockFailed"), t("common.pleaseTryAgain"));
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
      t("publicProfile.blockTitle", { name }),
      t("publicProfile.blockText"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
          onPress: () =>
            analyticsEvents.blockUserCancelled({ target_uid: targetId }),
        },
        {
          text: t("publicProfile.block"),
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
      void notifyFriendAdded(targetId, uid, myName || "Someone");
      void queryClient.invalidateQueries({ queryKey: ["friends"] });
      setFriendDone(true);
    } catch {
      analyticsEvents.friendInviteAcceptFailed({ inviter_uid: targetId });
      Alert.alert(
        t("publicProfile.addFriendFailed"),
        t("common.pleaseTryAgain"),
      );
    } finally {
      setFriendBusy(false);
    }
  };

  const handleAddFriend = () => {
    if (!requireAuth()) return;
    tapFeedback();
    analyticsEvents.friendAddTapped({ target_uid: targetId });
    void acceptNow();
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
            {isOwnProfile
              ? t("publicProfile.yourPublic")
              : t("profile.tab.title")}
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
              <Pressable
                accessibilityRole="imagebutton"
                accessibilityLabel={t("publicProfile.openPhoto")}
                disabled={!profile?.avatar}
                onPress={() => setViewerUri(profile?.avatar ?? null)}
              >
                <Avatar name={name} url={profile?.avatar ?? null} size={84} />
              </Pressable>
              <Text style={styles.name} numberOfLines={1}>
                {name}
              </Text>
              <Text style={styles.role}>
                {roleLabel(profile?.role ?? null, t)}
              </Text>
              {profile?.address ? (
                <Text style={styles.address} numberOfLines={2}>
                  {profile.address}
                </Text>
              ) : null}
              {isContractor && trades.length > 0 && !isOwnProfile ? (
                <PressableScale
                  accessibilityLabel={t("publicProfile.requestServices")}
                  onPress={handleRequestServices}
                  style={styles.requestCtaWrap}
                  scaleTo={0.98}
                >
                  <View style={styles.requestCta}>
                    <Text style={styles.requestCtaText}>
                      {t("publicProfile.requestServices")}
                    </Text>
                  </View>
                </PressableScale>
              ) : null}
            </View>

            {isContractor &&
            (profile?.businessName ||
              profile?.professionalRole ||
              profile?.shortBio) ? (
              <View style={styles.infoCard}>
                {profile?.businessName ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>
                      {t("tradePage.business")}
                    </Text>
                    <Text style={styles.infoValue}>{profile.businessName}</Text>
                  </View>
                ) : null}
                {profile?.professionalRole ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>
                      {t("trade.sections.role")}
                    </Text>
                    <Text style={styles.infoValue}>
                      {tx(profile.professionalRole)}
                    </Text>
                  </View>
                ) : null}
                {profile?.shortBio ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t("tradePage.about")}</Text>
                    <Text style={styles.infoValue}>{profile.shortBio}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            {trades.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {t("publicProfile.trades")}
                </Text>
                <View style={styles.tradesList}>
                  {trades.map((trade, index) => (
                    <PressableScale
                      key={trade.tradeId}
                      accessibilityLabel={t("compare.openA11y", {
                        name: trade.name,
                      })}
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
                        <TierAvatar
                          name={trade.name}
                          url={trade.avatarUrl || null}
                          years={trade.details.experienceYears}
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
                              {[
                                tx(trade.specialtyLabel),
                                trade.details.experienceYears !== null
                                  ? t("trade.yearsShort", {
                                      count: trade.details.experienceYears,
                                    })
                                  : "",
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </Text>
                          ) : null}
                          <Text style={styles.tradeMeta} numberOfLines={1}>
                            {priceLine(trade.details.rates, t)}
                          </Text>
                          {trade.placeName ? (
                            <View style={styles.tradeMetaRow}>
                              <MapPinIcon
                                size={12}
                                color={colors.textSecondary}
                              />
                              <Text style={styles.tradeMeta}>
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

            {trades[0]?.owner && hasBusinessDetails(trades[0].owner) ? (
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <BuildingIcon size={18} color={colors.accent} />
                  <Text style={styles.sectionTitle}>
                    {t("tradePage.business")}
                  </Text>
                </View>
                <BusinessPanel owner={trades[0].owner} />
              </View>
            ) : null}

            {profile && profile.socialGroups.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <UsersIcon size={18} color={colors.accent} />
                  <Text style={styles.sectionTitle}>
                    {t("publicProfile.community")}
                  </Text>
                </View>
                <CommunityBadges groups={profile.socialGroups} />
              </View>
            ) : null}

            {reviews.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <ReviewIcon size={18} color={colors.coin} />
                  <Text style={styles.sectionTitle}>
                    {t("tradePage.reviews")}
                  </Text>
                  <View style={styles.reviewSummary}>
                    <Text style={styles.reviewAvg}>
                      ★ {summary.average.toFixed(1)}
                    </Text>
                    <Text style={styles.reviewCount}>({summary.count})</Text>
                  </View>
                </View>
                <View style={styles.certList}>
                  {visibleReviews.map((review) => {
                    const author = reviewAuthors[review.authorId];
                    const filled = Math.max(
                      0,
                      Math.min(5, Math.round(review.rating)),
                    );
                    return (
                      <View key={review.id} style={styles.reviewCard}>
                        <View style={styles.reviewHead}>
                          <Avatar
                            name={author?.name || t("tradePage.client")}
                            url={author?.avatar ?? null}
                            size={38}
                          />
                          <View style={styles.reviewHeadBody}>
                            <Text style={styles.reviewAuthor} numberOfLines={1}>
                              {author?.name || t("tradePage.client")}
                            </Text>
                            <Text style={styles.reviewStars}>
                              {"★".repeat(filled)}
                              {"☆".repeat(5 - filled)}
                            </Text>
                          </View>
                        </View>
                        {review.text ? (
                          <Text style={styles.reviewText}>{review.text}</Text>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
                {reviews.length > 5 ? (
                  <Pressable
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={() => setShowAllReviews((value) => !value)}
                  >
                    <Text style={styles.reviewMore}>
                      {showAllReviews
                        ? t("publicProfile.showFewerReviews")
                        : t("publicProfile.showAllReviews", {
                            count: reviews.length,
                          })}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}

            {certificates.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <AwardIcon size={18} color={colors.accent} />
                  <Text style={styles.sectionTitle}>
                    {t("publicProfile.certificates")}
                  </Text>
                </View>
                <View style={styles.certList}>
                  {certificates.map((cert) => (
                    <View key={cert.id} style={styles.certCard}>
                      {certificateTitle(cert, tx) ? (
                        <Text style={styles.certTitle} numberOfLines={2}>
                          {certificateTitle(cert, tx)}
                        </Text>
                      ) : null}
                      {certificateSubtitle(cert, tx, certNumber) ? (
                        <Text style={styles.certSub} numberOfLines={2}>
                          {certificateSubtitle(cert, tx, certNumber)}
                        </Text>
                      ) : null}
                      <View style={styles.certPhotos}>
                        {cert.files.map((file) => (
                          <PressableScale
                            key={file.id}
                            accessibilityLabel={t("compare.openA11y", {
                              name: file.name,
                            })}
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
                  <Text style={styles.sectionTitle}>
                    {t("publicProfile.videoStories")}
                  </Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.videoRow}
                >
                  {videos.map((video, index) => (
                    <PressableScale
                      key={video.id}
                      accessibilityLabel={t("publicProfile.playA11y", {
                        title: video.title || t("publicProfile.video"),
                      })}
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
                  {t("publicProfile.restricted")}
                </Text>
              </View>
            ) : null}

            {isOwnProfile ? (
              <ProfileShareActions
                url={profileShareUrl(targetId)}
                name={name}
                targetUid={targetId}
                avatar={profile?.avatar ?? null}
                businessName={
                  myRole === "WORKER" ? (profile?.businessName ?? "") : ""
                }
              />
            ) : (
              <View style={styles.actions}>
                {block.iBlocked ||
                block.blockedMe ||
                !friendChecked ? null : alreadyFriend || friendDone ? (
                  <View style={styles.friendBadge}>
                    <UsersIcon size={18} color={colors.accent} />
                    <Text style={styles.friendBadgeText}>
                      {t("publicProfile.youreFriends")}
                    </Text>
                  </View>
                ) : (
                  <PressableScale
                    accessibilityLabel={t("publicProfile.addFriendA11y", {
                      name,
                    })}
                    onPress={handleAddFriend}
                    disabled={friendBusy}
                    scaleTo={0.98}
                  >
                    <View style={styles.friendButton}>
                      <UsersIcon size={18} color={colors.accent} />
                      <Text style={styles.friendButtonText}>
                        {friendBusy
                          ? t("publicProfile.adding")
                          : t("publicProfile.addFriend")}
                      </Text>
                    </View>
                  </PressableScale>
                )}

                <PressableScale
                  accessibilityLabel={t("publicProfile.reportA11y", { name })}
                  onPress={goReport}
                  scaleTo={0.98}
                >
                  <View style={styles.reportButton}>
                    <Text style={styles.reportText}>
                      {t("publicProfile.report")}
                    </Text>
                  </View>
                </PressableScale>

                <PressableScale
                  accessibilityLabel={
                    block.iBlocked
                      ? t("publicProfile.unblock")
                      : t("publicProfile.block")
                  }
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
                          ? t("publicProfile.unblockUser")
                          : t("publicProfile.blockUser")}
                    </Text>
                  </View>
                </PressableScale>
              </View>
            )}
          </ScrollView>
        )}

        {showInviteCta ? (
          <View style={styles.ctaBar}>
            <Text style={styles.ctaTitle} numberOfLines={2}>
              {profile
                ? t("publicProfile.addFriendQuestion", {
                    name: name.split(" ")[0] || name,
                  })
                : t("publicProfile.connectQuestion")}
            </Text>
            <PrimaryButton
              label={
                friendBusy
                  ? t("publicProfile.adding")
                  : t("publicProfile.addFriend")
              }
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
              <Text style={styles.ctaSecondary}>
                {t("publicProfile.skipForNow")}
              </Text>
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

      <ImageViewerModal uri={viewerUri} onClose={() => setViewerUri(null)} />
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
    alignItems: "flex-start",
    gap: 4,
  },
  tradeMeta: {
    flex: 1,
    color: t.colors.textSecondary,
    fontSize: 12.5,
    lineHeight: 17,
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
  reviewSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: "auto",
  },
  reviewAvg: {
    color: t.colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  reviewCount: {
    color: t.colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  reviewCard: {
    padding: Spacing.base,
    borderRadius: Radius.md,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    gap: Spacing.sm,
  },
  reviewHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  reviewHeadBody: {
    flex: 1,
    gap: 2,
  },
  reviewAuthor: {
    color: t.colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  reviewStars: {
    color: t.colors.coin,
    fontSize: 13,
    letterSpacing: 1,
  },
  reviewText: {
    color: t.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  reviewMore: {
    color: t.colors.accent,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    paddingVertical: Spacing.sm,
  },
  requestCtaWrap: {
    alignSelf: "stretch",
    marginTop: Spacing.base,
  },
  requestCta: {
    height: 52,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.primary,
  },
  requestCtaText: {
    color: "#04170D",
    fontSize: 16,
    fontWeight: "800",
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
  friendButton: {
    height: 52,
    borderRadius: Radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: "rgba(22,179,100,0.12)",
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.4)",
  },
  friendButtonText: {
    color: t.colors.accent,
    fontSize: 15,
    fontWeight: "700",
  },
  friendBadge: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  friendBadgeText: {
    color: t.colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
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
  ctaTitle: {
    color: t.colors.text,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 2,
  },
  ctaSecondary: {
    color: t.colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 4,
  },
}));
