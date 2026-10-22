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
  DetailsSection,
  IdentitySection,
  PricingSection,
  ServicesSection,
  type TradeFormValues,
  fromFormValues,
  specialtyFromValues,
  toFormValues,
  tradeFormSchema,
  tradeToFormSource,
} from "@/components/trade/trade-form";
import { BackButton } from "@/components/ui/back-button";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { Spacing, makeStyles, useTheme } from "@/constants/theme";
import { useSubmitErrorHaptic } from "@/hooks/use-submit-error-haptic";
import { analyticsEvents, errorMessage } from "@/lib/analytics-events";
import { findObjectionable } from "@/lib/content-filter";
import { errorFeedback, successFeedback } from "@/lib/haptics";
import { type TradeProfile, updateTrade } from "@/lib/trades";
import { useTradeById } from "@/queries/use-trade";

const schema = tradeFormSchema(false);

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const styles = useStyles();
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      {children}
    </View>
  );
}

function EditForm({ trade }: { trade: TradeProfile }) {
  const styles = useStyles();
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, submitCount, isDirty },
  } = useForm<TradeFormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: toFormValues(tradeToFormSource(trade)),
  });
  useSubmitErrorHaptic(submitCount, errors);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const sectionProps = { control, errors, setValue };

  const onSubmit = async (values: TradeFormValues) => {
    if (findObjectionable(values.title, values.about, values.customSpecialty, ...values.services)) {
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
      setFilterError("Please remove inappropriate language from your trade details.");
      return;
    }
    setFilterError(null);
    if (saving) return;
    setSaving(true);
    const location = values.location;
    try {
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
      setFilterError("Could not save your changes. Please try again.");
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
        <Text style={styles.headerTitle}>Edit trade</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <TradeCompleteness trade={trade} />
        <Group title="Trade">
          <IdentitySection {...sectionProps} />
        </Group>
        <Group title="Services & experience">
          <ServicesSection {...sectionProps} />
        </Group>
        <Group title="Pricing">
          <PricingSection {...sectionProps} />
        </Group>
        <Group title="Service area & availability">
          <AreaAvailabilitySection {...sectionProps} />
        </Group>
        <Group title="Details">
          <DetailsSection {...sectionProps} />
        </Group>
      </ScrollView>

      <View style={styles.footer}>
        {filterError ? (
          <Text style={styles.filterError}>{filterError}</Text>
        ) : null}
        <PrimaryButton
          label={saving ? "Saving…" : "Save changes"}
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
  const params = useLocalSearchParams<{ tradeId?: string }>();
  const tradeId =
    typeof params.tradeId === "string" ? params.tradeId : undefined;
  const { data: trade, isLoading } = useTradeById(tradeId);

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : !trade ? (
          <>
            <View style={styles.header}>
              <BackButton onPress={() => router.back()} />
              <View style={styles.headerSpacer} />
            </View>
            <View style={styles.center}>
              <Text style={styles.missing}>This trade isn&apos;t available.</Text>
            </View>
          </>
        ) : (
          <EditForm trade={trade} />
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
