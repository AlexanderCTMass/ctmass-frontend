import {
    addMinutes,
    differenceInMinutes,
    endOfDay,
    isBefore,
    isSameDay,
    max,
    min,
    parseISO,
    startOfDay
} from 'date-fns';

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export const EVENT_CATEGORY_COLORS = {
    availability: '#10B981',
    meeting: '#3B82F6',
    proposed: '#F59E0B',
    blocked: '#EF4444',
    break: '#9CA3AF'
};

export const EVENT_STATUS_ICONS = {
    confirmed: '🟩',
    tentative: '🟨',
    proposed: '🟨',
    blocked: '🔴',
    cancelled: '❌',
    moved: '🟦'
};

export const EVENT_CATEGORY_LABELS = {
    availability: 'Free slot',
    meeting: 'Meeting',
    proposed: 'Suggested slot',
    blocked: 'Lock',
    break: 'Break'
};

export const EVENT_STATUS_LABELS = {
    confirmed: 'Confirmed',
    tentative: 'Awaiting confirmation',
    proposed: 'Suggested',
    blocked: 'Blocked',
    cancelled: 'Canceled',
    moved: 'Moved'
};

export const timeStringToMinutes = (value) => {
    if (!value) return 0;
    const [h, m] = value.split(':').map(Number);
    return h * 60 + (m || 0);
};

export const minutesToTimeString = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export const applyTimeToDate = (date, timeString) => {
    const [h, m] = timeString.split(':').map(Number);
    const copy = new Date(date);
    copy.setHours(h, m || 0, 0, 0);
    return copy;
};

const getWorkingIntervalsForDay = (settings, date) => {
    if (!settings?.workingDays) return [];
    const key = DAY_KEYS[date.getDay()];
    const daySettings = settings.workingDays[key];
    if (!daySettings || !daySettings.enabled) {
        return [];
    }
    return (daySettings.intervals || []).map((interval) => ({
        startMinutes: timeStringToMinutes(interval.start),
        endMinutes: timeStringToMinutes(interval.end)
    })).filter(({ startMinutes, endMinutes }) => endMinutes > startMinutes);
};

export const computeWorkingMinutesForDay = (settings, date) => {
    return getWorkingIntervalsForDay(settings, date).reduce(
        (acc, interval) => acc + (interval.endMinutes - interval.startMinutes),
        0
    );
};

export const computeBusyMinutesForDay = (events, date) => {
    const start = startOfDay(date);
    const end = endOfDay(date);

    return events
        .filter((event) => isSameDay(new Date(event.start), date))
        .reduce((acc, event) => {
            const eventStart = max([new Date(event.start), start]);
            const eventEnd = min([new Date(event.end || event.start), end]);
            const minutes = differenceInMinutes(eventEnd, eventStart);
            return acc + Math.max(minutes, 0);
        }, 0);
};

export const computeDayStatus = (settings, events, date) => {
    const workingMinutes = computeWorkingMinutesForDay(settings, date);
    if (workingMinutes === 0) {
        return 'off';
    }

    const busyMinutes = computeBusyMinutesForDay(events, date);

    if (busyMinutes === 0) {
        return 'free';
    }

    if (busyMinutes >= workingMinutes) {
        return 'busy';
    }

    return 'partial';
};

export const buildDayStatusMap = (settings, events, rangeStart, rangeEnd) => {
    const map = {};
    if (!rangeStart || !rangeEnd) {
        return map;
    }

    const cursor = new Date(rangeStart);
    while (cursor <= rangeEnd) {
        const status = computeDayStatus(settings, events, cursor);
        map[cursor.toISOString().slice(0, 10)] = status;
        cursor.setDate(cursor.getDate() + 1);
    }

    return map;
};

export const expandRecurringEvents = (recurringEvents, rangeStart, rangeEnd) => {
    if (!Array.isArray(recurringEvents) || !rangeStart || !rangeEnd) {
        return [];
    }

    const occurrences = [];
    const safeRangeStart = startOfDay(rangeStart);
    const safeRangeEnd = endOfDay(rangeEnd);

    recurringEvents.forEach((recurring) => {
        if (!Array.isArray(recurring.daysOfWeek) || recurring.daysOfWeek.length === 0) {
            return;
        }

        const startDate = recurring.startDate ? startOfDay(parseISO(recurring.startDate)) : safeRangeStart;
        const untilDate = recurring.endDate ? endOfDay(parseISO(recurring.endDate)) : safeRangeEnd;

        const effectiveStart = max([startDate, safeRangeStart]);
        const effectiveEnd = min([untilDate, safeRangeEnd]);

        const cursor = new Date(effectiveStart);

        const startMinutes = timeStringToMinutes(recurring.startTime);
        const endMinutes = timeStringToMinutes(recurring.endTime);

        while (isBefore(cursor, effectiveEnd) || isSameDay(cursor, effectiveEnd)) {
            const dayKey = DAY_KEYS[cursor.getDay()];
            if (recurring.daysOfWeek.includes(dayKey)) {
                const occurrenceStart = applyTimeToDate(cursor, recurring.startTime);
                const occurrenceEnd = applyTimeToDate(cursor, recurring.endTime);

                occurrences.push({
                    id: `${recurring.id}_${cursor.toISOString().slice(0, 10)}`,
                    title: recurring.title,
                    description: recurring.description,
                    category: recurring.category,
                    status: recurring.status,
                    color: recurring.color,
                    allDay: endMinutes - startMinutes >= 24 * 60,
                    start: occurrenceStart.getTime(),
                    end: occurrenceEnd.getTime(),
                    metadata: {
                        ...recurring.metadata,
                        recurringId: recurring.id
                    },
                    source: 'recurring'
                });
            }

            cursor.setDate(cursor.getDate() + 1);
        }
    });

    return occurrences;
};

export const aggregateEventsForRange = (events = [], recurring = [], rangeStart, rangeEnd) => {
    const occurrenceEvents = expandRecurringEvents(recurring, rangeStart, rangeEnd);
    return [...events, ...occurrenceEvents];
};

export const getStatusEmoji = (status) => {
    switch (status) {
        case 'free':
            return '🟢';
        case 'partial':
            return '🟡';
        case 'busy':
            return '🔴';
        case 'off':
            return '⚫';
        default:
            return '';
    }
};

export const mapEventToFullCalendar = (event) => {
    const color = event.color || EVENT_CATEGORY_COLORS[event.category] || EVENT_CATEGORY_COLORS.meeting;

    return {
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        allDay: Boolean(event.allDay),
        backgroundColor: color,
        borderColor: color,
        textColor: '#FFFFFF',
        extendedProps: {
            description: event.description,
            category: event.category,
            status: event.status,
            metadata: event.metadata || {},
            color,
            source: event.source
        }
    };
};

const hasOverlap = (events, startMs, endMs, bufferMinutes = 0) => {
    const bufferMs = Math.max(bufferMinutes || 0, 0) * 60 * 1000;
    const slotStart = startMs - bufferMs;
    const slotEnd = endMs + bufferMs;

    return events.some((event) => {
        const eventStart = typeof event.start === 'number'
            ? event.start
            : new Date(event.start).getTime();
        const eventEndRaw = event.end ?? event.start;
        const eventEnd = typeof eventEndRaw === 'number'
            ? eventEndRaw
            : new Date(eventEndRaw).getTime();

        return slotStart < eventEnd && slotEnd > eventStart;
    });
};

export const classifyTimeOfDay = (date) => {
    const hour = date.getHours();
    if (hour < 6) {
        return 'morning';
    }
    if (hour < 12) {
        return 'morning';
    }
    if (hour < 17) {
        return 'day';
    }
    return 'evening';
};

export const generateAvailableSlots = (settings, events = [], rangeStart, rangeEnd, options = {}) => {
    if (!settings || !rangeStart || !rangeEnd) {
        return [];
    }

    const workingDays = settings.workingDays || {};
    const slotDurationMinutes = settings.slotDuration || 60;
    const bufferMinutes = options.bufferMinutes ?? settings.bufferTime ?? 0;
    const minBookingNoticeDays = settings.minBookingNotice ?? 0;
    const maxDays = Math.max(0, Math.round((rangeEnd - rangeStart) / (24 * 60 * 60 * 1000)));

    if (!workingDays || slotDurationMinutes <= 0 || maxDays < 0) {
        return [];
    }

    const busyWindows = events.map((event) => ({
        start: typeof event.start === 'number' ? event.start : new Date(event.start).getTime(),
        end: typeof event.end === 'number'
            ? event.end
            : new Date(event.end || event.start).getTime()
    }));

    const now = new Date();
    const earliestStart = new Date(Math.max(
        rangeStart.getTime(),
        now.getTime() + minBookingNoticeDays * 24 * 60 * 60 * 1000
    ));

    const results = [];
    const cursor = startOfDay(rangeStart);

    while (cursor.getTime() <= rangeEnd.getTime()) {
        const dayKey = DAY_KEYS[cursor.getDay()];
        const daySettings = workingDays[dayKey];

        if (daySettings?.enabled) {
            const intervals = getWorkingIntervalsForDay(settings, cursor);
            intervals.forEach((interval) => {
                const intervalStart = addMinutes(startOfDay(cursor), interval.startMinutes);
                const intervalEnd = addMinutes(startOfDay(cursor), interval.endMinutes);
                let slotStart = new Date(intervalStart);

                while (slotStart.getTime() < intervalEnd.getTime()) {
                    const slotEnd = addMinutes(slotStart, slotDurationMinutes);
                    if (slotEnd.getTime() > intervalEnd.getTime()) {
                        break;
                    }

                    if (slotStart.getTime() >= earliestStart.getTime()
                        && slotEnd.getTime() <= rangeEnd.getTime()
                        && !hasOverlap(busyWindows, slotStart.getTime(), slotEnd.getTime(), bufferMinutes)
                    ) {
                        const timeOfDay = classifyTimeOfDay(slotStart);
                        results.push({
                            id: `${slotStart.toISOString()}_${slotEnd.toISOString()}`,
                            start: slotStart.getTime(),
                            end: slotEnd.getTime(),
                            dayKey,
                            dateISO: slotStart.toISOString().slice(0, 10),
                            timeOfDay
                        });
                    }

                    slotStart = addMinutes(slotStart, slotDurationMinutes);
                }
            });
        }

        cursor.setDate(cursor.getDate() + 1);
    }

    results.sort((a, b) => a.start - b.start);
    return results;
};

export const findConflictingEvents = (events = [], slotStart, slotEnd, bufferMinutes = 0) => {
    const bufferMs = Math.max(bufferMinutes || 0, 0) * 60 * 1000;
    const startMs = slotStart - bufferMs;
    const endMs = slotEnd + bufferMs;

    return events.filter((event) => {
        const eventStart = typeof event.start === 'number' ? event.start : new Date(event.start).getTime();
        const eventEndRaw = event.end ?? event.start;
        const eventEnd = typeof eventEndRaw === 'number' ? eventEndRaw : new Date(eventEndRaw).getTime();
        return startMs < eventEnd && endMs > eventStart;
    });
};