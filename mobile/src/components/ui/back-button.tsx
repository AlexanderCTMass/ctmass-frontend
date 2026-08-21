import { StyleSheet, View } from "react-native";

import { ChevronLeftIcon } from "@/components/icons";
import { PressableScale } from "@/components/ui/pressable-scale";
import { Colors } from "@/constants/theme";

export function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <PressableScale accessibilityLabel="Go back" onPress={onPress}>
      <View style={styles.button}>
        <ChevronLeftIcon size={22} color={Colors.text} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
