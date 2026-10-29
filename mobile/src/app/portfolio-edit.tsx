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

import { ChevronLeftIcon, CloseIcon, ImageIcon } from "@/components/icons";
import { shortPlace } from "@/components/project/project-card";
import { ChoiceChips } from "@/components/trade/form-parts";
import { BackButton } from "@/components/ui/back-button";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import {
  Brand,
  Radius,
  Spacing,
  makeStyles,
  useTheme,
} from "@/constants/theme";
import {
  PROJECT_COST_RANGES,
  PROJECT_DURATIONS,
  PROJECT_TYPES,
} from "@/constants/trade-options";
import { useSubmitErrorHaptic } from "@/hooks/use-submit-error-haptic";
import { analyticsEvents, errorMessage } from "@/lib/analytics-events";
import { findObjectionable } from "@/lib/content-filter";
import { selectFeedback, tapFeedback } from "@/lib/haptics";
import { translateKey, useT } from "@/lib/i18n";
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
  title: z.string().trim().min(2, "portfolio.errors.title"),
  location: z.string().trim().min(2, "portfolio.errors.location"),
  description: z.string().max(1000, "portfolio.errors.description"),
  tags: z.array(z.string()).max(MAX_PORTFOLIO_TAGS),
  beforeUri: z.string().nullable(),
  afterUri: z.string().min(1, "portfolio.errors.after"),
  date: z.date().nullable(),
  projectType: z.string(),
  costRange: z.string(),
  duration: z.string(),
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
  const { t } = useT();
  return (
    <View style={styles.slot}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          uri
            ? t("portfolio.changePhotoA11y", { label })
            : t("portfolio.addPhotoA11y", { label })
        }
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
            <Text style={styles.slotAdd}>{t("certificate.addPhoto")}</Text>
          </>
        )}
        {uri ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("portfolio.removePhotoA11y", { label })}
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
        {required ? (
          <Text style={styles.required}> *</Text>
        ) : (
          ` (${t("form.optional").toLowerCase()})`
        )}
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
  const { t, locale } = useT();
  const current = startOfMonth(new Date());
  const atLatest = value ? value.getTime() >= current.getTime() : true;
  if (!value) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={() => onChange(current)}
        style={styles.monthEmpty}
      >
        <Text style={styles.monthEmptyText}>{t("portfolio.addDate")}</Text>
      </Pressable>
    );
  }
  return (
    <View style={styles.monthRow}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("portfolio.prevMonth")}
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
        {value.toLocaleDateString(locale, { month: "long", year: "numeric" })}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("portfolio.nextMonth")}
        hitSlop={8}
        disabled={atLatest}
        onPress={() => {
          selectFeedback();
          onChange(shiftMonth(value, 1));
        }}
        style={[
          styles.monthButton,
          styles.monthNext,
          atLatest && styles.disabled,
        ]}
      >
        <ChevronLeftIcon size={18} color={colors.text} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("portfolio.removeDate")}
        hitSlop={8}
        onPress={() => onChange(null)}
      >
        <Text style={styles.monthClear}>{t("trade.tray.clear")}</Text>
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
  const { t } = useT();
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
    formState: { isValid, errors, submitCount },
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
      projectType: item?.projectType ?? "",
      costRange: item?.costRange ?? "",
      duration: item?.duration ?? "",
    },
  });
  useSubmitErrorHaptic(submitCount, errors);

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
      setFormError(t("portfolio.filterError"));
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
        item?.specialtyId ||
        trade.primarySpecialtyId ||
        slug(trade.specialtyLabel),
      tags: values.tags,
      beforeUri: values.beforeUri,
      afterUri: values.afterUri,
      projectType: values.projectType,
      costRange: values.costRange,
      duration: values.duration,
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
      setFormError(t("portfolio.saveFailed"));
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
          {isEdit ? t("portfolio.edit") : t("portfolio.add")}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>{t("portfolio.intro")}</Text>

        <Section label={t("tradePage.photos")}>
          <View style={styles.slots}>
            <PhotoSlot
              label={t("portfolio.before")}
              uri={beforeUri}
              onPick={() => void pick("beforeUri")}
              onRemove={() =>
                setValue("beforeUri", null, { shouldValidate: true })
              }
            />
            <PhotoSlot
              label={t("portfolio.after")}
              required
              uri={afterUri || null}
              onPick={() => void pick("afterUri")}
              onRemove={() =>
                setValue("afterUri", "", { shouldValidate: true })
              }
            />
          </View>
          {errors.afterUri ? (
            <Text style={styles.error}>
              {translateKey(t, errors.afterUri.message)}
            </Text>
          ) : null}
        </Section>

        <Section label={t("portfolio.when")}>
          <Controller
            control={control}
            name="date"
            render={({ field: { value, onChange } }) => (
              <MonthPicker value={value} onChange={onChange} />
            )}
          />
        </Section>

        <Section label={t("portfolio.titleLabel")}>
          <Controller
            control={control}
            name="title"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t("portfolio.titlePlaceholder")}
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                maxLength={80}
              />
            )}
          />
          {errors.title ? (
            <Text style={styles.error}>
              {translateKey(t, errors.title.message)}
            </Text>
          ) : null}
        </Section>

        <Section label={t("setup.location")} hint={t("portfolio.locationHint")}>
          <Controller
            control={control}
            name="location"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t("portfolio.locationPlaceholder")}
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                maxLength={80}
              />
            )}
          />
          {errors.location ? (
            <Text style={styles.error}>
              {translateKey(t, errors.location.message)}
            </Text>
          ) : null}
        </Section>

        <Section
          label={t("portfolio.whatDid")}
          hint={t("portfolio.optionalHint")}
        >
          <Controller
            control={control}
            name="description"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t("portfolio.whatDidPlaceholder")}
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.textArea]}
                multiline
                maxLength={1000}
              />
            )}
          />
          {errors.description ? (
            <Text style={styles.error}>
              {translateKey(t, errors.description.message)}
            </Text>
          ) : null}
        </Section>

        <Section
          label={t("portfolio.projectType")}
          hint={t("portfolio.optionalHint")}
        >
          <Controller
            control={control}
            name="projectType"
            render={({ field: { value, onChange } }) => (
              <ChoiceChips
                options={PROJECT_TYPES}
                value={value}
                onChange={onChange}
                allowClear
              />
            )}
          />
        </Section>

        <Section label={t("portfolio.cost")} hint={t("portfolio.costHint")}>
          <Controller
            control={control}
            name="costRange"
            render={({ field: { value, onChange } }) => (
              <ChoiceChips
                options={PROJECT_COST_RANGES}
                value={value}
                onChange={onChange}
                allowClear
              />
            )}
          />
        </Section>

        <Section
          label={t("portfolio.duration")}
          hint={t("portfolio.optionalHint")}
        >
          <Controller
            control={control}
            name="duration"
            render={({ field: { value, onChange } }) => (
              <ChoiceChips
                options={PROJECT_DURATIONS}
                value={value}
                onChange={onChange}
                allowClear
              />
            )}
          />
        </Section>

        <Section
          label={t("portfolio.tags")}
          hint={t("portfolio.tagsHint", { count: MAX_PORTFOLIO_TAGS })}
        >
          {tags.length > 0 ? (
            <View style={styles.tagWrap}>
              {tags.map((tag) => (
                <Pressable
                  key={tag}
                  accessibilityRole="button"
                  accessibilityLabel={t("portfolio.removeTagA11y", { tag })}
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
                placeholder={t("portfolio.addTag")}
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
                accessibilityLabel={t("portfolio.addTag")}
                disabled={!tagDraft.trim()}
                onPress={addTag}
                style={[styles.tagAdd, !tagDraft.trim() && styles.disabled]}
              >
                <Text style={styles.tagAddText}>{t("compare.add")}</Text>
              </Pressable>
            </View>
          ) : null}
        </Section>
      </ScrollView>

      <View style={styles.footer}>
        {formError ? <Text style={styles.formError}>{formError}</Text> : null}
        <PrimaryButton
          label={
            saving
              ? t("setup.saving")
              : isEdit
                ? t("portfolio.saveChanges")
                : t("portfolio.addToPortfolio")
          }
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
  const { t } = useT();
  const params = useLocalSearchParams<{
    tradeId?: string;
    portfolioId?: string;
  }>();
  const tradeId =
    typeof params.tradeId === "string" ? params.tradeId : undefined;
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
              <Text style={styles.missing}>{t("portfolio.cantEdit")}</Text>
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
