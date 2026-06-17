import { analytics } from 'src/libs/firebase';
import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';

export const trackEvent = (eventName, params = {}) => {
    if (!analytics) return;
    logEvent(analytics, eventName, params);
};

export const setAnalyticsUser = (user) => {
    if (!analytics || !user?.id) return;
    setUserId(analytics, user.id);
    setUserProperties(analytics, {
        user_role: user.role || 'unknown',
        is_provider: user.role === 'WORKER' ? 'true' : 'false'
    });
};

export const clearAnalyticsUser = () => {
    if (!analytics) return;
    setUserId(analytics, null);
};

const REFERRAL_TRACKED_KEY = 'ctmass_tracked_referrals';
const REFERRAL_PENDING_KEY = 'ctmass_pending_referral';

const readTrackedSources = () => {
    try {
        const raw = window.localStorage.getItem(REFERRAL_TRACKED_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const captureReferralSource = () => {
    try {
        const source = new URLSearchParams(window.location.search).get('reqFrom');
        if (!source) return;
        if (readTrackedSources().includes(source)) return;
        window.localStorage.setItem(REFERRAL_PENDING_KEY, source);
    } catch {
    }
};

const flushReferralSource = () => {
    if (!analytics) return;
    try {
        const source = window.localStorage.getItem(REFERRAL_PENDING_KEY);
        if (!source) return;

        const tracked = readTrackedSources();
        if (!tracked.includes(source)) {
            logEvent(analytics, 'referral_source', { source });
            setUserProperties(analytics, { referral_source: source });
            window.localStorage.setItem(REFERRAL_TRACKED_KEY, JSON.stringify([...tracked, source]));
        }
        window.localStorage.removeItem(REFERRAL_PENDING_KEY);
    } catch {
    }
};

export const trackReferralSource = () => {
    captureReferralSource();
    flushReferralSource();
};
