import { Stack } from "expo-router";

import { useTheme } from "@/constants/theme";

export default function ChatLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
