import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { CheckIcon, SearchIcon, TradeGroupIcon } from "@/components/icons";
import { PressableScale } from "@/components/ui/pressable-scale";
import {
  OTHER_TRADE_LABEL,
  TRADE_GROUPS,
  TRADE_ITEMS,
  type TradeGroupId,
  type TradeItem,
  findGroup,
  findTrade,
} from "@/constants/trade-taxonomy";
import { Brand, Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { selectFeedback } from "@/lib/haptics";

function ItemCard({
  label,
  hint,
  groupId,
  selected,
  index,
  onPress,
}: {
  label: string;
  hint?: string;
  groupId: TradeGroupId;
  selected: boolean;
  index: number;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <Animated.View
      entering={FadeIn.delay(Math.min(index, 10) * 30).duration(260)}
      style={styles.cardWrap}
    >
      <PressableScale accessibilityLabel={label} onPress={onPress}>
        <View style={[styles.card, selected && styles.cardSelected]}>
          <TradeGroupIcon
            groupId={groupId}
            size={18}
            color={selected ? colors.accent : colors.textSecondary}
          />
          <View style={styles.cardText}>
            <Text style={styles.cardLabel} numberOfLines={2}>
              {label}
            </Text>
            {hint ? (
              <Text style={styles.cardHint} numberOfLines={1}>
                {hint}
              </Text>
            ) : null}
          </View>
          {selected ? (
            <View style={styles.check}>
              <CheckIcon size={12} color="#04170D" strokeWidth={3} />
            </View>
          ) : null}
        </View>
      </PressableScale>
    </Animated.View>
  );
}

export function TradePicker({
  value,
  onChange,
  allowOther = true,
}: {
  value: string | null;
  onChange: (label: string, item: TradeItem | null) => void;
  allowOther?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const current = findTrade(value);
  const isOther = value === OTHER_TRADE_LABEL;
  const [groupId, setGroupId] = useState<TradeGroupId>(
    current?.groupId ?? TRADE_GROUPS[0].id,
  );
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();

  const items = useMemo(() => {
    if (query) {
      return TRADE_ITEMS.filter(
        (item) =>
          item.label.toLowerCase().includes(query) ||
          item.aliases.some((alias) => alias.toLowerCase().includes(query)) ||
          (findGroup(item.groupId)?.label.toLowerCase().includes(query) ?? false),
      );
    }
    return findGroup(groupId)?.items ?? [];
  }, [groupId, query]);

  const choose = (label: string, item: TradeItem | null) => {
    selectFeedback();
    onChange(label, item);
  };

  return (
    <View style={styles.root}>
      <View style={styles.searchBox}>
        <SearchIcon size={18} color={colors.textMuted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search trades, e.g. EV charger"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          returnKeyType="search"
          autoCorrect={false}
        />
      </View>

      {query ? null : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.groups}
          keyboardShouldPersistTaps="handled"
        >
          {TRADE_GROUPS.map((group) => {
            const active = group.id === groupId;
            return (
              <Pressable
                key={group.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => {
                  selectFeedback();
                  setGroupId(group.id);
                }}
                style={[styles.groupChip, active && styles.groupChipActive]}
              >
                <TradeGroupIcon
                  groupId={group.id}
                  size={16}
                  color={active ? colors.onAccent : colors.textSecondary}
                />
                <Text
                  style={[styles.groupText, active && styles.groupTextActive]}
                  numberOfLines={1}
                >
                  {group.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.grid}>
        {items.map((item, index) => (
          <ItemCard
            key={`${groupId}-${item.id}`}
            label={item.label}
            hint={query ? findGroup(item.groupId)?.label : undefined}
            groupId={item.groupId}
            index={index}
            selected={current?.id === item.id}
            onPress={() => choose(item.label, item)}
          />
        ))}
        {allowOther ? (
          <ItemCard
            label={OTHER_TRADE_LABEL}
            hint="Not on the list"
            groupId="other"
            index={items.length}
            selected={isOther}
            onPress={() => choose(OTHER_TRADE_LABEL, null)}
          />
        ) : null}
      </View>
      {query && items.length === 0 ? (
        <Text style={styles.empty}>
          No trades match. Pick “Other” and describe it.
        </Text>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: {
    gap: Spacing.md,
  },
  searchBox: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  searchInput: {
    flex: 1,
    color: t.colors.text,
    fontSize: 15,
    paddingVertical: 0,
  },
  groups: {
    gap: Spacing.sm,
    paddingRight: Spacing.base,
  },
  groupChip: {
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  groupChipActive: {
    backgroundColor: t.colors.accent,
    borderColor: t.colors.accent,
  },
  groupText: {
    color: t.colors.textSecondary,
    fontSize: 13.5,
    fontWeight: "700",
  },
  groupTextActive: {
    color: t.colors.onAccent,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: Spacing.sm,
  },
  cardWrap: {
    width: "48.5%",
  },
  card: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: t.colors.surface,
    borderWidth: 1.5,
    borderColor: t.colors.border,
  },
  cardSelected: {
    borderColor: Brand.primary,
    backgroundColor: "rgba(22,179,100,0.12)",
  },
  cardText: {
    flex: 1,
  },
  cardLabel: {
    color: t.colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  cardHint: {
    color: t.colors.textMuted,
    fontSize: 11.5,
    fontWeight: "600",
    marginTop: 2,
  },
  check: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.primary,
  },
  empty: {
    color: t.colors.textSecondary,
    fontSize: 13.5,
    textAlign: "center",
  },
}));
