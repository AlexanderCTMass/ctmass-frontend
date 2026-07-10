import { useCallback, useEffect } from 'react';
import { onMessage } from 'firebase/messaging';
import toast from 'react-hot-toast';
import { messagingPromise } from 'src/libs/firebase';
import { pushSupported, registerPushToken, requestAndEnablePush } from 'src/libs/push';

// Headless behaviour for the logged-in user:
//  - silently (re)register the token when permission is already granted,
//  - ask for permission right after the app is installed,
//  - surface foreground push messages as toasts.
export const usePushNotifications = (userId) => {
    const supported = pushSupported();

    const enablePush = useCallback(() => requestAndEnablePush(userId), [userId]);

    useEffect(() => {
        if (supported && userId && Notification.permission === 'granted') {
            registerPushToken(userId).catch((error) => {
                console.error('[push] token register failed', error);
            });
        }
    }, [supported, userId]);

    useEffect(() => {
        if (!supported || !userId) {
            return undefined;
        }
        const onInstalled = () => { requestAndEnablePush(userId).catch(() => {}); };
        window.addEventListener('appinstalled', onInstalled);
        return () => window.removeEventListener('appinstalled', onInstalled);
    }, [supported, userId]);

    useEffect(() => {
        if (!supported) {
            return undefined;
        }
        let unsubscribe = () => {};
        messagingPromise.then((messaging) => {
            if (!messaging) {
                return;
            }
            unsubscribe = onMessage(messaging, (payload) => {
                const data = payload?.data || {};
                const title = payload?.notification?.title || data.title;
                const body = payload?.notification?.body || data.body;
                if (title || body) {
                    toast(`${title || ''}${title && body ? ' — ' : ''}${body || ''}`.trim());
                }
            });
        });
        return () => unsubscribe();
    }, [supported]);

    return { supported, enablePush };
};
