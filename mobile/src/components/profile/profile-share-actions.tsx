import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { QrCodeIcon, ShareIcon } from "@/components/icons";
import { ProfileQrModal } from "@/components/profile/profile-qr-modal";
import { PressableScale } from "@/components/ui/pressable-scale";
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { analyticsEvents } from "@/lib/analytics-events";
import { tapFeedback } from "@/lib/haptics";
import { shareProfileLink } from "@/lib/share";

export function ProfileShareActions({
  url,
  name,
  targetUid,
  avatar,
  businessName,
}: {
  url: string;
  name: string;
  targetUid: string;
  avatar?: string | null;
  businessName?: string;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const [qrOpen, setQrOpen] = useState(false);
  const [sharingLink, setSharingLink] = useState(false);

  const handleShareLink = () => {
    tapFeedback();
    analyticsEvents.profileShareLinkTapped({ target_uid: targetUid });
    setSharingLink(true);
    void shareProfileLink(url, name).finally(() => setSharingLink(false));
  };


  return (
    <View style={styles.row}>
      <View style={styles.col}>
        <PressableScale
          accessibilityLabel="Share profile"
          onPress={handleShareLink}
          disabled={sharingLink}
          scaleTo={0.98}
        >
          <View style={styles.button}>
            {sharingLink ? (
              <ActivityIndicator color={colors.accent} />
            ) : (
              <>
                <ShareIcon size={18} color={colors.accent} />
                <Text style={styles.buttonText}>Share profile</Text>
              </>
            )}
          </View>
        </PressableScale>
      </View>

      <View style={styles.col}>
        <PressableScale
          accessibilityLabel="Show QR code"
          onPress={() => {
            tapFeedback();
            analyticsEvents.profileQrOpened({ target_uid: targetUid });
            setQrOpen(true);
          }}
          scaleTo={0.98}
        >
          <View style={styles.button}>
            <QrCodeIcon size={18} color={colors.accent} />
            <Text style={styles.buttonText}>QR code</Text>
          </View>
        </PressableScale>
      </View>

      <ProfileQrModal
        visible={qrOpen}
        onClose={() => setQrOpen(false)}
        url={url}
        name={name}
        targetUid={targetUid}
        avatar={avatar}
        businessName={businessName}
        showReward
      />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  row: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  col: {
    flex: 1,
  },
  button: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(22,179,100,0.1)",
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.3)",
  },
  buttonText: {
    color: t.colors.accent,
    fontSize: 15,
    fontWeight: "700",
  },
}));
