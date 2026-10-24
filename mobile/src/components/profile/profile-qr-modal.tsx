import { useRef, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import { CloseIcon, CoinIcon } from "@/components/icons";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { analyticsEvents } from "@/lib/analytics-events";
import { tapFeedback } from "@/lib/haptics";
import { shareQrImage } from "@/lib/share";

type QrRef = { toDataURL: (callback: (data: string) => void) => void };

const QR_SIZE = 220;
const LOGO_SIZE = 64;
const logoMark = require("../../../assets/images/logo-mark.png") as number;

export function ProfileQrModal({
  visible,
  onClose,
  url,
  name,
  targetUid,
  avatar,
  businessName,
  subtitle = "Scan to open this profile",
  showReward = false,
}: {
  visible: boolean;
  onClose: () => void;
  url: string;
  name: string;
  targetUid: string;
  avatar?: string | null;
  businessName?: string;
  subtitle?: string;
  showReward?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const [sharing, setSharing] = useState(false);
  const qrRef = useRef<QrRef | null>(null);
  const company = businessName?.trim() ?? "";
  const showCompany = company.length > 0 && company !== name.trim();

  const close = () => {
    analyticsEvents.profileQrClosed({ target_uid: targetUid });
    onClose();
  };

  const handleShare = () => {
    const ref = qrRef.current;
    if (!ref || sharing) return;
    tapFeedback();
    analyticsEvents.profileQrShared({ target_uid: targetUid });
    setSharing(true);
    ref.toDataURL((data) => {
      void shareQrImage(data, name).finally(() => setSharing(false));
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={close}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            hitSlop={10}
            onPress={close}
            style={styles.close}
          >
            <CloseIcon size={20} color={colors.textSecondary} />
          </Pressable>
          <Text style={styles.title} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <View style={styles.qrWrap}>
            <QRCode
              value={url}
              size={QR_SIZE}
              color="#000000"
              backgroundColor="#FFFFFF"
              ecl="H"
              logo={avatar ? { uri: avatar } : logoMark}
              logoSize={LOGO_SIZE}
              logoMargin={4}
              logoBorderRadius={LOGO_SIZE / 2}
              logoBackgroundColor="#FFFFFF"
              getRef={(node: unknown) => {
                qrRef.current = node as QrRef | null;
              }}
            />
          </View>
          {showCompany ? (
            <Text style={styles.company} numberOfLines={2}>
              {company}
            </Text>
          ) : null}
          {showReward ? (
            <View style={styles.reward}>
              <CoinIcon size={20} />
              <Text style={styles.rewardText}>
                Earn CTMASS Coins when someone new joins with your code.
              </Text>
            </View>
          ) : null}
          <PrimaryButton
            label={sharing ? "Sharing…" : "Share QR code"}
            withArrow={false}
            loading={sharing}
            disabled={sharing}
            onPress={handleShare}
          />
        </View>
      </View>
    </Modal>
  );
}

const useStyles = makeStyles((t) => ({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    backgroundColor: t.colors.overlay,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  close: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: t.colors.text,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
    maxWidth: "80%",
    textAlign: "center",
  },
  subtitle: {
    color: t.colors.textSecondary,
    fontSize: 13.5,
    textAlign: "center",
  },
  qrWrap: {
    padding: Spacing.base,
    borderRadius: Radius.md,
    backgroundColor: "#FFFFFF",
    marginVertical: Spacing.base,
  },
  company: {
    color: t.colors.text,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginTop: -Spacing.sm,
    marginBottom: Spacing.sm,
  },
  reward: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    alignSelf: "stretch",
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: "rgba(255,193,7,0.14)",
  },
  rewardText: {
    flex: 1,
    color: t.colors.text,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
}));
