import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { type ReactNode, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import {
  ChevronLeftIcon,
  CloseIcon,
  ImageIcon,
} from "@/components/icons";
import { shortPlace } from "@/components/project/project-card";
import { BackButton } from "@/components/ui/back-button";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Brand, Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { analyticsEvents, errorMessage } from "@/lib/analytics-events";
import { findObjectionable } from "@/lib/content-filter";
import { selectFeedback, tapFeedback } from "@/lib/haptics";
import { choosePhoto } from "@/lib/media";
import {
  MAX_PORTFOLIO_TAGS,
  type PortfolioItem,
  createPortfolioItem,
  normalizeTag,
  updatePortfolioItem,
} from "@/lib/portfolio";
import type { TradeProfile } from "@/lib/trades";
import { usePortfolioItem } from "@/queries/use-portfolio";
import { useTradeById } from "@/queries/use-trade";
import { useAuthStore } from "@/store/use-auth-store";

const schema = z.object({
  title: z.string().trim().min(2, "Give the project a short title."),
  location: z.string().trim().min(2, "Where was this job done?"),
  description: z.string().max(1000, "Keep it under 1000 characters."),
  tags: z.array(z.string()).max(MAX_PORTFOLIO_TAGS),
  beforeUri: z.string().nullable(),
  afterUri: z.string().min(1, "Add an after photo."),
  date: z.date().nullable(),
});

type FormValues = z.infer<typeof schema>;

function slug(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function shiftMonth(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function Section({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  const styles = useStyles();
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
      {children}
    </View>
  );
}

function PhotoSlot({
  label,
  required,
  uri,
  onPick,
  onRemove,
}: {
  label: string;
  required?: boolean;
  uri: string | null;
  onPick: () => void;
  onRemove: () => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.slot}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={uri ? `Change ${label.toLowerCase()} photo` : `Add ${label.toLowerCase()} photo`}
        onPress={onPick}
        style={[styles.slotMedia, !uri && styles.slotEmpty]}
      >
        {uri ? (
          <Image
            source={{ uri }}
            style={styles.slotImage}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <>
            <ImageIcon size={26} color={colors.accent} />
            <Text style={styles.slotAdd}>Add photo</Text>
          </>
        )}
        {uri ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove ${label.toLowerCase()} photo`}
            hitSlop={8}
            onPress={onRemove}
            style={styles.slotRemove}
          >
            <CloseIcon size={14} color="#FFFFFF" />
          </Pressable>
        ) : null}
      </Pressable>
      <Text style={styles.slotLabel}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : " (optional)"}
      </Text>
    </View>
  );
}

function MonthPicker({
  value,
  onChange,
}: {
  value: Date | null;
  onChange: (date: Date | null) => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const current = startOfMonth(new Date());
  const atLatest = value ? value.getTime() >= current.getTime() : true;
  if (!value) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={() => onChange(current)}
        style={styles.monthEmpty}
      >
        <Text style={styles.monthEmptyText}>+ Add when it was done</Text>
      </Pressable>
    );
  }
  return (
    <View style={styles.monthRow}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Previous month"
        hitSlop={8}
        onPress={() => {
          selectFeedback();
          onChange(shiftMonth(value, -1));
        }}
        style={styles.monthButton}
      >
        <ChevronLeftIcon size={18} color={colors.text} />
      </Pressable>
      <Text style={styles.monthLabel}>
        {value.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Next month"
        hitSlop={8}
        disabled={atLatest}
        onPress={() => {
          selectFeedback();
          onChange(shiftMonth(value, 1));
        }}
        style={[styles.monthButton, styles.monthNext, atLatest && styles.disabled]}
      >
        <ChevronLeftIcon size={18} color={colors.text} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Remove date"
        hitSlop={8}
        onPress={() => onChange(null)}
      >
        <Text style={styles.monthClear}>Clear</Text>
      </Pressable>
    </View>
  );
}

function PortfolioForm({
  trade,
  item,
}: {
  trade: TradeProfile;
  item: PortfolioItem | null;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const queryClient = useQueryClient();
  const isEdit = Boolean(item);
  const [tagDraft, setTagDraft] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { isValid, errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      title: item?.title ?? "",
      location:
        item?.location ?? (trade.placeName ? shortPlace(trade.placeName) : ""),
      description: item?.shortDescription ?? "",
      tags: item?.tags ?? [],
      beforeUri: item?.beforeImage ?? null,
      afterUri: item?.afterImage ?? item?.cover ?? "",
      date: item ? item.date : startOfMonth(new Date()),
    },
  });

  const tags = useWatch({ control, name: "tags" });
  const beforeUri = useWatch({ control, name: "beforeUri" });
  const afterUri = useWatch({ control, name: "afterUri" });

  const pick = async (field: "beforeUri" | "afterUri") => {
    tapFeedback();
    const uri = await choosePhoto();
    if (uri) setValue(field, uri, { shouldValidate: true, shouldDirty: true });
  };

  const addTag = () => {
    const tag = normalizeTag(tagDraft);
    const current = getValues("tags");
    if (!tag || current.includes(tag) || current.length >= MAX_PORTFOLIO_TAGS) {
      setTagDraft("");
      return;
    }
    selectFeedback();
    setValue("tags", [...current, tag], { shouldValidate: true });
    setTagDraft("");
  };

  const removeTag = (tag: string) => {
    setValue(
      "tags",
      getValues("tags").filter((value) => value !== tag),
      { shouldValidate: true },
    );
  };

  const onSubmit = async (values: FormValues) => {
    const flagged = findObjectionable(
      values.title,
      values.description,
      values.location,
      values.tags.join(" "),
    );
    if (flagged) {
      analyticsEvents.contentFilterBlocked({
        screen: "portfolio_edit",
        fields: [
          findObjectionable(values.title) ? "title" : null,
          findObjectionable(values.description) ? "description" : null,
          findObjectionable(values.location) ? "location" : null,
          findObjectionable(values.tags.join(" ")) ? "tags" : null,
        ].filter((field): field is string => field !== null),
      });
      setFormError("Please remove inappropriate language from your project.");
      return;
    }
    if (saving) return;
    setFormError(null);
    setSaving(true);
    const input = {
      title: values.title,
      date: values.date,
      location: values.location,
      shortDescription: values.description,
      specialtyId:
        item?.specialtyId || trade.primarySpecialtyId || slug(trade.specialtyLabel),
      tags: values.tags,
      beforeUri: values.beforeUri,
      afterUri: values.afterUri,
    };
    try {
      const portfolioId = item
        ? (await updatePortfolioItem(item, input), item.id)
        : await createPortfolioItem(trade.ownerId, trade.tradeId, input);
      analyticsEvents.portfolioItemSaved({
        trade_id: trade.tradeId,
        portfolio_id: portfolioId,
        is_edit: isEdit,
        has_before: Boolean(values.beforeUri),
        tags_count: values.tags.length,
      });
      void queryClient.invalidateQueries({
        queryKey: ["portfolio", trade.ownerId, trade.tradeId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["portfolio-item", trade.ownerId, portfolioId],
      });
      tapFeedback();
      router.back();
    } catch (error) {
      analyticsEvents.portfolioItemSaveFailed({
        trade_id: trade.tradeId,
        is_edit: isEdit,
        error_message: errorMessage(error),
      });
      setSaving(false);
      setFormError("Couldn't save the project. Check your connection and try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 12}
    >
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>
          {isEdit ? "Edit project" : "Add project"}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Show a finished job. A before photo is optional — before/after pairs
          get the most attention.
        </Text>

        <Section label="Photos">
          <View style={styles.slots}>
            <PhotoSlot
              label="Before"
              uri={beforeUri}
              onPick={() => void pick("beforeUri")}
              onRemove={() =>
                setValue("beforeUri", null, { shouldValidate: true })
              }
            />
            <PhotoSlot
              label="After"
              required
              uri={afterUri || null}
              onPick={() => void pick("afterUri")}
              onRemove={() => setValue("afterUri", "", { shouldValidate: true })}
            />
          </View>
          {errors.afterUri ? (
            <Text style={styles.error}>{errors.afterUri.message}</Text>
          ) : null}
        </Section>

        <Section label="When was it done?">
          <Controller
            control={control}
            name="date"
            render={({ field: { value, onChange } }) => (
              <MonthPicker value={value} onChange={onChange} />
            )}
          />
        </Section>

        <Section label="Project title">
          <Controller
            control={control}
            name="title"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="e.g. Kitchen faucet replacement"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                maxLength={80}
              />
            )}
          />
          {errors.title ? (
            <Text style={styles.error}>{errors.title.message}</Text>
          ) : null}
        </Section>

        <Section label="Location" hint="City and state is enough.">
          <Controller
            control={control}
            name="location"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="e.g. Hartford, Connecticut"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                maxLength={80}
              />
            )}
          />
          {errors.location ? (
            <Text style={styles.error}>{errors.location.message}</Text>
          ) : null}
        </Section>

        <Section label="What did you do?" hint="Optional.">
          <Controller
            control={control}
            name="description"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="The problem, what you did, and the result."
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.textArea]}
                multiline
                maxLength={1000}
              />
            )}
          />
          {errors.description ? (
            <Text style={styles.error}>{errors.description.message}</Text>
          ) : null}
        </Section>

        <Section
          label="Tags"
          hint={`Optional, up to ${MAX_PORTFOLIO_TAGS}. e.g. faucet, kitchen`}
        >
          {tags.length > 0 ? (
            <View style={styles.tagWrap}>
              {tags.map((tag) => (
                <Pressable
                  key={tag}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove tag ${tag}`}
                  onPress={() => removeTag(tag)}
                  style={styles.tagChip}
                >
                  <Text style={styles.tagChipText}>#{tag}</Text>
                  <CloseIcon size={12} color={colors.accent} />
                </Pressable>
              ))}
            </View>
          ) : null}
          {tags.length < MAX_PORTFOLIO_TAGS ? (
            <View style={styles.tagInputRow}>
              <TextInput
                value={tagDraft}
                onChangeText={setTagDraft}
                onSubmitEditing={addTag}
                placeholder="Add a tag"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.tagInput]}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                submitBehavior="submit"
                maxLength={24}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add tag"
                disabled={!tagDraft.trim()}
                onPress={addTag}
                style={[styles.tagAdd, !tagDraft.trim() && styles.disabled]}
              >
                <Text style={styles.tagAddText}>Add</Text>
              </Pressable>
            </View>
          ) : null}
        </Section>
      </ScrollView>

      <View style={styles.footer}>
        {formError ? <Text style={styles.formError}>{formError}</Text> : null}
        <PrimaryButton
          label={saving ? "Saving…" : isEdit ? "Save changes" : "Add to portfolio"}
          onPress={() => void handleSubmit(onSubmit)()}
          disabled={!isValid || saving}
          loading={saving}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

export default function PortfolioEditScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const params = useLocalSearchParams<{
    tradeId?: string;
    portfolioId?: string;
  }>();
  const tradeId = typeof params.tradeId === "string" ? params.tradeId : undefined;
  const portfolioId =
    typeof params.portfolioId === "string" ? params.portfolioId : undefined;
  const uid = useAuthStore((state) => state.user?.uid);
  const trade = useTradeById(tradeId);
  const item = usePortfolioItem(portfolioId ? uid : undefined, portfolioId);

  const loading = trade.isLoading || (Boolean(portfolioId) && item.isLoading);
  const allowed =
    Boolean(trade.data && uid && trade.data.ownerId === uid) &&
    (!portfolioId || Boolean(item.data));

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : !allowed || !trade.data ? (
          <>
            <View style={styles.header}>
              <BackButton onPress={() => router.back()} />
              <View style={styles.headerSpacer} />
            </View>
            <View style={styles.center}>
              <Text style={styles.missing}>
                This project can&apos;t be edited.
              </Text>
            </View>
          </>
        ) : (
          <PortfolioForm trade={trade.data} item={item.data ?? null} />
        )}
      </SafeAreaView>
    </ScreenBackground>
  );
}

const useStyles = makeStyles((t) => ({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  missing: {
    color: t.colors.textSecondary,
    fontSize: 15,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    color: t.colors.text,
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xxl,
  },
  intro: {
    color: t.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  sectionLabel: {
    color: t.colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  sectionHint: {
    color: t.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  error: {
    color: t.colors.danger,
    fontSize: 12.5,
    fontWeight: "600",
  },
  input: {
    height: 54,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
    color: t.colors.text,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    paddingTop: Spacing.md,
    textAlignVertical: "top",
  },
  slots: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  slot: {
    flex: 1,
    gap: 6,
  },
  slotMedia: {
    aspectRatio: 1,
    borderRadius: Radius.md,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.colors.surface,
    gap: 6,
  },
  slotEmpty: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "rgba(22,179,100,0.5)",
  },
  slotImage: {
    width: "100%",
    height: "100%",
  },
  slotAdd: {
    color: t.colors.accent,
    fontSize: 13.5,
    fontWeight: "700",
  },
  slotRemove: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(5,7,12,0.7)",
  },
  slotLabel: {
    color: t.colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  required: {
    color: t.colors.danger,
  },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  monthButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  monthNext: {
    transform: [{ rotate: "180deg" }],
  },
  monthLabel: {
    flex: 1,
    color: t.colors.text,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  monthClear: {
    color: t.colors.textSecondary,
    fontSize: 13.5,
    fontWeight: "700",
  },
  monthEmpty: {
    height: 48,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: t.colors.border,
  },
  monthEmptyText: {
    color: t.colors.accent,
    fontSize: 14,
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.4,
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(22,179,100,0.12)",
    borderWidth: 1,
    borderColor: "rgba(22,179,100,0.3)",
  },
  tagChipText: {
    color: t.colors.accent,
    fontSize: 13.5,
    fontWeight: "700",
  },
  tagInputRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  tagInput: {
    flex: 1,
  },
  tagAdd: {
    height: 54,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.primaryDark,
  },
  tagAddText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  formError: {
    color: t.colors.danger,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
}));
