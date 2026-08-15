import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { PressableScale } from "@/components/ui/pressable-scale";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Brand, Colors, Radius, Spacing } from "@/constants/theme";
import { tapFeedback } from "@/lib/haptics";
import type { ProjectItem } from "@/lib/projects";
import { useMyProjects, useNearbyProjects } from "@/queries/use-projects";
import { useAppStore } from "@/store/use-app-store";
import { useAuthStore } from "@/store/use-auth-store";

type Mode = "homeowner" | "contractor";

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
  return (
    <View style={styles.segment}>
      {(["homeowner", "contractor"] as const).map((value) => {
        const active = mode === value;
        return (
          <PressableScale
            key={value}
            accessibilityLabel={value}
            onPress={() => {
              if (!active) {
                tapFeedback();
                onChange(value);
              }
            }}
          >
            <View
              style={[styles.segmentItem, active && styles.segmentItemActive]}
            >
              <Text
                style={[styles.segmentText, active && styles.segmentTextActive]}
              >
                {value === "homeowner" ? "Homeowner" : "Contractor"}
              </Text>
            </View>
          </PressableScale>
        );
      })}
    </View>
  );
}

function MyRequestCard({ project }: { project: ProjectItem }) {
  const status = statusMeta(project.state);
  return (
    <Animated.View entering={FadeInUp.duration(320)} style={styles.card}>
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
    </Animated.View>
  );
}

function NearbyCard({ project }: { project: ProjectItem }) {
  return (
    <Animated.View entering={FadeInUp.duration(320)} style={styles.card}>
      <Text style={styles.cardTitle} numberOfLines={1}>
        {project.title}
      </Text>
      <Text style={styles.cardMeta} numberOfLines={1}>
        {[project.placeName, project.specialtyLabel]
          .filter(Boolean)
          .join(" · ") || "New request"}
      </Text>
    </Animated.View>
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

  const myProjects = useMyProjects(uid);
  const nearby = useNearbyProjects(uid);

  const isHomeowner = mode === "homeowner";
  const myItems = myProjects.data ?? [];
  const nearbyItems = nearby.data ?? [];

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <SegmentedControl mode={mode} onChange={setMode} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isHomeowner ? (
            <>
              <Text style={styles.sectionTitle}>My requests</Text>
              {myProjects.isLoading ? (
                <Text style={styles.loading}>Loading…</Text>
              ) : myItems.length > 0 ? (
                myItems.map((project) => (
                  <MyRequestCard key={project.id} project={project} />
                ))
              ) : (
                <EmptyState
                  title="No requests yet"
                  text="Post your first request and get matched with local specialists."
                />
              )}
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Requests nearby</Text>
              {nearby.isLoading ? (
                <Text style={styles.loading}>Loading…</Text>
              ) : nearbyItems.length > 0 ? (
                nearbyItems.map((project) => (
                  <NearbyCard key={project.id} project={project} />
                ))
              ) : (
                <EmptyState
                  title="No open requests nearby"
                  text="New jobs in your area will show up here. Check back soon."
                />
              )}
            </>
          )}
        </ScrollView>

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
    paddingTop: Spacing.md,
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
  },
  segmentItem: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
  },
  segmentItemActive: {
    backgroundColor: Brand.primary,
  },
  segmentText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  segmentTextActive: {
    color: "#04170D",
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: Spacing.xs,
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
