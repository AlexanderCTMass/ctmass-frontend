import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Colors, Spacing } from "@/constants/theme";
import { toHref } from "@/lib/navigation";

export function GuestGate({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.body}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.text}>{text}</Text>
          <View style={styles.action}>
            <PrimaryButton
              label="Sign in"
              onPress={() => router.push(toHref("/auth"))}
            />
          </View>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
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
    color: Colors.text,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  text: {
    color: Colors.textSecondary,
    fontSize: 14.5,
    lineHeight: 21,
    textAlign: "center",
  },
  action: {
    alignSelf: "stretch",
    marginTop: Spacing.lg,
  },
});
