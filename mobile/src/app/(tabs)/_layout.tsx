import { Tabs } from "expo-router";
import { Pressable } from "react-native";

import { HomeIcon, ResponsesIcon } from "@/components/icons";
import { Brand, Colors } from "@/constants/theme";
import { tapFeedback } from "@/lib/haptics";

export default function TabsLayout() {
  return (
    <Tabs
      screenListeners={{
        tabPress: () => {
          tapFeedback();
        },
      }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Brand.primaryLight,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.backgroundElevated,
          borderTopColor: Colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        tabBarButton: (props) => (
          <Pressable
            onPress={props.onPress}
            onLongPress={props.onLongPress}
            testID={props.testID}
            accessibilityLabel={props.accessibilityLabel}
            accessibilityRole={props.accessibilityRole}
            accessibilityState={props.accessibilityState}
            style={props.style}
            android_ripple={{ color: "transparent" }}
          >
            {props.children}
          </Pressable>
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <HomeIcon size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: "Chats",
          tabBarIcon: ({ color, size }) => (
            <ResponsesIcon size={size} color={color as string} />
          ),
        }}
      />
    </Tabs>
  );
}
