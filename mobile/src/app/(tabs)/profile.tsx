import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  ArrowRightIcon,
  BellIcon,
  UserIcon,
  UsersIcon,
} from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { PressableScale } from "@/components/ui/pressable-scale";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Brand, Colors, Radius, Spacing } from "@/constants/theme";
import { deleteMyAccount } from "@/lib/account";
import { tapFeedback } from "@/lib/haptics";
import { pickImage } from "@/lib/media";
import { toHref } from "@/lib/navigation";
import { uploadImage } from "@/lib/storage-upload";
import { updateAvatar } from "@/lib/user-profile";
import { useProfile } from "@/queries/use-profile";
import { useAuthStore } from "@/store/use-auth-store";

function roleLabel(role: string | null): string {
  if (role === "WORKER") return "Contractor";
  if (role === "CUSTOMER") return "Homeowner";
  return "Member";
}

export default function ProfileTab() {
  const uid = useAuthStore((state) => state.user?.uid);
  const role = useAuthStore((state) => state.user?.role ?? null);
  const storeName = useAuthStore((state) => state.user?.name ?? "");
  const queryClient = useQueryClient();
  const { data: profile } = useProfile(uid);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const name = profile?.name || storeName || "Your profile";
  const avatar = profile?.avatar ?? null;

  const handleUploadPhoto = async () => {
    if (!uid || uploading) return;
    tapFeedback();
    const uri = await pickImage();
    if (!uri) return;
    setUploading(true);
    try {
      const url = await uploadImage(uri, `avatars/${uid}/${Date.now()}.jpg`);
      await updateAvatar(uid, url);
      void queryClient.invalidateQueries({ queryKey: ["profile", uid] });
    } catch {
      // keep current avatar on failure
    } finally {
      setUploading(false);
    }
  };

  const go = (path: string) => {
    tapFeedback();
    router.push(toHref(path));
  };

  const runDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteMyAccount();
      router.replace("/auth");
    } catch (error) {
      setDeleting(false);
      Alert.alert(
        "Couldn't delete account",
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    }
  };

  const handleDeleteAccount = () => {
    if (deleting) return;
    tapFeedback();
    Alert.alert(
      "Delete account?",
      "This permanently deletes your account and all of your data — profile, messages, projects, and coins. This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => void runDeleteAccount(),
        },
      ],
    );
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.heading}>Profile</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topCard}>
            <Avatar name={name} url={avatar} size={72} />
            <View style={styles.topBody}>
              <Text style={styles.name} numberOfLines={1}>
                {name}
              </Text>
              <Text style={styles.role}>{roleLabel(role)}</Text>
            </View>
            <PressableScale
              accessibilityLabel="Upload profile photo"
              onPress={() => void handleUploadPhoto()}
              disabled={uploading}
            >
              <View style={styles.uploadBtn}>
                <Text style={styles.uploadText}>
                  {uploading ? "Uploading…" : "Upload photo"}
                </Text>
              </View>
            </PressableScale>
          </View>

          <PressableScale
            accessibilityLabel="Setup your profile"
            onPress={() => go("/setup")}
          >
            <View style={styles.setupCard}>
              <View style={styles.setupIcon}>
                <UserIcon size={22} color={Brand.primaryLight} />
              </View>
              <View style={styles.setupBody}>
                <Text style={styles.setupTitle}>Setup your profile</Text>
                <Text style={styles.setupSub}>
                  Add your details so people recognize you.
                </Text>
              </View>
              <ArrowRightIcon size={18} color={Colors.textMuted} />
            </View>
          </PressableScale>

          <View style={styles.list}>
            <ProfileItem
              icon={<BellIcon size={20} color={Brand.primaryLight} />}
              label="Notifications"
              onPress={() => go("/notifications")}
            />
            <View style={styles.itemDivider} />
            <ProfileItem
              icon={<UserIcon size={20} color={Brand.primaryLight} />}
              label="Invite a friend"
              onPress={() => go("/invite")}
            />
            <View style={styles.itemDivider} />
            <ProfileItem
              icon={<UsersIcon size={20} color={Brand.primaryLight} />}
              label="Friends"
              onPress={() => go("/friends")}
            />
          </View>

          <PressableScale
            accessibilityLabel="Delete account"
            onPress={handleDeleteAccount}
            disabled={deleting}
            scaleTo={0.98}
          >
            <View style={styles.dangerCard}>
              <Text style={styles.dangerText}>Delete account</Text>
              <Text style={styles.dangerSub}>
                Permanently remove your account and all of your data.
              </Text>
            </View>
          </PressableScale>
        </ScrollView>

        {deleting ? (
          <View style={styles.overlay}>
            <View style={styles.overlayCard}>
              <ActivityIndicator color={Brand.primaryLight} />
              <Text style={styles.overlayText}>Deleting your account…</Text>
            </View>
          </View>
        ) : null}
      </SafeAreaView>
    </ScreenBackground>
  );
}

function ProfileItem({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <PressableScale accessibilityLabel={label} onPress={onPress} scaleTo={0.98}>
      <View style={styles.item}>
        <View style={styles.itemIcon}>{icon}</View>
        <Text style={styles.itemLabel}>{label}</Text>
        <ArrowRightIcon size={18} color={Colors.textMuted} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  heading: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  content: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xxl,
    gap: Spacing.base,
  },
  topCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.base,
    padding: Spacing.base,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  topBody: {
    flex: 1,
  },
  name: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  role: {
    color: Colors.textSecondary,
    fontSize: 13.5,
    fontWeight: "600",
    marginTop: 2,
  },
  uploadBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.4)",
    backgroundColor: "rgba(22,179,100,0.12)",
  },
  uploadText: {
    color: Brand.primaryLight,
    fontSize: 12.5,
    fontWeight: "700",
  },
  setupCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.base,
    padding: Spacing.base,
    borderRadius: Radius.md,
    backgroundColor: "rgba(22,179,100,0.08)",
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.25)",
  },
  setupIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(22,179,100,0.16)",
  },
  setupBody: {
    flex: 1,
  },
  setupTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  setupSub: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  list: {
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.base,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
  },
  itemIcon: {
    width: 32,
    alignItems: "center",
  },
  itemLabel: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  itemDivider: {
    height: 1,
    marginLeft: Spacing.base + 32 + Spacing.base,
    backgroundColor: Colors.border,
  },
  dangerCard: {
    marginTop: Spacing.sm,
    padding: Spacing.base,
    borderRadius: Radius.md,
    backgroundColor: "rgba(220,38,38,0.08)",
    borderWidth: 1,
    borderColor: "rgba(220,38,38,0.3)",
  },
  dangerText: {
    color: "#F87171",
    fontSize: 15,
    fontWeight: "700",
  },
  dangerSub: {
    color: "rgba(248,113,113,0.75)",
    fontSize: 12.5,
    marginTop: 3,
    lineHeight: 17,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(5,7,12,0.72)",
    alignItems: "center",
    justifyContent: "center",
  },
  overlayCard: {
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  overlayText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
});
