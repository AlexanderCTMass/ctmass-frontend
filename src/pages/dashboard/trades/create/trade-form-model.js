import { MAX_EXPERIENCE_YEARS, US_STATE_CODES } from 'src/constants/trade-options';
import { findTrade } from 'src/constants/trade-taxonomy';
import { detailsToInput, emptyDetailsInput } from 'src/utils/trade-details';

export const emptyCredentials = () => ({
    license: { on: false, state: '', type: '', number: '', expiry: '', documentUrl: '' },
    insurance: { on: false, type: '', expiry: '', documentUrl: '' }
});

const toMonth = (date) => {
    if (!date) return '';
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

export const monthToDate = (value) => {
    const match = String(value || '').match(/^(\d{4})-(\d{2})$/);
    if (!match) return null;
    return new Date(Number(match[1]), Number(match[2]), 0, 23, 59, 59);
};

export const emptyFormDetails = () => ({ ...emptyDetailsInput('other'), hasPricing: false });

export const formDetailsFromTrade = (details) => {
    if (!details) return emptyFormDetails();
    return { ...detailsToInput(details), hasPricing: details.rates !== null };
};

export const credentialsFromTrade = (details) => {
    const empty = emptyCredentials();
    if (!details) return empty;
    const { license, insurance } = details;
    return {
        license: license
            ? {
                on: true,
                state: license.state,
                type: license.type,
                number: license.number,
                expiry: toMonth(license.expiresAt),
                documentUrl: license.documentUrl
            }
            : empty.license,
        insurance: insurance
            ? {
                on: true,
                type: insurance.type,
                expiry: toMonth(insurance.expiresAt),
                documentUrl: insurance.documentUrl
            }
            : empty.insurance
    };
};

export const credentialsPayload = (credentials) => ({
    license: credentials.license.on
        ? {
            state: credentials.license.state,
            type: credentials.license.type.trim(),
            number: credentials.license.number.trim(),
            expiresAt: monthToDate(credentials.license.expiry),
            documentUrl: credentials.license.documentUrl || ''
        }
        : null,
    insurance: credentials.insurance.on
        ? {
            state: '',
            type: credentials.insurance.type,
            number: '',
            expiresAt: monthToDate(credentials.insurance.expiry),
            documentUrl: credentials.insurance.documentUrl || ''
        }
        : null
});

export const credentialsChanged = (before, after) => JSON.stringify(before) !== JSON.stringify(after);

const isPast = (month) => {
    const date = monthToDate(month);
    return Boolean(date && date.getTime() < Date.now());
};

export const validateTradeForm = (values, strict) => {
    const errors = {};
    const { details, credentials } = values;
    if (details.experienceYears !== null && details.experienceYears > MAX_EXPERIENCE_YEARS) {
        errors.experienceYears = 'Enter a realistic number of years.';
    }
    const rates = details.rates;
    if (rates.min !== null && rates.max !== null && rates.max < rates.min) {
        errors.rateMax = 'The upper rate must be higher.';
    }
    if (credentials.license.on) {
        if (!US_STATE_CODES.includes(credentials.license.state)) {
            errors.licenseState = 'Choose a state.';
        }
        if (credentials.license.type.trim().length < 2) {
            errors.licenseType = 'Enter the license type.';
        }
        if (isPast(credentials.license.expiry)) {
            errors.licenseExpiry = 'This date has passed.';
        }
    }
    if (credentials.insurance.on) {
        if (!credentials.insurance.type) {
            errors.insuranceType = 'Choose the insurance type.';
        }
        if (isPast(credentials.insurance.expiry)) {
            errors.insuranceExpiry = 'This date has passed.';
        }
    }
    if (strict) {
        if (details.experienceYears === null) {
            errors.experienceYears = 'Add your years in this trade.';
        }
        if (details.services.length === 0) {
            errors.services = 'Pick at least one service.';
        }
        if (!details.hasPricing) {
            errors.pricingModel = 'Choose how you price this trade.';
        }
        if (details.availability.days.length === 0) {
            errors.days = 'Choose when you work.';
        }
    }
    return errors;
};

export const groupForLabel = (label) => findTrade(label)?.groupId ?? 'other';

export const parseAreas = (text) => String(text || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);

export const findDictionarySpecialty = (specialties, label) => {
    if (!specialties?.allIds?.length || !label) return null;
    const trade = findTrade(label);
    const names = [label, ...(trade ? [trade.label, ...trade.aliases] : [])].map((item) => item.toLowerCase());
    const id = specialties.allIds.find((key) => names.includes(String(specialties.byId[key]?.label || '').toLowerCase()));
    return id ? specialties.byId[id] : null;
};
