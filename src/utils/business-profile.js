import { BUSINESS_ROLES, BUSINESS_STRUCTURES, CREW_SIZES } from 'src/constants/trade-options';

const record = (value) => (value && typeof value === 'object' ? value : {});

const strings = (value) => (Array.isArray(value)
    ? value.filter((item) => typeof item === 'string' && item.length > 0)
    : []);

const pick = (options, value) => (options.some((item) => item.value === value) ? value : '');

export const EMPTY_BUSINESS = {
    structure: '',
    crewSize: '',
    usesSubcontractors: false,
    role: '',
    foundedYear: null,
    languages: [],
    website: '',
    paymentMethods: []
};

export const readBusiness = (data = {}) => {
    const raw = record(data.business);
    const founded = raw.foundedYear;
    return {
        structure: pick(BUSINESS_STRUCTURES, raw.structure),
        crewSize: pick(CREW_SIZES, raw.crewSize),
        usesSubcontractors: raw.usesSubcontractors === true,
        role: pick(BUSINESS_ROLES, raw.role),
        foundedYear: typeof founded === 'number' && Number.isFinite(founded) ? founded : null,
        languages: strings(raw.languages),
        website: typeof raw.website === 'string' ? raw.website : '',
        paymentMethods: strings(raw.paymentMethods)
    };
};

export const readContactSettings = (data = {}) => {
    const raw = data.contactSettings;
    if (!raw || typeof raw !== 'object') {
        return { showPhone: true, showEmail: false, preferred: 'message' };
    }
    const preferred = raw.preferred === 'phone' || raw.preferred === 'email' ? raw.preferred : 'message';
    return {
        showPhone: raw.showPhone === true,
        showEmail: raw.showEmail === true,
        preferred
    };
};

export const normalizeWebsite = (value) => {
    const trimmed = String(value || '').trim();
    if (!trimmed) return '';
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

export const isValidWebsite = (value) => {
    const trimmed = String(value || '').trim();
    return trimmed === '' || /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(trimmed);
};

export const yearsInBusiness = (business) => {
    if (!business?.foundedYear) return null;
    return Math.max(0, new Date().getFullYear() - business.foundedYear);
};
