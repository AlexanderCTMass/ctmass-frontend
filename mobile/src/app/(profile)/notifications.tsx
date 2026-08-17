import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackButton } from "@/components/ui/back-button";
import { PressableScale } from "@/components/ui/pressable-scale";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Brand, Colors, Radius, Spacing } from "@/constants/theme";
import {
  fetchNotificationPrefs,
  hasNotificationPermission,
  type NotificationPrefs,
  registerFcmToken,
  requestNotificationPermission,
  updateNotificationPrefs,
} from "@/lib/notifications";
import { useAuthStore } from "@/store/use-auth-store";

type PrefKey = keyof NotificationPrefs;

export default function NotificationsScreen() {
  const uid = useAuthStore((state) => state.user?.uid);
  const role = useAuthStore((state) => state.user?.role ?? null);
  const isContractor = role === "WORKER";

  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [granted, setGranted] = useState<boolean | null>(null);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (!uid) return;
    let active = true;
    void fetchNotificationPrefs(uid).then((value) => {
      if (active) setPrefs(value);
    });
    void hasNotificationPermission().then((value) => {
      if (active) setGranted(value);
    });
    return () => {
      active = false;
    };
  }, [uid]);

  const toggle = (key: PrefKey) => {
    if (!prefs || !uid) return;
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    void updateNotificationPrefs(uid, next);
  };

  const enable = async () => {
    if (!uid || requesting) return;
    setRequesting(true);
    const ok = await requestNotificationPermission();
    setGranted(ok);
    if (ok) void registerFcmToken(uid);
    setRequesting(false);
  };

  const disabled = granted === false;

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {granted === false ? (
            <View style={styles.permissionCard}>
              <Text style={styles.permissionTitle}>
                Notifications are turned off
              </Text>
              <Text style={styles.permissionText}>
                Turn on notifications to get messages, project updates and
                reminders on this device.
              </Text>
              <PressableScale
                accessibilityLabel="Enable notifications"
                onPress={() => void enable()}
                disabled={requesting}
              >
                <View style={styles.permissionButton}>
                  <Text style={styles.permissionButtonText}>
                    {requesting ? "Requesting…" : "Enable notifications"}
                  </Text>
                </View>
              </PressableScale>
            </View>
          ) : null}

          <Text style={styles.sectionLabel}>Choose what to receive</Text>

          <View style={styles.group}>
            <PrefRow
              label="New messages"
              description="Get notified when someone messages you."
              value={prefs?.messages ?? true}
              disabled={disabled}
              onToggle={() => toggle("messages")}
            />
            {!isContractor ? (
              <>
                <View style={styles.rowDivider} />
                <PrefRow
                  label="Responses to your requests"
                  description="When a specialist responds to a project you posted."
                  value={prefs?.projectResponses ?? true}
                  disabled={disabled}
                  onToggle={() => toggle("projectResponses")}
                />
              </>
            ) : (
              <>
                <View style={styles.rowDivider} />
                <PrefRow
                  label="New matching projects"
                  description="When a new project matches your trade or is open to all."
                  value={prefs?.newProjects ?? true}
                  disabled={disabled}
                  onToggle={() => toggle("newProjects")}
                />
              </>
            )}
            <View style={styles.rowDivider} />
            <PrefRow
              label="Reminders"
              description="Occasional nudges when you've been away for a while."
              value={prefs?.inactivity ?? true}
              disabled={disabled}
              onToggle={() => toggle("inactivity")}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

function PrefRow({
  label,
  description,
  value,
  disabled,
  onToggle,
}: {
  label: string;
  description: string;
  value: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowBody}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: Colors.surfaceStrong, true: Brand.primary }}
        thumbColor="#F6F9FC"
        ios_backgroundColor={Colors.surfaceStrong}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  headerTitle: {
    flex: 1,
    color: Colors.text,
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
    paddingBottom: Spacing.xxl,
    gap: Spacing.base,
  },
  permissionCard: {
    borderRadius: Radius.md,
    padding: Spacing.base,
    backgroundColor: "rgba(255,193,7,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,193,7,0.3)",
    gap: Spacing.sm,
  },
  permissionTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  permissionText: {
    color: Colors.textSecondary,
    fontSize: 13.5,
    lineHeight: 19,
  },
  permissionButton: {
    alignSelf: "flex-start",
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    backgroundColor: Brand.coin,
  },
  permissionButtonText: {
    color: "#20160B",
    fontSize: 14,
    fontWeight: "700",
  },
  sectionLabel: {
    color: Colors.textMuted,
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  group: {
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    marginTop: -Spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.base,
    padding: Spacing.base,
  },
  rowBody: {
    flex: 1,
    gap: 3,
  },
  rowLabel: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  rowDescription: {
    color: Colors.textSecondary,
    fontSize: 12.5,
    lineHeight: 17,
  },
  rowDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: Spacing.base,
  },
});
