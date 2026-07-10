/* eslint-disable no-undef */
// Background push handler for FCM. Firebase config is passed as query params on
// registration (this file is static and can't read build-time env vars).
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

const params = new URLSearchParams(self.location.search);
const firebaseConfig = {
    apiKey: params.get('apiKey'),
    authDomain: params.get('authDomain'),
    projectId: params.get('projectId'),
    storageBucket: params.get('storageBucket'),
    messagingSenderId: params.get('messagingSenderId'),
    appId: params.get('appId')
};

if (firebaseConfig.projectId && firebaseConfig.messagingSenderId) {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    // Data-only messages: build the notification here for full control.
    messaging.onBackgroundMessage((payload) => {
        const data = payload.data || {};
        self.registration.showNotification(data.title || 'CTMASS', {
            body: data.body || '',
            icon: data.icon || '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            data: { link: data.link || '/' }
        });
    });
}

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const link = (event.notification.data && event.notification.data.link) || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) {
                    client.navigate(link);
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(link);
            }
            return undefined;
        })
    );
});
