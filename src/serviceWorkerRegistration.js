// This optional code is used to register a service worker (CRA PWA template).
// register() is not called by default.

const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

const UPDATE_CHECK_INTERVAL = 15 * 60 * 1000;

let reloading = false;
let reloadPending = false;

function reloadNow() {
    if (reloading) {
        return;
    }
    reloading = true;
    window.location.reload();
}

function reloadWhenIdle() {
    if (reloadPending) {
        return;
    }
    reloadPending = true;

    if (document.visibilityState === 'hidden') {
        reloadNow();
        return;
    }

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            reloadNow();
        }
    });
}

function watchForNewVersions(registration) {
    const hadController = navigator.serviceWorker.controller !== null;

    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (hadController) {
            reloadWhenIdle();
        }
    });

    const checkForUpdate = () => {
        registration.update().catch(() => {});
    };

    window.setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            checkForUpdate();
        }
    });
}

export function register(config) {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
        const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
        if (publicUrl.origin !== window.location.origin) {
            return;
        }

        window.addEventListener('load', () => {
            const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

            if (isLocalhost) {
                checkValidServiceWorker(swUrl, config);
                navigator.serviceWorker.ready.then(() => {
                    // eslint-disable-next-line no-console
                    console.log('This web app is being served cache-first by a service worker.');
                });
            } else {
                registerValidSW(swUrl, config);
            }
        });
    }
}

function registerValidSW(swUrl, config) {
    navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
            watchForNewVersions(registration);

            registration.onupdatefound = () => {
                const installingWorker = registration.installing;
                if (installingWorker == null) {
                    return;
                }
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            if (config && config.onUpdate) {
                                config.onUpdate(registration);
                            }
                        } else if (config && config.onSuccess) {
                            config.onSuccess(registration);
                        }
                    }
                };
            };
        })
        .catch((error) => {
            // eslint-disable-next-line no-console
            console.error('Error during service worker registration:', error);
        });
}

function checkValidServiceWorker(swUrl, config) {
    fetch(swUrl, { headers: { 'Service-Worker': 'script' } })
        .then((response) => {
            const contentType = response.headers.get('content-type');
            if (
                response.status === 404 ||
                (contentType != null && contentType.indexOf('javascript') === -1)
            ) {
                navigator.serviceWorker.ready.then((registration) => {
                    registration.unregister().then(() => {
                        window.location.reload();
                    });
                });
            } else {
                registerValidSW(swUrl, config);
            }
        })
        .catch(() => {
            // eslint-disable-next-line no-console
            console.log('No internet connection found. App is running in offline mode.');
        });
}

export function unregister() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
            .then((registration) => {
                registration.unregister();
            })
            .catch((error) => {
                // eslint-disable-next-line no-console
                console.error(error.message);
            });
    }
}
