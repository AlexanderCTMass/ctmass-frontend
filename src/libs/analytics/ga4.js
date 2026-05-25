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
