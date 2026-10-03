import { useEventListener } from "expo";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { VideoView, useVideoPlayer } from "expo-video";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  CloseIcon,
  EyeIcon,
  FlagIcon,
  HeartIcon,
  PlayIcon,
} from "@/components/icons";
import { Brand, Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { analyticsEvents } from "@/lib/analytics-events";
import { tapFeedback } from "@/lib/haptics";
import {
  type VideoStory,
  incrementVideoViews,
  reportVideo,
  toggleVideoLike,
} from "@/lib/videos";

const IMAGE_DURATION_MS = 4000;

function compact(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
}

function VideoSlide({
  url,
  paused,
  loop,
  onProgress,
  onEnd,
}: {
  url: string;
  paused: boolean;
  loop: boolean;
  onProgress: (fraction: number) => void;
  onEnd: () => void;
}) {
  const player = useVideoPlayer(url);

  useEffect(() => {
    player.loop = loop;
    player.timeUpdateEventInterval = 0.2;
  }, [player, loop]);

  useEffect(() => {
    if (paused) player.pause();
    else player.play();
  }, [paused, player]);

  useEventListener(player, "timeUpdate", ({ currentTime }) => {
    const duration = player.duration;
    if (duration > 0) onProgress(Math.min(currentTime / duration, 1));
  });

  useEventListener(player, "playToEnd", () => {
    if (!loop) onEnd();
  });

  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      nativeControls={false}
    />
  );
}

function VideoStoryPage({
  story,
  active,
  width,
  height,
  canInteract,
  viewerId,
  onCountView,
}: {
  story: VideoStory;
  active: boolean;
  width: number;
  height: number;
  canInteract: boolean;
  viewerId: string;
  onCountView: (id: string) => boolean;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const slides =
    story.content.length > 0
      ? story.content
      : [{ type: "image" as const, url: story.preview, path: story.previewPath }];

  const [slideIndex, setSlideIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [likes, setLikes] = useState(story.likes);
  const [liked, setLiked] = useState(story.likedBy.includes(viewerId));
  const [reported, setReported] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  const current = slides[slideIndex];
  const currentIsVideo = current?.type === "video";
  const single = slides.length === 1;

  useEffect(() => {
    if (active) onCountView(story.id);
  }, [active, story.id, onCountView]);

  const goTo = useCallback(
    (index: number) => {
      const clamped = ((index % slides.length) + slides.length) % slides.length;
      setProgress(0);
      setSlideIndex(clamped);
      scrollRef.current?.scrollTo({ x: clamped * width, animated: true });
    },
    [slides.length, width],
  );

  const advance = useCallback(() => goTo(slideIndex + 1), [goTo, slideIndex]);

  const onSlideMomentumEnd = useCallback(
    (offsetX: number) => {
      const index = Math.max(
        0,
        Math.min(Math.round(offsetX / width), slides.length - 1),
      );
      if (index !== slideIndex) {
        setSlideIndex(index);
        setProgress(0);
      }
    },
    [width, slides.length, slideIndex],
  );

  useEffect(() => {
    if (!active || currentIsVideo || paused) return;
    const startedAt = Date.now();
    const timer = setInterval(() => {
      const fraction = Math.min((Date.now() - startedAt) / IMAGE_DURATION_MS, 1);
      setProgress(fraction);
      if (fraction >= 1) {
        clearInterval(timer);
        advance();
      }
    }, 60);
    return () => clearInterval(timer);
  }, [active, currentIsVideo, paused, slideIndex, advance]);

  const handleLike = () => {
    if (!canInteract || !viewerId) {
      Alert.alert("Sign in", "Create a free account to like videos.");
      return;
    }
    tapFeedback();
    const next = !liked;
    setLiked(next);
    setLikes((value) => value + (next ? 1 : -1));
    analyticsEvents.videoLiked({ video_id: story.id, liked: next });
    void toggleVideoLike(story.id, viewerId, next).catch(() => {
      setLiked(!next);
      setLikes((value) => value + (next ? -1 : 1));
    });
  };

  const handleReport = () => {
    if (!viewerId) {
      Alert.alert("Sign in", "Create a free account to report videos.");
      return;
    }
    tapFeedback();
    setReportText("");
    setPaused(true);
    setReportOpen(true);
  };

  const closeReport = () => {
    if (submittingReport) return;
    setReportOpen(false);
    setPaused(false);
  };

  const submitReport = () => {
    const reason = reportText.trim();
    if (!reason || submittingReport || !viewerId) return;
    setSubmittingReport(true);
    analyticsEvents.videoReported({ video_id: story.id });
    void reportVideo(story.id, story.userId, viewerId, reason)
      .catch(() => undefined)
      .finally(() => {
        setSubmittingReport(false);
        setReported(true);
        setReportOpen(false);
        setPaused(false);
        Alert.alert("Thanks", "Thanks for reporting. Our team will take a look.");
      });
  };

  return (
    <View style={[styles.page, { width, height }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        nestedScrollEnabled
        scrollEnabled={!single}
        showsHorizontalScrollIndicator={false}
        style={StyleSheet.absoluteFill}
        onMomentumScrollEnd={(event) =>
          onSlideMomentumEnd(event.nativeEvent.contentOffset.x)
        }
      >
        {slides.map((slide, index) => {
          const showPlayer =
            active && index === slideIndex && slide.type === "video";
          const posterUri = slide.type === "video" ? story.preview : slide.url;
          return (
            <Pressable
              key={`${slide.url}-${index}`}
              style={{ width, height }}
              onPress={() => setPaused((value) => !value)}
            >
              {showPlayer ? (
                <VideoSlide
                  key={slide.url}
                  url={slide.url}
                  paused={paused}
                  loop={single}
                  onProgress={setProgress}
                  onEnd={advance}
                />
              ) : (
                <Image
                  source={{ uri: posterUri }}
                  style={{ width, height }}
                  contentFit="cover"
                  transition={120}
                />
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {currentIsVideo && paused ? (
        <View style={styles.pausedBadge} pointerEvents="none">
          <PlayIcon size={58} color="#FFFFFF" filled />
        </View>
      ) : null}

      <LinearGradient
        colors={["rgba(0,0,0,0.5)", "transparent"]}
        style={styles.topGradient}
        pointerEvents="none"
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.15)", "rgba(0,0,0,0.6)"]}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      {slides.length > 1 ? (
        <View
          style={[styles.progressRow, { top: insets.top + 8 }]}
          pointerEvents="none"
        >
          {slides.map((item, index) => (
            <View key={`${item.url}-${index}`} style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width:
                      index < slideIndex
                        ? "100%"
                        : index === slideIndex
                          ? `${Math.round(progress * 100)}%`
                          : "0%",
                  },
                ]}
              />
            </View>
          ))}
        </View>
      ) : null}

      {story.title || story.description ? (
        <View
          style={[styles.caption, { bottom: insets.bottom + 24 }]}
          pointerEvents="none"
        >
          {story.title ? (
            <Text style={styles.captionTitle} numberOfLines={2}>
              {story.title}
            </Text>
          ) : null}
          {story.description ? (
            <Text style={styles.captionText} numberOfLines={3}>
              {story.description}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={[styles.actions, { bottom: insets.bottom + 24 }]}>
        <View style={styles.action}>
          <EyeIcon size={30} color="#FFFFFF" />
          <Text style={styles.actionLabel}>{compact(story.views)}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={liked ? "Unlike" : "Like"}
          hitSlop={10}
          onPress={handleLike}
          style={styles.action}
        >
          <HeartIcon
            size={34}
            color={liked ? colors.destructive : "#FFFFFF"}
            filled={liked}
          />
          <Text style={styles.actionLabel}>{compact(likes)}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Report video"
          hitSlop={10}
          onPress={handleReport}
          disabled={reported}
          style={styles.action}
        >
          <FlagIcon size={30} color={reported ? colors.textMuted : "#FFFFFF"} />
          <Text style={styles.actionLabel}>
            {reported ? "Reported" : "Report"}
          </Text>
        </Pressable>
      </View>

      {reportOpen ? (
        <View style={StyleSheet.absoluteFill}>
          <Pressable
            style={styles.reportBackdrop}
            accessibilityLabel="Dismiss report"
            onPress={closeReport}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.reportKav}
            pointerEvents="box-none"
          >
            <View
              style={[
                styles.reportCard,
                { paddingBottom: insets.bottom + Spacing.base },
              ]}
            >
              <Text style={styles.reportTitle}>Report this video</Text>
              <Text style={styles.reportSubtitle}>
                Tell us what&apos;s wrong so our team can review it.
              </Text>
              <TextInput
                value={reportText}
                onChangeText={setReportText}
                placeholder="Describe the problem"
                placeholderTextColor="rgba(255,255,255,0.5)"
                style={styles.reportInput}
                multiline
                autoFocus
                maxLength={500}
                editable={!submittingReport}
              />
              <View style={styles.reportButtons}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Cancel"
                  onPress={closeReport}
                  disabled={submittingReport}
                  style={styles.reportCancel}
                >
                  <Text style={styles.reportCancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Submit report"
                  onPress={submitReport}
                  disabled={!reportText.trim() || submittingReport}
                  style={[
                    styles.reportSubmit,
                    (!reportText.trim() || submittingReport) &&
                      styles.reportSubmitDisabled,
                  ]}
                >
                  {submittingReport ? (
                    <ActivityIndicator size="small" color="#04170D" />
                  ) : (
                    <Text style={styles.reportSubmitText}>Submit report</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      ) : null}
    </View>
  );
}

function VideoFeed({
  stories,
  initialIndex,
  viewerId,
  canInteract,
  onClose,
}: {
  stories: VideoStory[];
  initialIndex: number;
  viewerId: string;
  canInteract: boolean;
  onClose: () => void;
}) {
  const styles = useStyles();
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const viewedRef = useRef<Set<string>>(new Set());

  const countView = useCallback((id: string) => {
    if (viewedRef.current.has(id)) return false;
    viewedRef.current.add(id);
    void incrementVideoViews(id).catch(() => undefined);
    return true;
  }, []);

  const onMomentumEnd = useCallback(
    (offsetY: number) => {
      const index = Math.round(offsetY / height);
      setActiveIndex(Math.max(0, Math.min(index, stories.length - 1)));
    },
    [height, stories.length],
  );

  return (
    <View style={[styles.root, { width, height }]}>
      <FlatList
        data={stories}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        getItemLayout={(_, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
        onMomentumScrollEnd={(event) =>
          onMomentumEnd(event.nativeEvent.contentOffset.y)
        }
        windowSize={3}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        renderItem={({ item, index }) => (
          <VideoStoryPage
            story={item}
            active={index === activeIndex}
            width={width}
            height={height}
            canInteract={canInteract}
            viewerId={viewerId}
            onCountView={countView}
          />
        )}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        hitSlop={12}
        onPress={onClose}
        style={[styles.close, { top: insets.top + 24 }]}
      >
        <CloseIcon size={24} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

export function VideoStoryViewer({
  visible,
  stories,
  initialIndex,
  viewerId,
  canInteract,
  onClose,
}: {
  visible: boolean;
  stories: VideoStory[];
  initialIndex: number;
  viewerId: string;
  canInteract: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {visible ? (
        <VideoFeed
          key={initialIndex}
          stories={stories}
          initialIndex={initialIndex}
          viewerId={viewerId}
          canInteract={canInteract}
          onClose={onClose}
        />
      ) : null}
    </Modal>
  );
}

const useStyles = makeStyles(() => ({
  root: {
    flex: 1,
    backgroundColor: "#000000",
  },
  page: {
    backgroundColor: "#000000",
    justifyContent: "center",
  },
  pausedBadge: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -29,
    marginLeft: -29,
    opacity: 0.9,
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  bottomGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 280,
  },
  progressRow: {
    position: "absolute",
    left: 12,
    right: 12,
    flexDirection: "row",
    gap: 4,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
  },
  caption: {
    position: "absolute",
    left: 16,
    right: 92,
    gap: 6,
  },
  captionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.2,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  captionText: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 14,
    lineHeight: 19,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actions: {
    position: "absolute",
    right: 10,
    alignItems: "center",
    gap: Spacing.lg,
  },
  action: {
    alignItems: "center",
    gap: 5,
  },
  actionLabel: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.85)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  close: {
    position: "absolute",
    right: Spacing.base,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  reportBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  reportKav: {
    flex: 1,
    justifyContent: "flex-end",
  },
  reportCard: {
    backgroundColor: "#141414",
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    gap: Spacing.sm,
  },
  reportTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  reportSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13.5,
    lineHeight: 19,
  },
  reportInput: {
    minHeight: 96,
    maxHeight: 160,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    color: "#FFFFFF",
    fontSize: 15,
    textAlignVertical: "top",
    marginTop: Spacing.xs,
  },
  reportButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  reportCancel: {
    flex: 1,
    height: 50,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  reportCancelText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  reportSubmit: {
    flex: 1,
    height: 50,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.primary,
  },
  reportSubmitDisabled: {
    opacity: 0.5,
  },
  reportSubmitText: {
    color: "#04170D",
    fontSize: 15,
    fontWeight: "800",
  },
}));
