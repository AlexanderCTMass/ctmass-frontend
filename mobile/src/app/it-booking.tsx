import { router, useLocalSearchParams } from "expo-router";
import {
  type ComponentProps,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import { CheckIcon } from "@/components/icons";
import { BackButton } from "@/components/ui/back-button";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { analyticsEvents } from "@/lib/analytics-events";
import { successFeedback } from "@/lib/haptics";
import { useT } from "@/lib/i18n";
import {
  INQUIRY_SOURCES,
  type InquirySource,
  buildCalendlyUrl,
} from "@/lib/it-inquiry";
import { toHref } from "@/lib/navigation";

const CALENDLY_BRIDGE = `
  (function () {
    window.addEventListener("message", function (event) {
      var data = event && event.data;
      if (!data || typeof data !== "object" || typeof data.event !== "string") return;
      if (data.event.indexOf("calendly.") !== 0) return;
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ event: data.event }));
      }
    });
  })();
  true;
`;

type ShouldStartLoadRequest = Parameters<
  NonNullable<ComponentProps<typeof WebView>["onShouldStartLoadWithRequest"]>
>[0];

function asParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

function isCalendlyUrl(url: string): boolean {
  return /^https:\/\/([a-z0-9-]+\.)*calendly\.com(\/|$|\?)/i.test(url);
}

export default function ItBookingScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useT();
  const params = useLocalSearchParams<{
    name?: string;
    email?: string;
    details?: string;
    source?: string;
  }>();
  const rawSource = asParam(params.source) as InquirySource;
  const source: InquirySource = INQUIRY_SOURCES.includes(rawSource)
    ? rawSource
    : "app";

  const url = useMemo(
    () =>
      buildCalendlyUrl({
        name: asParam(params.name),
        email: asParam(params.email),
        details: asParam(params.details),
        source,
      }),
    [params.name, params.email, params.details, source],
  );

  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [scheduled, setScheduled] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const openedAt = useRef(0);
  const scheduledRef = useRef(false);

  useEffect(() => {
    openedAt.current = Date.now();
    analyticsEvents.itBookingOpened({ source });
  }, [source]);

  const close = () => {
    analyticsEvents.itBookingClosed({
      source,
      scheduled: scheduledRef.current,
    });
    if (router.canGoBack()) router.back();
    else router.replace(toHref("/"));
  };

  const handleLoadEnd = () => {
    if (loading) {
      analyticsEvents.itBookingLoaded({
        source,
        load_ms: Date.now() - openedAt.current,
      });
    }
    setLoading(false);
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    let name = "";
    try {
      const data = JSON.parse(event.nativeEvent.data) as { event?: unknown };
      name = typeof data.event === "string" ? data.event : "";
    } catch {
      return;
    }
    if (name === "calendly.date_and_time_selected") {
      analyticsEvents.itBookingTimeSelected({ source });
    }
    if (name === "calendly.event_scheduled" && !scheduledRef.current) {
      scheduledRef.current = true;
      setScheduled(true);
      successFeedback();
      analyticsEvents.itBookingScheduled({ source });
    }
  };

  const handleNavigation = (request: ShouldStartLoadRequest) => {
    if (request.isTopFrame === false) return true;
    if (request.url.startsWith("about:") || isCalendlyUrl(request.url)) {
      return true;
    }
    void Linking.openURL(request.url).catch(() => undefined);
    return false;
  };

  const retry = () => {
    setFailed(false);
    setLoading(true);
    setReloadKey((key) => key + 1);
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <BackButton onPress={close} />
          <Text style={styles.title} numberOfLines={1}>
            {t("it.bookingTitle")}
          </Text>
          <View style={styles.spacer} />
        </View>

        <View style={styles.body}>
          {failed ? (
            <View style={styles.errorWrap}>
              <Text style={styles.errorTitle}>{t("it.calendarFailed")}</Text>
              <Text style={styles.errorText}>{t("it.calendarFailedText")}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("common.tryAgainButton")}
                onPress={retry}
                style={styles.retryBtn}
              >
                <Text style={styles.retryText}>
                  {t("common.tryAgainButton")}
                </Text>
              </Pressable>
            </View>
          ) : (
            <WebView
              key={reloadKey}
              source={{ uri: url }}
              injectedJavaScriptBeforeContentLoaded={CALENDLY_BRIDGE}
              onMessage={handleMessage}
              onLoadEnd={handleLoadEnd}
              onError={(event) => {
                analyticsEvents.itBookingLoadFailed({
                  source,
                  error_message: event.nativeEvent.description ?? "unknown",
                });
                setFailed(true);
              }}
              onShouldStartLoadWithRequest={handleNavigation}
              originWhitelist={["https://*", "about:*"]}
              setSupportMultipleWindows={false}
              style={styles.webview}
            />
          )}
          {loading && !failed ? (
            <View style={styles.loader}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : null}
        </View>

        {scheduled ? (
          <Animated.View
            entering={FadeInDown.duration(380)}
            style={styles.successCard}
          >
            <View style={styles.successRow}>
              <View style={styles.successIcon}>
                <CheckIcon size={22} color={colors.accent} />
              </View>
              <View style={styles.successBody}>
                <Text style={styles.successTitle}>{t("it.booked")}</Text>
                <Text style={styles.successText}>{t("it.bookedText")}</Text>
              </View>
            </View>
            <PrimaryButton
              label={t("common.done")}
              withArrow={false}
              onPress={close}
            />
          </Animated.View>
        ) : null}
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
    backgroundColor: "#FFFFFF",
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
  errorWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  errorTitle: {
    color: t.colors.text,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  errorText: {
    color: t.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  retryText: {
    color: t.colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  successCard: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.sm,
    padding: Spacing.base,
    gap: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.4)",
    backgroundColor: t.colors.surface,
  },
  successRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  successIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(22,179,100,0.14)",
  },
  successBody: {
    flex: 1,
  },
  successTitle: {
    color: t.colors.text,
    fontSize: 17,
    fontWeight: "800",
  },
  successText: {
    color: t.colors.textSecondary,
    fontSize: 13.5,
    lineHeight: 19,
    marginTop: 2,
  },
}));
