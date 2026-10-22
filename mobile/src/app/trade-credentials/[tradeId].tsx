import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, type Control, useForm, useWatch } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { CloseIcon, ImageIcon, ShieldCheckIcon } from "@/components/icons";
import {
  ChoiceChips,
  FormInput,
  FormSection,
  ToggleRow,
} from "@/components/trade/form-parts";
import { BackButton } from "@/components/ui/back-button";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenBackground } from "@/components/ui/screen-background";
import { US_STATE_CODES } from "@/constants/trade-options";
import { Radius, Spacing, makeStyles, useTheme } from "@/constants/theme";
import { useSubmitErrorHaptic } from "@/hooks/use-submit-error-haptic";
import { analyticsEvents, errorMessage } from "@/lib/analytics-events";
import { errorFeedback, successFeedback, tapFeedback } from "@/lib/haptics";
import { choosePhoto } from "@/lib/media";
import { uploadImage } from "@/lib/storage-upload";
import {
  type CredentialInput,
  type TradeProfile,
  updateTradeCredentials,
} from "@/lib/trades";
import { useTradeById } from "@/queries/use-trade";
import { useAuthStore } from "@/store/use-auth-store";

const INSURANCE_TYPES = [
  { value: "General liability", label: "General liability" },
  { value: "Workers' compensation", label: "Workers' compensation" },
  { value: "General liability + workers' comp", label: "Liability + workers' comp" },
  { value: "Commercial auto", label: "Commercial auto" },
];

const expiry = z
  .string()
  .refine((value) => value === "" || parseExpiry(value) !== null, "Use MM/YYYY.");

const EXPIRED = "This date has passed. Add a current document.";

function isPast(value: string): boolean {
  const date = parseExpiry(value);
  return Boolean(date && date.getTime() < Date.now());
}

const schema = z
  .object({
    licenseOn: z.boolean(),
    licenseState: z.string(),
    licenseType: z.string(),
    licenseNumber: z.string(),
    licenseExpiry: expiry,
    licenseDoc: z.string(),
    insuranceOn: z.boolean(),
    insuranceType: z.string(),
    insuranceExpiry: expiry,
    insuranceDoc: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.licenseOn) {
      if (!(US_STATE_CODES as readonly string[]).includes(values.licenseState.toUpperCase())) {
        ctx.addIssue({ code: "custom", path: ["licenseState"], message: "Enter a US state code, e.g. CT." });
      }
      if (values.licenseType.trim().length < 2) {
        ctx.addIssue({ code: "custom", path: ["licenseType"], message: "Enter the license type." });
      }
      if (isPast(values.licenseExpiry)) {
        ctx.addIssue({ code: "custom", path: ["licenseExpiry"], message: EXPIRED });
      }
    }
    if (values.insuranceOn && isPast(values.insuranceExpiry)) {
      ctx.addIssue({ code: "custom", path: ["insuranceExpiry"], message: EXPIRED });
    }
    if (values.insuranceOn && !values.insuranceType.trim()) {
      ctx.addIssue({ code: "custom", path: ["insuranceType"], message: "Choose the insurance type." });
    }
  });

type FormValues = z.infer<typeof schema>;

function parseExpiry(value: string): Date | null {
  const match = value.trim().match(/^(\d{1,2})\s*\/\s*(\d{4})$/);
  if (!match) return null;
  const month = Number(match[1]);
  const year = Number(match[2]);
  if (month < 1 || month > 12 || year < 2000 || year > 2100) return null;
  return new Date(year, month, 0, 23, 59, 59);
}

function formatExpiry(date: Date | null): string {
  if (!date) return "";
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

function maskExpiry(text: string): string {
  const digits = text.replace(/[^0-9]/g, "").slice(0, 6);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

function defaults(trade: TradeProfile): FormValues {
  const license = trade.details.license;
  const insurance = trade.details.insurance;
  return {
    licenseOn: Boolean(license),
    licenseState: license?.state ?? "",
    licenseType: license?.type ?? "",
    licenseNumber: license?.number ?? "",
    licenseExpiry: formatExpiry(license?.expiresAt ?? null),
    licenseDoc: license?.documentUrl ?? "",
    insuranceOn: Boolean(insurance),
    insuranceType: insurance?.type ?? "",
    insuranceExpiry: formatExpiry(insurance?.expiresAt ?? null),
    insuranceDoc: insurance?.documentUrl ?? "",
  };
}

function DocumentField({
  control,
  name,
}: {
  control: Control<FormValues>;
  name: "licenseDoc" | "insuranceDoc";
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) =>
        value ? (
          <View style={styles.docPreview}>
            <Image source={{ uri: value }} style={styles.docImage} contentFit="cover" />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Remove document"
              hitSlop={8}
              onPress={() => {
                tapFeedback();
                onChange("");
              }}
              style={styles.docRemove}
            >
              <CloseIcon size={14} color="#FFFFFF" />
            </Pressable>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add a photo of the document"
            onPress={() => {
              tapFeedback();
              void choosePhoto().then((uri) => {
                if (uri) onChange(uri);
              });
            }}
            style={({ pressed }) => [styles.docAdd, pressed && styles.pressed]}
          >
            <ImageIcon size={20} color={colors.accent} />
            <Text style={styles.docAddText}>Add a photo of the document</Text>
          </Pressable>
        )
      }
    />
  );
}

function CredentialsForm({ trade }: { trade: TradeProfile }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const uid = useAuthStore((state) => state.user?.uid);
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, submitCount, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: defaults(trade),
  });
  useSubmitErrorHaptic(submitCount, errors);
  const licenseOn = useWatch({ control, name: "licenseOn" });
  const insuranceOn = useWatch({ control, name: "insuranceOn" });

  const upload = async (uri: string, kind: string): Promise<string> => {
    if (!uri || uri.startsWith("http")) return uri;
    return uploadImage(uri, `trades/${uid}/${trade.tradeId}/credentials/${kind}_${Date.now()}.jpg`);
  };

  const onSubmit = async (values: FormValues) => {
    if (saving) return;
    setSaving(true);
    setTopError(null);
    try {
      const [licenseDoc, insuranceDoc] = await Promise.all([
        values.licenseOn ? upload(values.licenseDoc, "license") : Promise.resolve(""),
        values.insuranceOn ? upload(values.insuranceDoc, "insurance") : Promise.resolve(""),
      ]);
      const license: CredentialInput | null = values.licenseOn
        ? {
            state: values.licenseState.trim().toUpperCase(),
            type: values.licenseType.trim(),
            number: values.licenseNumber.trim(),
            expiresAt: parseExpiry(values.licenseExpiry),
            documentUrl: licenseDoc,
          }
        : null;
      const insurance: CredentialInput | null = values.insuranceOn
        ? {
            state: "",
            type: values.insuranceType.trim(),
            number: "",
            expiresAt: parseExpiry(values.insuranceExpiry),
            documentUrl: insuranceDoc,
          }
        : null;
      await updateTradeCredentials(trade.tradeId, { license, insurance });
      analyticsEvents.tradeCredentialsSaved({
        trade_id: trade.tradeId,
        has_license: Boolean(license),
        has_insurance: Boolean(insurance),
        license_state: license?.state ?? null,
        has_documents: Boolean(licenseDoc || insuranceDoc),
      });
      void queryClient.invalidateQueries({ queryKey: ["trade"] });
      void queryClient.invalidateQueries({ queryKey: ["specialist-pool"] });
      void queryClient.invalidateQueries({ queryKey: ["owner-trades"] });
      successFeedback();
      router.back();
    } catch (error) {
      analyticsEvents.tradeCredentialsSaveFailed({
        trade_id: trade.tradeId,
        error_message: errorMessage(error),
      });
      errorFeedback();
      setSaving(false);
      setTopError("Could not save. Check your connection and try again.");
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
        <Text style={styles.headerTitle}>License & insurance</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <ShieldCheckIcon size={20} color={colors.accent} />
          <Text style={styles.introText}>
            For {trade.specialtyLabel || trade.name}. Homeowners see “License
            provided” or “Insurance provided”. CTMASS does not verify documents.
          </Text>
        </View>

        <Controller
          control={control}
          name="licenseOn"
          render={({ field: { value, onChange } }) => (
            <ToggleRow label="I have a license for this trade" value={value} onChange={onChange} />
          )}
        />
        {licenseOn ? (
          <>
            <FormSection label="State" error={errors.licenseState?.message}>
              <Controller
                control={control}
                name="licenseState"
                render={({ field: { value, onChange, onBlur } }) => (
                  <FormInput
                    value={value}
                    onChangeText={(text) => onChange(text.replace(/[^a-z]/gi, "").slice(0, 2).toUpperCase())}
                    onBlur={onBlur}
                    placeholder="e.g. CT"
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                )}
              />
            </FormSection>
            <FormSection label="License type" error={errors.licenseType?.message}>
              <Controller
                control={control}
                name="licenseType"
                render={({ field: { value, onChange, onBlur } }) => (
                  <FormInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="e.g. E-2 Unlimited Electrical Journeyperson"
                    maxLength={80}
                  />
                )}
              />
            </FormSection>
            <FormSection label="License number" optional>
              <Controller
                control={control}
                name="licenseNumber"
                render={({ field: { value, onChange, onBlur } }) => (
                  <FormInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="As shown on the license"
                    autoCapitalize="characters"
                    maxLength={40}
                  />
                )}
              />
            </FormSection>
            <FormSection label="Expires" error={errors.licenseExpiry?.message} optional>
              <Controller
                control={control}
                name="licenseExpiry"
                render={({ field: { value, onChange, onBlur } }) => (
                  <FormInput
                    value={value}
                    onChangeText={(text) => onChange(maskExpiry(text))}
                    onBlur={onBlur}
                    placeholder="MM/YYYY"
                    keyboardType="number-pad"
                  />
                )}
              />
            </FormSection>
            <FormSection label="Document" hint="Kept private. Homeowners only see that a license was provided." optional>
              <DocumentField control={control} name="licenseDoc" />
            </FormSection>
          </>
        ) : null}

        <View style={styles.divider} />

        <Controller
          control={control}
          name="insuranceOn"
          render={({ field: { value, onChange } }) => (
            <ToggleRow label="I carry insurance" value={value} onChange={onChange} />
          )}
        />
        {insuranceOn ? (
          <>
            <FormSection label="Insurance type" error={errors.insuranceType?.message}>
              <Controller
                control={control}
                name="insuranceType"
                render={({ field: { value, onChange } }) => (
                  <ChoiceChips options={INSURANCE_TYPES} value={value} onChange={onChange} />
                )}
              />
            </FormSection>
            <FormSection label="Valid through" error={errors.insuranceExpiry?.message} optional>
              <Controller
                control={control}
                name="insuranceExpiry"
                render={({ field: { value, onChange, onBlur } }) => (
                  <FormInput
                    value={value}
                    onChangeText={(text) => onChange(maskExpiry(text))}
                    onBlur={onBlur}
                    placeholder="MM/YYYY"
                    keyboardType="number-pad"
                  />
                )}
              />
            </FormSection>
            <FormSection label="Certificate of insurance" hint="Kept private. Homeowners only see that insurance was provided." optional>
              <DocumentField control={control} name="insuranceDoc" />
            </FormSection>
          </>
        ) : null}
      </ScrollView>
      <View style={styles.footer}>
        {topError ? <Text style={styles.error}>{topError}</Text> : null}
        <PrimaryButton
          label={saving ? "Saving…" : "Save"}
          loading={saving}
          disabled={!isDirty || saving}
          onPress={() => void handleSubmit(onSubmit)()}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

export default function TradeCredentialsScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const params = useLocalSearchParams<{ tradeId?: string; source?: string }>();
  const tradeId = typeof params.tradeId === "string" ? params.tradeId : undefined;
  const uid = useAuthStore((state) => state.user?.uid);
  const { data: trade, isLoading } = useTradeById(tradeId);

  useEffect(() => {
    if (!tradeId) return;
    analyticsEvents.tradeCredentialsOpened({
      trade_id: tradeId,
      source: typeof params.source === "string" ? params.source : "unknown",
    });
  }, [tradeId, params.source]);

  const allowed = Boolean(trade && uid && trade.ownerId === uid);

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : trade && allowed ? (
          <CredentialsForm trade={trade} />
        ) : (
          <>
            <View style={styles.header}>
              <BackButton onPress={() => router.back()} />
            </View>
            <View style={styles.center}>
              <Text style={styles.missing}>This trade isn&apos;t available.</Text>
            </View>
          </>
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
  content: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  intro: {
    flexDirection: "row",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: "rgba(22,179,100,0.1)",
    marginBottom: Spacing.sm,
  },
  introText: {
    flex: 1,
    color: t.colors.text,
    fontSize: 13.5,
    lineHeight: 19,
  },
  divider: {
    height: 1,
    backgroundColor: t.colors.border,
    marginVertical: Spacing.lg,
  },
  docAdd: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "rgba(22,179,100,0.45)",
  },
  docAddText: {
    color: t.colors.accent,
    fontSize: 14.5,
    fontWeight: "700",
  },
  docPreview: {
    width: 140,
    height: 100,
    borderRadius: Radius.md,
    overflow: "hidden",
    backgroundColor: t.colors.surfaceStrong,
  },
  docImage: {
    width: "100%",
    height: "100%",
  },
  docRemove: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(5,7,12,0.65)",
  },
  pressed: {
    opacity: 0.7,
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  error: {
    color: t.colors.danger,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
}));
