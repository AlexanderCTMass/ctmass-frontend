import { Pressable, Text, View } from "react-native";

import {
  CalendarIcon,
  DollarIcon,
  GlobeIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  ResponsesIcon,
  ReviewIcon,
  ScaleIcon,
  ShieldCheckIcon,
  TextMessageIcon,
  TradeGroupIcon,
} from "@/components/icons";
import { compactPlace } from "@/components/project/project-card";
import { TierAvatar, TierPill } from "@/components/trade/tier-badge";
import { LikeButton } from "@/components/ui/like-button";
import { PressableScale } from "@/components/ui/pressable-scale";
import type { ContactMethod } from "@/constants/project-request";
import {
  Brand,
  Radius,
  Spacing,
  makeStyles,
  useTheme,
} from "@/constants/theme";
import { reachableMethods } from "@/lib/business-profile";
import { formatMiles } from "@/lib/geo";
import { useT } from "@/lib/i18n";
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

export function ContactMethodIcon({
  method,
  color,
  size = 13,
}: {
  method: ContactMethod;
  color: string;
  size?: number;
}) {
  switch (method) {
    case "phone":
      return <PhoneIcon size={size} color={color} />;
    case "sms":
      return <TextMessageIcon size={size} color={color} />;
    case "email":
      return <MailIcon size={size} color={color} />;
    default:
      return <ResponsesIcon size={size} color={color} />;
  }
}

function Fact({ icon, text }: { icon: React.ReactNode; text: string }) {
  const styles = useStyles();
  return (
    <View style={styles.fact}>
      {icon}
      <Text style={styles.factText} numberOfLines={2}>
        {text}
      </Text>
    </View>
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
  const { t, tx } = useT();
  const details = specialist.details;
  const owner = specialist.owner;
  const place = specialist.placeName ? compactPlace(specialist.placeName) : "";
  const placeLine = [place, formatMiles(distance)].filter(Boolean).join(" · ");
  const rated = specialist.rating > 0;
  const services = servicesPreview(details.services, 3);
  const trust = trustItems(details, owner, t);
  const response = responseLine(details, t);
  const schedule = availabilityLine(details.availability, t);
  const subPrice = priceSubline(details.rates, t);
  const listed = hasListedRate(details.rates);
  const languages = owner?.business.languages ?? [];
  const methods = owner ? reachableMethods(owner) : [];
  const iconColor = colors.textSecondary;
  const others = otherTrades.slice(0, 2);
  const moreOthers = otherTrades.length - others.length;
  const facts: { key: string; icon: React.ReactNode; text: string }[] = [];
  if (response) {
    facts.push({
      key: "response",
      icon: <ResponsesIcon size={15} color={iconColor} />,
      text: response,
    });
  }
  if (schedule) {
    facts.push({
      key: "schedule",
      icon: <CalendarIcon size={15} color={iconColor} />,
      text: schedule,
    });
  }
  if (details.radiusMiles) {
    facts.push({
      key: "radius",
      icon: <MapPinIcon size={15} color={iconColor} />,
      text: t("trade.servesWithin", { miles: details.radiusMiles }),
    });
  }
  if (languages.length > 0) {
    facts.push({
      key: "languages",
      icon: <GlobeIcon size={15} color={iconColor} />,
      text: languages.map(tx).join(", "),
    });
  }

  return (
    <PressableScale accessibilityLabel={specialist.name} onPress={onPress}>
      <View style={styles.card}>
        <View style={styles.header}>
          <TierAvatar
            name={specialist.name}
            url={specialist.avatarUrl || null}
            years={details.experienceYears}
            size={54}
            showLabel={false}
          />
          <View style={styles.headerText}>
            <Text style={styles.name} numberOfLines={2}>
              {specialist.name}
            </Text>
            <View style={styles.ratingRow}>
              <TierPill years={details.experienceYears} small />
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
              ) : !badge ? (
                <Text style={styles.newText}>
                  {t("compare.values.newOnCtmass")}
                </Text>
              ) : null}
            </View>
            {specialist.specialtyLabel ? (
              <View style={styles.metaRow}>
                <TradeGroupIcon
                  groupId={details.groupId}
                  size={14}
                  color={colors.accent}
                />
                <Text style={styles.specialty} numberOfLines={1}>
                  {tx(specialist.specialtyLabel)}
                </Text>
              </View>
            ) : null}
            {placeLine ? (
              <View style={styles.metaRow}>
                <MapPinIcon size={14} color={iconColor} />
                <Text style={styles.place} numberOfLines={1}>
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
                accessibilityLabel={
                  compared
                    ? t("trade.removeFromCompare")
                    : t("trade.addToCompare")
                }
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
                  {tx(service)}
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

        <View style={styles.facts}>
          <View style={styles.priceRow}>
            <DollarIcon
              size={15}
              color={listed ? colors.accent : iconColor}
              strokeWidth={2}
            />
            <View style={styles.priceBody}>
              <Text
                style={[styles.priceLine, listed && styles.priceText]}
                numberOfLines={2}
              >
                {priceLine(details.rates, t)}
              </Text>
              {subPrice ? (
                <Text style={styles.subPrice} numberOfLines={1}>
                  {subPrice}
                </Text>
              ) : null}
            </View>
          </View>
          {facts.length > 0 ? (
            <View style={styles.factGrid}>
              {facts.map((fact) => (
                <Fact key={fact.key} icon={fact.icon} text={fact.text} />
              ))}
            </View>
          ) : null}
          {methods.length > 0 ? (
            <View style={styles.contactRow}>
              <Text style={styles.contactLabel}>{t("trade.prefers")}</Text>
              {methods.map((method) => (
                <View key={method} style={styles.contactChip}>
                  <ContactMethodIcon method={method} color={colors.accent} />
                  <Text style={styles.contactText} numberOfLines={1}>
                    {t(`trade.contactShort.${method}`)}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {others.length > 0 ? (
          <View style={styles.alsoRow}>
            <Text style={styles.alsoLabel}>{t("trade.also")}</Text>
            {others.map((trade) => (
              <Pressable
                key={trade.tradeId}
                accessibilityRole="button"
                accessibilityLabel={t("compare.openA11y", {
                  name: tx(trade.specialtyLabel),
                })}
                onPress={() => onOpenTrade?.(trade)}
                style={({ pressed }) => [
                  styles.alsoChip,
                  pressed && styles.pressed,
                ]}
              >
                <TradeGroupIcon
                  groupId={trade.details.groupId}
                  size={13}
                  color={colors.accent}
                />
                <Text style={styles.alsoText} numberOfLines={1}>
                  {tx(trade.specialtyLabel) || trade.name}
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
                label={t("trade.message")}
                icon={<ResponsesIcon size={15} color={colors.text} />}
                onPress={onMessage}
              />
            ) : null}
            {phone && onCall ? (
              <ActionButton
                label={t("trade.call")}
                icon={<PhoneIcon size={15} color={colors.text} />}
                onPress={onCall}
              />
            ) : null}
            {onRequestQuote ? (
              <ActionButton
                label={t("compare.requestQuote")}
                primary
                onPress={onRequestQuote}
              />
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
    minWidth: 0,
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
    gap: 5,
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
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  specialty: {
    flex: 1,
    color: t.colors.text,
    fontSize: 13.5,
    fontWeight: "700",
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
    backgroundColor: t.isDark
      ? "rgba(63,199,154,0.14)"
      : "rgba(22,179,100,0.12)",
  },
  trustText: {
    color: t.colors.accent,
    fontSize: 12,
    fontWeight: "700",
  },
  facts: {
    gap: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  priceBody: {
    flex: 1,
    gap: 1,
  },
  priceLine: {
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
  },
  factGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: Spacing.sm,
  },
  fact: {
    width: "50%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    paddingRight: Spacing.sm,
  },
  factText: {
    flex: 1,
    color: t.colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 17,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  contactLabel: {
    color: t.colors.textMuted,
    fontSize: 12.5,
    fontWeight: "700",
  },
  contactChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  contactText: {
    color: t.colors.text,
    fontSize: 12,
    fontWeight: "600",
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
