import { useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'loginLinkSends';
const MAX_ATTEMPTS = 3;
const COOLDOWNS_MS = [0, 60 * 1000, 10 * 60 * 1000, 0];

const loadState = () => {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
};

const saveState = (state) => {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // ignore
    }
};

const formatRemaining = (ms) => {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    if (totalSeconds < 60) return `${totalSeconds}s`;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return seconds ? `${minutes}m ${seconds}s` : `${minutes}m`;
};

export const useLoginLinkThrottle = (email) => {
    const [state, setState] = useState(loadState);
    const [now, setNow] = useState(() => Date.now());

    const key = (email || '').trim().toLowerCase();
    const entry = state[key] || { attempts: 0, lastSentAt: 0 };

    const cooldownMs = COOLDOWNS_MS[entry.attempts] || 0;
    const elapsed = now - entry.lastSentAt;
    const remainingMs = entry.attempts > 0 && elapsed < cooldownMs ? cooldownMs - elapsed : 0;

    const isOnCooldown = remainingMs > 0;
    const isExhausted = entry.attempts >= MAX_ATTEMPTS && elapsed >= cooldownMs;

    useEffect(() => {
        if (!isOnCooldown) return undefined;
        const id = setInterval(() => setNow(Date.now()), 500);
        return () => clearInterval(id);
    }, [isOnCooldown]);

    const registerSend = useCallback(() => {
        if (!key) return;
        setState((prev) => {
            const prevEntry = prev[key] || { attempts: 0, lastSentAt: 0 };
            const nextEntry = {
                attempts: Math.min(prevEntry.attempts + 1, MAX_ATTEMPTS),
                lastSentAt: Date.now()
            };
            const next = { ...prev, [key]: nextEntry };
            saveState(next);
            return next;
        });
        setNow(Date.now());
    }, [key]);

    const message = useMemo(() => {
        if (isOnCooldown) {
            const remaining = formatRemaining(remainingMs);
            if (entry.attempts === 1) {
                return `A login link has already been sent. You can request another one in ${remaining}.`;
            }
            return `A login link has been sent. You can request another one in ${remaining}.`;
        }
        if (isExhausted) {
            return 'You have reached the maximum number of login link requests for this email. Please try another login method or contact support.';
        }
        return null;
    }, [isOnCooldown, isExhausted, remainingMs, entry.attempts]);

    return {
        canSend: !!key && !isOnCooldown && !isExhausted,
        isOnCooldown,
        isExhausted,
        remainingMs,
        attemptsUsed: entry.attempts,
        registerSend,
        message
    };
};
