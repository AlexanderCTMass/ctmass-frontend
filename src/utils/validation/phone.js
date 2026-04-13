import * as Yup from 'yup';

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
