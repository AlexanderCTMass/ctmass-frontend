import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Radius, Spacing, makeStyles } from "@/constants/theme";
import type { SocialGroup } from "@/lib/social-groups";

export function CommunityBadges({ groups }: { groups: SocialGroup[] }) {
  const styles = useStyles();
  const [activeKey, setActiveKey] = useState<string>(groups[0]?.value ?? "");

  if (groups.length === 0) return null;

  const active = groups.find((group) => group.value === activeKey) ?? groups[0];

  return (
    <View style={styles.card}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {groups.map((group) => {
          const isActive = group.value === active.value;
          return (
            <Pressable
              key={group.value}
              accessibilityRole="button"
              accessibilityLabel={group.label}
              onPress={() => setActiveKey(group.value)}
              style={[styles.chip, isActive && styles.chipActive]}
            >
              <Text style={styles.chipIcon}>{group.icon}</Text>
              <Text
                style={[styles.chipText, isActive && styles.chipTextActive]}
                numberOfLines={1}
              >
                {group.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {active.description ? (
        <View style={styles.descBox}>
          <Text style={styles.descTitle}>{active.label}</Text>
          <Text style={styles.descText}>{active.description}</Text>
        </View>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  card: {
    gap: Spacing.md,
    padding: Spacing.base,
    borderRadius: Radius.md,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  row: {
    gap: Spacing.sm,
    paddingRight: Spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.background,
  },
  chipActive: {
    borderColor: t.colors.accent,
    backgroundColor: "rgba(22,179,100,0.12)",
  },
  chipIcon: {
    fontSize: 15,
  },
  chipText: {
    color: t.colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  chipTextActive: {
    color: t.colors.text,
  },
  descBox: {
    gap: 4,
  },
  descTitle: {
    color: t.colors.text,
    fontSize: 14.5,
    fontWeight: "700",
  },
  descText: {
    color: t.colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
}));
