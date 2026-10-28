import { type Control, Controller, type FieldErrors } from "react-hook-form";
import { Text, View } from "react-native";
import { z } from "zod";

import {
  ChoiceChips,
  FormInput,
  FormSection,
  MultiChips,
  ToggleRow,
  digitsOnly,
} from "@/components/trade/form-parts";
import {
  BUSINESS_ROLES,
  BUSINESS_STRUCTURES,
  CREW_SIZES,
  LANGUAGES,
  PAYMENT_METHODS,
} from "@/constants/trade-options";
import {
  CONTACT_METHODS,
  type ContactMethod,
} from "@/constants/project-request";
import { makeStyles } from "@/constants/theme";
import {
  type BusinessDetails,
  type ContactSettings,
  contactSettingsPayload,
  normalizeWebsite,
} from "@/lib/business-profile";
import { useT } from "@/lib/i18n";

const currentYear = new Date().getFullYear();

export const businessFieldsSchema = z.object({
  structure: z.string(),
  crewSize: z.string(),
  usesSubcontractors: z.boolean(),
  businessRole: z.string(),
  foundedYear: z
    .string()
    .refine(
      (value) =>
        value === "" || (Number(value) >= 1900 && Number(value) <= currentYear),
      "business.errors.year",
    ),
  languages: z.array(z.string()),
  website: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(value),
      "business.errors.website",
    ),
  paymentMethods: z.array(z.string()),
  showPhone: z.boolean(),
  showEmail: z.boolean(),
  contactMethods: z.array(z.string()).min(1, "business.errors.contactMethods"),
});

export type BusinessFieldValues = z.infer<typeof businessFieldsSchema>;

export function businessDefaults(
  business: BusinessDetails | undefined,
  contact: ContactSettings | undefined,
): BusinessFieldValues {
  return {
    structure: business?.structure ?? "",
    crewSize: business?.crewSize ?? "",
    usesSubcontractors: business?.usesSubcontractors ?? false,
    businessRole: business?.role ?? "",
    foundedYear: business?.foundedYear ? String(business.foundedYear) : "",
    languages: business?.languages ?? [],
    website: business?.website ?? "",
    paymentMethods: business?.paymentMethods ?? [],
    showPhone: contact?.showPhone ?? true,
    showEmail: contact?.showEmail ?? false,
    contactMethods: contact?.methods ?? ["app"],
  };
}

export function businessFromValues(values: BusinessFieldValues): {
  business: BusinessDetails;
  contactSettings: ContactSettings;
} {
  return {
    business: {
      structure: values.structure,
      crewSize: values.crewSize,
      usesSubcontractors: values.usesSubcontractors,
      role: values.businessRole,
      foundedYear: values.foundedYear ? Number(values.foundedYear) : null,
      languages: values.languages,
      website: normalizeWebsite(values.website),
      paymentMethods: values.paymentMethods,
    },
    contactSettings: contactSettingsPayload(
      values.contactMethods as ContactMethod[],
      { showPhone: values.showPhone, showEmail: values.showEmail },
    ),
  };
}

const languageOptions = LANGUAGES.map((item) => ({ value: item, label: item }));

type Props<T extends BusinessFieldValues> = {
  control: Control<T>;
  errors: FieldErrors<T>;
};

export function BusinessDetailsFields<T extends BusinessFieldValues>({
  control: rawControl,
  errors: rawErrors,
}: Props<T>) {
  const control = rawControl as unknown as Control<BusinessFieldValues>;
  const errors = rawErrors as FieldErrors<BusinessFieldValues>;
  const styles = useStyles();
  const { t } = useT();
  return (
    <View>
      <Text style={styles.note}>{t("business.note")}</Text>
      <FormSection label={t("business.role")} optional>
        <Controller
          control={control}
          name="businessRole"
          render={({ field: { value, onChange } }) => (
            <ChoiceChips
              options={BUSINESS_ROLES}
              value={value}
              onChange={onChange}
              allowClear
            />
          )}
        />
      </FormSection>
      <FormSection label={t("trade.sections.structure")} optional>
        <Controller
          control={control}
          name="structure"
          render={({ field: { value, onChange } }) => (
            <ChoiceChips
              options={BUSINESS_STRUCTURES}
              value={value}
              onChange={onChange}
              allowClear
            />
          )}
        />
      </FormSection>
      <FormSection label={t("trade.sections.crewSize")} optional>
        <Controller
          control={control}
          name="crewSize"
          render={({ field: { value, onChange } }) => (
            <ChoiceChips
              options={CREW_SIZES}
              value={value}
              onChange={onChange}
              allowClear
            />
          )}
        />
        <Controller
          control={control}
          name="usesSubcontractors"
          render={({ field: { value, onChange } }) => (
            <ToggleRow
              label={t("business.subcontractors")}
              value={value}
              onChange={onChange}
            />
          )}
        />
      </FormSection>
      <FormSection
        label={t("business.founded")}
        hint={t("business.foundedHint")}
        error={errors.foundedYear?.message}
        optional
      >
        <Controller
          control={control}
          name="foundedYear"
          render={({ field: { value, onChange, onBlur } }) => (
            <FormInput
              value={value}
              onChangeText={(next) => onChange(digitsOnly(next, 4))}
              onBlur={onBlur}
              placeholder={t("tradeForm.example", {
                value: String(currentYear - 6),
              })}
              keyboardType="number-pad"
            />
          )}
        />
      </FormSection>
      <FormSection label={t("business.languages")} optional>
        <Controller
          control={control}
          name="languages"
          render={({ field: { value, onChange } }) => (
            <MultiChips
              options={languageOptions}
              value={value}
              onChange={onChange}
            />
          )}
        />
      </FormSection>
      <FormSection label={t("trade.sections.paymentMethods")} optional>
        <Controller
          control={control}
          name="paymentMethods"
          render={({ field: { value, onChange } }) => (
            <MultiChips
              options={PAYMENT_METHODS}
              value={value}
              onChange={onChange}
            />
          )}
        />
      </FormSection>
      <FormSection
        label={t("trade.sections.website")}
        error={errors.website?.message}
        optional
      >
        <Controller
          control={control}
          name="website"
          render={({ field: { value, onChange, onBlur } }) => (
            <FormInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="example.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          )}
        />
      </FormSection>
    </View>
  );
}

export function ContactVisibilityFields<T extends BusinessFieldValues>({
  control: rawControl,
  errors: rawErrors,
}: Props<T>) {
  const control = rawControl as unknown as Control<BusinessFieldValues>;
  const errors = rawErrors as FieldErrors<BusinessFieldValues>;
  const { t } = useT();
  return (
    <View>
      <Controller
        control={control}
        name="showPhone"
        render={({ field: { value, onChange } }) => (
          <ToggleRow
            label={t("business.showPhone")}
            hint={t("business.showPhoneHint")}
            value={value}
            onChange={onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="showEmail"
        render={({ field: { value, onChange } }) => (
          <ToggleRow
            label={t("business.showEmail")}
            value={value}
            onChange={onChange}
          />
        )}
      />
      <FormSection
        label={t("trade.sections.preferredContact")}
        hint={t("business.contactMethodsHint")}
        error={errors.contactMethods?.message}
      >
        <Controller
          control={control}
          name="contactMethods"
          render={({ field: { value, onChange } }) => (
            <MultiChips
              options={CONTACT_METHODS}
              value={value}
              onChange={onChange}
            />
          )}
        />
      </FormSection>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  note: {
    color: t.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
}));
