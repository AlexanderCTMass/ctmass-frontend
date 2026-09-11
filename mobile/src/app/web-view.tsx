import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import { BackButton } from "@/components/ui/back-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Spacing, makeStyles, useTheme } from "@/constants/theme";
import { analyticsEvents } from "@/lib/analytics-events";

export default function WebViewScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const params = useLocalSearchParams<{ url?: string; title?: string }>();
  const url = typeof params.url === "string" ? params.url : "";
  const title = typeof params.title === "string" ? params.title : "";
  const [loading, setLoading] = useState(true);
  const openedAt = useRef(0);

  useEffect(() => {
    openedAt.current = Date.now();
    analyticsEvents.webViewOpened({ url, title });
  }, [url, title]);

  const handleLoadEnd = () => {
    if (loading) {
      analyticsEvents.webViewLoaded({
        url,
        load_ms: Date.now() - openedAt.current,
      });
    }
    setLoading(false);
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.spacer} />
        </View>

        <View style={styles.body}>
          {url ? (
            <WebView
              source={{ uri: url }}
              onLoadEnd={handleLoadEnd}
              style={styles.webview}
              startInLoadingState
            />
          ) : (
            <Text style={styles.error}>Nothing to show.</Text>
          )}
          {loading && url ? (
            <View style={styles.loader}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const useStyles = makeStyles((t) => ({
  safe: {
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
  title: {
    flex: 1,
    color: t.colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  spacer: {
    width: 40,
  },
  body: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    color: t.colors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.xl,
  },
}));
