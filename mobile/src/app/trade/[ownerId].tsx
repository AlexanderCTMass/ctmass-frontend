import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AwardIcon,
  BuildingIcon,
  CalendarIcon,
  DollarIcon,
  ImageIcon,
  MapPinIcon,
  PhoneIcon,
  ResponsesIcon,
  ReviewIcon,
  ShieldCheckIcon,
  TextMessageIcon,
  ToolsIcon,
  TradeGroupIcon,
  UsersIcon,
} from "@/components/icons";
import { PortfolioTile } from "@/components/portfolio/portfolio-tile";
import { CommunityBadges } from "@/components/profile/community-badges";
import { shortPlace } from "@/components/project/project-card";
import { TierAvatar } from "@/components/trade/tier-badge";
import { TradeCompleteness } from "@/components/trade/trade-completeness";
import {
  AvailabilityPanel,
  BusinessPanel,
  CredentialsPanel,
  ExperiencePanel,
  PricingPanel,
  WorkProcessPanel,
  hasBusinessDetails,
  hasWorkProcess,
} from "@/components/trade/trade-sections";
import { Avatar } from "@/components/ui/avatar";
import { BackButton } from "@/components/ui/back-button";
import { ImageViewerModal } from "@/components/ui/image-viewer-modal";
import { LikeButton } from "@/components/ui/like-button";
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
import { businessRoleLabel } from "@/constants/trade-options";
import { specialistSubject, useSwipeActions } from "@/hooks/use-swipe-actions";
import { publicPhone, useTradeContact } from "@/hooks/use-trade-contact";
import { analyticsEvents, errorMessage } from "@/lib/analytics-events";
import { tapFeedback } from "@/lib/haptics";
import { toHref } from "@/lib/navigation";
import type { PortfolioItem } from "@/lib/portfolio";
import { priceLine, responseLine, trustItems } from "@/lib/trade-display";
import { type Specialist, deleteTrade } from "@/lib/trades";
import { useTradePortfolio } from "@/queries/use-portfolio";
import {
  useTradeById,
  useTradeByOwner,
  useTradesByOwner,
} from "@/queries/use-trade";
import {
  useOwnerPublicProfile,
  useOwnerReviews,
  useTradeCertificates,
} from "@/queries/use-trade-extras";
import { useAuthStore } from "@/store/use-auth-store";

const PORTFOLIO_PREVIEW = 4;
const REVIEWS_PREVIEW = 3;

function memberSince(date: Date | null): string {
  if (!date) return "";
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function Section({
  icon,
  title,
  action,
  children,
}: {
  icon?: ReactNode;
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const styles = useStyles();
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionAction}>{action}</View>
      </View>
      {children}
    </View>
  );
}

function Highlight({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  const styles = useStyles();
  return (
    <View style={styles.highlight}>
      <View style={styles.highlightIcon}>{icon}</View>
      <Text style={styles.highlightLabel}>{label}</Text>
      <Text style={styles.highlightValue} numberOfLines={2}>
        {value}
      </Text>
      {hint ? (
        <Text style={styles.highlightHint} numberOfLines={2}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

function PortfolioGrid({
  items,
  isOwner,
  onOpen,
}: {
  items: PortfolioItem[];
  isOwner: boolean;
  onOpen: (item: PortfolioItem, index: number) => void;
}) {
  const styles = useStyles();
  const rows: PortfolioItem[][] = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));
  return (
    <View style={styles.grid}>
      {rows.map((row, rowIndex) => (
        <View key={row[0].id} style={styles.gridRow}>
          {row.map((item, colIndex) => (
            <PortfolioTile
              key={item.id}
              item={item}
              showOwnerState={isOwner}
              onPress={() => onOpen(item, rowIndex * 2 + colIndex)}
            />
          ))}
          {row.length === 1 ? <View style={styles.gridSpacer} /> : null}
        </View>
      ))}
    </View>
  );
}

export default function TradeProfileScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const params = useLocalSearchParams<{
    ownerId?: string;
    projectId?: string;
    tradeId?: string;
  }>();
  const paramOwnerId =
    typeof params.ownerId === "string" ? params.ownerId : undefined;
  const projectId =
    typeof params.projectId === "string" ? params.projectId : undefined;
  const tradeId =
    typeof params.tradeId === "string" ? params.tradeId : undefined;
  const uid = useAuthStore((state) => state.user?.uid);

  const queryClient = useQueryClient();
  const byId = useTradeById(tradeId);
  const byOwner = useTradeByOwner(tradeId ? undefined : paramOwnerId);
  const trade = tradeId ? byId.data : byOwner.data;
  const isLoading = tradeId ? byId.isLoading : byOwner.isLoading;
  const ownerId = trade?.ownerId || paramOwnerId;
  const isOwner = Boolean(uid && trade && uid === trade.ownerId);

  const ownerProfile = useOwnerPublicProfile(ownerId);
  const portfolio = useTradePortfolio(ownerId, trade?.tradeId, isOwner);
  const certificates = useTradeCertificates(ownerId, trade?.tradeId);
  const reviews = useOwnerReviews(ownerId, REVIEWS_PREVIEW, trade?.tradeId);
  const ownerTrades = useTradesByOwner(ownerId);
  const contact = useTradeContact("page");
  const swipe = useSwipeActions(uid, "trade");

  const [deleting, setDeleting] = useState(false);
  const [showAllPortfolio, setShowAllPortfolio] = useState(false);
  const [viewerUri, setViewerUri] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const portfolioY = useRef(0);

  const profile = ownerProfile.data ?? null;
  const portfolioItems = portfolio.data ?? [];
  const visiblePortfolio = showAllPortfolio
    ? portfolioItems
    : portfolioItems.slice(0, PORTFOLIO_PREVIEW);
  const linkedCertificates = certificates.data ?? [];
  const reviewItems = reviews.data?.items ?? [];
  const reviewTotal = reviews.data?.total ?? trade?.reviews ?? 0;
  const reviewScope = reviews.data?.scope ?? trade?.ratingScope ?? "all";
  const owner = trade?.owner ?? null;
  const phone = trade
    ? publicPhone(owner, trade.useProfilePhone ? "" : trade.phone)
    : "";
  const gallery = trade?.gallery ?? [];
  const cover =
    portfolioItems.find((item) => item.isPublic)?.cover ?? gallery[0] ?? null;
  const photoCount =
    portfolioItems.filter((item) => item.isPublic).length || gallery.length;
  const avatarUrl = trade?.avatarUrl || profile?.avatar || null;
  const otherTrades = (ownerTrades.data ?? []).filter(
    (item) => item.tradeId !== trade?.tradeId,
  );
  const liked = trade ? swipe.specialistIndex.liked.has(trade.tradeId) : false;

  const viewedRef = useRef(false);
  useEffect(() => {
    if (!trade || viewedRef.current) return;
    viewedRef.current = true;
    analyticsEvents.tradeProfileViewed({
      owner_id: trade.ownerId,
      trade_id: trade.tradeId,
      specialty: trade.specialtyLabel,
      rating: trade.rating,
      reviews: trade.reviews,
      from_project: Boolean(projectId),
    });
  }, [trade, projectId]);

  const contactTarget = trade
    ? {
        tradeId: trade.tradeId,
        ownerId: trade.ownerId,
        name: trade.name,
        specialtyLabel: trade.specialtyLabel,
        avatarUrl: avatarUrl ?? "",
        owner,
      }
    : null;

  const handleEdit = () => {
    if (!trade) return;
    tapFeedback();
    analyticsEvents.tradeEditOpened({ trade_id: trade.tradeId });
    router.push(toHref(`/trade-edit/${encodeURIComponent(trade.tradeId)}`));
  };

  const runDelete = async () => {
    if (!trade || deleting) return;
    setDeleting(true);
    try {
      await deleteTrade(trade.tradeId);
      analyticsEvents.tradeDeleted({ trade_id: trade.tradeId });
      void queryClient.invalidateQueries({ queryKey: ["trade"] });
      void queryClient.invalidateQueries({ queryKey: ["owner-trades"] });
      void queryClient.invalidateQueries({ queryKey: ["specialist-pool"] });
      router.back();
    } catch (error) {
      analyticsEvents.tradeDeleteFailed({
        trade_id: trade.tradeId,
        error_message: errorMessage(error),
      });
      setDeleting(false);
      Alert.alert("Couldn't delete", "Please try again.");
    }
  };

  const handleDelete = () => {
    if (!trade || deleting) return;
    tapFeedback();
    Alert.alert(
      "Delete this trade?",
      "It will be removed from your profile and search. This can't be undone.",
      [
        { text: "Keep trade", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => void runDelete(),
        },
      ],
    );
  };

  const toggleLike = () => {
    if (!trade) return;
    const subject = specialistSubject(trade);
    if (liked) swipe.unlike(subject, "tap");
    else swipe.like(subject, "tap");
  };

  const openOwner = () => {
    if (!trade) return;
    tapFeedback();
    analyticsEvents.tradeProfileOwnerOpened({
      owner_id: trade.ownerId,
      trade_id: trade.tradeId,
    });
    const name = profile?.name || trade.name;
    router.push(
      toHref(
        `/user/${encodeURIComponent(trade.ownerId)}?name=${encodeURIComponent(name)}`,
      ),
    );
  };

  const openOtherTrade = (other: Specialist) => {
    tapFeedback();
    const project = projectId ? `&projectId=${encodeURIComponent(projectId)}` : "";
    router.push(
      toHref(
        `/trade/${encodeURIComponent(other.ownerId)}?tradeId=${encodeURIComponent(other.tradeId)}${project}`,
      ),
    );
  };

  const openPortfolioItem = (item: PortfolioItem, position: number) => {
    if (!trade) return;
    tapFeedback();
    analyticsEvents.portfolioItemOpened({
      owner_id: trade.ownerId,
      trade_id: trade.tradeId,
      portfolio_id: item.id,
      position,
      is_own: isOwner,
    });
    queryClient.setQueryData(["portfolio-item", trade.ownerId, item.id], item);
    router.push(
      toHref(
        `/portfolio/${encodeURIComponent(item.id)}?ownerId=${encodeURIComponent(trade.ownerId)}&tradeId=${encodeURIComponent(trade.tradeId)}`,
      ),
    );
  };

  const addPortfolio = () => {
    if (!trade) return;
    tapFeedback();
    analyticsEvents.portfolioAddTapped({
      trade_id: trade.tradeId,
      items_count: portfolioItems.length,
    });
    router.push(
      toHref(`/portfolio-edit?tradeId=${encodeURIComponent(trade.tradeId)}`),
    );
  };

  const scrollToPortfolio = () => {
    scrollRef.current?.scrollTo({ y: portfolioY.current, animated: true });
  };

  const openCertificate = (url: string) => {
    tapFeedback();
    void WebBrowser.openBrowserAsync(url).catch(() =>
      Linking.openURL(url).catch(() => undefined),
    );
  };

  if (isLoading || !trade || !contactTarget) {
    return (
      <ScreenBackground>
        <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
          <View style={styles.header}>
            <BackButton onPress={() => router.back()} />
          </View>
          <View style={styles.center}>
            {isLoading ? (
              <ActivityIndicator color={colors.accent} />
            ) : (
              <Text style={styles.missing}>
                This specialist profile isn&apos;t available.
              </Text>
            )}
          </View>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  const details = trade.details;
  const place = trade.placeName ? shortPlace(trade.placeName) : "";
  const since = memberSince(trade.createdAt);
  const about = trade.about || trade.shortDescription;
  const tradeLabel = trade.specialtyLabel || "this trade";
  const subtitle = [trade.specialtyLabel, place].filter(Boolean).join(" · ");
  const trust = trustItems(details);
  const response = responseLine(details);
  const accepting = details.availability?.acceptingWork !== false;
  const roleLabel = owner ? businessRoleLabel(owner.business.role) : "";
  const tags = [
    roleLabel,
    owner?.businessName && owner.businessName !== trade.name
      ? owner.businessName
      : "",
  ].filter(Boolean);

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.headerTitle} numberOfLines={1}>
            {isOwner ? "My trade" : "Services"}
          </Text>
          {!isOwner && uid ? (
            <LikeButton liked={liked} onPress={toggleLike} />
          ) : (
            <View style={styles.headerSpacer} />
          )}
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            {cover ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="See portfolio"
                onPress={scrollToPortfolio}
              >
                <Image
                  source={{ uri: cover }}
                  style={styles.cover}
                  contentFit="cover"
                  transition={150}
                />
                <View style={styles.coverChip}>
                  <ImageIcon size={14} color="#FFFFFF" />
                  <Text style={styles.coverChipText}>{photoCount}</Text>
                </View>
              </Pressable>
            ) : null}
            <View style={styles.heroBody}>
              <View style={[styles.avatarRing, cover && styles.avatarLifted]}>
                <TierAvatar
                  name={trade.name}
                  url={avatarUrl}
                  years={details.experienceYears}
                  size={76}
                />
              </View>
              <Text style={styles.name} numberOfLines={2}>
                {trade.name}
              </Text>
              {subtitle ? (
                <View style={styles.subtitleRow}>
                  <TradeGroupIcon groupId={details.groupId} size={15} color={colors.accent} />
                  <Text style={styles.subtitle} numberOfLines={2}>
                    {subtitle}
                  </Text>
                </View>
              ) : null}
              <View style={styles.badgeRow}>
                {trade.rating > 0 ? (
                  <View style={styles.ratingPill}>
                    <ReviewIcon size={14} color={colors.coin} />
                    <Text style={styles.ratingValue}>
                      {trade.rating.toFixed(1)}
                    </Text>
                    <Text style={styles.ratingCount}>
                      ({trade.reviews} {trade.reviews === 1 ? "review" : "reviews"})
                    </Text>
                  </View>
                ) : (
                  <View style={styles.newPill}>
                    <Text style={styles.newPillText}>New on CTMASS</Text>
                  </View>
                )}
                {details.experienceYears !== null ? (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>
                      {details.experienceYears}{" "}
                      {details.experienceYears === 1 ? "year" : "years"} in {tradeLabel}
                    </Text>
                  </View>
                ) : null}
              </View>
              {trust.length > 0 ? (
                <View style={styles.badgeRow}>
                  {trust.map((item) => (
                    <View key={item.key} style={styles.trustPill}>
                      <ShieldCheckIcon size={13} color={colors.accent} />
                      <Text style={styles.trustPillText}>{item.label}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
              {tags.length > 0 ? (
                <View style={styles.tagRow}>
                  {tags.map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText} numberOfLines={1}>
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
              {!accepting ? (
                <Text style={styles.unavailable}>
                  Not accepting new projects right now
                </Text>
              ) : null}
            </View>
          </View>

          {isOwner ? (
            <TradeCompleteness trade={trade} portfolioCount={portfolioItems.length} />
          ) : null}

          <View style={styles.highlights}>
            <Highlight
              icon={<DollarIcon size={18} color={colors.accent} />}
              label="Price"
              value={priceLine(details.rates)}
            />
            <Highlight
              icon={<MapPinIcon size={18} color={colors.accent} />}
              label="Service area"
              value={details.radiusMiles ? `Within ${details.radiusMiles} mi` : place || "Ask about your area"}
              hint={details.radiusMiles && place ? `from ${place}` : undefined}
            />
            <Highlight
              icon={<ResponsesIcon size={18} color={colors.accent} />}
              label="Response"
              value={response || "Not yet established"}
              hint={response ? "Set by contractor" : undefined}
            />
            <Highlight
              icon={<ToolsIcon size={18} color={colors.accent} />}
              label="Jobs on CTMASS"
              value={trade.completedProjects > 0 ? String(trade.completedProjects) : "—"}
            />
          </View>

          <Section icon={<ShieldCheckIcon size={18} color={colors.accent} />} title="License & insurance">
            <CredentialsPanel details={details} />
            {linkedCertificates.length > 0 ? (
              <View style={styles.list}>
                {linkedCertificates.map((cert) => (
                  <PressableScale
                    key={cert.id}
                    accessibilityLabel={cert.institution || cert.documentType}
                    onPress={() => {
                      const file = cert.files[0];
                      if (file) openCertificate(file.url);
                    }}
                  >
                    <View style={styles.certRow}>
                      <View style={styles.certIcon}>
                        <AwardIcon size={18} color={colors.accent} />
                      </View>
                      <View style={styles.certBody}>
                        <Text style={styles.certTitle} numberOfLines={1}>
                          {cert.institution || cert.documentType || "Document"}
                        </Text>
                        {cert.documentType && cert.institution ? (
                          <Text style={styles.certSub} numberOfLines={1}>
                            {cert.documentType}
                            {cert.year ? ` · ${cert.year}` : ""}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  </PressableScale>
                ))}
              </View>
            ) : null}
          </Section>

          <Section icon={<DollarIcon size={18} color={colors.accent} />} title="Pricing">
            <PricingPanel details={details} />
          </Section>

          {details.services.length > 0 ? (
            <Section icon={<ToolsIcon size={18} color={colors.accent} />} title="Services">
              <View style={styles.chipWrap}>
                {details.services.map((service) => (
                  <View key={service} style={styles.serviceChip}>
                    <Text style={styles.serviceChipText}>{service}</Text>
                  </View>
                ))}
              </View>
            </Section>
          ) : null}

          <Section icon={<AwardIcon size={18} color={colors.accent} />} title="Experience">
            <ExperiencePanel
              details={details}
              tradeLabel={tradeLabel}
              owner={owner}
              completedJobs={trade.completedProjects}
              since={since}
            />
          </Section>

          {about ? (
            <Section title="About">
              <View style={styles.card}>
                <Text style={styles.about}>{about}</Text>
              </View>
            </Section>
          ) : null}

          <View
            onLayout={(event) => {
              portfolioY.current = event.nativeEvent.layout.y;
            }}
          >
            {portfolioItems.length > 0 || isOwner ? (
              <Section
                icon={<ImageIcon size={18} color={colors.accent} />}
                title={
                  portfolioItems.length > 0
                    ? `Portfolio (${portfolioItems.length})`
                    : "Portfolio"
                }
                action={
                  isOwner && portfolioItems.length > 0 ? (
                    <Pressable
                      accessibilityRole="button"
                      hitSlop={8}
                      onPress={addPortfolio}
                    >
                      <Text style={styles.sectionLink}>+ Add project</Text>
                    </Pressable>
                  ) : null
                }
              >
                {portfolio.isLoading ? (
                  <ActivityIndicator color={colors.accent} />
                ) : portfolioItems.length === 0 ? (
                  <PressableScale
                    accessibilityLabel="Add your first portfolio project"
                    onPress={addPortfolio}
                  >
                    <View style={styles.portfolioEmpty}>
                      <View style={styles.portfolioEmptyIcon}>
                        <ImageIcon size={26} color={colors.accent} />
                      </View>
                      <Text style={styles.portfolioEmptyTitle}>
                        Show off your best work
                      </Text>
                      <Text style={styles.portfolioEmptyText}>
                        Add before and after photos of finished jobs. Homeowners
                        trust pros with a portfolio.
                      </Text>
                      <Text style={styles.sectionLink}>+ Add project</Text>
                    </View>
                  </PressableScale>
                ) : (
                  <>
                    <PortfolioGrid
                      items={visiblePortfolio}
                      isOwner={isOwner}
                      onOpen={openPortfolioItem}
                    />
                    {portfolioItems.length > PORTFOLIO_PREVIEW ? (
                      <Pressable
                        accessibilityRole="button"
                        hitSlop={8}
                        onPress={() => setShowAllPortfolio((value) => !value)}
                      >
                        <Text style={styles.moreLink}>
                          {showAllPortfolio
                            ? "Show less"
                            : `Show all ${portfolioItems.length} projects`}
                        </Text>
                      </Pressable>
                    ) : null}
                  </>
                )}
              </Section>
            ) : (
              <Section icon={<ImageIcon size={18} color={colors.accent} />} title="Portfolio">
                <Text style={styles.emptyNote}>No projects added yet</Text>
              </Section>
            )}
          </View>

          {gallery.length > 0 ? (
            <Section
              icon={<ImageIcon size={18} color={colors.accent} />}
              title="Photos"
            >
              <View style={styles.photoGrid}>
                {gallery.slice(0, 9).map((uri) => (
                  <Pressable
                    key={uri}
                    accessibilityRole="imagebutton"
                    accessibilityLabel="Open photo"
                    onPress={() => setViewerUri(uri)}
                    style={styles.photoCell}
                  >
                    <Image
                      source={{ uri }}
                      style={styles.photoImage}
                      contentFit="cover"
                      transition={150}
                    />
                  </Pressable>
                ))}
              </View>
            </Section>
          ) : null}

          <Section
            icon={<ReviewIcon size={18} color={colors.coin} />}
            title={reviewTotal > 0 ? `Reviews (${reviewTotal})` : "Reviews"}
            action={
              reviewTotal > reviewItems.length ? (
                <Pressable
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={openOwner}
                >
                  <Text style={styles.sectionLink}>See all</Text>
                </Pressable>
              ) : null
            }
          >
            {reviewItems.length === 0 ? (
              <Text style={styles.emptyNote}>
                {isOwner ? "No reviews yet" : "Be the first to leave a review after your project."}
              </Text>
            ) : (
              <View style={styles.list}>
                {reviewScope === "all" ? (
                  <Text style={styles.emptyNote}>Across all of this contractor&apos;s trades</Text>
                ) : null}
                {reviewItems.map((review) => {
                  const filled = Math.max(
                    0,
                    Math.min(5, Math.round(review.rating)),
                  );
                  const authorName = review.author?.name || "Client";
                  return (
                    <View key={review.id} style={styles.card}>
                      <View style={styles.reviewHead}>
                        <Avatar
                          name={authorName}
                          url={review.author?.avatar ?? null}
                          size={36}
                        />
                        <View style={styles.reviewHeadBody}>
                          <Text style={styles.reviewAuthor} numberOfLines={1}>
                            {authorName}
                          </Text>
                          <Text style={styles.reviewStars}>
                            {"★".repeat(filled)}
                            {"☆".repeat(5 - filled)}
                          </Text>
                        </View>
                      </View>
                      {review.text ? (
                        <Text style={styles.reviewText} numberOfLines={4}>
                          {review.text}
                        </Text>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            )}
          </Section>

          <Section icon={<CalendarIcon size={18} color={colors.accent} />} title="Availability & response">
            <AvailabilityPanel details={details} owner={owner} />
          </Section>

          {hasWorkProcess(details) ? (
            <Section icon={<ToolsIcon size={18} color={colors.accent} />} title="How they work">
              <WorkProcessPanel details={details} />
            </Section>
          ) : null}

          {owner && hasBusinessDetails(owner) ? (
            <Section icon={<BuildingIcon size={18} color={colors.accent} />} title="Business">
              <BusinessPanel owner={owner} />
            </Section>
          ) : null}

          {otherTrades.length > 0 ? (
            <Section icon={<TradeGroupIcon groupId={details.groupId} size={18} color={colors.accent} />} title="Other trades">
              <View style={styles.list}>
                {otherTrades.map((other) => (
                  <PressableScale
                    key={other.tradeId}
                    accessibilityLabel={other.specialtyLabel || other.name}
                    onPress={() => openOtherTrade(other)}
                  >
                    <View style={styles.certRow}>
                      <View style={styles.certIcon}>
                        <TradeGroupIcon groupId={other.details.groupId} size={18} color={colors.accent} />
                      </View>
                      <View style={styles.certBody}>
                        <Text style={styles.certTitle} numberOfLines={1}>
                          {other.specialtyLabel || other.name}
                        </Text>
                        <Text style={styles.certSub} numberOfLines={1}>
                          {[
                            other.details.experienceYears !== null
                              ? `${other.details.experienceYears} yrs`
                              : "",
                            priceLine(other.details.rates),
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </Text>
                      </View>
                      <Text style={styles.ownerChevronText}>›</Text>
                    </View>
                  </PressableScale>
                ))}
              </View>
            </Section>
          ) : null}

          <Section
            icon={<UsersIcon size={18} color={colors.accent} />}
            title="About the specialist"
          >
            <PressableScale
              accessibilityLabel="Open specialist profile"
              onPress={openOwner}
            >
              <View style={styles.ownerCard}>
                <Avatar
                  name={profile?.name || trade.name}
                  url={profile?.avatar ?? avatarUrl}
                  size={48}
                />
                <View style={styles.ownerBody}>
                  <Text style={styles.ownerName} numberOfLines={1}>
                    {profile?.name || trade.name}
                  </Text>
                  <Text style={styles.ownerHint} numberOfLines={1}>
                    {isOwner ? "View your public profile" : "View profile & all services"}
                  </Text>
                </View>
                <View style={styles.ownerChevron}>
                  <Text style={styles.ownerChevronText}>›</Text>
                </View>
              </View>
            </PressableScale>
            {profile && profile.socialGroups.length > 0 ? (
              <CommunityBadges groups={profile.socialGroups} />
            ) : null}
          </Section>
        </ScrollView>

        <View style={styles.footer}>
          {isOwner ? (
            <>
              <PrimaryButton
                label="Edit trade"
                onPress={handleEdit}
                disabled={deleting}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Delete trade"
                hitSlop={8}
                disabled={deleting}
                onPress={handleDelete}
                style={styles.deleteWrap}
              >
                <Text style={styles.deleteLink}>
                  {deleting ? "Deleting…" : "Delete trade"}
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              {projectId ? null : (
                <PrimaryButton
                  label="Request quote"
                  onPress={() => contact.requestQuote(contactTarget)}
                />
              )}
              <View style={styles.contactRow}>
                {phone ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Call"
                    onPress={() => contact.call(contactTarget, phone)}
                    style={({ pressed }) => [
                      styles.contactButton,
                      styles.callButton,
                      pressed && styles.contactPressed,
                    ]}
                  >
                    <PhoneIcon size={20} color="#FFFFFF" />
                    <Text style={[styles.contactText, styles.callText]}>Call</Text>
                  </Pressable>
                ) : null}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Message"
                  disabled={contact.opening}
                  onPress={() => void contact.message(contactTarget, projectId)}
                  style={({ pressed }) => [
                    styles.contactButton,
                    styles.messageButton,
                    pressed && styles.contactPressed,
                  ]}
                >
                  {contact.opening ? (
                    <ActivityIndicator color={colors.accent} />
                  ) : (
                    <TextMessageIcon size={20} color={colors.accent} />
                  )}
                  <Text style={[styles.contactText, styles.messageText]}>
                    Message
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </SafeAreaView>
      <ImageViewerModal uri={viewerUri} onClose={() => setViewerUri(null)} />
    </ScreenBackground>
  );
}

const useStyles = makeStyles((t) => ({
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
    color: t.colors.text,
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.3,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  missing: {
    color: t.colors.textSecondary,
    fontSize: 15,
    textAlign: "center",
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xl,
  },
  hero: {
    borderRadius: Radius.lg,
    overflow: "hidden",
    backgroundColor: t.isDark ? t.colors.surface : t.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  cover: {
    width: "100%",
    height: 170,
    backgroundColor: t.colors.surfaceStrong,
  },
  coverChip: {
    position: "absolute",
    right: Spacing.md,
    bottom: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(5,7,12,0.65)",
  },
  coverChipText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "800",
  },
  heroBody: {
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  avatarRing: {
    padding: 4,
    borderRadius: 60,
    backgroundColor: t.isDark ? t.colors.surface : t.colors.backgroundElevated,
  },
  avatarLifted: {
    marginTop: -62,
  },
  name: {
    color: t.colors.text,
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: -0.4,
    textAlign: "center",
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: -4,
  },
  subtitle: {
    flexShrink: 1,
    color: t.colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  trustPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(22,179,100,0.12)",
  },
  trustPillText: {
    color: t.colors.accent,
    fontSize: 12.5,
    fontWeight: "700",
  },
  unavailable: {
    color: t.colors.coin,
    fontSize: 13,
    fontWeight: "700",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  serviceChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    backgroundColor: t.colors.surfaceStrong,
  },
  serviceChipText: {
    color: t.colors.text,
    fontSize: 13.5,
    fontWeight: "600",
  },
  emptyNote: {
    color: t.colors.textSecondary,
    fontSize: 13.5,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(255,193,7,0.14)",
  },
  ratingValue: {
    color: t.colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  ratingCount: {
    color: t.colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  newPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(22,179,100,0.14)",
  },
  newPillText: {
    color: t.colors.accent,
    fontSize: 12.5,
    fontWeight: "800",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: t.colors.surfaceStrong,
    maxWidth: "100%",
  },
  tagText: {
    color: t.colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  highlights: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  highlight: {
    flexBasis: "48%",
    flexGrow: 1,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: t.isDark ? t.colors.surface : t.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: t.colors.border,
    gap: 3,
  },
  highlightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(22,179,100,0.12)",
    marginBottom: 4,
  },
  highlightLabel: {
    color: t.colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  highlightValue: {
    color: t.colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  highlightHint: {
    color: t.colors.textMuted,
    fontSize: 12,
  },
  section: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  sectionTitle: {
    color: t.colors.text,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  sectionAction: {
    flex: 1,
    alignItems: "flex-end",
  },
  sectionLink: {
    color: t.colors.accent,
    fontSize: 14,
    fontWeight: "700",
  },
  card: {
    padding: Spacing.base,
    borderRadius: Radius.md,
    backgroundColor: t.isDark ? t.colors.surface : t.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: t.colors.border,
    gap: Spacing.sm,
  },
  about: {
    color: t.colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  grid: {
    gap: Spacing.sm,
  },
  gridRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  photoCell: {
    width: "31.5%",
    aspectRatio: 1,
    borderRadius: Radius.sm,
    overflow: "hidden",
    backgroundColor: t.colors.surfaceStrong,
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  gridSpacer: {
    flex: 1,
  },
  moreLink: {
    color: t.colors.accent,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    paddingVertical: Spacing.xs,
  },
  portfolioEmpty: {
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "rgba(22,179,100,0.45)",
    gap: Spacing.sm,
  },
  portfolioEmptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(22,179,100,0.12)",
  },
  portfolioEmptyTitle: {
    color: t.colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  portfolioEmptyText: {
    color: t.colors.textSecondary,
    fontSize: 13.5,
    lineHeight: 19,
    textAlign: "center",
  },
  list: {
    gap: Spacing.sm,
  },
  certRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: t.isDark ? t.colors.surface : t.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  certIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(22,179,100,0.12)",
  },
  certBody: {
    flex: 1,
    gap: 2,
  },
  certTitle: {
    color: t.colors.text,
    fontSize: 14.5,
    fontWeight: "700",
  },
  certSub: {
    color: t.colors.textSecondary,
    fontSize: 12.5,
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
    fontSize: 14.5,
    fontWeight: "700",
  },
  reviewStars: {
    color: t.colors.coin,
    fontSize: 13,
    letterSpacing: 1,
  },
  reviewText: {
    color: t.colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  ownerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: t.isDark ? t.colors.surface : t.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  ownerBody: {
    flex: 1,
    gap: 2,
  },
  ownerName: {
    color: t.colors.text,
    fontSize: 15.5,
    fontWeight: "800",
  },
  ownerHint: {
    color: t.colors.accent,
    fontSize: 13,
    fontWeight: "600",
  },
  ownerChevron: {
    paddingHorizontal: Spacing.xs,
  },
  ownerChevronText: {
    color: t.colors.textMuted,
    fontSize: 26,
    fontWeight: "300",
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  contactRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  contactButton: {
    flex: 1,
    height: 50,
    borderRadius: Radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  callButton: {
    backgroundColor: Brand.primaryDark,
  },
  messageButton: {
    borderWidth: 1.5,
    borderColor: "rgba(22,179,100,0.45)",
    backgroundColor: t.isDark ? "rgba(22,179,100,0.08)" : "rgba(255,255,255,0.75)",
  },
  contactPressed: {
    opacity: 0.75,
  },
  contactText: {
    fontSize: 15.5,
    fontWeight: "700",
  },
  callText: {
    color: "#FFFFFF",
  },
  messageText: {
    color: t.colors.accent,
  },
  deleteWrap: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  deleteLink: {
    color: t.colors.destructive,
    fontSize: 14,
    fontWeight: "700",
  },
}));
