import { router } from "expo-router";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";

import { CoinIcon } from "@/components/icons";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Brand, Colors, Radius, Spacing } from "@/constants/theme";
import { formatCoins } from "@/lib/shop";
import { toHref } from "@/lib/navigation";
import { useLoyaltyStore } from "@/store/use-loyalty-store";

export function EarnCoinsModal() {
  const earn = useLoyaltyStore((state) => state.earn);
  const clearEarn = useLoyaltyStore((state) => state.clearEarn);

  const visible = earn !== null;
  const amount = earn?.amount ?? 0;
  const gap = earn?.gap ?? 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={clearEarn}
    >
      <View style={styles.overlay}>
        <Animated.View
          entering={ZoomIn.springify().damping(16)}
          style={styles.card}
        >
          <Animated.View entering={FadeIn.delay(120)} style={styles.coinWrap}>
            <CoinIcon size={72} />
          </Animated.View>

          <Text style={styles.amount}>+{formatCoins(amount)} coins</Text>
          <Text style={styles.subtitle}>Added to your balance</Text>

          <View style={styles.gapBox}>
            {gap > 0 ? (
              <Text style={styles.gapText}>
                Earn{" "}
                <Text style={styles.gapStrong}>{formatCoins(gap)} more coins</Text>{" "}
                to unlock your first shop reward.
              </Text>
            ) : (
              <Text style={styles.gapText}>
                You have enough coins for your first shop reward! 🎉
              </Text>
            )}
          </View>

          <View style={styles.actions}>
            <PrimaryButton label="Got it" withArrow={false} onPress={clearEarn} />
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                clearEarn();
                router.navigate(toHref("/shop"));
              }}
              style={styles.shopLink}
            >
              <Text style={styles.shopLinkText}>Open Shop</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: Radius.lg,
    backgroundColor: Colors.backgroundElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    alignItems: "center",
  },
  coinWrap: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,193,7,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,193,7,0.3)",
    marginBottom: Spacing.base,
  },
  amount: {
    color: Brand.coin,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  gapBox: {
    marginTop: Spacing.base,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.base,
  },
  gapText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  gapStrong: {
    color: Colors.text,
    fontWeight: "700",
  },
  actions: {
    alignSelf: "stretch",
    gap: Spacing.md,
  },
  shopLink: {
    alignSelf: "center",
    paddingVertical: Spacing.xs,
  },
  shopLinkText: {
    color: Brand.primaryLight,
    fontSize: 15,
    fontWeight: "700",
  },
});
