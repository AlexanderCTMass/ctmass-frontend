import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { Brand, Colors } from "@/constants/theme";

const logoMark = require("../../assets/images/logo-mark.png") as number;

export function BrandLogo({ size = 96 }: { size?: number }) {
  return (
    <View
      style={[
        styles.ring,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Image
        source={logoMark}
        style={{ width: size * 0.9, height: size * 0.9 }}
        contentFit="contain"
        transition={220}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.35)",
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  },
});
