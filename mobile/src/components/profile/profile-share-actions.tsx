import { useRef, useState } from "react";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import { CloseIcon, QrCodeIcon, ShareIcon } from "@/components/icons";
import { PressableScale } from "@/components/ui/pressable-scale";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { analyticsEvents } from "@/lib/analytics-events";
import { tapFeedback } from "@/lib/haptics";
import { shareProfileLink, shareQrImage } from "@/lib/share";

type QrRef = { toDataURL: (callback: (data: string) => void) => void };

export function ProfileShareActions({
  url,
  name,
  targetUid,
}: {
  url: string;
  name: string;
  targetUid: string;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const [qrOpen, setQrOpen] = useState(false);
  const [sharingLink, setSharingLink] = useState(false);
  const [sharingQr, setSharingQr] = useState(false);
  const qrRef = useRef<QrRef | null>(null);

  const closeQr = () => {
    analyticsEvents.profileQrClosed({ target_uid: targetUid });
    setQrOpen(false);
  };

  const handleShareLink = () => {
    tapFeedback();
    analyticsEvents.profileShareLinkTapped({ target_uid: targetUid });
    setSharingLink(true);
    void shareProfileLink(url, name).finally(() => setSharingLink(false));
  };

  const handleShareQr = () => {
    const ref = qrRef.current;
    if (!ref) return;
    tapFeedback();
    analyticsEvents.profileQrShared({ target_uid: targetUid });
    setSharingQr(true);
    ref.toDataURL((data) => {
      void shareQrImage(data, name).finally(() => setSharingQr(false));
    });
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

      <Modal
        visible={qrOpen}
        transparent
        animationType="fade"
        onRequestClose={closeQr}
      >
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={10}
              onPress={closeQr}
              style={styles.close}
            >
              <CloseIcon size={20} color={colors.textSecondary} />
            </Pressable>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.cardSub}>Scan to open this profile</Text>
            <View style={styles.qrWrap}>
              <QRCode
                value={url}
                size={220}
                color="#000000"
                backgroundColor="#FFFFFF"
                getRef={(node: unknown) => {
                  qrRef.current = node as QrRef | null;
                }}
              />
            </View>
            <PrimaryButton
              label={sharingQr ? "Sharing…" : "Share QR code"}
              withArrow={false}
              loading={sharingQr}
              disabled={sharingQr}
              onPress={handleShareQr}
            />
          </View>
        </View>
      </Modal>
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
  cardTitle: {
    color: t.colors.text,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
    maxWidth: "80%",
    textAlign: "center",
  },
  cardSub: {
    color: t.colors.textSecondary,
    fontSize: 13.5,
  },
  qrWrap: {
    padding: Spacing.base,
    borderRadius: Radius.md,
    backgroundColor: "#FFFFFF",
    marginVertical: Spacing.base,
  },
}));
