import toast from 'react-hot-toast';
import { calendarAvailabilityApi } from 'src/api/calendarAvailability';
import { calendarAvailabilityActions } from 'src/slices/calendarAvailability';

const initializeCalendar = (userId) => async (dispatch, getState) => {
    if (!userId) {
        return;
    }

    const { calendarAvailability } = getState();
    if (calendarAvailability.initialized) {
        return;
    }

    dispatch(calendarAvailabilityActions.startLoading());

    try {
        const [settings, events, recurringEvents] = await Promise.all([
            calendarAvailabilityApi.getSettings(userId),
            calendarAvailabilityApi.getEvents(userId),
            calendarAvailabilityApi.getRecurringEvents(userId)
        ]);

        dispatch(calendarAvailabilityActions.setSettings(settings));
        dispatch(calendarAvailabilityActions.setEvents(events));
        dispatch(calendarAvailabilityActions.setRecurringEvents(recurringEvents));
        dispatch(calendarAvailabilityActions.finishLoading());
    } catch (error) {
        console.error('[CalendarAvailability] initialize error', error);
        dispatch(calendarAvailabilityActions.setError(error.message));
        toast.error('Не удалось загрузить календарь');
    }
};

const refreshSettings = (userId) => async (dispatch) => {
    if (!userId) {
        return;
    }
    dispatch(calendarAvailabilityActions.startLoading());
    try {
        const settings = await calendarAvailabilityApi.getSettings(userId);
        dispatch(calendarAvailabilityActions.setSettings(settings));
        dispatch(calendarAvailabilityActions.finishLoading());
    } catch (error) {
        console.error('[CalendarAvailability] refresh settings error', error);
        dispatch(calendarAvailabilityActions.setError(error.message));
        toast.error('Failed to update calendar settings');
    }
};

const saveSettings = (userId, settings) => async (dispatch) => {
    if (!userId) {
        return;
    }
    dispatch(calendarAvailabilityActions.startSaveSettings());

    try {
        const saved = await calendarAvailabilityApi.saveSettings(userId, settings);
        dispatch(calendarAvailabilityActions.setSettings(saved));
        toast.success('Calendar settings saved');
    } catch (error) {
        console.error('[CalendarAvailability] save settings error', error);
        dispatch(calendarAvailabilityActions.setError(error.message));
        toast.error('Failed to save settings');
    }
};

const refreshEvents = (userId) => async (dispatch) => {
    if (!userId) {
        return;
    }
    dispatch(calendarAvailabilityActions.startEventsLoading());
    try {
        const events = await calendarAvailabilityApi.getEvents(userId);
        dispatch(calendarAvailabilityActions.setEvents(events));
    } catch (error) {
        console.error('[CalendarAvailability] refresh events error', error);
        dispatch(calendarAvailabilityActions.setError(error.message));
        toast.error('Failed to update events');
    }
};

const createEvent = (userId, event) => async (dispatch) => {
    if (!userId) {
        return;
    }

    dispatch(calendarAvailabilityActions.startEventsLoading());

    try {
        const saved = await calendarAvailabilityApi.createEvent(userId, event);
        dispatch(calendarAvailabilityActions.addEvent(saved));
        toast.success('Event added');
    } catch (error) {
        console.error('[CalendarAvailability] create event error', error);
        dispatch(calendarAvailabilityActions.setError(error.message));
        toast.error('Failed to create event');
    }
};

const updateEvent = (userId, eventId, update) => async (dispatch) => {
    if (!userId || !eventId) {
        return;
    }

    dispatch(calendarAvailabilityActions.startEventsLoading());

    try {
        const saved = await calendarAvailabilityApi.updateEvent(userId, eventId, update);
        dispatch(calendarAvailabilityActions.updateEvent(saved));
        toast.success('The event has been updated.');
    } catch (error) {
        console.error('[CalendarAvailability] update event error', error);
        dispatch(calendarAvailabilityActions.setError(error.message));
        toast.error('Failed to update event');
    }
};

const deleteEvent = (userId, eventId) => async (dispatch) => {
    if (!userId || !eventId) {
        return;
    }

    dispatch(calendarAvailabilityActions.startEventsLoading());

    try {
        await calendarAvailabilityApi.deleteEvent(userId, eventId);
        dispatch(calendarAvailabilityActions.removeEvent(eventId));
        toast.success('The event has been deleted.');
    } catch (error) {
        console.error('[CalendarAvailability] delete event error', error);
        dispatch(calendarAvailabilityActions.setError(error.message));
        toast.error('Failed to delete event');
    }
};

const createRecurringEvent = (userId, recurring) => async (dispatch) => {
    if (!userId) {
        return;
    }

    dispatch(calendarAvailabilityActions.startRecurringLoading());

    try {
        const saved = await calendarAvailabilityApi.createRecurringEvent(userId, recurring);
        dispatch(calendarAvailabilityActions.addRecurringEvent(saved));
        toast.success('A recurring event has been added.');
    } catch (error) {
        console.error('[CalendarAvailability] create recurring error', error);
        dispatch(calendarAvailabilityActions.setError(error.message));
        toast.error('Failed to create recurring event');
    }
};

const updateRecurringEvent = (userId, recurringId, update) => async (dispatch) => {
    if (!userId || !recurringId) {
        return;
    }

    dispatch(calendarAvailabilityActions.startRecurringLoading());

    try {
        const saved = await calendarAvailabilityApi.updateRecurringEvent(userId, recurringId, update);
        dispatch(calendarAvailabilityActions.updateRecurringEvent(saved));
        toast.success('Recurring event updated');
    } catch (error) {
        console.error('[CalendarAvailability] update recurring error', error);
        dispatch(calendarAvailabilityActions.setError(error.message));
        toast.error('Failed to update recurring event');
    }
};

const deleteRecurringEvent = (userId, recurringId) => async (dispatch) => {
    if (!userId || !recurringId) {
        return;
    }

    dispatch(calendarAvailabilityActions.startRecurringLoading());

    try {
        await calendarAvailabilityApi.deleteRecurringEvent(userId, recurringId);
        dispatch(calendarAvailabilityActions.removeRecurringEvent(recurringId));
        toast.success('The recurring event has been removed');
    } catch (error) {
        console.error('[CalendarAvailability] delete recurring error', error);
        dispatch(calendarAvailabilityActions.setError(error.message));
        toast.error('Failed to delete recurring event');
    }
};

const bulkBlockDays = (userId, payload) => async (dispatch) => {
    if (!userId) {
        return;
    }

    dispatch(calendarAvailabilityActions.startEventsLoading());

    try {
        const refreshedEvents = await calendarAvailabilityApi.bulkBlockDays(userId, payload);
        dispatch(calendarAvailabilityActions.setEvents(refreshedEvents));
        toast.success('Selected days are blocked');
    } catch (error) {
        console.error('[CalendarAvailability] bulk block error', error);
        dispatch(calendarAvailabilityActions.setError(error.message));
        toast.error('Failed to block days');
    }
};

const resetCalendar = () => (dispatch) => {
    dispatch(calendarAvailabilityActions.reset());
};

export const calendarAvailabilityThunks = {
    initializeCalendar,
    refreshSettings,
    saveSettings,
    refreshEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    createRecurringEvent,
    updateRecurringEvent,
    deleteRecurringEvent,
    bulkBlockDays,
    resetCalendar
};