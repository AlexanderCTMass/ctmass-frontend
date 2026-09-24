import { useEventListener } from "expo";
import { Image } from "expo-image";
import { VideoView, useVideoPlayer } from "expo-video";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
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
import { Spacing, makeStyles, useTheme } from "@/constants/theme";
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
  height,
  canInteract,
  viewerId,
  onCountView,
}: {
  story: VideoStory;
  active: boolean;
  height: number;
  canInteract: boolean;
  viewerId: string;
  onCountView: (id: string) => boolean;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

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

  const slide = slides[slideIndex];
  const isVideo = slide.type === "video";
  const showPlayer = active && isVideo;
  const posterUri = isVideo ? story.preview : slide.url;

  useEffect(() => {
    if (active) onCountView(story.id);
  }, [active, story.id, onCountView]);

  const advance = useCallback(() => {
    setProgress(0);
    setSlideIndex((index) => (index + 1) % slides.length);
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setProgress(0);
    setSlideIndex((index) => (index - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!active || isVideo || paused) return;
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
  }, [active, isVideo, paused, slideIndex, advance]);

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
    Alert.alert(
      "Report this video?",
      "We'll review it and remove it if it breaks our rules.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Report",
          style: "destructive",
          onPress: () => {
            setReported(true);
            analyticsEvents.videoReported({ video_id: story.id });
            void reportVideo(
              story.id,
              story.userId,
              viewerId,
              "inappropriate",
            ).catch(() => undefined);
            Alert.alert("Thanks", "Thanks for reporting. Our team will take a look.");
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.page, { height }]}>
      {showPlayer ? (
        <VideoSlide
          key={slide.url}
          url={slide.url}
          paused={paused}
          loop={slides.length === 1}
          onProgress={setProgress}
          onEnd={advance}
        />
      ) : (
        <Image
          source={{ uri: posterUri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={120}
        />
      )}

      <View style={styles.tapRow} pointerEvents="box-none">
        <Pressable style={styles.tapZone} onPress={goPrev} />
        <Pressable
          style={styles.tapZoneWide}
          onPress={() => setPaused((value) => !value)}
        />
        <Pressable style={styles.tapZone} onPress={advance} />
      </View>

      {showPlayer && paused ? (
        <View style={styles.pausedBadge} pointerEvents="none">
          <PlayIcon size={54} color="#FFFFFF" filled />
        </View>
      ) : null}

      <View style={styles.bottomGradient} pointerEvents="none" />

      {slides.length > 1 ? (
        <View
          style={[styles.progressRow, { top: insets.top + 10 }]}
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
          style={[styles.caption, { bottom: insets.bottom + 44 }]}
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

      <View style={[styles.actions, { bottom: insets.bottom + 44 }]}>
        <View style={styles.action}>
          <EyeIcon size={26} color="#FFFFFF" />
          <Text style={styles.actionLabel}>{compact(story.views)}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={liked ? "Unlike" : "Like"}
          hitSlop={8}
          onPress={handleLike}
          style={styles.action}
        >
          <HeartIcon
            size={28}
            color={liked ? colors.destructive : "#FFFFFF"}
            filled={liked}
          />
          <Text style={styles.actionLabel}>{compact(likes)}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Report video"
          hitSlop={8}
          onPress={handleReport}
          disabled={reported}
          style={styles.action}
        >
          <FlagIcon
            size={26}
            color={reported ? colors.textMuted : "#FFFFFF"}
          />
          <Text style={styles.actionLabel}>
            {reported ? "Reported" : "Report"}
          </Text>
        </Pressable>
      </View>
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
        style={[styles.close, { top: insets.top + Spacing.sm }]}
      >
        <CloseIcon size={26} color="#FFFFFF" />
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
    width: "100%",
    backgroundColor: "#000000",
    justifyContent: "center",
  },
  tapRow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
  },
  tapZone: {
    flex: 1,
  },
  tapZoneWide: {
    flex: 1.4,
  },
  pausedBadge: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -27,
    marginLeft: -27,
    opacity: 0.92,
  },
  bottomGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 220,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  progressRow: {
    position: "absolute",
    top: 14,
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
    right: 88,
    bottom: 44,
    gap: 4,
  },
  captionTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
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
    right: 12,
    bottom: 56,
    alignItems: "center",
    gap: Spacing.lg,
  },
  action: {
    alignItems: "center",
    gap: 4,
  },
  actionLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  close: {
    position: "absolute",
    right: Spacing.base,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
}));
