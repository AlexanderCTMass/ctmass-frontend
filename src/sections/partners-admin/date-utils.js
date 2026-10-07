export const AD_TIME_ZONE = 'America/New_York';
export const AD_TIME_ZONE_LABEL = 'US Eastern time';

const pad = (value) => String(value).padStart(2, '0');

const zoneParts = new Intl.DateTimeFormat('en-US', {
    timeZone: AD_TIME_ZONE,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
});

const partsOf = (ms) => {
    const result = {};
    zoneParts.formatToParts(new Date(ms)).forEach((part) => {
        if (part.type !== 'literal') result[part.type] = Number(part.value);
    });
    return result;
};

const zoneOffset = (ms) => {
    const p = partsOf(ms);
    return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(ms / 1000) * 1000;
};

const zonedMidnight = (y, m, d) => {
    const wall = Date.UTC(y, m - 1, d);
    const first = wall - zoneOffset(wall);
    return wall - zoneOffset(first);
};

export const toDateInput = (ms) => {
    if (!ms) return '';
    const p = partsOf(ms);
    return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
};

export const startOfDateInput = (value) => {
    if (!value) return null;
    const [y, m, d] = value.split('-').map(Number);
    return zonedMidnight(y, m, d);
};

export const endOfDateInput = (value) => {
    if (!value) return null;
    const [y, m, d] = value.split('-').map(Number);
    const next = new Date(Date.UTC(y, m - 1, d + 1));
    return zonedMidnight(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate());
};

export const lastDayInput = (endAtExclusive) => (endAtExclusive ? toDateInput(endAtExclusive - 1) : '');

export const addDaysInput = (value, days) => {
    const [y, m, d] = value.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d + days));
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
};

const shortFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: AD_TIME_ZONE });
const longFormat = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: AD_TIME_ZONE
});

export const formatPeriod = (startAt, endAt) => {
    if (!startAt || !endAt) return '—';
    const sameYear = partsOf(startAt).year === partsOf(endAt - 1).year;
    return `${(sameYear ? shortFormat : longFormat).format(new Date(startAt))} – ${longFormat.format(new Date(endAt - 1))}`;
};

export const daysBetween = (startAt, endAt) =>
    startAt && endAt ? Math.max(0, Math.round((endAt - startAt) / 86400000)) : 0;

export const formatNumber = (value) => new Intl.NumberFormat('en-US').format(Math.round(value || 0));

export const formatUsd = (value) =>
    value === null || value === undefined || value === ''
        ? '—'
        : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
