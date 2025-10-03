const CONSENT_KEY = 'cookiesConsent';
const PREFERENCES_KEY = 'cookiesPreferences';
const TTL = 365 * 24 * 60 * 60 * 1_000;

const now = () => Date.now()

export function getConsent() {
    try {
        const raw = localStorage.getItem(CONSENT_KEY);
        const ts = +localStorage.getItem(`${CONSENT_KEY}:ts`);
        if (!raw || !ts || now() - ts > TTL) return null;
        return raw;
    } catch { return null; }
}

export function getPrefs() {
    try {
        const raw = localStorage.getItem(PREFERENCES_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

function save(key, value) {
    localStorage.setItem(key, value);
    localStorage.setItem(`${CONSENT_KEY}:ts`, String(now()));
}

export function acceptAll() {
    save(CONSENT_KEY, 'accepted');
    localStorage.setItem(PREFERENCES_KEY,
        JSON.stringify({ analytics: true, marketing: true, ts: now() }));
}

export function declineAll() {
    save(CONSENT_KEY, 'declined');
    localStorage.setItem(PREFERENCES_KEY,
        JSON.stringify({ analytics: false, marketing: false, ts: now() }));
}

export function saveCustom(prefs) {
    save(CONSENT_KEY, 'custom');
    localStorage.setItem(PREFERENCES_KEY,
        JSON.stringify({ ...prefs, ts: now() }));
}

// на будущее, когда добавим Analytics/Marketing куки, функция для проверки
export function safeSetItem(key, value, category = 'essential') {
    if (category === 'essential') {
        localStorage.setItem(key, value);
    } else {
        const prefs = getPrefs();
        if (category === 'analytics' && prefs?.analytics) localStorage.setItem(key, value);
        if (category === 'marketing' && prefs?.marketing) localStorage.setItem(key, value);
    }
}