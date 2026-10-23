import { Pressable, Text, View } from "react-native";

import {
  CalendarIcon,
  DollarIcon,
  MapPinIcon,
  PhoneIcon,
  ResponsesIcon,
  ReviewIcon,
  ScaleIcon,
  ShieldCheckIcon,
  TradeGroupIcon,
} from "@/components/icons";
import { shortPlace } from "@/components/project/project-card";
import { TierAvatar } from "@/components/trade/tier-badge";
import { LikeButton } from "@/components/ui/like-button";
import { PressableScale } from "@/components/ui/pressable-scale";
import { Brand, Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { formatMiles } from "@/lib/geo";
import {
  availabilityLine,
  hasListedRate,
  priceLine,
  priceSubline,
  responseLine,
  servicesPreview,
  trustItems,
} from "@/lib/trade-display";
import type { Specialist } from "@/lib/trades";

export type TradeCardBadge = { label: string; tint: string; bg: string };

function ActionButton({
  label,
  icon,
  primary,
  onPress,
}: {
  label: string;
  icon?: React.ReactNode;
  primary?: boolean;
  onPress: () => void;
}) {
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        primary ? styles.actionPrimary : styles.actionSecondary,
        pressed && styles.pressed,
      ]}
    >
      {icon}
      <Text
        style={[styles.actionText, primary && styles.actionTextPrimary]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function TradeCard({
  specialist,
  distance,
  badge,
  liked,
  phone,
  otherTrades = [],
  compared,
  onPress,
  onToggleLike,
  onToggleCompare,
  onMessage,
  onCall,
  onRequestQuote,
  onOpenTrade,
}: {
  specialist: Specialist;
  distance: number | null;
  badge?: TradeCardBadge | null;
  liked?: boolean;
  phone?: string;
  otherTrades?: Specialist[];
  compared?: boolean;
  onPress: () => void;
  onToggleLike?: () => void;
  onToggleCompare?: () => void;
  onMessage?: () => void;
  onCall?: () => void;
  onRequestQuote?: () => void;
  onOpenTrade?: (trade: Specialist) => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const details = specialist.details;
  const place = specialist.placeName ? shortPlace(specialist.placeName) : "";
  const placeLine = [specialist.specialtyLabel, place, formatMiles(distance)]
    .filter(Boolean)
    .join(" · ");
  const rated = specialist.rating > 0;
  const services = servicesPreview(details.services, 3);
  const trust = trustItems(details);
  const response = responseLine(details);
  const schedule = availabilityLine(details.availability);
  const subPrice = priceSubline(details.rates);
  const listed = hasListedRate(details.rates);
  const iconColor = colors.textSecondary;
  const others = otherTrades.slice(0, 2);
  const moreOthers = otherTrades.length - others.length;

  return (
    <PressableScale accessibilityLabel={specialist.name} onPress={onPress}>
      <View style={styles.card}>
        <View style={styles.header}>
          <TierAvatar
            name={specialist.name}
            url={specialist.avatarUrl || null}
            years={details.experienceYears}
            size={54}
          />
          <View style={styles.headerText}>
            <Text style={styles.name} numberOfLines={2}>
              {specialist.name}
            </Text>
            <View style={styles.ratingRow}>
              {badge ? (
                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.badgeText, { color: badge.tint }]}>
                    {badge.label}
                  </Text>
                </View>
              ) : null}
              {rated ? (
                <>
                  <ReviewIcon size={13} color={colors.coin} />
                  <Text style={styles.ratingValue}>
                    {specialist.rating.toFixed(1)}
                  </Text>
                  <Text style={styles.ratingCount}>({specialist.reviews})</Text>
                </>
              ) : (
                <Text style={styles.newText}>New on CTMASS</Text>
              )}
            </View>
            {placeLine ? (
              <View style={styles.placeRow}>
                <TradeGroupIcon
                  groupId={details.groupId}
                  size={14}
                  color={colors.accent}
                />
                <Text style={styles.place} numberOfLines={2}>
                  {placeLine}
                </Text>
              </View>
            ) : null}
          </View>
          <View style={styles.headerActions}>
            {onToggleLike ? (
              <LikeButton liked={Boolean(liked)} onPress={onToggleLike} />
            ) : null}
            {onToggleCompare ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={compared ? "Remove from compare" : "Add to compare"}
                accessibilityState={{ selected: Boolean(compared) }}
                hitSlop={8}
                onPress={onToggleCompare}
                style={[styles.compare, compared && styles.compareActive]}
              >
                <ScaleIcon
                  size={16}
                  color={compared ? colors.onAccent : colors.textSecondary}
                  strokeWidth={2}
                />
              </Pressable>
            ) : null}
          </View>
        </View>

        {services.shown.length > 0 ? (
          <View style={styles.chips}>
            {services.shown.map((service) => (
              <View key={service} style={styles.chip}>
                <Text style={styles.chipText} numberOfLines={1}>
                  {service}
                </Text>
              </View>
            ))}
            {services.more > 0 ? (
              <View style={styles.chip}>
                <Text style={styles.chipText}>+{services.more}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.facts}>
          <View style={styles.fact}>
            <DollarIcon size={15} color={listed ? colors.accent : iconColor} strokeWidth={2} />
            <Text
              style={[styles.factText, listed && styles.priceText]}
              numberOfLines={1}
            >
              {priceLine(details.rates)}
            </Text>
          </View>
          {subPrice ? <Text style={styles.subPrice}>{subPrice}</Text> : null}
          {trust.length > 0 ? (
            <View style={styles.trustRow}>
              {trust.map((item) => (
                <View key={item.key} style={styles.trust}>
                  <ShieldCheckIcon size={13} color={colors.accent} />
                  <Text style={styles.trustText} numberOfLines={1}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
          {response ? (
            <View style={styles.fact}>
              <ResponsesIcon size={15} color={iconColor} />
              <Text style={styles.factText} numberOfLines={1}>
                {response}
              </Text>
            </View>
          ) : null}
          {schedule ? (
            <View style={styles.fact}>
              <CalendarIcon size={15} color={iconColor} />
              <Text style={styles.factText} numberOfLines={1}>
                {schedule}
              </Text>
            </View>
          ) : null}
          {details.radiusMiles ? (
            <View style={styles.fact}>
              <MapPinIcon size={15} color={iconColor} />
              <Text style={styles.factText} numberOfLines={1}>
                Serves within {details.radiusMiles} mi
              </Text>
            </View>
          ) : null}
        </View>

        {others.length > 0 ? (
          <View style={styles.alsoRow}>
            <Text style={styles.alsoLabel}>Also:</Text>
            {others.map((trade) => (
              <Pressable
                key={trade.tradeId}
                accessibilityRole="button"
                accessibilityLabel={`Open ${trade.specialtyLabel}`}
                onPress={() => onOpenTrade?.(trade)}
                style={({ pressed }) => [styles.alsoChip, pressed && styles.pressed]}
              >
                <TradeGroupIcon groupId={trade.details.groupId} size={13} color={colors.accent} />
                <Text style={styles.alsoText} numberOfLines={1}>
                  {trade.specialtyLabel || trade.name}
                </Text>
              </Pressable>
            ))}
            {moreOthers > 0 ? (
              <Text style={styles.alsoLabel}>+{moreOthers}</Text>
            ) : null}
          </View>
        ) : null}

        {onMessage || onRequestQuote ? (
          <View style={styles.actions}>
            {onMessage ? (
              <ActionButton
                label="Message"
                icon={<ResponsesIcon size={15} color={colors.text} />}
                onPress={onMessage}
              />
            ) : null}
            {phone && onCall ? (
              <ActionButton
                label="Call"
                icon={<PhoneIcon size={15} color={colors.text} />}
                onPress={onCall}
              />
            ) : null}
            {onRequestQuote ? (
              <ActionButton label="Request quote" primary onPress={onRequestQuote} />
            ) : null}
          </View>
        ) : null}
      </View>
    </PressableScale>
  );
}

const useStyles = makeStyles((t) => ({
  card: {
    padding: Spacing.base,
    borderRadius: Radius.lg,
    backgroundColor: t.colors.card,
    borderWidth: 1,
    borderColor: t.colors.border,
    gap: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  headerActions: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  name: {
    color: t.colors.text,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  ratingValue: {
    color: t.colors.text,
    fontSize: 13.5,
    fontWeight: "800",
  },
  ratingCount: {
    color: t.colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  newText: {
    color: t.colors.accent,
    fontSize: 12.5,
    fontWeight: "700",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    marginRight: 2,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  placeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  place: {
    flex: 1,
    color: t.colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  compare: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.colors.surfaceStrong,
  },
  compareActive: {
    backgroundColor: t.colors.accent,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    maxWidth: "100%",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    backgroundColor: t.colors.surfaceStrong,
  },
  chipText: {
    color: t.colors.text,
    fontSize: 12.5,
    fontWeight: "600",
  },
  facts: {
    gap: 7,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
  },
  fact: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  factText: {
    flex: 1,
    color: t.colors.textSecondary,
    fontSize: 13.5,
    fontWeight: "600",
  },
  priceText: {
    color: t.colors.text,
    fontWeight: "800",
    fontSize: 14.5,
  },
  subPrice: {
    color: t.colors.textMuted,
    fontSize: 12.5,
    marginTop: -3,
    marginLeft: 23,
  },
  trustRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  trust: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(22,179,100,0.12)",
  },
  trustText: {
    color: t.colors.accent,
    fontSize: 12,
    fontWeight: "700",
  },
  alsoRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  alsoLabel: {
    color: t.colors.textMuted,
    fontSize: 12.5,
    fontWeight: "700",
  },
  alsoChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  alsoText: {
    color: t.colors.text,
    fontSize: 12.5,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  action: {
    flexGrow: 1,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
  },
  actionPrimary: {
    backgroundColor: Brand.primaryDark,
  },
  actionSecondary: {
    backgroundColor: t.colors.surfaceStrong,
  },
  actionText: {
    color: t.colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  actionTextPrimary: {
    color: "#FFFFFF",
  },
  pressed: {
    opacity: 0.7,
  },
}));
