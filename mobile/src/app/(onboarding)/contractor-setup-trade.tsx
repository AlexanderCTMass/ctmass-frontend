import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInRight } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AreaAvailabilitySection,
  DetailsSection,
  IdentitySection,
  PricingSection,
  STEP_FIELDS,
  ServicesSection,
  type TradeFormValues,
  fromFormValues,
  specialtyFromValues,
  toFormValues,
  tradeFormSchema,
} from "@/components/trade/trade-form";
import { BackButton } from "@/components/ui/back-button";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ScreenBackground } from "@/components/ui/screen-background";
import { OTHER_TRADE_LABEL } from "@/constants/trade-taxonomy";
import { Spacing, makeStyles } from "@/constants/theme";
import { useSubmitErrorHaptic } from "@/hooks/use-submit-error-haptic";
import { analyticsEvents, locationProps } from "@/lib/analytics-events";
import { findObjectionable } from "@/lib/content-filter";
import { errorFeedback, tapFeedback } from "@/lib/haptics";
import { toHref } from "@/lib/navigation";
import { useAuthStore } from "@/store/use-auth-store";
import { useTradeDraftStore } from "@/store/use-trade-draft-store";

const STEPS = [
  { name: "trade", title: "What's your trade?", subtitle: "One trade per profile. You can add more trades later." },
  { name: "services", title: "Services & experience", subtitle: "Experience counts only for this trade." },
  { name: "pricing", title: "Pricing", subtitle: "Clear pricing helps homeowners compare. Amounts are optional." },
  { name: "area", title: "Where & when you work", subtitle: "Homeowners see your city, radius and schedule." },
  { name: "details", title: "Final details", subtitle: "Optional, but complete profiles get more requests." },
] as const;

const schema = tradeFormSchema(true);

export default function ContractorSetupTradeScreen() {
  const styles = useStyles();
  const patch = useTradeDraftStore((state) => state.patch);
  const scrollRef = useRef<ScrollView>(null);
  const [step, setStep] = useState(0);
  const [filterError, setFilterError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors, submitCount },
  } = useForm<TradeFormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: toFormValues(null),
  });
  useSubmitErrorHaptic(submitCount, errors);

  useEffect(() => {
    analyticsEvents.tradeSetupViewed();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [step]);

  const isLast = step === STEPS.length - 1;
  const sectionProps = { control, errors, setValue };

  const goBack = () => {
    if (step === 0) {
      router.back();
      return;
    }
    tapFeedback();
    setStep((value) => value - 1);
  };

  const onSubmit = (values: TradeFormValues) => {
    if (findObjectionable(values.title, values.about, values.customSpecialty, ...values.services)) {
      analyticsEvents.contentFilterBlocked({
        screen: "trade_setup",
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
    const specialty = specialtyFromValues(values);
    const details = fromFormValues(values);
    patch({
      title: values.title.trim(),
      specialty,
      location: values.location,
      about: values.about.trim(),
      details,
    });
    analyticsEvents.tradeSetupSubmitted({
      title: values.title.trim(),
      specialty,
      trade_group: details.groupId,
      is_custom_specialty: values.specialty === OTHER_TRADE_LABEL,
      services_count: details.services.length,
      experience_years: details.experienceYears,
      pricing_model: details.rates.model,
      has_rate: details.rates.min !== null,
      radius_miles: details.radiusMiles,
      days: details.availability.days,
      response_time: details.responseTime,
      about_length: values.about.trim().length,
      ...locationProps(values.location),
    });
    const auth = useAuthStore.getState();
    router.push(
      toHref(
        auth.isAuthenticated && auth.user?.uid
          ? "/contractor-setup-trade-completed"
          : "/contractor-ready",
      ),
    );
  };

  const goNext = async () => {
    if (isLast) {
      await handleSubmit(onSubmit)();
      return;
    }
    const valid = await trigger(STEP_FIELDS[step]);
    if (!valid) {
      errorFeedback();
      return;
    }
    tapFeedback();
    analyticsEvents.tradeSetupStepCompleted({
      step: step + 1,
      step_name: STEPS[step].name,
    });
    setStep((value) => value + 1);
  };

  const current = STEPS[step];

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 12}
        >
          <View style={styles.header}>
            <BackButton onPress={goBack} />
            <View style={styles.progress}>
              <ProgressBar progress={(step + 1) / STEPS.length} />
            </View>
            <Text style={styles.stepCount}>
              {step + 1}/{STEPS.length}
            </Text>
          </View>

          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View key={current.name} entering={FadeInRight.duration(260)}>
              <Animated.Text entering={FadeIn.duration(360)} style={styles.eyebrow}>
                Your trade
              </Animated.Text>
              <Text style={styles.title}>{current.title}</Text>
              <Text style={styles.subtitle}>{current.subtitle}</Text>
              {step === 0 ? <IdentitySection {...sectionProps} /> : null}
              {step === 1 ? <ServicesSection {...sectionProps} /> : null}
              {step === 2 ? <PricingSection {...sectionProps} /> : null}
              {step === 3 ? <AreaAvailabilitySection {...sectionProps} /> : null}
              {step === 4 ? <DetailsSection {...sectionProps} /> : null}
            </Animated.View>
          </ScrollView>

          <View style={styles.footer}>
            {filterError ? (
              <Text style={styles.filterError}>{filterError}</Text>
            ) : null}
            <PrimaryButton
              label={isLast ? "Publish trade" : "Continue"}
              onPress={() => void goNext()}
            />
          </View>
        </KeyboardAvoidingView>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  progress: {
    flex: 1,
  },
  stepCount: {
    color: t.colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.xxl,
  },
  eyebrow: {
    color: t.colors.accent,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2.4,
    textTransform: "uppercase",
  },
  title: {
    color: t.colors.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginTop: Spacing.sm,
  },
  subtitle: {
    color: t.colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: Spacing.sm,
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
