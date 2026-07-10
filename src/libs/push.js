import { getToken, deleteToken } from 'firebase/messaging';
import { messagingPromise, VAPID_KEY } from 'src/libs/firebase';
import { firebaseConfig } from 'src/config';
import { cabinetApi } from 'src/api/cabinet';

// Dedicated scope so the FCM worker never replaces the app-shell SW (scope '/').
const FCM_SW_SCOPE = '/firebase-cloud-messaging-push-scope';

export const pushSupported = () =>
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'Notification' in window &&
    Boolean(VAPID_KEY);

// Firebase config is passed to the (static) messaging SW via query params.
const buildMessagingSwUrl = () => {
    const params = new URLSearchParams();
    Object.entries({
        apiKey: firebaseConfig.apiKey,
        authDomain: firebaseConfig.authDomain,
        projectId: firebaseConfig.projectId,
        storageBucket: firebaseConfig.storageBucket,
        messagingSenderId: firebaseConfig.messagingSenderId,
        appId: firebaseConfig.appId
    }).forEach(([key, value]) => {
        if (value) {
            params.set(key, value);
        }
    });
    return `/firebase-messaging-sw.js?${params.toString()}`;
};

const getMessagingSwRegistration = () =>
    navigator.serviceWorker.register(buildMessagingSwUrl(), { scope: FCM_SW_SCOPE });

// Fetches the current FCM token and persists it on the user's profile.
export const registerPushToken = async (userId) => {
    if (!pushSupported() || !userId) {
        return null;
    }
    const messaging = await messagingPromise;
    if (!messaging) {
        return null;
    }
    const swReg = await getMessagingSwRegistration();
    const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: swReg });
    if (token) {
        await cabinetApi.saveFcmToken(userId, token);
    }
    return token;
};

// Interactive opt-in: requests permission (if needed) then registers the token.
export const requestAndEnablePush = async (userId) => {
    if (!pushSupported()) {
        return { ok: false, reason: 'unsupported' };
    }
    if (Notification.permission === 'denied') {
        return { ok: false, reason: 'denied' };
    }
    if (Notification.permission === 'default') {
        const result = await Notification.requestPermission();
        if (result !== 'granted') {
            return { ok: false, reason: result };
        }
    }
    const token = await registerPushToken(userId);
    return { ok: Boolean(token), reason: token ? 'granted' : 'error' };
};

// Removes the token from this device and from the user's profile.
export const disablePush = async (userId) => {
    if (!pushSupported()) {
        return;
    }
    const messaging = await messagingPromise;
    if (!messaging) {
        return;
    }
    let token = null;
    try {
        const swReg = await getMessagingSwRegistration();
        token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: swReg });
    } catch {
        token = null;
    }
    try {
        await deleteToken(messaging);
    } catch {
        /* ignore */
    }
    if (token && userId) {
        await cabinetApi.removeFcmToken(userId, token);
    }
};
