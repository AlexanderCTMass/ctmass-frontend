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
  OTHER_TRADE_LABEL,
  findTrade,
  siblingTrades,
} from "@/constants/trade-taxonomy";
import type { GeoPlace } from "@/lib/mapbox";
import {
  type TradeDetails,
  type TradeDetailsInput,
  detailsToInput,
  emptyDetailsInput,
} from "@/lib/trade-details";

const MAX_SERVICES = 12;

const money = z
  .string()
  .refine((value) => value === "" || /^\d{1,6}$/.test(value), "Numbers only.");

function baseSchema() {
  return z.object({
    title: z.string().trim().min(2, "Enter a trade name."),
    specialty: z.string().min(1, "Pick your trade."),
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
    issues.push({ path: "customSpecialty", message: "Describe your trade." });
  }
  const years = values.experienceYears;
  if (years !== "" && Number(years) > MAX_EXPERIENCE_YEARS) {
    issues.push({ path: "experienceYears", message: "Enter a realistic number of years." });
  }
  if (values.rateMin && values.rateMax && Number(values.rateMax) < Number(values.rateMin)) {
    issues.push({ path: "rateMax", message: "The upper rate must be higher." });
  }
  if (strict) {
    if (years === "") {
      issues.push({ path: "experienceYears", message: "Add your years in this trade." });
    }
    if (values.services.length === 0) {
      issues.push({ path: "services", message: "Pick at least one service." });
    }
    if (!values.pricingModel) {
      issues.push({ path: "pricingModel", message: "Choose how you price this trade." });
    }
    if (values.days.length === 0) {
      issues.push({ path: "days", message: "Choose when you work." });
    }
    if (!values.location) {
      issues.push({ path: "location", message: "Add your service location." });
    }
  }
  return issues;
}

export function tradeFormSchema(strict: boolean) {
  return baseSchema().superRefine((values, ctx) => {
    for (const issue of issuesFor(values, strict)) {
      ctx.addIssue({ code: "custom", path: [issue.path], message: issue.message });
    }
  });
}

export const STEP_FIELDS: (keyof TradeFormValues)[][] = [
  ["title", "specialty", "customSpecialty"],
  ["services", "experienceYears"],
  ["pricingModel", "rateMin", "rateMax", "minimumCharge", "serviceCallFee"],
  ["location", "radiusMiles", "days", "responseTime"],
  ["about"],
];

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

export function toFormValues(source: TradeFormSource | null): TradeFormValues {
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
  const specialty = useWatch({ control, name: "specialty" });
  return (
    <>
      <FormSection
        label="Trade name"
        hint="What homeowners see on your card, e.g. your business name plus the trade."
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
              placeholder="e.g. Mike's Plumbing"
              maxLength={80}
            />
          )}
        />
      </FormSection>
      <FormSection
        label="Primary trade"
        hint="One trade per profile. Add your other trades as separate profiles."
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
                placeholder="Describe your trade"
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
  const parts = useFormPartStyles();
  const [custom, setCustom] = useState("");
  const trade = findTrade(specialty);
  const suggestions = trade ? siblingTrades(trade).map((item) => item.label) : [];
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
        placeholder="Add your own, e.g. Panel upgrades"
        returnKeyType="done"
        maxLength={40}
        blurOnSubmit={false}
      />
      <Text style={parts.note}>
        {value.length}/{MAX_SERVICES} selected. Tap a service to remove it.
      </Text>
    </>
  );
}

export function ServicesSection({ control, errors }: SectionProps) {
  const specialty = useWatch({ control, name: "specialty" });
  const custom = useWatch({ control, name: "customSpecialty" });
  const years = useWatch({ control, name: "experienceYears" });
  const parts = useFormPartStyles();
  const label = specialty === OTHER_TRADE_LABEL ? custom : specialty;
  return (
    <>
      <FormSection
        label="Services you offer"
        hint="Specific jobs under this trade. Homeowners search for these."
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
        label={`Years in ${label || "this trade"}`}
        hint="Only hands-on experience in this trade, not total career or years in business."
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
              placeholder="e.g. 8"
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
        <Text style={parts.note}>
          Shown as provided by you. CTMASS does not verify experience.
        </Text>
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
  const parts = useFormPartStyles();
  const model = useWatch({ control, name: "pricingModel" });
  const takesRate = modelTakesRate(model);
  const showsFees = model !== "" && model !== "not_provided";
  return (
    <>
      <FormSection
        label="How do you price this trade?"
        hint="Each trade has its own pricing."
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
          label="Rate"
          hint="Enter one amount, or a range."
          error={errors.rateMin?.message ?? errors.rateMax?.message}
          optional
        >
          <View style={parts.row}>
            <View style={parts.flex}>
              <MoneyField control={control} name="rateMin" placeholder="From" />
            </View>
            <View style={parts.flex}>
              <MoneyField control={control} name="rateMax" placeholder="To" />
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
          <FormSection label="Minimum charge" optional>
            <MoneyField control={control} name="minimumCharge" placeholder="e.g. 125" />
          </FormSection>
          <FormSection label="Service call / diagnostic fee" optional>
            <MoneyField control={control} name="serviceCallFee" placeholder="e.g. 89" />
            <Controller
              control={control}
              name="serviceCallCredited"
              render={({ field: { value, onChange } }) => (
                <ToggleRow
                  label="Credited toward the repair"
                  value={value}
                  onChange={onChange}
                />
              )}
            />
          </FormSection>
          <FormSection label="Travel fee" optional>
            <TextLine control={control} name="travelFee" placeholder="e.g. Free within 15 miles, then $1/mile" />
          </FormSection>
          <FormSection label="After-hours / emergency pricing" optional>
            <TextLine control={control} name="afterHours" placeholder="e.g. +50% after 6pm, $150 dispatch" />
          </FormSection>
          <FormSection label="Materials & parts" optional>
            <TextLine control={control} name="materials" placeholder="e.g. Parts billed separately" />
          </FormSection>
          <FormSection label="Pricing note" optional>
            <TextLine control={control} name="rateNote" placeholder="Anything else homeowners should know" />
          </FormSection>
        </>
      ) : null}
      <Text style={[parts.note, parts.noteSpaced]}>{PRICE_DISCLAIMER}</Text>
    </>
  );
}

export function AreaAvailabilitySection({ control, errors }: SectionProps) {
  const parts = useFormPartStyles();
  const emergency = useWatch({ control, name: "emergency" });
  return (
    <>
      <FormSection
        label="Business location"
        hint="Used to measure distance. Homeowners only see your city and state."
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
      <FormSection label="Service radius">
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
      <FormSection label="Towns you serve" hint="Separate with commas." optional>
        <TextLine control={control} name="areas" placeholder="e.g. Hartford, West Hartford, Glastonbury" />
      </FormSection>
      <FormSection label="Working days" error={errors.days?.message}>
        <Controller
          control={control}
          name="days"
          render={({ field: { value, onChange } }) => (
            <MultiChips options={AVAILABILITY_DAYS} value={value} onChange={onChange} />
          )}
        />
      </FormSection>
      <FormSection label="Working hours" optional>
        <Controller
          control={control}
          name="hours"
          render={({ field: { value, onChange } }) => (
            <ChoiceChips options={WORKING_HOURS} value={value} onChange={onChange} allowClear />
          )}
        />
      </FormSection>
      <FormSection label="New work">
        <Controller
          control={control}
          name="acceptingWork"
          render={({ field: { value, onChange } }) => (
            <ToggleRow
              label="Accepting new projects"
              hint="Turn off when you're fully booked."
              value={value}
              onChange={onChange}
            />
          )}
        />
      </FormSection>
      <FormSection label="Emergency service" optional>
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
          <TextLine control={control} name="emergencyNote" placeholder="Hours, extra fee and coverage area" />
        ) : null}
      </FormSection>
      <FormSection
        label="Typical response time"
        hint="Your own commitment. It is labeled “Set by contractor”."
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
      <Text style={[parts.note, parts.noteSpaced]}>
        Your phone and email are managed in your profile settings.
      </Text>
    </>
  );
}

export function DetailsSection({ control }: SectionProps) {
  return (
    <>
      <FormSection label="About your work" hint="Typical projects, what makes you different." optional>
        <Controller
          control={control}
          name="about"
          render={({ field: { value, onChange, onBlur } }) => (
            <FormInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="What you do, how you work, what makes you great…"
              multiline
              maxLength={2000}
            />
          )}
        />
      </FormSection>
      <FormSection label="Project types" optional>
        <Controller
          control={control}
          name="projectTypes"
          render={({ field: { value, onChange } }) => (
            <MultiChips options={PROJECT_TYPES} value={value} onChange={onChange} />
          )}
        />
      </FormSection>
      <FormSection label="Estimates" optional>
        <Controller
          control={control}
          name="estimate"
          render={({ field: { value, onChange } }) => (
            <ChoiceChips options={ESTIMATE_POLICIES} value={value} onChange={onChange} allowClear />
          )}
        />
        <TextLine control={control} name="estimateNote" placeholder="e.g. Written estimate within 48 hours" />
      </FormSection>
      <FormSection label="Workmanship warranty" optional>
        <Controller
          control={control}
          name="warranty"
          render={({ field: { value, onChange } }) => (
            <ChoiceChips options={WARRANTY_OPTIONS} value={value} onChange={onChange} allowClear />
          )}
        />
        <TextLine control={control} name="warrantyTerms" placeholder="What's covered and what isn't" />
      </FormSection>
      <FormSection label="Permits" optional>
        <Controller
          control={control}
          name="permits"
          render={({ field: { value, onChange } }) => (
            <ChoiceChips options={PERMIT_OPTIONS} value={value} onChange={onChange} allowClear />
          )}
        />
      </FormSection>
      <FormSection label="Who does the work" optional>
        <Controller
          control={control}
          name="workBy"
          render={({ field: { value, onChange } }) => (
            <ChoiceChips options={WORK_BY_OPTIONS} value={value} onChange={onChange} allowClear />
          )}
        />
      </FormSection>
    </>
  );
}
