import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CheckIcon, CloseIcon } from "@/components/icons";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { SOCIAL_GROUP_SECTIONS } from "@/constants/social-groups";
import { analyticsEvents, errorMessage } from "@/lib/analytics-events";
import { tapFeedback } from "@/lib/haptics";
import {
  type SocialGroup,
  buildSocialGroupPayload,
  updateSocialGroups,
} from "@/lib/social-groups";
import { useAuthStore } from "@/store/use-auth-store";

type Props = {
  visible: boolean;
  initial: SocialGroup[];
  onClose: () => void;
  onSaved: (groups: SocialGroup[]) => void;
};

function SocialGroupsPanel({ initial, onClose, onSaved }: Omit<Props, "visible">) {
  const { colors } = useTheme();
  const styles = useStyles();
  const uid = useAuthStore((state) => state.user?.uid);

  const [selected, setSelected] = useState<string[]>(() =>
    initial.map((group) => group.value),
  );
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const filteredSections = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return SOCIAL_GROUP_SECTIONS;
    return SOCIAL_GROUP_SECTIONS.map((section) => ({
      title: section.title,
      options: section.options.filter(
        (option) =>
          option.label.toLowerCase().includes(query) ||
          option.description.toLowerCase().includes(query),
      ),
    })).filter((section) => section.options.length > 0);
  }, [search]);

  const toggle = (value: string) => {
    tapFeedback();
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  };

  const handleSave = async () => {
    if (!uid || saving) return;
    setSaving(true);
    const payload = buildSocialGroupPayload(selected);
    try {
      await updateSocialGroups(uid, payload);
      analyticsEvents.socialGroupsSaved({ selected_count: payload.length });
      onSaved(payload);
      onClose();
    } catch (error) {
      analyticsEvents.socialGroupsSaveFailed({
        error_message: errorMessage(error),
      });
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Social groups</Text>
          <Text style={styles.subtitle}>
            Select the roles and communities that describe you. Shown on your
            public profile.
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={10}
          onPress={onClose}
          style={styles.close}
        >
          <CloseIcon size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search groups…"
          placeholderTextColor={colors.textMuted}
          style={styles.search}
          autoCapitalize="none"
        />
        <Text style={styles.count}>Selected: {selected.length}</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {filteredSections.length === 0 ? (
          <Text style={styles.empty}>Nothing found.</Text>
        ) : (
          filteredSections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.options.map((option) => {
                const active = selected.includes(option.value);
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityLabel={option.label}
                    onPress={() => toggle(option.value)}
                    style={[styles.option, active && styles.optionActive]}
                  >
                    <Text style={styles.optionIcon}>{option.icon}</Text>
                    <View style={styles.optionBody}>
                      <Text style={styles.optionLabel}>{option.label}</Text>
                      <Text style={styles.optionDesc} numberOfLines={2}>
                        {option.description}
                      </Text>
                    </View>
                    <View
                      style={[styles.checkbox, active && styles.checkboxActive]}
                    >
                      {active ? (
                        <CheckIcon size={14} color="#FFFFFF" />
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label={saving ? "Saving…" : "Save selections"}
          withArrow={false}
          loading={saving}
          disabled={saving}
          onPress={() => void handleSave()}
        />
      </View>
    </SafeAreaView>
  );
}

export function SocialGroupsModal({ visible, initial, onClose, onSaved }: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      {visible ? (
        <ModalBackground>
          <SocialGroupsPanel
            initial={initial}
            onClose={onClose}
            onSaved={onSaved}
          />
        </ModalBackground>
      ) : null}
    </Modal>
  );
}

function ModalBackground({ children }: { children: React.ReactNode }) {
  const styles = useStyles();
  return <View style={styles.root}>{children}</View>;
}

const useStyles = makeStyles((t) => ({
  root: {
    flex: 1,
    backgroundColor: t.colors.background,
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: t.colors.text,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  subtitle: {
    color: t.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.colors.surface,
  },
  searchWrap: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
    gap: 6,
  },
  search: {
    minHeight: 46,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    color: t.colors.text,
    fontSize: 15,
  },
  count: {
    color: t.colors.textMuted,
    fontSize: 12.5,
    fontWeight: "600",
  },
  list: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.lg,
    gap: Spacing.lg,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    color: t.colors.textSecondary,
    fontSize: 12.5,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  empty: {
    color: t.colors.textSecondary,
    fontSize: 14,
    paddingVertical: Spacing.lg,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  optionActive: {
    borderColor: t.colors.accent,
    backgroundColor: "rgba(22,179,100,0.1)",
  },
  optionIcon: {
    fontSize: 22,
  },
  optionBody: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    color: t.colors.text,
    fontSize: 14.5,
    fontWeight: "700",
  },
  optionDesc: {
    color: t.colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: t.colors.border,
    backgroundColor: t.colors.background,
  },
  checkboxActive: {
    borderColor: t.colors.accent,
    backgroundColor: t.colors.accent,
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
  },
}));
