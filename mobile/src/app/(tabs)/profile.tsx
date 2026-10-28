import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  CodeBadgeIcon,
  CoinIcon,
  MailIcon,
  QrCodeIcon,
  ReviewIcon,
  ShareIcon,
  ToolsIcon,
  UserIcon,
  UsersIcon,
} from "@/components/icons";
import { LanguageSelector } from "@/components/profile/language-selector";
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
import { requestAppReview } from "@/lib/app-review";
import type { Translate } from "@/lib/i18n";
import { signOutEverywhere } from "@/lib/auth";
import { tapFeedback } from "@/lib/haptics";
import {
  coinsForRole,
  isRuleEnabledForRole,
  loyaltyRoleKey,
} from "@/lib/loyalty-config";
import { choosePhoto } from "@/lib/media";
import { toHref } from "@/lib/navigation";
import { profileShareUrl } from "@/lib/public-profile";
import { formatCoins } from "@/lib/shop";
import { uploadImage } from "@/lib/storage-upload";
import { updateAvatar } from "@/lib/user-profile";
import { useLoyaltyRules } from "@/queries/use-loyalty-config";
import { useProfile } from "@/queries/use-profile";
import { useAuthStore } from "@/store/use-auth-store";

function roleLabel(role: string | null, t: Translate): string {
  if (role === "WORKER") return t("common.roles.contractor");
  if (role === "CUSTOMER") return t("common.roles.homeowner");
  return t("common.roles.member");
}

export default function ProfileTab() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
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

  const { data: loyaltyRules } = useLoyaltyRules();

  const name = profile?.name || storeName || t("profile.tab.yourProfile");
  const avatar = profile?.avatar ?? null;
  const inviteRule = loyaltyRules?.find(
    (rule) => rule.actionType === "INVITE_USER_REGISTERS",
  );
  const roleKey = loyaltyRoleKey(role);
  const inviteCoins =
    inviteRule && isRuleEnabledForRole(inviteRule, roleKey)
      ? coinsForRole(inviteRule, roleKey)
      : 0;

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
      Alert.alert(
        t("profile.tab.removePhotoFailed"),
        t("common.pleaseTryAgain"),
      );
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
    Alert.alert(t("profile.tab.photoTitle"), undefined, [
      { text: t("profile.tab.viewPhoto"), onPress: () => setPhotoOpen(true) },
      {
        text: t("profile.tab.choosePhoto"),
        onPress: () => void handleUploadPhoto(),
      },
      {
        text: t("profile.tab.removePhoto"),
        style: "destructive",
        onPress: () => void removePhoto(),
      },
      { text: t("common.cancel"), style: "cancel" },
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
        t("profile.tab.uploadPhotoFailed"),
        t("common.checkConnection"),
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

  const handleLeaveFeedback = async () => {
    tapFeedback();
    analyticsEvents.profileMenuItemTapped({ item: "leave_feedback" });
    try {
      const method = await requestAppReview();
      analyticsEvents.appReviewRequested({ method });
      if (method === "unavailable") {
        Alert.alert(
          t("profile.tab.leaveFeedback"),
          t("profile.tab.ratingUnavailable"),
        );
      }
    } catch {
      analyticsEvents.appReviewRequested({ method: "unavailable" });
      Alert.alert(t("profile.tab.storeOpenFailed"), t("common.tryLater"));
    }
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
      Alert.alert(
        t("profile.tab.contactSupport"),
        t("profile.tab.emailSupport"),
      );
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
        t("profile.tab.deleteFailed"),
        error instanceof AccountDeletionError
          ? error.message
          : t("common.somethingWrong"),
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
      Alert.alert(t("profile.tab.logoutFailed"), t("common.somethingWrong"));
    } finally {
      setLoggingOut(false);
    }
  };

  const handleLogout = () => {
    if (loggingOut) return;
    tapFeedback();
    analyticsEvents.logOutTapped();
    Alert.alert(
      t("profile.tab.logoutConfirmTitle"),
      t("profile.tab.logoutConfirmText"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
          onPress: () => analyticsEvents.logOutCancelled(),
        },
        {
          text: t("profile.tab.logout"),
          style: "destructive",
          onPress: () => void runLogout(),
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    if (deleting) return;
    tapFeedback();
    analyticsEvents.deleteAccountTapped();
    Alert.alert(
      t("profile.tab.deleteConfirmTitle"),
      t("profile.tab.deleteConfirmText"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
          onPress: () => analyticsEvents.deleteAccountCancelled(),
        },
        {
          text: t("common.delete"),
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
        title={t("profile.tab.guestTitle")}
        text={t("profile.tab.guestText")}
      >
        <LanguageSelector />
        <ThemeSelector />
      </GuestGate>
    );
  }

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.heading}>{t("profile.tab.title")}</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topCard}>
            <Pressable
              accessibilityRole="imagebutton"
              accessibilityLabel={
                avatar
                  ? t("profile.tab.changePhotoA11y")
                  : t("profile.tab.uploadPhotoA11y")
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
              <Text style={styles.role}>{roleLabel(role, t)}</Text>
            </View>
            <PressableScale
              accessibilityLabel={t("profile.tab.showQrA11y")}
              onPress={() => {
                tapFeedback();
                analyticsEvents.profileTabQrOpened();
                setQrOpen(true);
              }}
              disabled={!uid}
            >
              <View style={styles.qrBtn}>
                <QrCodeIcon size={22} color={colors.accent} />
                <Text style={styles.qrText}>{t("profile.tab.myQr")}</Text>
              </View>
            </PressableScale>
          </View>

          <PressableScale
            accessibilityLabel={t("profile.tab.setupTitle")}
            onPress={() => go("/setup", "setup_profile")}
          >
            <View style={styles.setupCard}>
              <View style={styles.setupIcon}>
                <UserIcon size={22} color={colors.accent} />
              </View>
              <View style={styles.setupBody}>
                <Text style={styles.setupTitle}>
                  {t("profile.tab.setupTitle")}
                </Text>
                <Text style={styles.setupSub}>{t("profile.tab.setupSub")}</Text>
              </View>
              <ArrowRightIcon size={18} color={colors.textMuted} />
            </View>
          </PressableScale>

          <View style={styles.list}>
            {role === "WORKER" ? (
              <>
                <ProfileItem
                  icon={<ToolsIcon size={20} color={colors.accent} />}
                  label={t("profile.tab.myTrades")}
                  onPress={() => go("/my-trades", "my_trades")}
                />
                <View style={styles.itemDivider} />
              </>
            ) : null}
            <ProfileItem
              icon={<ShareIcon size={20} color={colors.accent} />}
              label={t("profile.tab.viewPublic")}
              onPress={() => go(`/user/${uid}`, "public_profile")}
            />
            <View style={styles.itemDivider} />
            <ProfileItem
              icon={<BellIcon size={20} color={colors.accent} />}
              label={t("profile.tab.notifications")}
              onPress={() => go("/notifications", "notifications")}
            />
            <View style={styles.itemDivider} />
            <ProfileItem
              icon={<UserIcon size={20} color={colors.accent} />}
              label={t("profile.tab.invite")}
              coins={inviteCoins}
              onPress={() => go("/invite", "invite_friend")}
            />
            <View style={styles.itemDivider} />
            <ProfileItem
              icon={<UsersIcon size={20} color={colors.accent} />}
              label={t("profile.tab.friends")}
              onPress={() => go("/friends", "friends")}
            />
            <View style={styles.itemDivider} />
            <ProfileItem
              icon={<CodeBadgeIcon size={20} color={colors.accent} />}
              label={t("profile.tab.itServices")}
              onPress={() => go("/it-services", "it_services")}
            />
            <View style={styles.itemDivider} />
            <ProfileItem
              icon={<ReviewIcon size={20} color={colors.accent} />}
              label={t("profile.tab.leaveFeedback")}
              onPress={() => void handleLeaveFeedback()}
            />
            <View style={styles.itemDivider} />
            <ProfileItem
              icon={<MailIcon size={20} color={colors.accent} />}
              label={t("profile.tab.contactSupport")}
              onPress={() => void handleContactSupport()}
            />
          </View>

          <LanguageSelector />

          <ThemeSelector />

          <PressableScale
            accessibilityLabel={t("profile.tab.logout")}
            onPress={handleLogout}
            disabled={loggingOut}
            scaleTo={0.98}
          >
            <View style={styles.logoutCard}>
              <Text style={styles.logoutText}>{t("profile.tab.logout")}</Text>
            </View>
          </PressableScale>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("profile.tab.deleteAccount")}
            onPress={handleDeleteAccount}
            disabled={deleting}
            hitSlop={8}
            style={styles.deleteLinkWrap}
          >
            <Text style={styles.deleteLink}>
              {t("profile.tab.deleteAccount")}
            </Text>
          </Pressable>
        </ScrollView>

        {deleting || loggingOut ? (
          <View style={styles.overlay}>
            <View style={styles.overlayCard}>
              <ActivityIndicator color={colors.accent} />
              <Text style={styles.overlayText}>
                {deleting
                  ? t("profile.tab.deleting")
                  : t("profile.tab.loggingOut")}
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
          avatar={avatar}
          businessName={role === "WORKER" ? (profile?.businessName ?? "") : ""}
          subtitle={t("profile.tab.qrSubtitle")}
          showReward
        />
      ) : null}
    </ScreenBackground>
  );
}

function ProfileItem({
  icon,
  label,
  coins = 0,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  coins?: number;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <PressableScale accessibilityLabel={label} onPress={onPress} scaleTo={0.98}>
      <View style={styles.item}>
        <View style={styles.itemIcon}>{icon}</View>
        <Text style={styles.itemLabel}>{label}</Text>
        {coins > 0 ? (
          <View style={styles.coinPill}>
            <CoinIcon size={15} />
            <Text style={styles.coinPillText}>+{formatCoins(coins)}</Text>
          </View>
        ) : null}
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
  coinPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(255,193,7,0.14)",
  },
  coinPillText: {
    color: t.colors.coin,
    fontSize: 13,
    fontWeight: "800",
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
