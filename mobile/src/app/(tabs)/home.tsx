import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { PressableScale } from "@/components/ui/pressable-scale";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Brand, Colors, Radius, Spacing } from "@/constants/theme";
import { timeAgo } from "@/lib/format";
import { tapFeedback } from "@/lib/haptics";
import { toHref } from "@/lib/navigation";
import type { ProjectItem } from "@/lib/projects";
import { useMyProjects, useNearbyProjects } from "@/queries/use-projects";
import { useAppStore } from "@/store/use-app-store";
import { useAuthStore } from "@/store/use-auth-store";

type Mode = "homeowner" | "contractor";
const PAGE = 20;

function statusMeta(state: string): {
  label: string;
  tint: string;
  bg: string;
} {
  switch (state) {
    case "in_progress":
      return {
        label: "in progress",
        tint: Brand.primaryLight,
        bg: "rgba(22,179,100,0.14)",
      };
    case "published":
      return {
        label: "looking for specialists",
        tint: Brand.coin,
        bg: "rgba(255,193,7,0.14)",
      };
    case "completed":
      return {
        label: "completed",
        tint: Brand.primaryLight,
        bg: "rgba(22,179,100,0.14)",
      };
    case "moderate":
      return {
        label: "in review",
        tint: Brand.info,
        bg: "rgba(41,112,255,0.16)",
      };
    default:
      return {
        label: "draft",
        tint: Colors.textSecondary,
        bg: Colors.surfaceStrong,
      };
  }
}

function SegmentedControl({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (mode: Mode) => void;
}) {
  const index = mode === "contractor" ? 1 : 0;
  const [width, setWidth] = useState(0);
  const pillWidth = width > 0 ? (width - 8) / 2 : 0;
  const offset = useSharedValue(index);

  useEffect(() => {
    offset.value = withTiming(index, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [index, offset]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value * pillWidth }],
  }));

  return (
    <View
      style={styles.segment}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      {pillWidth > 0 ? (
        <Animated.View
          style={[styles.segmentPill, { width: pillWidth }, pillStyle]}
        />
      ) : null}
      {(["homeowner", "contractor"] as const).map((value) => {
        const active = mode === value;
        return (
          <Pressable
            key={value}
            accessibilityRole="button"
            style={styles.segmentItem}
            onPress={() => {
              if (!active) {
                tapFeedback();
                onChange(value);
              }
            }}
          >
            <Text
              style={[styles.segmentText, active && styles.segmentTextActive]}
            >
              {value === "homeowner" ? "Homeowner" : "Contractor"}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function MyRequestCard({ project }: { project: ProjectItem }) {
  const status = statusMeta(project.state);
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {project.title}
        </Text>
        <View style={[styles.chip, { backgroundColor: status.bg }]}>
          <Text style={[styles.chipText, { color: status.tint }]}>
            {status.label}
          </Text>
        </View>
      </View>
      {project.placeName ? (
        <Text style={styles.cardMeta} numberOfLines={1}>
          {project.placeName}
        </Text>
      ) : null}
    </View>
  );
}

function NearbyCard({ project }: { project: ProjectItem }) {
  const meta = [project.placeName, project.specialtyLabel]
    .filter(Boolean)
    .join(" · ");
  const posted = timeAgo(project.createdAt);
  return (
    <PressableScale
      accessibilityLabel={project.title}
      onPress={() => {
        tapFeedback();
        router.push(toHref(`/request/${project.id}`));
      }}
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {project.title}
        </Text>
        <Text style={styles.cardMeta} numberOfLines={1}>
          {meta || "New request"}
        </Text>
        {posted ? <Text style={styles.cardPosted}>posted {posted}</Text> : null}
      </View>
    </PressableScale>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

export default function HomeTab() {
  const role = useAppStore((state) => state.role);
  const uid = useAuthStore((state) => state.user?.uid);
  const [mode, setMode] = useState<Mode>(
    role === "contractor" ? "contractor" : "homeowner",
  );
  const [myPage, setMyPage] = useState(PAGE);
  const [nearbyPage, setNearbyPage] = useState(PAGE);

  const myProjects = useMyProjects(uid, myPage);
  const nearby = useNearbyProjects(uid, nearbyPage);

  const isHomeowner = mode === "homeowner";
  const myItems = myProjects.data ?? [];
  const nearbyItems = nearby.data ?? [];

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <SegmentedControl mode={mode} onChange={setMode} />
        </View>

        {isHomeowner ? (
          <FlashList
            data={myItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MyRequestCard project={item} />}
            ListHeaderComponent={
              <Text style={styles.sectionTitle}>My requests</Text>
            }
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              myProjects.isLoading ? (
                <Text style={styles.loading}>Loading…</Text>
              ) : (
                <EmptyState
                  title="No requests yet"
                  text="Post your first request and get matched with local specialists."
                />
              )
            }
            contentContainerStyle={styles.listContent}
            onEndReachedThreshold={0.4}
            onEndReached={() => {
              if (myItems.length >= myPage) setMyPage((page) => page + PAGE);
            }}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlashList
            data={nearbyItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <NearbyCard project={item} />}
            ListHeaderComponent={
              <Text style={styles.sectionTitle}>Requests nearby</Text>
            }
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              nearby.isLoading ? (
                <Text style={styles.loading}>Loading…</Text>
              ) : (
                <EmptyState
                  title="No open requests nearby"
                  text="New jobs in your area will show up here. Check back soon."
                />
              )
            }
            contentContainerStyle={styles.listContent}
            onEndReachedThreshold={0.4}
            onEndReached={() => {
              if (nearbyItems.length >= nearbyPage)
                setNearbyPage((page) => page + PAGE);
            }}
            showsVerticalScrollIndicator={false}
          />
        )}

        {isHomeowner ? (
          <View style={styles.footer}>
            <PrimaryButton
              label="New request"
              onPress={() => router.push("/homeowner-choose-specialty")}
            />
          </View>
        ) : null}
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
    alignItems: "center",
  },
  segment: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 4,
    position: "relative",
  },
  segmentPill: {
    position: "absolute",
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: Radius.pill,
    backgroundColor: Brand.primary,
  },
  segmentItem: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  segmentTextActive: {
    color: "#04170D",
  },
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  separator: {
    height: Spacing.md,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: Spacing.md,
  },
  card: {
    padding: Spacing.base,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  cardTitle: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  cardMeta: {
    color: Colors.textSecondary,
    fontSize: 13.5,
  },
  cardPosted: {
    color: Colors.textMuted,
    fontSize: 12.5,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  loading: {
    color: Colors.textSecondary,
    fontSize: 14,
    paddingVertical: Spacing.md,
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
  footer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
});
