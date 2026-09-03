import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { InteractionManager } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Brand, Colors } from "@/constants/theme";
import "@/lib/push-background";
import { requestTrackingConsentOnce } from "@/lib/tracking";
import { AuthProvider } from "@/providers/auth-provider";
import { LoyaltyProvider } from "@/providers/loyalty-provider";
import { NotificationsProvider } from "@/providers/notifications-provider";

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 2,
    },
  },
});

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Brand.primary,
    background: Colors.background,
    card: Colors.backgroundElevated,
    text: Colors.text,
    border: Colors.border,
  },
};

export default function RootLayout() {
  useEffect(() => {
    void SplashScreen.hideAsync();
    const task = InteractionManager.runAfterInteractions(() => {
      void requestTrackingConsentOnce();
    });
    return () => task.cancel();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={navigationTheme}>
            <StatusBar style="light" />
            <AuthProvider>
              <LoyaltyProvider>
                <NotificationsProvider>
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      animation: "fade",
                      animationDuration: 260,
                      contentStyle: { backgroundColor: Colors.background },
                    }}
                  />
                </NotificationsProvider>
              </LoyaltyProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
