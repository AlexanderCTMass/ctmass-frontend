import { lazy } from 'react';

const RELOAD_FLAG = 'chunk-reload-attempted';

const isChunkLoadError = (error) => {
    if (!error) {
        return false;
    }
    const message = error.message || '';
    return (
        error.name === 'ChunkLoadError' ||
        /Loading chunk [\d]+ failed/i.test(message) ||
        /Loading CSS chunk/i.test(message) ||
        /Failed to fetch dynamically imported module/i.test(message) ||
        /error loading dynamically imported module/i.test(message)
    );
};

const retryImport = (factory, retries = 2, interval = 600) =>
    new Promise((resolve, reject) => {
        factory()
            .then((module) => {
                window.sessionStorage.removeItem(RELOAD_FLAG);
                resolve(module);
            })
            .catch((error) => {
                if (retries > 0) {
                    setTimeout(() => {
                        retryImport(factory, retries - 1, interval).then(resolve, reject);
                    }, interval);
                    return;
                }

                if (isChunkLoadError(error) && !window.sessionStorage.getItem(RELOAD_FLAG)) {
                    window.sessionStorage.setItem(RELOAD_FLAG, '1');
                    window.location.reload();
                    return;
                }

                reject(error);
            });
    });

export const lazyWithRetry = (factory) => lazy(() => retryImport(factory));
