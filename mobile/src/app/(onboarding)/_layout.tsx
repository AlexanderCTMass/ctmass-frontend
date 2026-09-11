import { Stack } from "expo-router";

import { useTheme } from "@/constants/theme";

export default function OnboardingLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
