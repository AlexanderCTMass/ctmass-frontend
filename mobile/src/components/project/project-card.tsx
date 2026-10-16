import { Image } from "expo-image";
import { Text, View } from "react-native";

import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  ResponsesIcon,
  WalletIcon,
} from "@/components/icons";
import { PressableScale } from "@/components/ui/pressable-scale";
import {
  bestTimeLabel,
  budgetLabel,
  startLabel,
} from "@/constants/project-request";
import { Brand, Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { timeAgo } from "@/lib/format";
import { formatMiles } from "@/lib/geo";
import type { ProjectDetail } from "@/lib/projects";

export type CardBadge = { label: string; tint: string; bg: string };

const MAX_TILES = 4;

export function shortPlace(placeName: string): string {
  const parts = placeName
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part && !/^united states$/i.test(part));
  if (parts.length <= 2) return parts.join(", ");
  const state = parts[parts.length - 1].replace(/\s*\d.*$/, "");
  const city = parts[parts.length - 2];
  return state ? `${city}, ${state}` : city;
}

function PhotoStrip({ photos }: { photos: string[] }) {
  const styles = useStyles();
  if (photos.length === 0) return null;
  const visible = photos.slice(0, MAX_TILES);
  const extra = photos.length - visible.length;
  return (
    <View style={styles.photos}>
      {visible.map((uri, index) => {
        const showExtra = extra > 0 && index === visible.length - 1;
        return (
          <View key={uri} style={styles.photoTile}>
            <Image
              source={{ uri }}
              style={styles.photo}
              contentFit="cover"
              transition={150}
              recyclingKey={uri}
            />
            {showExtra ? (
              <View style={styles.photoMore}>
                <Text style={styles.photoMoreText}>+{extra + 1}</Text>
              </View>
            ) : null}
          </View>
        );
      })}
      {Array.from({ length: MAX_TILES - visible.length }).map((_, index) => (
        <View key={`spacer-${index}`} style={styles.photoSpacer} />
      ))}
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const styles = useStyles();
  return (
    <View style={styles.infoRow}>
      {icon}
      <Text style={styles.infoText} numberOfLines={1}>
        <Text style={styles.infoLabel}>{label}: </Text>
        {value}
      </Text>
    </View>
  );
}

export function ProjectCard({
  project,
  badge,
  distance,
  ctaLabel,
  showResponses = true,
  highlighted = false,
  onPress,
}: {
  project: ProjectDetail;
  badge?: CardBadge | null;
  distance?: number | null;
  ctaLabel: string;
  showResponses?: boolean;
  highlighted?: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const place = project.placeName ? shortPlace(project.placeName) : "";
  const miles = formatMiles(distance ?? null);
  const placeLine = [place, miles].filter(Boolean).join(" · ");
  const start = startLabel(project.startType, project.start, project.end);
  const bestTime = project.contactPreferences
    ? bestTimeLabel(project.contactPreferences.bestTime)
    : "";
  const posted = timeAgo(project.createdAt);
  const budget = budgetLabel(project.budget);
  const responses = `${project.responseCount} ${project.responseCount === 1 ? "response" : "responses"}`;
  const iconColor = colors.textSecondary;

  return (
    <PressableScale accessibilityLabel={project.title} onPress={onPress}>
      <View style={[styles.card, highlighted && styles.cardHighlighted]}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title} numberOfLines={2}>
              {project.title}
            </Text>
            {project.specialtyLabel &&
            project.specialtyLabel !== project.title ? (
              <Text style={styles.specialty} numberOfLines={1}>
                {project.specialtyLabel}
              </Text>
            ) : null}
          </View>
          {badge ? (
            <View style={[styles.badge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.tint }]}>
                {badge.label}
              </Text>
            </View>
          ) : null}
        </View>

        {placeLine ? (
          <View style={styles.placeRow}>
            <MapPinIcon size={15} color={colors.accent} />
            <Text style={styles.place} numberOfLines={1}>
              {placeLine}
            </Text>
          </View>
        ) : null}

        {project.description ? (
          <Text style={styles.description} numberOfLines={3}>
            {project.description}
          </Text>
        ) : null}

        <PhotoStrip photos={project.photos} />

        {start || bestTime || posted ? (
          <View style={styles.infoList}>
            {start ? (
              <InfoRow
                icon={<CalendarIcon size={15} color={iconColor} />}
                label="Start"
                value={start}
              />
            ) : null}
            {bestTime ? (
              <InfoRow
                icon={<ClockIcon size={15} color={iconColor} />}
                label="Best time"
                value={bestTime}
              />
            ) : null}
            {posted ? (
              <InfoRow
                icon={<ResponsesIcon size={15} color={iconColor} />}
                label="Posted"
                value={posted}
              />
            ) : null}
          </View>
        ) : null}

        {budget || showResponses ? (
          <View style={styles.stats}>
            <View style={styles.stat}>
              <View style={styles.statLabelRow}>
                <WalletIcon size={14} color={iconColor} />
                <Text style={styles.statLabel}>Budget</Text>
              </View>
              <Text style={styles.statValue}>{budget || "Open to quotes"}</Text>
            </View>
            {showResponses ? (
              <>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <View style={styles.statLabelRow}>
                    <ResponsesIcon size={14} color={iconColor} />
                    <Text style={styles.statLabel}>Responses</Text>
                  </View>
                  <Text style={styles.statValue}>{responses}</Text>
                </View>
              </>
            ) : null}
          </View>
        ) : null}

        <View style={styles.cta}>
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </View>
      </View>
    </PressableScale>
  );
}

const useStyles = makeStyles((t) => ({
  card: {
    padding: Spacing.base,
    borderRadius: Radius.lg,
    backgroundColor: t.isDark ? t.colors.surface : t.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: t.colors.border,
    gap: Spacing.md,
  },
  cardHighlighted: {
    borderColor: "rgba(22,179,100,0.45)",
    backgroundColor: t.isDark ? "rgba(22,179,100,0.08)" : "#F7FCF9",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: t.colors.text,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  specialty: {
    color: t.colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  badgeText: {
    fontSize: 11.5,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  placeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: -4,
  },
  place: {
    flex: 1,
    color: t.colors.textSecondary,
    fontSize: 13.5,
    fontWeight: "600",
  },
  description: {
    color: t.colors.text,
    fontSize: 14.5,
    lineHeight: 21,
  },
  photos: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  photoTile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: Radius.sm,
    overflow: "hidden",
    backgroundColor: t.colors.surfaceStrong,
  },
  photoSpacer: {
    flex: 1,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoMore: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(5,7,12,0.55)",
  },
  photoMoreText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  infoList: {
    gap: 7,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
    color: t.colors.textSecondary,
    fontSize: 13.5,
  },
  infoLabel: {
    color: t.colors.text,
    fontWeight: "700",
  },
  stats: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
  },
  stat: {
    flex: 1,
    gap: 4,
  },
  statLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statLabel: {
    color: t.colors.textSecondary,
    fontSize: 12.5,
    fontWeight: "600",
  },
  statValue: {
    color: t.colors.text,
    fontSize: 15.5,
    fontWeight: "800",
  },
  statDivider: {
    width: 1,
    marginHorizontal: Spacing.base,
    backgroundColor: t.colors.border,
  },
  cta: {
    height: 46,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.primaryDark,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
}));
