import { Stack } from "expo-router";

import { Colors } from "@/constants/theme";

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: Colors.background },
      }}
    />
  );
}
