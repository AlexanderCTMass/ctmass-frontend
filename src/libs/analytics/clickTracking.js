import { trackClick } from './behavior';

export const enableClickTracking = () => {
    const handler = (e) => {
        const el = e.target.closest('[data-track]');
        if (!el) return;

        const elName = el.dataset.track;
        if (elName) trackClick(elName);
    };

    document.addEventListener('click', handler, { passive: true });
    return () => document.removeEventListener('click', handler, { passive: true });
};