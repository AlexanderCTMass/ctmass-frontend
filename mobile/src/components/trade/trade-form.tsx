import { useState } from "react";
import {
  type Control,
  Controller,
  type FieldErrors,
  type UseFormSetValue,
  useWatch,
} from "react-hook-form";
import { Text, View } from "react-native";
import { z } from "zod";

import {
  ChoiceChips,
  FormInput,
  FormSection,
  MultiChips,
  ToggleRow,
  digitsOnly,
  useFormPartStyles,
} from "@/components/trade/form-parts";
import { TierBadge } from "@/components/trade/tier-badge";
import { TradePicker } from "@/components/trade/trade-picker";
import { LocationPicker } from "@/components/ui/location-picker";
import {
  AVAILABILITY_DAYS,
  EMERGENCY_OPTIONS,
  ESTIMATE_POLICIES,
  LANGUAGES,
  MAX_EXPERIENCE_YEARS,
  PERMIT_OPTIONS,
  PRICE_DISCLAIMER,
  PRICING_MODELS,
  PROJECT_TYPES,
  RATE_BASES,
  RESPONSE_TIMES,
  SERVICE_RADII,
  WARRANTY_OPTIONS,
  WORKING_HOURS,
  WORK_BY_OPTIONS,
  type AvailabilityDay,
  type EmergencyService,
  type PricingModel,
  type ProjectType,
  type RateBasis,
  type ResponseTime,
  defaultBasisFor,
  modelTakesRate,
} from "@/constants/trade-options";
import {
  CONTACT_METHODS,
  type ContactMethod,
  PHONE_CONTACT_METHODS,
} from "@/constants/project-request";
import { servicesForTrade } from "@/constants/trade-services";
import { OTHER_TRADE_LABEL, findTrade } from "@/constants/trade-taxonomy";
import { useT } from "@/lib/i18n";
import type { GeoPlace } from "@/lib/mapbox";
import {
  type TradeDetails,
  type TradeDetailsInput,
  detailsToInput,
  emptyDetailsInput,
} from "@/lib/trade-details";
import { isValidUSPhone } from "@/lib/shop-form";

const MAX_SERVICES = 12;

const money = z
  .string()
  .refine(
    (value) => value === "" || /^\d{1,6}$/.test(value),
    "tradeForm.errors.numbersOnly",
  );

function baseSchema() {
  return z.object({
    title: z.string().trim().min(2, "tradeForm.errors.title"),
    specialty: z.string().min(1, "tradeForm.errors.specialty"),
    customSpecialty: z.string(),
    services: z.array(z.string()).max(MAX_SERVICES),
    experienceYears: z.string(),
    location: z.custom<GeoPlace | null>(),
    radiusMiles: z.number(),
    areas: z.string(),
    pricingModel: z.string(),
    rateMin: money,
    rateMax: money,
    rateBasis: z.string(),
    minimumCharge: money,
    serviceCallFee: money,
    serviceCallCredited: z.boolean(),
    travelFee: z.string(),
    afterHours: z.string(),
    materials: z.string(),
    rateNote: z.string(),
    days: z.array(z.string()),
    hours: z.string(),
    acceptingWork: z.boolean(),
    emergency: z.string(),
    emergencyNote: z.string(),
    responseTime: z.string(),
    projectTypes: z.array(z.string()),
    estimate: z.string(),
    estimateNote: z.string(),
    warranty: z.string(),
    warrantyTerms: z.string(),
    permits: z.string(),
    workBy: z.string(),
    about: z.string(),
    languages: z.array(z.string()),
    contactMethods: z.array(z.string()),
    phone: z.string(),
  });
}

export type TradeFormValues = z.infer<ReturnType<typeof baseSchema>>;

type Issue = { path: keyof TradeFormValues; message: string };

function issuesFor(values: TradeFormValues, strict: boolean): Issue[] {
  const issues: Issue[] = [];
  if (
    values.specialty === OTHER_TRADE_LABEL &&
    values.customSpecialty.trim().length < 2
  ) {
    issues.push({
      path: "customSpecialty",
      message: "tradeForm.errors.customSpecialty",
    });
  }
  const years = values.experienceYears;
  if (years !== "" && Number(years) > MAX_EXPERIENCE_YEARS) {
    issues.push({
      path: "experienceYears",
      message: "tradeForm.errors.yearsRealistic",
    });
  }
  if (
    values.rateMin &&
    values.rateMax &&
    Number(values.rateMax) < Number(values.rateMin)
  ) {
    issues.push({ path: "rateMax", message: "tradeForm.errors.rateMax" });
  }
  if (values.contactMethods.length === 0) {
    issues.push({
      path: "contactMethods",
      message: "business.errors.contactMethods",
    });
  }
  if (needsPhone(values.contactMethods) && !isValidUSPhone(values.phone)) {
    issues.push({ path: "phone", message: "validation.usPhone" });
  }
  if (strict) {
    if (years === "") {
      issues.push({
        path: "experienceYears",
        message: "tradeForm.errors.years",
      });
    }
    if (values.services.length === 0) {
      issues.push({ path: "services", message: "tradeForm.errors.services" });
    }
    if (!values.pricingModel) {
      issues.push({
        path: "pricingModel",
        message: "tradeForm.errors.pricingModel",
      });
    }
    if (values.days.length === 0) {
      issues.push({ path: "days", message: "tradeForm.errors.days" });
    }
    if (!values.location) {
      issues.push({ path: "location", message: "tradeForm.errors.location" });
    }
  }
  return issues;
}

export function tradeFormSchema(strict: boolean) {
  return baseSchema().superRefine((values, ctx) => {
    for (const issue of issuesFor(values, strict)) {
      ctx.addIssue({
        code: "custom",
        path: [issue.path],
        message: issue.message,
      });
    }
  });
}

export const STEP_FIELDS: (keyof TradeFormValues)[][] = [
  ["title", "specialty", "customSpecialty"],
  ["services", "experienceYears"],
  ["pricingModel", "rateMin", "rateMax", "minimumCharge", "serviceCallFee"],
  ["location", "radiusMiles", "days", "responseTime"],
  ["languages", "contactMethods", "phone"],
  ["about"],
];

export type TradeContactSource = {
  languages: string[];
  methods: ContactMethod[];
  phone: string;
};

export function contactSourceFromProfile(
  profile:
    | {
        business: { languages: string[] };
        contactSettings: { methods: ContactMethod[] };
        phone: string;
      }
    | null
    | undefined,
): TradeContactSource | null {
  if (!profile) return null;
  return {
    languages: profile.business.languages,
    methods: profile.contactSettings.methods,
    phone: profile.phone,
  };
}

export function needsPhone(methods: string[]): boolean {
  return methods.some((method) =>
    PHONE_CONTACT_METHODS.includes(method as ContactMethod),
  );
}

export function contactFromValues(values: TradeFormValues): TradeContactSource {
  const methods = values.contactMethods as ContactMethod[];
  return {
    languages: values.languages,
    methods,
    phone: needsPhone(methods) ? values.phone.trim() : "",
  };
}

const text = (value: number | null) => (value === null ? "" : String(value));
const numberOrNull = (value: string) => (value === "" ? null : Number(value));

export type TradeFormSource = {
  title: string;
  specialtyLabel: string;
  about: string;
  location: GeoPlace | null;
  details: TradeDetailsInput | null;
  hasPricing: boolean;
};

function toGeoPlace(
  raw: Record<string, unknown> | null,
  center: [number, number] | null,
): GeoPlace | null {
  const placeName = typeof raw?.place_name === "string" ? raw.place_name : "";
  if (!placeName || !center) return null;
  return {
    id: typeof raw?.id === "string" ? raw.id : placeName,
    place_name: placeName,
    text: typeof raw?.text === "string" ? raw.text : placeName,
    center,
    geometry: { type: "Point", coordinates: center },
  };
}

export function tradeToFormSource(trade: {
  name: string;
  specialtyLabel: string;
  about: string;
  addressLocation: Record<string, unknown> | null;
  center: [number, number] | null;
  details: TradeDetails;
}): TradeFormSource {
  return {
    title: trade.name === "Specialist" ? "" : trade.name,
    specialtyLabel: trade.specialtyLabel,
    about: trade.about,
    location: toGeoPlace(trade.addressLocation, trade.center),
    details: detailsToInput(trade.details),
    hasPricing: trade.details.rates !== null,
  };
}

export function toFormValues(
  source: TradeFormSource | null,
  contact?: TradeContactSource | null,
): TradeFormValues {
  const label = source?.specialtyLabel ?? "";
  const known = findTrade(label);
  const details: TradeDetailsInput =
    source?.details ?? emptyDetailsInput(known?.groupId ?? "other");
  const rates = details.rates;
  return {
    title: source?.title ?? "",
    specialty: known ? known.label : label ? OTHER_TRADE_LABEL : "",
    customSpecialty: known ? "" : label,
    services: details.services,
    experienceYears: text(details.experienceYears),
    location: source?.location ?? null,
    radiusMiles: details.radiusMiles,
    areas: details.areas.join(", "),
    pricingModel: source?.hasPricing ? rates.model : "",
    rateMin: text(rates.min),
    rateMax: text(rates.max),
    rateBasis: rates.basis,
    minimumCharge: text(rates.minimumCharge),
    serviceCallFee: text(rates.serviceCallFee),
    serviceCallCredited: rates.serviceCallCredited,
    travelFee: rates.travelFee,
    afterHours: rates.afterHours,
    materials: rates.materials,
    rateNote: rates.note,
    days: details.availability.days,
    hours: details.availability.hours,
    acceptingWork: details.availability.acceptingWork,
    emergency: details.availability.emergency,
    emergencyNote: details.availability.emergencyNote,
    responseTime: details.responseTime,
    projectTypes: details.workPolicy.projectTypes,
    estimate: details.workPolicy.estimate,
    estimateNote: details.workPolicy.estimateNote,
    warranty: details.workPolicy.warranty,
    warrantyTerms: details.workPolicy.warrantyTerms,
    permits: details.workPolicy.permits,
    workBy: details.workPolicy.workBy,
    about: source?.about ?? "",
    languages: contact?.languages ?? [],
    contactMethods: contact?.methods ?? ["app"],
    phone: contact?.phone ?? "",
  };
}

export function specialtyFromValues(values: TradeFormValues): string {
  return values.specialty === OTHER_TRADE_LABEL
    ? values.customSpecialty.trim()
    : values.specialty;
}

export function fromFormValues(values: TradeFormValues): TradeDetailsInput {
  const model = (values.pricingModel || "not_provided") as PricingModel;
  const takesRate = modelTakesRate(model);
  return {
    groupId: findTrade(specialtyFromValues(values))?.groupId ?? "other",
    services: values.services,
    experienceYears: numberOrNull(values.experienceYears),
    rates: {
      model,
      min: takesRate ? numberOrNull(values.rateMin) : null,
      max: takesRate ? numberOrNull(values.rateMax) : null,
      basis: (values.rateBasis || defaultBasisFor(model)) as RateBasis,
      minimumCharge: numberOrNull(values.minimumCharge),
      serviceCallFee: numberOrNull(values.serviceCallFee),
      serviceCallCredited: values.serviceCallCredited,
      travelFee: values.travelFee.trim(),
      afterHours: values.afterHours.trim(),
      materials: values.materials.trim(),
      note: values.rateNote.trim(),
    },
    availability: {
      days: values.days as AvailabilityDay[],
      hours: values.hours,
      acceptingWork: values.acceptingWork,
      emergency: (values.emergency || "none") as EmergencyService,
      emergencyNote:
        values.emergency && values.emergency !== "none"
          ? values.emergencyNote.trim()
          : "",
    },
    responseTime: values.responseTime as ResponseTime | "",
    radiusMiles: values.radiusMiles,
    areas: values.areas
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 12),
    workPolicy: {
      projectTypes: values.projectTypes as ProjectType[],
      estimate: values.estimate,
      estimateNote: values.estimateNote.trim(),
      warranty: values.warranty,
      warrantyTerms: values.warrantyTerms.trim(),
      permits: values.permits,
      workBy: values.workBy,
    },
  };
}

type SectionProps = {
  control: Control<TradeFormValues>;
  errors: FieldErrors<TradeFormValues>;
  setValue: UseFormSetValue<TradeFormValues>;
};

export function IdentitySection({ control, errors, setValue }: SectionProps) {
  const { t } = useT();
  const specialty = useWatch({ control, name: "specialty" });
  return (
    <>
      <FormSection
        label={t("tradeForm.tradeName")}
        hint={t("tradeForm.tradeNameHint")}
        error={errors.title?.message}
      >
        <Controller
          control={control}
          name="title"
          render={({ field: { value, onChange, onBlur } }) => (
            <FormInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={t("tradeForm.tradeNamePlaceholder")}
              maxLength={80}
            />
          )}
        />
      </FormSection>
      <FormSection
        label={t("tradeForm.primaryTrade")}
        hint={t("tradeForm.primaryTradeHint")}
        error={errors.specialty?.message ?? errors.customSpecialty?.message}
      >
        <Controller
          control={control}
          name="specialty"
          render={({ field: { value, onChange } }) => (
            <TradePicker
              value={value || null}
              onChange={(label, item) => {
                if (label !== value) {
                  setValue("services", [], { shouldValidate: true });
                }
                if (item) {
                  setValue("customSpecialty", "", { shouldValidate: true });
                }
                onChange(label);
              }}
            />
          )}
        />
        {specialty === OTHER_TRADE_LABEL ? (
          <Controller
            control={control}
            name="customSpecialty"
            render={({ field: { value, onChange, onBlur } }) => (
              <FormInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t("tradeForm.describeTrade")}
                maxLength={60}
              />
            )}
          />
        ) : null}
      </FormSection>
    </>
  );
}

function ServicesField({
  value,
  onChange,
  specialty,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  specialty: string;
}) {
  const { t } = useT();
  const parts = useFormPartStyles();
  const [custom, setCustom] = useState("");
  const suggestions = servicesForTrade(specialty);
  const own = value.filter((item) => !suggestions.includes(item));
  const options = [...suggestions, ...own].map((item) => ({
    value: item,
    label: item,
  }));
  const add = () => {
    const next = custom.trim().replace(/\s+/g, " ");
    if (next.length < 2 || value.length >= MAX_SERVICES) return;
    if (!value.some((item) => item.toLowerCase() === next.toLowerCase())) {
      onChange([...value, next]);
    }
    setCustom("");
  };
  return (
    <>
      {options.length > 0 ? (
        <MultiChips options={options} value={value} onChange={onChange} />
      ) : null}
      <FormInput
        value={custom}
        onChangeText={setCustom}
        onSubmitEditing={add}
        onBlur={add}
        placeholder={t("tradeForm.addService")}
        returnKeyType="done"
        maxLength={40}
        blurOnSubmit={false}
      />
      <Text style={parts.note}>
        {t("tradeForm.servicesSelected", {
          count: value.length,
          max: MAX_SERVICES,
        })}
      </Text>
    </>
  );
}

export function ServicesSection({ control, errors }: SectionProps) {
  const { t, tx } = useT();
  const specialty = useWatch({ control, name: "specialty" });
  const custom = useWatch({ control, name: "customSpecialty" });
  const years = useWatch({ control, name: "experienceYears" });
  const parts = useFormPartStyles();
  const label = specialty === OTHER_TRADE_LABEL ? custom : specialty;
  return (
    <>
      <FormSection
        label={t("tradeForm.services")}
        hint={t("tradeForm.servicesHint")}
        error={errors.services?.message}
      >
        <Controller
          control={control}
          name="services"
          render={({ field: { value, onChange } }) => (
            <ServicesField
              value={value}
              onChange={onChange}
              specialty={specialty}
            />
          )}
        />
      </FormSection>
      <FormSection
        label={t("trade.sections.yearsInLabel", {
          trade: label ? tx(label) : t("tradePage.thisTrade"),
        })}
        hint={t("tradeForm.yearsHint")}
        error={errors.experienceYears?.message}
      >
        <Controller
          control={control}
          name="experienceYears"
          render={({ field: { value, onChange, onBlur } }) => (
            <FormInput
              value={value}
              onChangeText={(next) => onChange(digitsOnly(next, 2))}
              onBlur={onBlur}
              placeholder={t("tradeForm.yearsPlaceholder")}
              keyboardType="number-pad"
              suffix="years"
            />
          )}
        />
        {years !== "" ? (
          <View style={parts.row}>
            <TierBadge years={Number(years)} />
          </View>
        ) : null}
        <Text style={parts.note}>{t("tradeForm.yearsNote")}</Text>
      </FormSection>
    </>
  );
}

function MoneyField({
  control,
  name,
  placeholder,
}: {
  control: Control<TradeFormValues>;
  name: "rateMin" | "rateMax" | "minimumCharge" | "serviceCallFee";
  placeholder: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur } }) => (
        <FormInput
          value={value}
          onChangeText={(next) => onChange(digitsOnly(next, 6))}
          onBlur={onBlur}
          placeholder={placeholder}
          keyboardType="number-pad"
          prefix="$"
        />
      )}
    />
  );
}

function TextLine({
  control,
  name,
  placeholder,
}: {
  control: Control<TradeFormValues>;
  name:
    | "travelFee"
    | "afterHours"
    | "materials"
    | "rateNote"
    | "emergencyNote"
    | "estimateNote"
    | "warrantyTerms"
    | "areas";
  placeholder: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur } }) => (
        <FormInput
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          maxLength={160}
        />
      )}
    />
  );
}

export function PricingSection({ control, errors, setValue }: SectionProps) {
  const { t, tx } = useT();
  const parts = useFormPartStyles();
  const model = useWatch({ control, name: "pricingModel" });
  const takesRate = modelTakesRate(model);
  const showsFees = model !== "" && model !== "not_provided";
  return (
    <>
      <FormSection
        label={t("tradeForm.pricingModel")}
        hint={t("tradeForm.pricingModelHint")}
        error={errors.pricingModel?.message}
      >
        <Controller
          control={control}
          name="pricingModel"
          render={({ field: { value, onChange } }) => (
            <ChoiceChips
              options={PRICING_MODELS}
              value={value}
              onChange={(next) => {
                onChange(next);
                if (next) {
                  setValue("rateBasis", defaultBasisFor(next));
                }
              }}
            />
          )}
        />
      </FormSection>
      {takesRate ? (
        <FormSection
          label={t("compare.rows.rate")}
          hint={t("tradeForm.rateHint")}
          error={errors.rateMin?.message ?? errors.rateMax?.message}
          optional
        >
          <View style={parts.row}>
            <View style={parts.flex}>
              <MoneyField
                control={control}
                name="rateMin"
                placeholder={t("tradeForm.from")}
              />
            </View>
            <View style={parts.flex}>
              <MoneyField
                control={control}
                name="rateMax"
                placeholder={t("tradeForm.to")}
              />
            </View>
          </View>
          <Controller
            control={control}
            name="rateBasis"
            render={({ field: { value, onChange } }) => (
              <ChoiceChips
                options={RATE_BASES}
                value={value}
                onChange={(next) => next && onChange(next)}
              />
            )}
          />
        </FormSection>
      ) : null}
      {showsFees ? (
        <>
          <FormSection label={t("trade.sections.minimumCharge")} optional>
            <MoneyField
              control={control}
              name="minimumCharge"
              placeholder={t("tradeForm.example", { value: "125" })}
            />
          </FormSection>
          <FormSection label={t("tradeForm.serviceCallFee")} optional>
            <MoneyField
              control={control}
              name="serviceCallFee"
              placeholder={t("tradeForm.example", { value: "89" })}
            />
            <Controller
              control={control}
              name="serviceCallCredited"
              render={({ field: { value, onChange } }) => (
                <ToggleRow
                  label={t("tradeForm.credited")}
                  value={value}
                  onChange={onChange}
                />
              )}
            />
          </FormSection>
          <FormSection label={t("tradeForm.travelFee")} optional>
            <TextLine
              control={control}
              name="travelFee"
              placeholder={t("tradeForm.travelPlaceholder")}
            />
          </FormSection>
          <FormSection label={t("tradeForm.afterHours")} optional>
            <TextLine
              control={control}
              name="afterHours"
              placeholder={t("tradeForm.afterHoursPlaceholder")}
            />
          </FormSection>
          <FormSection label={t("tradeForm.materials")} optional>
            <TextLine
              control={control}
              name="materials"
              placeholder={t("tradeForm.materialsPlaceholder")}
            />
          </FormSection>
          <FormSection label={t("tradeForm.pricingNote")} optional>
            <TextLine
              control={control}
              name="rateNote"
              placeholder={t("tradeForm.pricingNotePlaceholder")}
            />
          </FormSection>
        </>
      ) : null}
      <Text style={[parts.note, parts.noteSpaced]}>{tx(PRICE_DISCLAIMER)}</Text>
    </>
  );
}

export function AreaAvailabilitySection({ control, errors }: SectionProps) {
  const { t } = useT();
  const emergency = useWatch({ control, name: "emergency" });
  return (
    <>
      <FormSection
        label={t("tradeForm.location")}
        hint={t("tradeForm.locationHint")}
        error={errors.location?.message}
      >
        <Controller
          control={control}
          name="location"
          render={({ field: { value, onChange } }) => (
            <LocationPicker
              value={value}
              onChange={onChange}
              analyticsContext="trade_setup"
            />
          )}
        />
      </FormSection>
      <FormSection label={t("trade.sections.serviceRadius")}>
        <Controller
          control={control}
          name="radiusMiles"
          render={({ field: { value, onChange } }) => (
            <ChoiceChips
              options={SERVICE_RADII.map((miles) => ({
                value: miles,
                label: `${miles} mi`,
              }))}
              value={value}
              onChange={(next) => next !== "" && onChange(next)}
            />
          )}
        />
      </FormSection>
      <FormSection
        label={t("tradeForm.towns")}
        hint={t("tradeForm.townsHint")}
        optional
      >
        <TextLine
          control={control}
          name="areas"
          placeholder={t("tradeForm.townsPlaceholder")}
        />
      </FormSection>
      <FormSection label={t("tradeForm.days")} error={errors.days?.message}>
        <Controller
          control={control}
          name="days"
          render={({ field: { value, onChange } }) => (
            <MultiChips
              options={AVAILABILITY_DAYS}
              value={value}
              onChange={onChange}
            />
          )}
        />
      </FormSection>
      <FormSection label={t("tradeForm.hours")} optional>
        <Controller
          control={control}
          name="hours"
          render={({ field: { value, onChange } }) => (
            <ChoiceChips
              options={WORKING_HOURS}
              value={value}
              onChange={onChange}
              allowClear
            />
          )}
        />
      </FormSection>
      <FormSection label={t("tradeForm.newWork")}>
        <Controller
          control={control}
          name="acceptingWork"
          render={({ field: { value, onChange } }) => (
            <ToggleRow
              label={t("tradeForm.accepting")}
              hint={t("tradeForm.acceptingHint")}
              value={value}
              onChange={onChange}
            />
          )}
        />
      </FormSection>
      <FormSection label={t("tradeForm.emergency")} optional>
        <Controller
          control={control}
          name="emergency"
          render={({ field: { value, onChange } }) => (
            <ChoiceChips
              options={EMERGENCY_OPTIONS}
              value={value}
              onChange={onChange}
            />
          )}
        />
        {emergency && emergency !== "none" ? (
          <TextLine
            control={control}
            name="emergencyNote"
            placeholder={t("tradeForm.emergencyPlaceholder")}
          />
        ) : null}
      </FormSection>
      <FormSection
        label={t("tradeForm.responseTime")}
        hint={t("tradeForm.responseTimeHint")}
        optional
      >
        <Controller
          control={control}
          name="responseTime"
          render={({ field: { value, onChange } }) => (
            <ChoiceChips
              options={RESPONSE_TIMES}
              value={value}
              onChange={onChange}
              allowClear
            />
          )}
        />
      </FormSection>
    </>
  );
}

const languageOptions = LANGUAGES.map((item) => ({ value: item, label: item }));

export function ContactSection({ control, errors }: SectionProps) {
  const { t } = useT();
  const parts = useFormPartStyles();
  const methods = useWatch({ control, name: "contactMethods" });
  return (
    <>
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
      {needsPhone(methods) ? (
        <FormSection
          label={t("project.phoneNumber")}
          hint={t("tradeForm.phoneHint")}
          error={errors.phone?.message}
        >
          <Controller
            control={control}
            name="phone"
            render={({ field: { value, onChange, onBlur } }) => (
              <FormInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="+1 (555) 123-4567"
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                autoComplete="tel"
              />
            )}
          />
        </FormSection>
      ) : null}
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
      <Text style={[parts.note, parts.noteSpaced]}>
        {t("tradeForm.contactNote")}
      </Text>
    </>
  );
}

export function DetailsSection({ control }: SectionProps) {
  const { t } = useT();
  return (
    <>
      <FormSection
        label={t("tradeForm.about")}
        hint={t("tradeForm.aboutHint")}
        optional
      >
        <Controller
          control={control}
          name="about"
          render={({ field: { value, onChange, onBlur } }) => (
            <FormInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={t("tradeForm.aboutPlaceholder")}
              multiline
              maxLength={2000}
            />
          )}
        />
      </FormSection>
      <FormSection label={t("trade.sections.projectTypes")} optional>
        <Controller
          control={control}
          name="projectTypes"
          render={({ field: { value, onChange } }) => (
            <MultiChips
              options={PROJECT_TYPES}
              value={value}
              onChange={onChange}
            />
          )}
        />
      </FormSection>
      <FormSection label={t("trade.sections.estimates")} optional>
        <Controller
          control={control}
          name="estimate"
          render={({ field: { value, onChange } }) => (
            <ChoiceChips
              options={ESTIMATE_POLICIES}
              value={value}
              onChange={onChange}
              allowClear
            />
          )}
        />
        <TextLine
          control={control}
          name="estimateNote"
          placeholder={t("tradeForm.estimatePlaceholder")}
        />
      </FormSection>
      <FormSection label={t("trade.sections.warranty")} optional>
        <Controller
          control={control}
          name="warranty"
          render={({ field: { value, onChange } }) => (
            <ChoiceChips
              options={WARRANTY_OPTIONS}
              value={value}
              onChange={onChange}
              allowClear
            />
          )}
        />
        <TextLine
          control={control}
          name="warrantyTerms"
          placeholder={t("tradeForm.warrantyPlaceholder")}
        />
      </FormSection>
      <FormSection label={t("trade.sections.permits")} optional>
        <Controller
          control={control}
          name="permits"
          render={({ field: { value, onChange } }) => (
            <ChoiceChips
              options={PERMIT_OPTIONS}
              value={value}
              onChange={onChange}
              allowClear
            />
          )}
        />
      </FormSection>
      <FormSection label={t("tradeForm.workBy")} optional>
        <Controller
          control={control}
          name="workBy"
          render={({ field: { value, onChange } }) => (
            <ChoiceChips
              options={WORK_BY_OPTIONS}
              value={value}
              onChange={onChange}
              allowClear
            />
          )}
        />
      </FormSection>
    </>
  );
}
