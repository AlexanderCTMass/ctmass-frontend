export const APP_STORE_URL = 'https://apps.apple.com/us/app/ctmass-homeowners-pros/id6806073536';

export const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.ctmass.app';

export const detectMobilePlatform = () => {
    if (typeof navigator === 'undefined') return 'other';
    const ua = navigator.userAgent || '';
    if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
    if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) return 'ios';
    if (/android/i.test(ua)) return 'android';
    return 'other';
};
