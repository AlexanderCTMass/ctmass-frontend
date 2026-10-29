import { Tabs } from "expo-router";
import { useEffect } from "react";
import { Pressable } from "react-native";

import {
  HomeIcon,
  ResponsesIcon,
  ShopIcon,
  UserIcon,
} from "@/components/icons";
import { useTheme } from "@/constants/theme";
import { analyticsEvents, currentScreen } from "@/lib/analytics-events";
import { tapFeedback } from "@/lib/haptics";
import { useT } from "@/lib/i18n";
import { setPushNavigationReady } from "@/lib/push-routing";
import { usePartnerAdsSync } from "@/queries/use-partner-ads";
import { useShopFeatures } from "@/queries/use-shop";

export default function TabsLayout() {
  const { colors } = useTheme();
  const { t } = useT();
  usePartnerAdsSync();
  useShopFeatures();

  useEffect(() => {
    const timer = setTimeout(() => setPushNavigationReady(true), 0);
    return () => {
      clearTimeout(timer);
      setPushNavigationReady(false);
    };
  }, []);
  return (
    <Tabs
      screenListeners={({ route }) => ({
        tabPress: () => {
          tapFeedback();
          analyticsEvents.tabSelected({
            tab: route.name,
            previous_tab: currentScreen(),
          });
        },
      })}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.backgroundElevated,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        tabBarButton: (props) => (
          <Pressable
            onPress={props.onPress}
            onLongPress={props.onLongPress}
            testID={props.testID}
            accessibilityLabel={props.accessibilityLabel}
            accessibilityRole={props.accessibilityRole}
            accessibilityState={props.accessibilityState}
            style={props.style}
            android_ripple={{ color: "transparent" }}
          >
            {props.children}
          </Pressable>
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t("tabs.home"),
          tabBarIcon: ({ color, size }) => (
            <HomeIcon size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: t("tabs.chats"),
          tabBarIcon: ({ color, size }) => (
            <ResponsesIcon size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: t("tabs.shop"),
          tabBarIcon: ({ color, size }) => (
            <ShopIcon size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          tabBarIcon: ({ color, size }) => (
            <UserIcon size={size} color={color as string} />
          ),
        }}
      />
    </Tabs>
  );
}
