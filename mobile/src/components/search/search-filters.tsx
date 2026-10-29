import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import {
  CheckIcon,
  ChevronLeftIcon,
  CloseIcon,
  GlobeIcon,
  ShieldCheckIcon,
  TradeGroupIcon,
} from "@/components/icons";
import { TradePicker } from "@/components/trade/trade-picker";
import { ModalSafeArea } from "@/components/ui/modal-safe-area";
import { LANGUAGES } from "@/constants/trade-options";
import { findTrade } from "@/constants/trade-taxonomy";
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { selectFeedback } from "@/lib/haptics";
import { useT } from "@/lib/i18n";
import {
  isInsured,
  isLicensed,
  offersFreeEstimate,
} from "@/lib/trade-display";
import type { Specialist } from "@/lib/trades";

export type SearchFilters = {
  trade: string | null;
  licensed: boolean;
  insured: boolean;
  freeEstimate: boolean;
  language: string | null;
};

export const EMPTY_FILTERS: SearchFilters = {
  trade: null,
  licensed: false,
  insured: false,
  freeEstimate: false,
  language: null,
};

export function activeFilterCount(filters: SearchFilters): number {
  return [
    filters.trade,
    filters.licensed,
    filters.insured,
    filters.freeEstimate,
    filters.language,
  ].filter(Boolean).length;
}

export function matchesFilters(
  specialist: Specialist,
  filters: SearchFilters,
): boolean {
  const details = specialist.details;
  if (filters.trade) {
    const wanted = findTrade(filters.trade);
    const own = findTrade(specialist.specialtyLabel);
    const same = wanted && own ? wanted.id === own.id : false;
    if (!same && specialist.specialtyLabel !== filters.trade) return false;
  }
  if (filters.licensed && !isLicensed(details, specialist.owner)) return false;
  if (filters.insured && !isInsured(details)) return false;
  if (filters.freeEstimate && !offersFreeEstimate(details)) return false;
  if (
    filters.language &&
    !(specialist.owner?.business.languages ?? []).includes(filters.language)
  ) {
    return false;
  }
  return true;
}

function FilterChip({
  label,
  active,
  icon,
  dropdown,
  onPress,
  onClear,
}: {
  label: string;
  active: boolean;
  icon?: (color: string) => React.ReactNode;
  dropdown?: boolean;
  onPress: () => void;
  onClear?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useT();
  const tint = active ? colors.accent : colors.text;
  return (
    <Pressable
      accessibilityRole={dropdown ? "button" : "switch"}
      accessibilityState={dropdown ? undefined : { checked: active }}
      accessibilityLabel={label}
      onPress={() => {
        selectFeedback();
        onPress();
      }}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        pressed && styles.pressed,
      ]}
    >
      {icon?.(tint)}
      <Text style={[styles.chipText, { color: tint }]} numberOfLines={1}>
        {label}
      </Text>
      {active && onClear ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("search.filters.clearOne", { name: label })}
          hitSlop={10}
          onPress={() => {
            selectFeedback();
            onClear();
          }}
        >
          <CloseIcon size={13} color={tint} />
        </Pressable>
      ) : dropdown ? (
        <View style={styles.caret}>
          <ChevronLeftIcon size={12} color={tint} />
        </View>
      ) : null}
    </Pressable>
  );
}

function Sheet({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useT();
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ModalSafeArea style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{title}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("common.close")}
            hitSlop={10}
            onPress={onClose}
            style={styles.sheetClose}
          >
            <CloseIcon size={18} color={colors.text} />
          </Pressable>
        </View>
        <ScrollView
          contentContainerStyle={styles.sheetContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </ModalSafeArea>
    </Modal>
  );
}

export function SearchFilterBar({
  value,
  onChange,
}: {
  value: SearchFilters;
  onChange: (next: SearchFilters, changed: keyof SearchFilters) => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t, tx } = useT();
  const [sheet, setSheet] = useState<"trade" | "language" | null>(null);
  const set = <K extends keyof SearchFilters>(key: K, next: SearchFilters[K]) =>
    onChange({ ...value, [key]: next }, key);
  const count = activeFilterCount(value);
  const tradeItem = findTrade(value.trade);

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bar}
        keyboardShouldPersistTaps="handled"
      >
        <FilterChip
          label={value.trade ? tx(value.trade) : t("search.filters.trade")}
          active={Boolean(value.trade)}
          dropdown
          icon={(color) =>
            tradeItem ? (
              <TradeGroupIcon
                groupId={tradeItem.groupId}
                size={14}
                color={color}
              />
            ) : null
          }
          onPress={() => setSheet("trade")}
          onClear={() => set("trade", null)}
        />
        <FilterChip
          label={t("trade.trust.license")}
          active={value.licensed}
          icon={(color) => <ShieldCheckIcon size={14} color={color} />}
          onPress={() => set("licensed", !value.licensed)}
        />
        <FilterChip
          label={t("trade.trust.insurance")}
          active={value.insured}
          icon={(color) => <ShieldCheckIcon size={14} color={color} />}
          onPress={() => set("insured", !value.insured)}
        />
        <FilterChip
          label={t("trade.trust.freeEstimate")}
          active={value.freeEstimate}
          onPress={() => set("freeEstimate", !value.freeEstimate)}
        />
        <FilterChip
          label={
            value.language ? tx(value.language) : t("search.filters.language")
          }
          active={Boolean(value.language)}
          dropdown
          icon={(color) => <GlobeIcon size={14} color={color} />}
          onPress={() => setSheet("language")}
          onClear={() => set("language", null)}
        />
        {count > 1 ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={6}
            onPress={() => {
              selectFeedback();
              onChange(EMPTY_FILTERS, "trade");
            }}
            style={styles.clearAll}
          >
            <Text style={styles.clearAllText}>
              {t("search.filters.clearAll")}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>

      <Sheet
        visible={sheet === "trade"}
        title={t("search.filters.tradeTitle")}
        onClose={() => setSheet(null)}
      >
        <TradePicker
          value={value.trade}
          allowOther={false}
          onChange={(label) => {
            set("trade", label === value.trade ? null : label);
            setSheet(null);
          }}
        />
      </Sheet>

      <Sheet
        visible={sheet === "language"}
        title={t("search.filters.languageTitle")}
        onClose={() => setSheet(null)}
      >
        <View style={styles.list}>
          {LANGUAGES.map((language) => {
            const selected = value.language === language;
            return (
              <Pressable
                key={language}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => {
                  selectFeedback();
                  set("language", selected ? null : language);
                  setSheet(null);
                }}
                style={({ pressed }) => [
                  styles.option,
                  selected && styles.optionActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.optionText}>{tx(language)}</Text>
                {selected ? (
                  <CheckIcon size={16} color={colors.accent} strokeWidth={3} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </Sheet>
    </>
  );
}

const useStyles = makeStyles((t) => ({
  bar: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
    alignItems: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 34,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  chipActive: {
    borderColor: t.colors.accent,
    backgroundColor: t.isDark
      ? "rgba(63,199,154,0.14)"
      : "rgba(22,179,100,0.10)",
  },
  chipText: {
    fontSize: 13.5,
    fontWeight: "700",
    maxWidth: 180,
  },
  caret: {
    transform: [{ rotate: "-90deg" }],
  },
  pressed: {
    opacity: 0.7,
  },
  clearAll: {
    height: 34,
    justifyContent: "center",
    paddingHorizontal: Spacing.sm,
  },
  clearAllText: {
    color: t.colors.accent,
    fontSize: 13.5,
    fontWeight: "700",
  },
  sheet: {
    flex: 1,
    backgroundColor: t.colors.background,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  sheetTitle: {
    flex: 1,
    color: t.colors.text,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  sheetClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.colors.surfaceStrong,
  },
  sheetContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xxl,
  },
  list: {
    gap: Spacing.sm,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 52,
    paddingHorizontal: Spacing.base,
    borderRadius: Radius.md,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  optionActive: {
    borderColor: t.colors.accent,
  },
  optionText: {
    color: t.colors.text,
    fontSize: 15.5,
    fontWeight: "600",
  },
}));
