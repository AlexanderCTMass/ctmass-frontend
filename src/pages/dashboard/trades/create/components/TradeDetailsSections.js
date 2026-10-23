import { useMemo } from 'react';
import {
    Alert,
    Autocomplete,
    Box,
    Card,
    CardContent,
    Chip,
    FormControlLabel,
    InputAdornment,
    MenuItem,
    Stack,
    Switch,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from '@mui/material';
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
    US_STATE_CODES,
    WARRANTY_OPTIONS,
    WORKING_HOURS,
    WORK_BY_OPTIONS,
    defaultBasisFor,
    modelTakesRate,
    tierBadgeLabel,
    tierFor
} from 'src/constants/trade-options';
import { servicesForTrade } from 'src/constants/trade-services';

export const MAX_SERVICES = 12;

export const INSURANCE_TYPES = [
    'General liability',
    "Workers' compensation",
    "General liability + workers' comp",
    'Commercial auto'
];

const toggleSx = {
    flexWrap: 'wrap',
    gap: 1,
    '& .MuiToggleButtonGroup-grouped': {
        borderRadius: '14px !important',
        border: '1px solid',
        borderColor: 'divider',
        px: 2,
        textTransform: 'none',
        m: 0
    }
};

function SectionCard({ title, subtitle, children }) {
    return (
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                <Stack spacing={3}>
                    <Stack spacing={0.5}>
                        <Typography variant="h6" fontWeight={700}>
                            {title}
                        </Typography>
                        {subtitle ? (
                            <Typography variant="body2" color="text.secondary">
                                {subtitle}
                            </Typography>
                        ) : null}
                    </Stack>
                    {children}
                </Stack>
            </CardContent>
        </Card>
    );
}

function FieldLabel({ children, optional }) {
    return (
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {children}
            {optional ? (
                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    Optional
                </Typography>
            ) : null}
        </Typography>
    );
}

const digits = (value, max = 6) => String(value ?? '').replace(/[^0-9]/g, '').slice(0, max);
const numOrNull = (value) => (value === '' || value === null || value === undefined ? null : Number(value));

function MoneyField({ label, value, onChange, error, helperText }) {
    return (
        <TextField
            label={label}
            fullWidth
            value={value ?? ''}
            onChange={(event) => onChange(numOrNull(digits(event.target.value)))}
            error={Boolean(error)}
            helperText={error || helperText}
            inputProps={{ inputMode: 'numeric' }}
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
        />
    );
}

export function TradeServicesExperienceCard({ specialtyLabel, details, onChange, errors = {} }) {
    const suggestions = useMemo(() => servicesForTrade(specialtyLabel), [specialtyLabel]);
    const years = details.experienceYears;
    const tier = years === null ? null : tierFor(years);

    return (
        <SectionCard
            title="Services and experience"
            subtitle="Experience counts only for this trade, not your total career or years in business."
        >
            <Stack spacing={1.5}>
                <FieldLabel>Services you offer</FieldLabel>
                <Autocomplete
                    multiple
                    freeSolo
                    options={suggestions}
                    value={details.services}
                    onChange={(_, next) => {
                        const cleaned = [];
                        next.forEach((item) => {
                            const label = String(item).trim().replace(/\s+/g, ' ');
                            if (label.length >= 2 && !cleaned.some((entry) => entry.toLowerCase() === label.toLowerCase())) {
                                cleaned.push(label);
                            }
                        });
                        onChange({ services: cleaned.slice(0, MAX_SERVICES) });
                    }}
                    renderTags={(value, getTagProps) => value.map((option, index) => (
                        <Chip label={option} {...getTagProps({ index })} key={option} />
                    ))}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            placeholder={details.services.length ? '' : 'Pick from the list or type your own'}
                            error={Boolean(errors.services)}
                            helperText={errors.services || `${details.services.length}/${MAX_SERVICES} selected. Press Enter to add your own.`}
                        />
                    )}
                />
            </Stack>

            <Stack spacing={1.5}>
                <FieldLabel>Years in {specialtyLabel || 'this trade'}</FieldLabel>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                    <TextField
                        value={years ?? ''}
                        onChange={(event) => onChange({ experienceYears: numOrNull(digits(event.target.value, 2)) })}
                        placeholder="e.g. 8"
                        error={Boolean(errors.experienceYears)}
                        helperText={errors.experienceYears || 'Shown as provided by you. CTMASS does not verify experience.'}
                        inputProps={{ inputMode: 'numeric', max: MAX_EXPERIENCE_YEARS }}
                        InputProps={{ endAdornment: <InputAdornment position="end">years</InputAdornment> }}
                        sx={{ maxWidth: { sm: 220 } }}
                    />
                    {tier ? (
                        <Chip
                            label={tierBadgeLabel(years)}
                            variant="outlined"
                            sx={{ borderColor: tier.color, color: tier.color, fontWeight: 800, letterSpacing: '0.04em' }}
                        />
                    ) : null}
                </Stack>
            </Stack>
        </SectionCard>
    );
}

export function TradePricingCard({ details, onChange, errors = {} }) {
    const rates = details.rates;
    const model = details.hasPricing ? rates.model : '';
    const takesRate = modelTakesRate(model);
    const showsFees = model !== '' && model !== 'not_provided';
    const setRates = (patch) => onChange({ rates: { ...rates, ...patch }, hasPricing: true });

    return (
        <SectionCard title="Pricing" subtitle="Each trade has its own pricing. Amounts are optional.">
            <Stack spacing={1.5}>
                <FieldLabel>How do you price this trade?</FieldLabel>
                <ToggleButtonGroup
                    exclusive
                    value={model}
                    onChange={(_, next) => next && setRates({ model: next, basis: defaultBasisFor(next) })}
                    sx={toggleSx}
                >
                    {PRICING_MODELS.map((option) => (
                        <ToggleButton key={option.value} value={option.value}>
                            {option.label}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
                {errors.pricingModel ? (
                    <Typography variant="caption" color="error">{errors.pricingModel}</Typography>
                ) : null}
            </Stack>

            {takesRate ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                    <MoneyField label="Rate from" value={rates.min} onChange={(min) => setRates({ min })} />
                    <MoneyField
                        label="Rate to"
                        value={rates.max}
                        onChange={(max) => setRates({ max })}
                        error={errors.rateMax}
                    />
                    <TextField
                        select
                        label="Rate basis"
                        value={rates.basis}
                        onChange={(event) => setRates({ basis: event.target.value })}
                    >
                        {RATE_BASES.map((option) => (
                            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                        ))}
                    </TextField>
                </Box>
            ) : null}

            {showsFees ? (
                <>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                        <MoneyField
                            label="Minimum charge (optional)"
                            value={rates.minimumCharge}
                            onChange={(minimumCharge) => setRates({ minimumCharge })}
                        />
                        <MoneyField
                            label="Service call / diagnostic fee (optional)"
                            value={rates.serviceCallFee}
                            onChange={(serviceCallFee) => setRates({ serviceCallFee })}
                        />
                    </Box>
                    <FormControlLabel
                        control={(
                            <Switch
                                checked={rates.serviceCallCredited}
                                onChange={(event) => setRates({ serviceCallCredited: event.target.checked })}
                            />
                        )}
                        label="Service call fee is credited toward the repair"
                    />
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                        <TextField
                            label="Travel fee (optional)"
                            value={rates.travelFee}
                            onChange={(event) => setRates({ travelFee: event.target.value })}
                            placeholder="Free within 15 miles, then $1/mile"
                            inputProps={{ maxLength: 160 }}
                        />
                        <TextField
                            label="After-hours / emergency pricing (optional)"
                            value={rates.afterHours}
                            onChange={(event) => setRates({ afterHours: event.target.value })}
                            placeholder="+50% after 6pm, $150 dispatch"
                            inputProps={{ maxLength: 160 }}
                        />
                        <TextField
                            label="Materials and parts (optional)"
                            value={rates.materials}
                            onChange={(event) => setRates({ materials: event.target.value })}
                            placeholder="Parts billed separately"
                            inputProps={{ maxLength: 160 }}
                        />
                        <TextField
                            label="Pricing note (optional)"
                            value={rates.note}
                            onChange={(event) => setRates({ note: event.target.value })}
                            inputProps={{ maxLength: 160 }}
                        />
                    </Box>
                </>
            ) : null}

            <Typography variant="caption" color="text.secondary">
                {PRICE_DISCLAIMER}
            </Typography>
        </SectionCard>
    );
}

export function TradeAvailabilityCard({ details, onChange, errors = {} }) {
    const availability = details.availability;
    const setAvailability = (patch) => onChange({ availability: { ...availability, ...patch } });

    return (
        <SectionCard title="Availability and response" subtitle="Homeowners see your schedule and how fast you usually reply.">
            <Stack spacing={1.5}>
                <FieldLabel>Working days</FieldLabel>
                <ToggleButtonGroup
                    value={availability.days}
                    onChange={(_, next) => setAvailability({ days: next })}
                    sx={toggleSx}
                >
                    {AVAILABILITY_DAYS.map((option) => (
                        <ToggleButton key={option.value} value={option.value}>{option.label}</ToggleButton>
                    ))}
                </ToggleButtonGroup>
                {errors.days ? <Typography variant="caption" color="error">{errors.days}</Typography> : null}
            </Stack>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <TextField
                    select
                    label="Working hours (optional)"
                    value={availability.hours}
                    onChange={(event) => setAvailability({ hours: event.target.value })}
                >
                    <MenuItem value="">Not specified</MenuItem>
                    {WORKING_HOURS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    select
                    label="Typical response time (optional)"
                    value={details.responseTime}
                    onChange={(event) => onChange({ responseTime: event.target.value })}
                    helperText="Your own commitment. Shown as set by contractor."
                >
                    <MenuItem value="">Not specified</MenuItem>
                    {RESPONSE_TIMES.map((option) => (
                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    select
                    label="Emergency service"
                    value={availability.emergency}
                    onChange={(event) => setAvailability({ emergency: event.target.value })}
                >
                    {EMERGENCY_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                </TextField>
                {availability.emergency !== 'none' ? (
                    <TextField
                        label="Emergency hours, fee and coverage"
                        value={availability.emergencyNote}
                        onChange={(event) => setAvailability({ emergencyNote: event.target.value })}
                        inputProps={{ maxLength: 160 }}
                    />
                ) : null}
            </Box>

            <FormControlLabel
                control={(
                    <Switch
                        checked={availability.acceptingWork}
                        onChange={(event) => setAvailability({ acceptingWork: event.target.checked })}
                    />
                )}
                label="Accepting new projects"
            />
        </SectionCard>
    );
}

export function TradeCredentialsCard({ credentials, onChange, errors = {} }) {
    const { license, insurance } = credentials;
    const setLicense = (patch) => onChange({ ...credentials, license: { ...license, ...patch } });
    const setInsurance = (patch) => onChange({ ...credentials, insurance: { ...insurance, ...patch } });

    return (
        <SectionCard
            title="License and insurance"
            subtitle="Homeowners see “License provided” or “Insurance provided”. CTMASS does not verify documents."
        >
            <FormControlLabel
                control={<Switch checked={license.on} onChange={(event) => setLicense({ on: event.target.checked })} />}
                label="I have a license for this trade"
            />
            {license.on ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '140px 1fr 1fr 180px' }, gap: 2 }}>
                    <TextField
                        select
                        label="State"
                        value={license.state}
                        onChange={(event) => setLicense({ state: event.target.value })}
                        error={Boolean(errors.licenseState)}
                        helperText={errors.licenseState}
                    >
                        {US_STATE_CODES.map((code) => (
                            <MenuItem key={code} value={code}>{code}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="License type"
                        value={license.type}
                        onChange={(event) => setLicense({ type: event.target.value })}
                        error={Boolean(errors.licenseType)}
                        helperText={errors.licenseType}
                        inputProps={{ maxLength: 80 }}
                    />
                    <TextField
                        label="License number (optional)"
                        value={license.number}
                        onChange={(event) => setLicense({ number: event.target.value })}
                        inputProps={{ maxLength: 40 }}
                    />
                    <TextField
                        label="Expires (optional)"
                        type="month"
                        value={license.expiry}
                        onChange={(event) => setLicense({ expiry: event.target.value })}
                        error={Boolean(errors.licenseExpiry)}
                        helperText={errors.licenseExpiry}
                        InputLabelProps={{ shrink: true }}
                    />
                </Box>
            ) : null}

            <FormControlLabel
                control={<Switch checked={insurance.on} onChange={(event) => setInsurance({ on: event.target.checked })} />}
                label="I carry insurance"
            />
            {insurance.on ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 180px' }, gap: 2 }}>
                    <TextField
                        select
                        label="Insurance type"
                        value={insurance.type}
                        onChange={(event) => setInsurance({ type: event.target.value })}
                        error={Boolean(errors.insuranceType)}
                        helperText={errors.insuranceType}
                    >
                        {INSURANCE_TYPES.map((type) => (
                            <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Valid through (optional)"
                        type="month"
                        value={insurance.expiry}
                        onChange={(event) => setInsurance({ expiry: event.target.value })}
                        error={Boolean(errors.insuranceExpiry)}
                        helperText={errors.insuranceExpiry}
                        InputLabelProps={{ shrink: true }}
                    />
                </Box>
            ) : null}

            <Alert severity="info" variant="outlined">
                You can add a photo of the document in the CTMASS app. Documents stay private.
            </Alert>
        </SectionCard>
    );
}

export function TradeWorkPolicyCard({ details, onChange }) {
    const policy = details.workPolicy;
    const setPolicy = (patch) => onChange({ workPolicy: { ...policy, ...patch } });

    return (
        <SectionCard title="How you work" subtitle="Optional, but it answers the questions homeowners ask before calling.">
            <Stack spacing={1.5}>
                <FieldLabel optional>Project types</FieldLabel>
                <ToggleButtonGroup
                    value={policy.projectTypes}
                    onChange={(_, next) => setPolicy({ projectTypes: next })}
                    sx={toggleSx}
                >
                    {PROJECT_TYPES.map((option) => (
                        <ToggleButton key={option.value} value={option.value}>{option.label}</ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Stack>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <TextField
                    select
                    label="Estimates (optional)"
                    value={policy.estimate}
                    onChange={(event) => setPolicy({ estimate: event.target.value })}
                >
                    <MenuItem value="">Not specified</MenuItem>
                    {ESTIMATE_POLICIES.map((option) => (
                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    label="Estimate details (optional)"
                    value={policy.estimateNote}
                    onChange={(event) => setPolicy({ estimateNote: event.target.value })}
                    placeholder="Written estimate within 48 hours"
                    inputProps={{ maxLength: 160 }}
                />
                <TextField
                    select
                    label="Workmanship warranty (optional)"
                    value={policy.warranty}
                    onChange={(event) => setPolicy({ warranty: event.target.value })}
                >
                    <MenuItem value="">Not specified</MenuItem>
                    {WARRANTY_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    label="Warranty terms (optional)"
                    value={policy.warrantyTerms}
                    onChange={(event) => setPolicy({ warrantyTerms: event.target.value })}
                    inputProps={{ maxLength: 160 }}
                />
                <TextField
                    select
                    label="Permits (optional)"
                    value={policy.permits}
                    onChange={(event) => setPolicy({ permits: event.target.value })}
                >
                    <MenuItem value="">Not specified</MenuItem>
                    {PERMIT_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    select
                    label="Who does the work (optional)"
                    value={policy.workBy}
                    onChange={(event) => setPolicy({ workBy: event.target.value })}
                >
                    <MenuItem value="">Not specified</MenuItem>
                    {WORK_BY_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                </TextField>
            </Box>
        </SectionCard>
    );
}
