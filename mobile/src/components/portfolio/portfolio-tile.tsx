import { Image } from "expo-image";
import { Text, View } from "react-native";

import { EyeIcon, ReviewIcon } from "@/components/icons";
import { PressableScale } from "@/components/ui/pressable-scale";
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { useT } from "@/lib/i18n";
import type { PortfolioItem } from "@/lib/portfolio";

export function PortfolioTile({
  item,
  showOwnerState = false,
  onPress,
  onLongPress,
}: {
  item: PortfolioItem;
  showOwnerState?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t, tx } = useT();
  const hidden = showOwnerState && !item.isPublic;
  return (
    <PressableScale
      accessibilityLabel={tx(item.title)}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.wrap}
    >
      <View style={styles.tile}>
        <View style={styles.media}>
          {item.cover ? (
            <Image
              source={{ uri: item.cover }}
              style={[styles.image, hidden && styles.imageHidden]}
              contentFit="cover"
              transition={150}
              recyclingKey={item.cover}
            />
          ) : null}
          {item.beforeImage ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{t("portfolio.beforeAfter")}</Text>
            </View>
          ) : null}
          {showOwnerState && item.isFavorite ? (
            <View style={styles.favorite}>
              <ReviewIcon size={13} color={colors.coin} />
            </View>
          ) : null}
          {hidden ? (
            <View style={styles.hiddenBadge}>
              <EyeIcon size={13} color="#FFFFFF" />
              <Text style={styles.badgeText}>{t("setup.hidden")}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={1}>
            {tx(item.title)}
          </Text>
          {item.location ? (
            <Text style={styles.meta} numberOfLines={1}>
              {item.location}
            </Text>
          ) : null}
        </View>
      </View>
    </PressableScale>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: {
    flex: 1,
  },
  tile: {
    borderRadius: Radius.md,
    overflow: "hidden",
    backgroundColor: t.isDark ? t.colors.surface : t.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  media: {
    aspectRatio: 4 / 3,
    backgroundColor: t.colors.surfaceStrong,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageHidden: {
    opacity: 0.45,
  },
  badge: {
    position: "absolute",
    left: 8,
    bottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(5,7,12,0.62)",
  },
  hiddenBadge: {
    position: "absolute",
    right: 8,
    top: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(5,7,12,0.7)",
  },
  favorite: {
    position: "absolute",
    left: 8,
    top: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  body: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 2,
  },
  title: {
    color: t.colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  meta: {
    color: t.colors.textSecondary,
    fontSize: 12,
  },
}));
