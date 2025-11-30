import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    writeBatch
} from 'firebase/firestore';
import { firestore } from 'src/libs/firebase';
import { createResourceId } from 'src/utils/create-resource-id';

const WEEK_DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const createDefaultIntervals = () => ([
    { start: '09:00', end: '13:00' },
    { start: '14:00', end: '18:00' }
]);

const buildDefaultWorkingDays = () => ({
    sun: { enabled: false, intervals: [{ start: '00:00', end: '00:00' }] },
    mon: { enabled: true, intervals: createDefaultIntervals() },
    tue: { enabled: true, intervals: createDefaultIntervals() },
    wed: { enabled: true, intervals: createDefaultIntervals() },
    thu: { enabled: true, intervals: createDefaultIntervals() },
    fri: { enabled: true, intervals: createDefaultIntervals() },
    sat: { enabled: false, intervals: [{ start: '00:00', end: '00:00' }] }
});

const BUILT_IN_TEMPLATES = [
    {
        key: 'standard',
        name: 'Standard working day',
        description: '09:00-18:00, break 13:00-14:00 (Mon-Fri)',
        slotDuration: 60,
        bufferTime: 15,
        minBookingNotice: 2,
        workingDays: buildDefaultWorkingDays()
    },
    {
        key: 'flex',
        name: 'Flexible schedule',
        description: 'Mon, Wed, Fri: 10:00-19:00; Tue, Thu: 12:00-20:00',
        slotDuration: 45,
        bufferTime: 10,
        minBookingNotice: 1,
        workingDays: {
            ...buildDefaultWorkingDays(),
            mon: { enabled: true, intervals: [{ start: '10:00', end: '19:00' }] },
            wed: { enabled: true, intervals: [{ start: '10:00', end: '19:00' }] },
            fri: { enabled: true, intervals: [{ start: '10:00', end: '19:00' }] },
            tue: { enabled: true, intervals: [{ start: '12:00', end: '20:00' }] },
            thu: { enabled: true, intervals: [{ start: '12:00', end: '20:00' }] }
        }
    },
    {
        key: 'intense',
        name: 'Intensive mode',
        description: 'Mon-Sat: 08:00-12:00, 13:00-17:00 (minimum buffer)',
        slotDuration: 30,
        bufferTime: 5,
        minBookingNotice: 1,
        workingDays: {
            ...buildDefaultWorkingDays(),
            mon: { enabled: true, intervals: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '17:00' }] },
            tue: { enabled: true, intervals: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '17:00' }] },
            wed: { enabled: true, intervals: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '17:00' }] },
            thu: { enabled: true, intervals: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '17:00' }] },
            fri: { enabled: true, intervals: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '17:00' }] },
            sat: { enabled: true, intervals: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '17:00' }] },
            sun: { enabled: false, intervals: [{ start: '00:00', end: '00:00' }] }
        }
    }
];

const DEFAULT_SETTINGS = {
    enabled: false,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    slotDuration: 60,
    bufferTime: 15,
    minBookingNotice: 2,
    workingDays: buildDefaultWorkingDays(),
    customTemplates: [],
    lastSavedAt: null
};

const eventCollectionRef = (userId) =>
    collection(firestore, 'profiles', userId, 'calendarEvents');

const recurringCollectionRef = (userId) =>
    collection(firestore, 'profiles', userId, 'calendarRecurring');

const settingsDocRef = (userId) =>
    doc(firestore, 'profiles', userId, 'calendar', 'settings');

const profileDocRef = (userId) =>
    doc(firestore, 'profiles', userId);

const normalizeTimestamp = (value) => {
    if (!value) return null;
    if (typeof value === 'number') return value;
    if (value.toDate) return value.toDate().getTime();
    if (value instanceof Date) return value.getTime();
    return Number(value);
};

const normalizeEvent = (docSnap) => {
    const data = docSnap.data();
    return {
        id: docSnap.id,
        title: data.title || '',
        description: data.description || '',
        category: data.category || 'meeting',
        status: data.status || 'confirmed',
        color: data.color,
        allDay: Boolean(data.allDay),
        start: normalizeTimestamp(data.start),
        end: normalizeTimestamp(data.end),
        metadata: data.metadata || {},
        createdAt: normalizeTimestamp(data.createdAt),
        updatedAt: normalizeTimestamp(data.updatedAt),
        source: 'single'
    };
};

const normalizeRecurring = (docSnap) => {
    const data = docSnap.data();
    return {
        id: docSnap.id,
        title: data.title || '',
        description: data.description || '',
        category: data.category || 'meeting',
        status: data.status || 'confirmed',
        color: data.color,
        daysOfWeek: data.daysOfWeek || [],
        startTime: data.startTime || '09:00',
        endTime: data.endTime || '10:00',
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        metadata: data.metadata || {},
        createdAt: normalizeTimestamp(data.createdAt),
        updatedAt: normalizeTimestamp(data.updatedAt),
        source: 'recurring'
    };
};

const deepMergeWorkingDays = (defaults, stored = {}) => {
    const result = {};
    WEEK_DAY_KEYS.forEach((key) => {
        const base = defaults[key] || { enabled: false, intervals: [{ start: '00:00', end: '00:00' }] };
        const overrides = stored[key] || {};
        result[key] = {
            enabled: overrides.enabled ?? base.enabled,
            intervals: Array.isArray(overrides.intervals) && overrides.intervals.length > 0
                ? overrides.intervals
                : base.intervals
        };
    });
    return result;
};

const mergeSettings = (stored) => ({
    ...DEFAULT_SETTINGS,
    ...(stored || {}),
    workingDays: deepMergeWorkingDays(DEFAULT_SETTINGS.workingDays, stored?.workingDays),
    customTemplates: Array.isArray(stored?.customTemplates) ? stored.customTemplates : [],
    lastSavedAt: normalizeTimestamp(stored?.lastSavedAt),
    timezone: stored?.timezone || DEFAULT_SETTINGS.timezone
});

const stripUndefined = (value) => JSON.parse(JSON.stringify(value));

class CalendarAvailabilityApi {
    async getSettings(userId) {
        const snap = await getDoc(settingsDocRef(userId));
        if (!snap.exists()) {
            return {
                ...DEFAULT_SETTINGS,
                templates: BUILT_IN_TEMPLATES
            };
        }

        const data = snap.data();
        return {
            ...mergeSettings(data),
            templates: BUILT_IN_TEMPLATES
        };
    }

    async saveSettings(userId, settings = {}) {
        const payload = stripUndefined({
            ...settings,
            workingDays: deepMergeWorkingDays(DEFAULT_SETTINGS.workingDays, settings.workingDays || {}),
            customTemplates: settings.customTemplates || [],
            lastSavedAt: serverTimestamp()
        });

        await setDoc(settingsDocRef(userId), payload, { merge: true });

        try {
            await updateDoc(profileDocRef(userId), {
                calendarEnabled: Boolean(settings.enabled),
                calendarSettingsUpdatedAt: serverTimestamp()
            });
        } catch (error) {
            console.warn('[CalendarAvailabilityApi] Failed to update profile with calendar flag', error);
        }

        return this.getSettings(userId);
    }

    async getEvents(userId) {
        const q = query(eventCollectionRef(userId), orderBy('start', 'asc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(normalizeEvent);
    }

    async getRecurringEvents(userId) {
        const q = query(recurringCollectionRef(userId), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(normalizeRecurring);
    }

    async createEvent(userId, event) {
        const eventId = event.id || createResourceId();
        const docRef = doc(eventCollectionRef(userId), eventId);

        const payload = stripUndefined({
            title: event.title,
            description: event.description || '',
            category: event.category || 'meeting',
            status: event.status || 'confirmed',
            color: event.color,
            allDay: Boolean(event.allDay),
            start: normalizeTimestamp(event.start),
            end: normalizeTimestamp(event.end),
            metadata: event.metadata || {},
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        await setDoc(docRef, payload, { merge: false });

        const saved = await getDoc(docRef);
        return normalizeEvent(saved);
    }

    async updateEvent(userId, eventId, update) {
        if (!eventId) {
            throw new Error('eventId is required to update an event');
        }

        const docRef = doc(eventCollectionRef(userId), eventId);
        const payload = stripUndefined({
            ...update,
            start: update.start !== undefined ? normalizeTimestamp(update.start) : undefined,
            end: update.end !== undefined ? normalizeTimestamp(update.end) : undefined,
            updatedAt: serverTimestamp()
        });

        await updateDoc(docRef, payload);

        const saved = await getDoc(docRef);
        return normalizeEvent(saved);
    }

    async deleteEvent(userId, eventId) {
        if (!eventId) {
            throw new Error('eventId is required to delete an event');
        }
        await deleteDoc(doc(eventCollectionRef(userId), eventId));
        return true;
    }

    async createRecurringEvent(userId, recurring) {
        const recurringId = recurring.id || createResourceId();
        const docRef = doc(recurringCollectionRef(userId), recurringId);

        const payload = stripUndefined({
            title: recurring.title,
            description: recurring.description || '',
            category: recurring.category || 'meeting',
            status: recurring.status || 'confirmed',
            color: recurring.color,
            daysOfWeek: Array.isArray(recurring.daysOfWeek) ? recurring.daysOfWeek : [],
            startTime: recurring.startTime || '09:00',
            endTime: recurring.endTime || '10:00',
            startDate: recurring.startDate || null,
            endDate: recurring.endDate || null,
            timezone: recurring.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
            metadata: recurring.metadata || {},
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        await setDoc(docRef, payload, { merge: false });

        const saved = await getDoc(docRef);
        return normalizeRecurring(saved);
    }

    async updateRecurringEvent(userId, recurringId, update) {
        if (!recurringId) {
            throw new Error('recurringId is required to update recurring event');
        }
        const docRef = doc(recurringCollectionRef(userId), recurringId);
        const payload = stripUndefined({
            ...update,
            updatedAt: serverTimestamp()
        });

        await updateDoc(docRef, payload);

        const saved = await getDoc(docRef);
        return normalizeRecurring(saved);
    }

    async deleteRecurringEvent(userId, recurringId) {
        if (!recurringId) {
            throw new Error('recurringId is required to delete recurring event');
        }
        await deleteDoc(doc(recurringCollectionRef(userId), recurringId));
        return true;
    }

    async bulkBlockDays(userId, { startDate, endDate, reason, category = 'blocked' }) {
        if (!startDate || !endDate) {
            throw new Error('Both startDate and endDate are required for bulk block');
        }

        const batch = writeBatch(firestore);
        const cursor = new Date(startDate);
        const stop = new Date(endDate);

        cursor.setHours(0, 0, 0, 0);
        stop.setHours(0, 0, 0, 0);

        while (cursor.getTime() <= stop.getTime()) {
            const dayId = createResourceId();
            const docRef = doc(eventCollectionRef(userId), dayId);

            batch.set(docRef, {
                title: reason || 'Blocked day',
                description: reason || 'Blocked day',
                category,
                status: 'blocked',
                color: category === 'blocked' ? '#EF4444' : '#3B82F6',
                allDay: true,
                start: cursor.getTime(),
                end: cursor.getTime() + 24 * 60 * 60 * 1000 - 1,
                metadata: {
                    reason: reason || 'Bulk block',
                    bulk: true
                },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            }, { merge: false });

            cursor.setDate(cursor.getDate() + 1);
        }

        await batch.commit();
        return this.getEvents(userId);
    }
}

export const calendarAvailabilityApi = new CalendarAvailabilityApi();
export const DEFAULT_CALENDAR_SETTINGS = {
    ...DEFAULT_SETTINGS,
    templates: BUILT_IN_TEMPLATES
};
export const CALENDAR_BUILT_IN_TEMPLATES = BUILT_IN_TEMPLATES;