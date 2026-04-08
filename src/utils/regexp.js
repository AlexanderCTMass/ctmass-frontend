export const PHONE_NUMBER_REGEXP = /^(\+1|1)?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
export const CHPU_REGEXP = /^[a-z0-9-]+$/;
export const EMAIL_REGEXP = /^\S+@\S+\.\S+$/;

export const generateUrlFromStr = (str) => {
    return str === undefined ? '' : str.replace(/[^a-z0-9_]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
}

export const formatUSPhoneForWhatsApp = (phone) => {
    let cleanedPhone = phone.replace(/\D/g, '');

    if (!cleanedPhone.startsWith('1')) {
        cleanedPhone = '1' + cleanedPhone;
    }

    if (cleanedPhone.length !== 11) {
        return null;
    }

    return cleanedPhone;
};