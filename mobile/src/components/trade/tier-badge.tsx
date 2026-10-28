import { Text, View } from "react-native";

import { TierIcon } from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { tierBadgeLabel, tierFor } from "@/constants/trade-options";
import { Radius, makeStyles, useTheme } from "@/constants/theme";
import { useT } from "@/lib/i18n";

export function TierBadge({ years }: { years: number }) {
  const styles = useStyles();
  const { t, tx } = useT();
  const { isDark } = useTheme();
  const tier = tierFor(years);
  const ink = isDark ? tier.color : "#04170D";
  return (
    <View
      style={[
        styles.badge,
        { borderColor: tier.color },
        !isDark && { backgroundColor: tier.color },
      ]}
      accessibilityLabel={t("trade.tierA11y", {
        tier: tx(tier.label),
        count: years,
      })}
    >
      <TierIcon tierId={tier.id} size={14} color={ink} strokeWidth={2.2} />
      <Text style={[styles.badgeText, { color: ink }]}>
        {tierBadgeLabel(years, t)}
      </Text>
    </View>
  );
}

export function TierPill({
  years,
  small = false,
}: {
  years: number | null;
  small?: boolean;
}) {
  const styles = useStyles();
  const { t, tx } = useT();
  if (years === null) return null;
  const tier = tierFor(years);
  return (
    <View
      style={[
        styles.tierPill,
        small && styles.tierPillSmall,
        { backgroundColor: tier.color },
      ]}
      accessibilityLabel={t("trade.tierA11y", {
        tier: tx(tier.label),
        count: years,
      })}
    >
      <Text
        style={[styles.tierText, small && styles.tierTextSmall]}
        numberOfLines={1}
      >
        {tierBadgeLabel(years, t)}
      </Text>
    </View>
  );
}

export function TierAvatar({
  name,
  url,
  years,
  size = 64,
  showLabel = true,
}: {
  name: string;
  url: string | null;
  years: number | null;
  size?: number;
  showLabel?: boolean;
}) {
  const styles = useStyles();
  const { t } = useT();
  const tier = years === null ? null : tierFor(years);
  const ring = tier ? 3 : 0;
  const outer = size + ring * 2 + (tier ? 4 : 0);
  return (
    <View
      style={[
        styles.avatarWrap,
        { width: outer, paddingBottom: tier && showLabel ? 9 : 0 },
      ]}
    >
      <View
        style={[
          styles.ring,
          {
            width: outer,
            height: outer,
            borderRadius: outer / 2,
            borderWidth: ring,
            borderColor: tier?.color ?? "transparent",
          },
        ]}
      >
        <Avatar name={name} url={url} size={size} />
      </View>
      {tier && years !== null && showLabel ? (
        <View style={[styles.photoLabel, { backgroundColor: tier.color }]}>
          <Text style={styles.photoLabelText} numberOfLines={1}>
            {tierBadgeLabel(years, t)}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    backgroundColor: t.colors.surface,
  },
  badgeText: {
    fontSize: 11.5,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  tierPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  tierPillSmall: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tierText: {
    color: "#04170D",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  tierTextSmall: {
    fontSize: 9.5,
  },
  avatarWrap: {
    alignItems: "center",
  },
  ring: {
    alignItems: "center",
    justifyContent: "center",
  },
  photoLabel: {
    position: "absolute",
    bottom: 0,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: t.colors.card,
  },
  photoLabelText: {
    color: "#04170D",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
}));
