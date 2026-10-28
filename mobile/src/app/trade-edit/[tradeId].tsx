import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TradeCompleteness } from "@/components/trade/trade-completeness";
import {
  AreaAvailabilitySection,
  ContactSection,
  DetailsSection,
  IdentitySection,
  PricingSection,
  ServicesSection,
  type TradeContactSource,
  type TradeFormValues,
  contactFromValues,
  contactSourceFromProfile,
  fromFormValues,
  specialtyFromValues,
  toFormValues,
  tradeFormSchema,
  tradeToFormSource,
} from "@/components/trade/trade-form";
import { ShieldCheckIcon } from "@/components/icons";
import { BackButton } from "@/components/ui/back-button";
import { PressableScale } from "@/components/ui/pressable-scale";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { useSubmitErrorHaptic } from "@/hooks/use-submit-error-haptic";
import { analyticsEvents, errorMessage } from "@/lib/analytics-events";
import { findObjectionable } from "@/lib/content-filter";
import { errorFeedback, successFeedback, tapFeedback } from "@/lib/haptics";
import { useT } from "@/lib/i18n";
import { toHref } from "@/lib/navigation";
import { type TradeProfile, updateTrade } from "@/lib/trades";
import { saveTradeContact } from "@/lib/user-profile";
import { useProfile } from "@/queries/use-profile";
import { useTradeById } from "@/queries/use-trade";
import { useAuthStore } from "@/store/use-auth-store";

const schema = tradeFormSchema(false);

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const styles = useStyles();
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      {children}
    </View>
  );
}

function EditForm({
  trade,
  uid,
  contact,
}: {
  trade: TradeProfile;
  uid: string;
  contact: TradeContactSource | null;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useT();
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, submitCount, isDirty, dirtyFields },
  } = useForm<TradeFormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: toFormValues(tradeToFormSource(trade), contact),
  });
  useSubmitErrorHaptic(submitCount, errors);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const sectionProps = { control, errors, setValue };

  const onSubmit = async (values: TradeFormValues) => {
    if (
      findObjectionable(
        values.title,
        values.about,
        values.customSpecialty,
        ...values.services,
      )
    ) {
      analyticsEvents.contentFilterBlocked({
        screen: "trade_edit",
        fields: [
          findObjectionable(values.title) ? "title" : null,
          findObjectionable(values.about) ? "about" : null,
          findObjectionable(values.customSpecialty) ? "custom_specialty" : null,
          findObjectionable(...values.services) ? "services" : null,
        ].filter((field): field is string => field !== null),
      });
      errorFeedback();
      setFilterError(t("tradeSetup.filterError"));
      return;
    }
    setFilterError(null);
    if (saving) return;
    setSaving(true);
    const location = values.location;
    const contactInput = contactFromValues(values);
    const contactChanged = Boolean(
      dirtyFields.languages || dirtyFields.contactMethods || dirtyFields.phone,
    );
    try {
      if (contactChanged) {
        await saveTradeContact(uid, contactInput);
        void queryClient.invalidateQueries({ queryKey: ["profile", uid] });
      }
      await updateTrade(trade, {
        title: values.title.trim(),
        primarySpecialtyLabel: specialtyFromValues(values),
        about: values.about.trim(),
        location: location
          ? {
              address: location.place_name,
              addressLocation: location,
              commuteMode: trade.commuteMode,
              commuteDuration: trade.commuteDuration,
            }
          : null,
        details: fromFormValues(values),
      });
      analyticsEvents.tradeUpdated({ trade_id: trade.tradeId });
      void queryClient.invalidateQueries({ queryKey: ["trade"] });
      void queryClient.invalidateQueries({ queryKey: ["specialists"] });
      void queryClient.invalidateQueries({ queryKey: ["specialist-pool"] });
      void queryClient.invalidateQueries({ queryKey: ["owner-trades"] });
      successFeedback();
      router.back();
    } catch (error) {
      analyticsEvents.tradeUpdateFailed({
        trade_id: trade.tradeId,
        error_message: errorMessage(error),
      });
      errorFeedback();
      setSaving(false);
      setFilterError(t("tradeEdit.saveFailed"));
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
        <Text style={styles.headerTitle}>{t("tradePage.editTrade")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <TradeCompleteness trade={trade} />
        <PressableScale
          accessibilityLabel={t("tradePage.licenseInsurance")}
          onPress={() => {
            tapFeedback();
            router.push(
              toHref(
                `/trade-credentials/${encodeURIComponent(trade.tradeId)}?source=trade_edit`,
              ),
            );
          }}
        >
          <View style={styles.linkRow}>
            <ShieldCheckIcon size={20} color={colors.accent} />
            <View style={styles.linkBody}>
              <Text style={styles.linkTitle}>
                {t("tradePage.licenseInsurance")}
              </Text>
              <Text style={styles.linkHint}>
                {trade.details.license || trade.details.insurance
                  ? t("tradeEdit.credProvided")
                  : t("tradeEdit.credMissing")}
              </Text>
            </View>
            <Text style={styles.linkChevron}>›</Text>
          </View>
        </PressableScale>
        <Group title={t("tradeEdit.groups.trade")}>
          <IdentitySection {...sectionProps} />
        </Group>
        <Group title={t("tradeSetup.steps.services.title")}>
          <ServicesSection {...sectionProps} />
        </Group>
        <Group title={t("trade.sections.pricing")}>
          <PricingSection {...sectionProps} />
        </Group>
        <Group title={t("tradeEdit.groups.area")}>
          <AreaAvailabilitySection {...sectionProps} />
        </Group>
        <Group title={t("tradeEdit.groups.contact")}>
          <ContactSection {...sectionProps} />
        </Group>
        <Group title={t("videoStory.details")}>
          <DetailsSection {...sectionProps} />
        </Group>
      </ScrollView>

      <View style={styles.footer}>
        {filterError ? (
          <Text style={styles.filterError}>{filterError}</Text>
        ) : null}
        <PrimaryButton
          label={saving ? t("setup.saving") : t("portfolio.saveChanges")}
          onPress={() => void handleSubmit(onSubmit)()}
          disabled={!isDirty || saving}
          loading={saving}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

export default function TradeEditScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useT();
  const params = useLocalSearchParams<{ tradeId?: string }>();
  const tradeId =
    typeof params.tradeId === "string" ? params.tradeId : undefined;
  const { data: trade, isLoading } = useTradeById(tradeId);
  const uid = useAuthStore((state) => state.user?.uid);
  const { data: profile, isLoading: profileLoading } = useProfile(uid);

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        {isLoading || profileLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : !trade || !uid || trade.ownerId !== uid ? (
          <>
            <View style={styles.header}>
              <BackButton onPress={() => router.back()} />
              <View style={styles.headerSpacer} />
            </View>
            <View style={styles.center}>
              <Text style={styles.missing}>{t("tradeEdit.unavailable")}</Text>
            </View>
          </>
        ) : (
          <EditForm
            trade={trade}
            uid={uid}
            contact={contactSourceFromProfile(profile)}
          />
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
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  group: {
    marginTop: Spacing.lg,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.base,
    borderRadius: Radius.lg,
    backgroundColor: t.colors.card,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  linkBody: {
    flex: 1,
    gap: 2,
  },
  linkTitle: {
    color: t.colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  linkHint: {
    color: t.colors.textSecondary,
    fontSize: 13,
  },
  linkChevron: {
    color: t.colors.textMuted,
    fontSize: 26,
    fontWeight: "300",
  },
  groupTitle: {
    color: t.colors.accent,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: Spacing.md,
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  filterError: {
    color: t.colors.danger,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
}));
