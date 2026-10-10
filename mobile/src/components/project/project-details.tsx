import { Image } from "expo-image";
import { useState } from "react";
import {
  FlatList,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  CalendarIcon,
  ClockIcon,
  CloseIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  ResponsesIcon,
  TextMessageIcon,
  WalletIcon,
} from "@/components/icons";
import {
  bestTimeLabel,
  budgetLabel,
  type ContactMethod,
  contactMethodLabel,
  startLabel,
} from "@/constants/project-request";
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { analyticsEvents } from "@/lib/analytics-events";
import { timeAgo } from "@/lib/format";
import { formatMiles } from "@/lib/geo";
import { tapFeedback } from "@/lib/haptics";
import type { ProjectDetail } from "@/lib/projects";

function MethodIcon({ method, color }: { method: ContactMethod; color: string }) {
  switch (method) {
    case "app":
      return <ResponsesIcon size={15} color={color} />;
    case "phone":
      return <PhoneIcon size={15} color={color} />;
    case "sms":
      return <TextMessageIcon size={15} color={color} />;
    default:
      return <MailIcon size={15} color={color} />;
  }
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) return value;
  return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function mapsUrl(center: [number, number], label: string): string {
  const [lng, lat] = center;
  const query = encodeURIComponent(label || `${lat},${lng}`);
  return Platform.OS === "ios"
    ? `http://maps.apple.com/?ll=${lat},${lng}&q=${query}`
    : `geo:${lat},${lng}?q=${lat},${lng}(${query})`;
}

function PhotoViewer({
  photos,
  index,
  onClose,
}: {
  photos: string[];
  index: number | null;
  onClose: () => void;
}) {
  const styles = useStyles();
  const { width } = useWindowDimensions();
  return (
    <Modal
      visible={index !== null}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.viewer}>
        <SafeAreaView style={styles.viewerSafe} edges={["top", "bottom"]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            hitSlop={12}
            onPress={onClose}
            style={styles.viewerClose}
          >
            <CloseIcon size={22} color="#FFFFFF" />
          </Pressable>
          {index !== null ? (
            <FlatList
              data={photos}
              horizontal
              pagingEnabled
              initialScrollIndex={index}
              getItemLayout={(_, i) => ({
                length: width,
                offset: width * i,
                index: i,
              })}
              keyExtractor={(uri) => uri}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={[styles.viewerPage, { width }]}>
                  <Image
                    source={{ uri: item }}
                    style={styles.viewerImage}
                    contentFit="contain"
                  />
                </View>
              )}
            />
          ) : null}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function Fact({
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
    <View style={styles.fact}>
      <View style={styles.factLabelRow}>
        {icon}
        <Text style={styles.factLabel}>{label}</Text>
      </View>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

export function ProjectDetails({
  project,
  distance,
  contactMode,
}: {
  project: ProjectDetail;
  distance?: number | null;
  contactMode: "owner" | "visible";
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const iconColor = colors.textSecondary;

  const start = startLabel(project.startType, project.start, project.end);
  const budget = budgetLabel(project.budget);
  const posted = timeAgo(project.createdAt);
  const miles = formatMiles(distance ?? null);
  const preferences = project.contactPreferences;
  const phone = project.contactPhone;
  const email = project.contactEmail;
  const wants = (method: ContactMethod) =>
    preferences?.methods.includes(method) ?? false;
  const showPhone = Boolean(phone) && (wants("phone") || wants("sms"));
  const showEmail = Boolean(email) && wants("email");

  const openLink = (url: string, kind: string) => {
    tapFeedback();
    analyticsEvents.requestContactTapped({ project_id: project.id, kind });
    void Linking.openURL(url).catch(() => {});
  };

  const center = project.locationCenter;

  return (
    <View style={styles.wrap}>
      {project.photos.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.gallery}
        >
          {project.photos.map((uri, index) => (
            <Pressable
              key={uri}
              accessibilityRole="imagebutton"
              accessibilityLabel={`Photo ${index + 1}`}
              onPress={() => {
                tapFeedback();
                setViewerIndex(index);
              }}
            >
              <Image
                source={{ uri }}
                style={
                  project.photos.length === 1
                    ? styles.galleryImageSingle
                    : styles.galleryImage
                }
                contentFit="cover"
                transition={200}
              />
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      {project.placeName ? (
        <View style={styles.card}>
          <View style={styles.locationRow}>
            <MapPinIcon size={18} color={colors.accent} />
            <View style={styles.locationBody}>
              <Text style={styles.locationText}>{project.placeName}</Text>
              {miles ? (
                <Text style={styles.locationMeta}>{miles} from you</Text>
              ) : null}
            </View>
          </View>
          {center ? (
            <Pressable
              accessibilityRole="link"
              hitSlop={8}
              onPress={() => openLink(mapsUrl(center, project.placeName), "map")}
            >
              <Text style={styles.link}>Open in Maps</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <View style={styles.facts}>
        <Fact
          icon={<WalletIcon size={14} color={iconColor} />}
          label="Budget"
          value={budget || "Open to quotes"}
        />
        <Fact
          icon={<CalendarIcon size={14} color={iconColor} />}
          label="Start"
          value={start || "Not specified"}
        />
        {posted ? (
          <Fact
            icon={<ClockIcon size={14} color={iconColor} />}
            label="Posted"
            value={posted}
          />
        ) : null}
        <Fact
          icon={<ResponsesIcon size={14} color={iconColor} />}
          label="Responses"
          value={String(project.responseCount)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About the job</Text>
        {project.description ? (
          <Text style={styles.description}>{project.description}</Text>
        ) : (
          <Text style={styles.muted}>No description provided.</Text>
        )}
      </View>

      {preferences ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {contactMode === "owner"
              ? "How contractors will contact you"
              : "Preferred contact"}
          </Text>
          <View style={styles.card}>
            <View style={styles.methods}>
              {preferences.methods.map((method) => (
                <View key={method} style={styles.methodChip}>
                  <MethodIcon method={method} color={colors.accent} />
                  <Text style={styles.methodText}>
                    {contactMethodLabel(method)}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.bestTimeRow}>
              <ClockIcon size={15} color={iconColor} />
              <Text style={styles.bestTimeText}>
                <Text style={styles.bestTimeLabel}>Best time: </Text>
                {bestTimeLabel(preferences.bestTime)}
              </Text>
            </View>

            {contactMode === "owner" && (showPhone || showEmail) ? (
              <View style={styles.contactActions}>
                {showPhone ? (
                  <View style={styles.contactButton}>
                    <PhoneIcon size={16} color={colors.accent} />
                    <Text style={styles.contactButtonText}>
                      {formatPhone(phone)}
                    </Text>
                  </View>
                ) : null}
                {showEmail ? (
                  <View style={styles.contactButton}>
                    <MailIcon size={16} color={colors.accent} />
                    <Text style={styles.contactButtonText} numberOfLines={1}>
                      {email}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            {contactMode === "visible" && (showPhone || showEmail) ? (
              <View style={styles.contactActions}>
                {phone && wants("phone") ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => openLink(`tel:${phone}`, "phone")}
                    style={styles.contactButton}
                  >
                    <PhoneIcon size={16} color={colors.accent} />
                    <Text style={styles.contactButtonText}>
                      Call {formatPhone(phone)}
                    </Text>
                  </Pressable>
                ) : null}
                {phone && wants("sms") ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => openLink(`sms:${phone}`, "sms")}
                    style={styles.contactButton}
                  >
                    <TextMessageIcon size={16} color={colors.accent} />
                    <Text style={styles.contactButtonText}>Send a text</Text>
                  </Pressable>
                ) : null}
                {showEmail ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => openLink(`mailto:${email}`, "email")}
                    style={styles.contactButton}
                  >
                    <MailIcon size={16} color={colors.accent} />
                    <Text style={styles.contactButtonText} numberOfLines={1}>
                      {email}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>
      ) : null}

      <PhotoViewer
        photos={project.photos}
        index={viewerIndex}
        onClose={() => setViewerIndex(null)}
      />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: {
    marginTop: Spacing.base,
    gap: Spacing.base,
  },
  gallery: {
    gap: Spacing.sm,
  },
  galleryImage: {
    width: 220,
    height: 160,
    borderRadius: Radius.md,
    backgroundColor: t.colors.surfaceStrong,
  },
  galleryImageSingle: {
    width: 340,
    height: 210,
    borderRadius: Radius.md,
    backgroundColor: t.colors.surfaceStrong,
  },
  card: {
    padding: Spacing.base,
    borderRadius: Radius.lg,
    backgroundColor: t.isDark ? t.colors.surface : t.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: t.colors.border,
    gap: Spacing.md,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  locationBody: {
    flex: 1,
    gap: 2,
  },
  locationText: {
    color: t.colors.text,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 21,
  },
  locationMeta: {
    color: t.colors.textSecondary,
    fontSize: 13,
  },
  link: {
    color: t.colors.accent,
    fontSize: 14,
    fontWeight: "700",
  },
  facts: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  fact: {
    flexGrow: 1,
    flexBasis: "46%",
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: t.isDark ? t.colors.surface : t.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: t.colors.border,
    gap: 4,
  },
  factLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  factLabel: {
    color: t.colors.textSecondary,
    fontSize: 12.5,
    fontWeight: "600",
  },
  factValue: {
    color: t.colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    color: t.colors.text,
    fontSize: 17,
    fontWeight: "800",
  },
  description: {
    color: t.colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  muted: {
    color: t.colors.textMuted,
    fontSize: 13.5,
    lineHeight: 19,
  },
  methods: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  methodChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(22,179,100,0.12)",
  },
  methodText: {
    color: t.colors.accent,
    fontSize: 13,
    fontWeight: "700",
  },
  bestTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  bestTimeText: {
    flex: 1,
    color: t.colors.textSecondary,
    fontSize: 14,
  },
  bestTimeLabel: {
    color: t.colors.text,
    fontWeight: "700",
  },
  contactActions: {
    gap: Spacing.sm,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    height: 46,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.4)",
  },
  contactButtonText: {
    flex: 1,
    color: t.colors.text,
    fontSize: 14.5,
    fontWeight: "700",
  },
  viewer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.94)",
  },
  viewerSafe: {
    flex: 1,
  },
  viewerClose: {
    position: "absolute",
    top: Spacing.xl,
    right: Spacing.base,
    zIndex: 2,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  viewerPage: {
    flex: 1,
    justifyContent: "center",
  },
  viewerImage: {
    width: "100%",
    height: "80%",
  },
}));
