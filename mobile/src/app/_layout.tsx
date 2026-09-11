import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppErrorBoundary } from "@/components/app-error-boundary";
import { AppSplash } from "@/components/app-splash";
import { Brand, useTheme } from "@/constants/theme";
import { initAnalytics, setAnalyticsUserProperties } from "@/lib/analytics";
import { analyticsEvents } from "@/lib/analytics-events";
import "@/lib/push-background";
import { AnalyticsProvider } from "@/providers/analytics-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { LoyaltyProvider } from "@/providers/loyalty-provider";
import { NotificationsProvider } from "@/providers/notifications-provider";
import { useAuthStore } from "@/store/use-auth-store";
import {
  initializeTheme,
  resolveScheme,
  useThemeStore,
} from "@/store/use-theme-store";

const launchStartedAt = Date.now();
const LAUNCH_SPLASH_MAX_MS = 2500;

void SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ fade: true, duration: 200 });
initAnalytics();

const initialTheme = initializeTheme();
if (initialTheme.firstLaunch) {
  analyticsEvents.themeInitialized({ theme: initialTheme.scheme });
}
setAnalyticsUserProperties({
  theme: initialTheme.scheme,
  theme_preference: initialTheme.preference,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 2,
    },
  },
});

function hideNativeSplash() {
  void SplashScreen.hideAsync();
}

function resetQueryCache() {
  queryClient.clear();
}

export default function RootLayout() {
  const { isDark, colors } = useTheme();
  const authReady = useAuthStore((state) => !state.isInitializing);
  const [splashTimedOut, setSplashTimedOut] = useState(false);
  const showLaunchSplash = !authReady && !splashTimedOut;

  useEffect(() => {
    const timer = setTimeout(
      () => setSplashTimedOut(true),
      LAUNCH_SPLASH_MAX_MS,
    );
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showLaunchSplash) return;
    hideNativeSplash();
    analyticsEvents.splashScreenShown({
      trigger: "launch",
      duration_ms: Date.now() - launchStartedAt,
      theme: resolveScheme(useThemeStore.getState()),
    });
  }, [showLaunchSplash]);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);

  const baseTheme = isDark ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: Brand.primary,
      background: colors.background,
      card: colors.backgroundElevated,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={isDark ? "light" : "dark"} />
        <AppErrorBoundary onReset={resetQueryCache}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider value={navigationTheme}>
              <AuthProvider>
                <AnalyticsProvider>
                  <LoyaltyProvider>
                    <NotificationsProvider>
                      <Stack
                        screenOptions={{
                          headerShown: false,
                          animation: "fade",
                          animationDuration: 260,
                          contentStyle: { backgroundColor: colors.background },
                        }}
                      />
                    </NotificationsProvider>
                  </LoyaltyProvider>
                </AnalyticsProvider>
              </AuthProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </AppErrorBoundary>
        {showLaunchSplash ? <AppSplash onLayout={hideNativeSplash} /> : null}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
