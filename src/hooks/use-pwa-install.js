import { useCallback, useEffect, useState } from 'react';

let deferredPrompt = window.__ctmassInstallPrompt || null;
let installed = false;

const subscribers = new Set();

const notify = () => subscribers.forEach((fn) => fn());

window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    window.__ctmassInstallPrompt = event;
    notify();
});

window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    window.__ctmassInstallPrompt = null;
    installed = true;
    notify();
});

export const isStandaloneDisplay = () =>
    window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;

export const isIosDevice = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);

export const usePwaInstall = () => {
    const [, setRevision] = useState(0);

    useEffect(() => {
        const update = () => setRevision((value) => value + 1);
        subscribers.add(update);
        return () => {
            subscribers.delete(update);
        };
    }, []);

    const promptInstall = useCallback(async () => {
        if (!deferredPrompt) {
            return null;
        }

        const event = deferredPrompt;
        event.prompt();
        const choice = await event.userChoice;

        deferredPrompt = null;
        window.__ctmassInstallPrompt = null;
        if (choice?.outcome === 'accepted') {
            installed = true;
        }
        notify();

        return choice?.outcome || null;
    }, []);

    return {
        canInstall: Boolean(deferredPrompt),
        isInstalled: installed || isStandaloneDisplay(),
        isIos: isIosDevice(),
        promptInstall
    };
};
