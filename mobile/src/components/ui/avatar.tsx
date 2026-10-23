import { Image } from "expo-image";
import { useState } from "react";
import { Text, View } from "react-native";

import { makeStyles } from "@/constants/theme";

const PLACEHOLDER_PATTERN =
  /default-?avatar|avatar-?default|defaultuser|avatar-anika-visser|blank-profile|no-?avatar|placeholder/i;

export function usableAvatarUrl(url: string | null | undefined): string | null {
  const value = url?.trim();
  if (!value || !/^https?:\/\//i.test(value)) return null;
  if (PLACEHOLDER_PATTERN.test(value)) return null;
  return value;
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase();
}

export function Avatar({
  name,
  url,
  size = 44,
}: {
  name: string;
  url?: string | null;
  size?: number;
}) {
  const styles = useStyles();
  const dimension = { width: size, height: size, borderRadius: size / 2 };
  const source = usableAvatarUrl(url);
  const [failed, setFailed] = useState<string | null>(null);

  if (source && failed !== source) {
    return (
      <Image
        source={{ uri: source }}
        style={dimension}
        contentFit="cover"
        transition={150}
        onError={() => setFailed(source)}
      />
    );
  }

  return (
    <View style={[styles.fallback, dimension]}>
      <Text style={[styles.text, { fontSize: size * 0.36 }]}>
        {initials(name) || "?"}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  fallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(22,179,100,0.16)",
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.3)",
  },
  text: {
    color: t.colors.accent,
    fontWeight: "800",
  },
}));
