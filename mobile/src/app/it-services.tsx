import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { CalendarIcon, CodeBadgeIcon, ShopIcon } from "@/components/icons";
import { BackButton } from "@/components/ui/back-button";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { analyticsEvents } from "@/lib/analytics-events";
import { tapFeedback } from "@/lib/haptics";
import { useT } from "@/lib/i18n";
import { toHref } from "@/lib/navigation";
import {
  DEFAULT_SHOP_ITEMS,
  SHOP_CATEGORIES,
  type ShopFeature,
} from "@/lib/shop";
import { useShopFeatures } from "@/queries/use-shop";

function itServicesFrom(features: ShopFeature[]): ShopFeature[] {
  return features
    .filter(
      (feature) =>
        feature.category === SHOP_CATEGORIES.IT_SERVICES && feature.enabled,
    )
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export default function ItServicesScreen() {
  const { colors, gradients } = useTheme();
  const styles = useStyles();
  const { t, tx } = useT();
  const { data: features } = useShopFeatures();

  const services = useMemo(() => {
    const live = itServicesFrom(features ?? []);
    return live.length > 0 ? live : itServicesFrom(DEFAULT_SHOP_ITEMS);
  }, [features]);

  useEffect(() => {
    analyticsEvents.itServicesViewed({ services_count: services.length });
  }, [services.length]);

  const book = (service?: string) => {
    tapFeedback();
    analyticsEvents.itServicesBookTapped({ service: service ?? "" });
    const query = service
      ? `source=app-profile&service=${encodeURIComponent(service)}`
      : "source=app-profile";
    router.push(toHref(`/it-inquiry?${query}`));
  };

  const openShop = () => {
    tapFeedback();
    analyticsEvents.itServicesShopTapped();
    router.navigate(toHref("/shop"));
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.headerTitle}>{t("profile.tab.itServices")}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeInDown.duration(480)}
            style={styles.hero}
          >
            <View style={styles.heroIcon}>
              <CodeBadgeIcon size={26} color={colors.accent} />
            </View>
            <Text style={styles.eyebrow}>{t("onboarding.it.eyebrow")}</Text>
            <Text style={styles.heroTitle}>{t("it.servicesTitle")}</Text>
            <Text style={styles.heroText}>{t("it.servicesText")}</Text>
          </Animated.View>

          <View style={styles.list}>
            {services.map((service, index) => (
              <Animated.View
                key={service.featureKey}
                entering={FadeInDown.delay(120 + index * 70).duration(460)}
                style={styles.card}
              >
                {service.imageUrl1 ? (
                  <Image
                    source={{ uri: service.imageUrl1 }}
                    style={styles.cardImage}
                    contentFit="cover"
                    transition={200}
                  />
                ) : null}
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>
                    {tx(service.displayName)}
                  </Text>
                  {service.description ? (
                    <Text style={styles.cardText} numberOfLines={4}>
                      {tx(service.description)}
                    </Text>
                  ) : null}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("it.bookAboutA11y", {
                      name: tx(service.displayName),
                    })}
                    onPress={() => book(service.displayName)}
                    style={styles.cardBtn}
                  >
                    <CalendarIcon size={16} color={colors.accent} />
                    <Text style={styles.cardBtnText}>{t("it.bookFree")}</Text>
                  </Pressable>
                </View>
              </Animated.View>
            ))}
          </View>

          <LinearGradient
            colors={gradients.shop}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.shopCard}
          >
            <Text style={styles.shopTitle}>{t("it.payCoins")}</Text>
            <Text style={styles.shopText}>{t("it.payCoinsText")}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("shop.earn.openShop")}
              onPress={openShop}
              style={styles.shopBtn}
            >
              <ShopIcon size={16} color="#FFFFFF" />
              <Text style={styles.shopBtnText}>{t("shop.earn.openShop")}</Text>
            </Pressable>
          </LinearGradient>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton label={t("it.bookFree30")} onPress={() => book()} />
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const useStyles = makeStyles((t) => ({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    color: t.colors.text,
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
    gap: Spacing.xl,
  },
  hero: {
    gap: Spacing.sm,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(22,179,100,0.12)",
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.28)",
    marginBottom: Spacing.xs,
  },
  eyebrow: {
    color: t.colors.accent,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: t.colors.text,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  heroText: {
    color: t.colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  list: {
    gap: Spacing.md,
  },
  card: {
    borderRadius: Radius.lg,
    overflow: "hidden",
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  cardImage: {
    width: "100%",
    height: 140,
  },
  cardBody: {
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  cardTitle: {
    color: t.colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  cardText: {
    color: t.colors.textSecondary,
    fontSize: 13.5,
    lineHeight: 19,
  },
  cardBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.base,
    paddingVertical: 9,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.4)",
    backgroundColor: "rgba(22,179,100,0.1)",
  },
  cardBtnText: {
    color: t.colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  shopCard: {
    padding: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    gap: Spacing.sm,
  },
  shopTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  shopText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13.5,
    lineHeight: 20,
  },
  shopBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.base,
    paddingVertical: 9,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  shopBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
}));
