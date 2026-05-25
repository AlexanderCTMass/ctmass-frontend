import * as Yup from 'yup';

export const normalizeUSPhone = (value) => {
    if (!value) return null;
    const digits = String(value).replace(/\D/g, '');
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
    return null;
};

export const phonesMatch = (a, b) => {
    const na = normalizeUSPhone(a);
    const nb = normalizeUSPhone(b);
    return Boolean(na && nb && na === nb);
};

export const formatUSPhoneForDisplay = (value) => {
    const normalized = normalizeUSPhone(value);
    if (!normalized) return value || '';
    const d = normalized.replace(/\D/g, '').slice(-10);
    return `+1 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
};

export const isValidUSPhone = (value) => {
    if (!value) return true;
    const digits = value.replace(/\D/g, '');
    return digits.length === 11 && digits.startsWith('1');
};

export const phoneYupSchema = Yup.string().test(
    'us-phone',
    'Enter a valid US phone number (+1 and 10 digits)',
    isValidUSPhone
);

export const phoneRequiredYupSchema = Yup.string()
    .required('Phone number is required')
    .test('us-phone', 'Enter a valid US phone number (+1 and 10 digits)', isValidUSPhone);
