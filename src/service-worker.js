/* eslint-disable no-restricted-globals */
import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';

clientsClaim();

// App shell — precache all build assets (JS/CSS/HTML with content hashes).
precacheAndRoute(self.__WB_MANIFEST);

// SPA navigations → serve index.html from the precache.
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
    ({ request, url }) => {
        if (request.mode !== 'navigate') {
            return false;
        }
        // Leave Firebase Hosting / auth helper paths (/__/...) alone.
        if (url.pathname.startsWith('/_')) {
            return false;
        }
        // Don't fall back for direct file requests (e.g. /manifest.json).
        if (url.pathname.match(fileExtensionRegexp)) {
            return false;
        }
        return true;
    },
    createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

// Same-origin images — cache with background refresh.
registerRoute(
    ({ request, url }) =>
        url.origin === self.location.origin && request.destination === 'image',
    new StaleWhileRevalidate({
        cacheName: 'images',
        plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 })]
    })
);

// Google Fonts (stylesheet + font files).
registerRoute(
    ({ url }) => url.origin === 'https://fonts.googleapis.com',
    new StaleWhileRevalidate({ cacheName: 'google-fonts-stylesheets' })
);
registerRoute(
    ({ url }) => url.origin === 'https://fonts.gstatic.com',
    new CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
            new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 })
        ]
    })
);

// Firestore, Firebase Auth, Stripe, App Check, analytics and every POST are
// intentionally NOT handled here — they fall through to the network untouched.

// Update flow: the app posts SKIP_WAITING when the user accepts a new version.
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
