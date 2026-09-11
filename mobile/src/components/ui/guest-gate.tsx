import { router } from "expo-router";
import { type ReactNode, useEffect } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Spacing, makeStyles } from "@/constants/theme";
import { analyticsEvents } from "@/lib/analytics-events";
import { toHref } from "@/lib/navigation";

export function GuestGate({
  gate,
  title,
  text,
  children,
}: {
  gate: string;
  title: string;
  text: string;
  children?: ReactNode;
}) {
  const styles = useStyles();

  useEffect(() => {
    analyticsEvents.guestGateViewed({ gate });
  }, [gate]);

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.body}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.text}>{text}</Text>
          <View style={styles.action}>
            <PrimaryButton
              label="Sign in"
              onPress={() => {
                analyticsEvents.guestGateSignInTapped({ gate });
                router.push(toHref("/auth"));
              }}
            />
          </View>
          {children ? <View style={styles.extra}>{children}</View> : null}
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const useStyles = makeStyles((t) => ({
  safe: {
    flex: 1,
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  title: {
    color: t.colors.text,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  text: {
    color: t.colors.textSecondary,
    fontSize: 14.5,
    lineHeight: 21,
    textAlign: "center",
  },
  action: {
    alignSelf: "stretch",
    marginTop: Spacing.lg,
  },
  extra: {
    alignSelf: "stretch",
    marginTop: Spacing.xl,
  },
}));
