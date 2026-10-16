import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  ArrowRightIcon,
  BellIcon,
  CameraIcon,
  MailIcon,
  QrCodeIcon,
  ShareIcon,
  UserIcon,
  UsersIcon,
} from "@/components/icons";
import { ProfileQrModal } from "@/components/profile/profile-qr-modal";
import { ThemeSelector } from "@/components/profile/theme-selector";
import { Avatar } from "@/components/ui/avatar";
import { GuestGate } from "@/components/ui/guest-gate";
import { ImageViewerModal } from "@/components/ui/image-viewer-modal";
import { PressableScale } from "@/components/ui/pressable-scale";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { AccountDeletionError, deleteMyAccount } from "@/lib/account";
import { analyticsEvents, errorMessage } from "@/lib/analytics-events";
import { signOutEverywhere } from "@/lib/auth";
import { tapFeedback } from "@/lib/haptics";
import { choosePhoto } from "@/lib/media";
import { toHref } from "@/lib/navigation";
import { profileShareUrl } from "@/lib/public-profile";
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
  const { colors } = useTheme();
  const styles = useStyles();
  const uid = useAuthStore((state) => state.user?.uid);
  const role = useAuthStore((state) => state.user?.role ?? null);
  const storeName = useAuthStore((state) => state.user?.name ?? "");
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const queryClient = useQueryClient();
  const { data: profile } = useProfile(uid);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const name = profile?.name || storeName || "Your profile";
  const avatar = profile?.avatar ?? null;

  const removePhoto = async () => {
    if (!uid || uploading) return;
    setUploading(true);
    try {
      await updateAvatar(uid, "");
      await queryClient.invalidateQueries({ queryKey: ["profile", uid] });
      analyticsEvents.profilePhotoRemoved();
    } catch (error) {
      analyticsEvents.profilePhotoUploadFailed({
        error_message: errorMessage(error),
      });
      Alert.alert("Couldn't remove photo", "Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoPress = () => {
    if (!avatar) {
      void handleUploadPhoto();
      return;
    }
    tapFeedback();
    Alert.alert("Profile photo", undefined, [
      { text: "View photo", onPress: () => setPhotoOpen(true) },
      { text: "Choose new photo", onPress: () => void handleUploadPhoto() },
      {
        text: "Remove photo",
        style: "destructive",
        onPress: () => void removePhoto(),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleUploadPhoto = async () => {
    if (!uid || uploading) return;
    tapFeedback();
    analyticsEvents.profilePhotoUploadTapped();
    const uri = await choosePhoto();
    if (!uri) {
      analyticsEvents.profilePhotoPickerCancelled();
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(uri, `avatars/${uid}/${Date.now()}.jpg`);
      await updateAvatar(uid, url);
      void queryClient.invalidateQueries({ queryKey: ["profile", uid] });
      analyticsEvents.profilePhotoUploaded();
    } catch (error) {
      analyticsEvents.profilePhotoUploadFailed({
        error_message: errorMessage(error),
      });
      Alert.alert(
        "Couldn't upload photo",
        "Check your connection and try again.",
      );
    } finally {
      setUploading(false);
    }
  };

  const go = (path: string, item: string) => {
    tapFeedback();
    analyticsEvents.profileMenuItemTapped({ item });
    router.push(toHref(path));
  };

  const handleContactSupport = async () => {
    tapFeedback();
    analyticsEvents.profileMenuItemTapped({ item: "contact_support" });
    const subject = encodeURIComponent("CTMASS support");
    const mailto = `mailto:support@ctmass.com?subject=${subject}`;
    const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=support@ctmass.com&su=${subject}`;
    try {
      if (await Linking.canOpenURL(mailto)) {
        await Linking.openURL(mailto);
        analyticsEvents.contactSupportOpened({ method: "mailto" });
        return;
      }
      await Linking.openURL(gmail);
      analyticsEvents.contactSupportOpened({ method: "gmail" });
    } catch {
      analyticsEvents.contactSupportOpened({ method: "fallback" });
      Alert.alert("Contact support", "Please email us at support@ctmass.com");
    }
  };

  const runDeleteAccount = async () => {
    analyticsEvents.deleteAccountConfirmed();
    setDeleting(true);
    try {
      await deleteMyAccount();
      analyticsEvents.accountDeleted();
      queryClient.clear();
      useAuthStore.getState().signOut();
    } catch (error) {
      analyticsEvents.accountDeletionFailed({
        error_message: errorMessage(error),
      });
      Alert.alert(
        "Couldn't delete account",
        error instanceof AccountDeletionError
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const runLogout = async () => {
    setLoggingOut(true);
    try {
      await signOutEverywhere();
      analyticsEvents.loggedOut();
      queryClient.clear();
      useAuthStore.getState().signOut();
    } catch (error) {
      analyticsEvents.logOutFailed({ error_message: errorMessage(error) });
      Alert.alert("Couldn't log out", "Something went wrong. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  const handleLogout = () => {
    if (loggingOut) return;
    tapFeedback();
    analyticsEvents.logOutTapped();
    Alert.alert("Log out?", "You can sign back in anytime.", [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => analyticsEvents.logOutCancelled(),
      },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => void runLogout(),
      },
    ]);
  };

  const handleDeleteAccount = () => {
    if (deleting) return;
    tapFeedback();
    analyticsEvents.deleteAccountTapped();
    Alert.alert(
      "Delete account?",
      "This permanently deletes your account and all of your data — profile, messages, projects, and coins. This can't be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => analyticsEvents.deleteAccountCancelled(),
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => void runDeleteAccount(),
        },
      ],
    );
  };

  if (!isAuthenticated) {
    return (
      <GuestGate
        gate="profile"
        title="Sign in to your profile"
        text="Create a free account to set up your profile, manage notifications, and more."
      >
        <ThemeSelector />
      </GuestGate>
    );
  }

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
            <Pressable
              accessibilityRole="imagebutton"
              accessibilityLabel={
                avatar ? "Change profile photo" : "Upload profile photo"
              }
              disabled={uploading}
              onPress={handlePhotoPress}
              style={styles.avatarWrap}
            >
              <Avatar name={name} url={avatar} size={72} />
              {uploading ? (
                <View style={styles.avatarOverlay}>
                  <ActivityIndicator color="#FFFFFF" />
                </View>
              ) : null}
              <View style={styles.cameraBadge}>
                <CameraIcon size={15} color="#FFFFFF" strokeWidth={2} />
              </View>
            </Pressable>
            <View style={styles.topBody}>
              <Text style={styles.name} numberOfLines={1}>
                {name}
              </Text>
              <Text style={styles.role}>{roleLabel(role)}</Text>
            </View>
            <PressableScale
              accessibilityLabel="Show my QR code"
              onPress={() => {
                tapFeedback();
                analyticsEvents.profileTabQrOpened();
                setQrOpen(true);
              }}
              disabled={!uid}
            >
              <View style={styles.qrBtn}>
                <QrCodeIcon size={22} color={colors.accent} />
                <Text style={styles.qrText}>My QR</Text>
              </View>
            </PressableScale>
          </View>

          <PressableScale
            accessibilityLabel="Setup your profile"
            onPress={() => go("/setup", "setup_profile")}
          >
            <View style={styles.setupCard}>
              <View style={styles.setupIcon}>
                <UserIcon size={22} color={colors.accent} />
              </View>
              <View style={styles.setupBody}>
                <Text style={styles.setupTitle}>Setup your profile</Text>
                <Text style={styles.setupSub}>
                  Add your details so people recognize you.
                </Text>
              </View>
              <ArrowRightIcon size={18} color={colors.textMuted} />
            </View>
          </PressableScale>

          <View style={styles.list}>
            <ProfileItem
              icon={<ShareIcon size={20} color={colors.accent} />}
              label="View public profile"
              onPress={() => go(`/user/${uid}`, "public_profile")}
            />
            <View style={styles.itemDivider} />
            <ProfileItem
              icon={<BellIcon size={20} color={colors.accent} />}
              label="Notifications"
              onPress={() => go("/notifications", "notifications")}
            />
            <View style={styles.itemDivider} />
            <ProfileItem
              icon={<UserIcon size={20} color={colors.accent} />}
              label="Invite a friend"
              onPress={() => go("/invite", "invite_friend")}
            />
            <View style={styles.itemDivider} />
            <ProfileItem
              icon={<UsersIcon size={20} color={colors.accent} />}
              label="Friends"
              onPress={() => go("/friends", "friends")}
            />
            <View style={styles.itemDivider} />
            <ProfileItem
              icon={<MailIcon size={20} color={colors.accent} />}
              label="Contact support"
              onPress={() => void handleContactSupport()}
            />
          </View>

          <ThemeSelector />

          <PressableScale
            accessibilityLabel="Log out"
            onPress={handleLogout}
            disabled={loggingOut}
            scaleTo={0.98}
          >
            <View style={styles.logoutCard}>
              <Text style={styles.logoutText}>Log out</Text>
            </View>
          </PressableScale>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Delete account"
            onPress={handleDeleteAccount}
            disabled={deleting}
            hitSlop={8}
            style={styles.deleteLinkWrap}
          >
            <Text style={styles.deleteLink}>Delete account</Text>
          </Pressable>
        </ScrollView>

        {deleting || loggingOut ? (
          <View style={styles.overlay}>
            <View style={styles.overlayCard}>
              <ActivityIndicator color={colors.accent} />
              <Text style={styles.overlayText}>
                {deleting ? "Deleting your account…" : "Logging out…"}
              </Text>
            </View>
          </View>
        ) : null}
      </SafeAreaView>

      <ImageViewerModal
        uri={photoOpen && avatar ? avatar : null}
        onClose={() => setPhotoOpen(false)}
      />
      {uid ? (
        <ProfileQrModal
          visible={qrOpen}
          onClose={() => setQrOpen(false)}
          url={profileShareUrl(uid)}
          name={name}
          targetUid={uid}
          subtitle="Scan to open my profile and connect"
          showReward
        />
      ) : null}
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
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <PressableScale accessibilityLabel={label} onPress={onPress} scaleTo={0.98}>
      <View style={styles.item}>
        <View style={styles.itemIcon}>{icon}</View>
        <Text style={styles.itemLabel}>{label}</Text>
        <ArrowRightIcon size={18} color={colors.textMuted} />
      </View>
    </PressableScale>
  );
}

const useStyles = makeStyles((t) => ({
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  heading: {
    color: t.colors.text,
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
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  topBody: {
    flex: 1,
  },
  name: {
    color: t.colors.text,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  role: {
    color: t.colors.textSecondary,
    fontSize: 13.5,
    fontWeight: "600",
    marginTop: 2,
  },
  avatarWrap: {
    width: 72,
    height: 72,
  },
  avatarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(5,7,12,0.45)",
  },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.colors.accent,
    borderWidth: 2.5,
    borderColor: t.colors.surface,
  },
  qrBtn: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    width: 64,
    height: 64,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.4)",
    backgroundColor: "rgba(22,179,100,0.12)",
  },
  qrText: {
    color: t.colors.accent,
    fontSize: 11.5,
    fontWeight: "800",
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
    color: t.colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  setupSub: {
    color: t.colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  list: {
    borderRadius: Radius.md,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
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
    color: t.colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  itemDivider: {
    height: 1,
    marginLeft: Spacing.base + 32 + Spacing.base,
    backgroundColor: t.colors.border,
  },
  logoutCard: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.base,
    borderRadius: Radius.md,
    alignItems: "center",
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  logoutText: {
    color: t.colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  deleteLinkWrap: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
  },
  deleteLink: {
    color: t.colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: t.colors.overlay,
    alignItems: "center",
    justifyContent: "center",
  },
  overlayCard: {
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  overlayText: {
    color: t.colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
}));
