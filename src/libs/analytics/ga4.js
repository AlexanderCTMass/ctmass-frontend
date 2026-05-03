import { analytics } from 'src/libs/firebase';
import { logEvent } from 'firebase/analytics';

export const trackEvent = (eventName, params = {}) => {
    if (!analytics) return;
    logEvent(analytics, eventName, params);
};
