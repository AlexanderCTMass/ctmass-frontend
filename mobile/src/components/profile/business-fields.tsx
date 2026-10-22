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
  PREFERRED_CONTACTS,
  type PreferredContact,
} from "@/constants/trade-options";
import { makeStyles } from "@/constants/theme";
import {
  type BusinessDetails,
  type ContactSettings,
  normalizeWebsite,
} from "@/lib/business-profile";

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
      `Enter a year between 1900 and ${currentYear}.`,
    ),
  languages: z.array(z.string()),
  website: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" || /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(value),
      "Enter a valid website, e.g. example.com",
    ),
  paymentMethods: z.array(z.string()),
  showPhone: z.boolean(),
  showEmail: z.boolean(),
  preferredContact: z.string(),
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
    preferredContact: contact?.preferred ?? "message",
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
    contactSettings: {
      showPhone: values.showPhone,
      showEmail: values.showEmail,
      preferred: (values.preferredContact || "message") as PreferredContact,
    },
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
  return (
    <View>
      <Text style={styles.note}>
        Shared by all your trades. Experience is set separately in each trade.
      </Text>
      <FormSection label="Your role" optional>
        <Controller
          control={control}
          name="businessRole"
          render={({ field: { value, onChange } }) => (
            <ChoiceChips options={BUSINESS_ROLES} value={value} onChange={onChange} allowClear />
          )}
        />
      </FormSection>
      <FormSection label="Business structure" optional>
        <Controller
          control={control}
          name="structure"
          render={({ field: { value, onChange } }) => (
            <ChoiceChips options={BUSINESS_STRUCTURES} value={value} onChange={onChange} allowClear />
          )}
        />
      </FormSection>
      <FormSection label="Crew size" optional>
        <Controller
          control={control}
          name="crewSize"
          render={({ field: { value, onChange } }) => (
            <ChoiceChips options={CREW_SIZES} value={value} onChange={onChange} allowClear />
          )}
        />
        <Controller
          control={control}
          name="usesSubcontractors"
          render={({ field: { value, onChange } }) => (
            <ToggleRow label="I work with subcontractors when needed" value={value} onChange={onChange} />
          )}
        />
      </FormSection>
      <FormSection
        label="Year founded"
        hint="Years in business are shown separately from trade experience."
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
              placeholder={`e.g. ${currentYear - 6}`}
              keyboardType="number-pad"
            />
          )}
        />
      </FormSection>
      <FormSection label="Languages you speak with customers" optional>
        <Controller
          control={control}
          name="languages"
          render={({ field: { value, onChange } }) => (
            <MultiChips options={languageOptions} value={value} onChange={onChange} />
          )}
        />
      </FormSection>
      <FormSection label="Payment methods" optional>
        <Controller
          control={control}
          name="paymentMethods"
          render={({ field: { value, onChange } }) => (
            <MultiChips options={PAYMENT_METHODS} value={value} onChange={onChange} />
          )}
        />
      </FormSection>
      <FormSection label="Website" error={errors.website?.message} optional>
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
  return (
    <View>
      <Controller
        control={control}
        name="showPhone"
        render={({ field: { value, onChange } }) => (
          <ToggleRow
            label="Show my phone on my trades"
            hint="Homeowners get a Call button. CTMASS messages are always on."
            value={value}
            onChange={onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="showEmail"
        render={({ field: { value, onChange } }) => (
          <ToggleRow label="Show my email on my trades" value={value} onChange={onChange} />
        )}
      />
      <FormSection label="Preferred contact" error={errors.preferredContact?.message}>
        <Controller
          control={control}
          name="preferredContact"
          render={({ field: { value, onChange } }) => (
            <ChoiceChips
              options={PREFERRED_CONTACTS}
              value={value}
              onChange={(next) => next && onChange(next)}
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
