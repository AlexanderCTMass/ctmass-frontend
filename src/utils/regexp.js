export const PHONE_NUMBER_REGEXP = /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
export const CHPU_REGEXP = /^[a-z0-9-]+$/;

export const generateUrlFromStr = (str) => {
    return str === undefined ? '' : str.replace(/[^a-z0-9_]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
}