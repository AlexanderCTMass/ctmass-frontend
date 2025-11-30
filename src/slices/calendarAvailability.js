import { createSlice } from "@reduxjs/toolkit";
import { DEFAULT_CALENDAR_SETTINGS } from "src/api/calendarAvailability";

const initialState = {
    settings: null,
    events: [],
    recurringEvents: [],
    loading: false,
    settingsSaving: false,
    eventsLoading: false,
    recurringLoading: false,
    error: null,
    initialized: false
};

const slice = createSlice({
    name: 'calendarAvailability',
    initialState,
    reducers: {
        startLoading(state) {
            state.loading = true;
            state.error = null;
        },
        finishLoading(state) {
            state.loading = false;
            state.initialized = true;
        },
        setError(state, action) {
            state.error = action.payload || null;
            state.loading = false;
            state.settingsSaving = false;
            state.eventsLoading = false;
            state.recurringLoading = false;
        },
        setSettings(state, action) {
            state.settings = action.payload || DEFAULT_CALENDAR_SETTINGS;
            state.loading = false;
            state.settingsSaving = false;
            state.initialized = true;
        },
        startSaveSettings(state) {
            state.settingsSaving = true;
            state.error = null;
        },
        setEvents(state, action) {
            state.events = action.payload || [];
            state.eventsLoading = false;
            state.loading = false;
            state.initialized = true;
        },
        setRecurringEvents(state, action) {
            state.recurringEvents = action.payload || [];
            state.recurringLoading = false;
            state.loading = false;
        },
        startEventsLoading(state) {
            state.eventsLoading = true;
            state.error = null;
        },
        startRecurringLoading(state) {
            state.recurringLoading = true;
            state.error = null;
        },
        addEvent(state, action) {
            state.events = [...state.events, action.payload];
            state.eventsLoading = false;
        },
        updateEvent(state, action) {
            const updated = action.payload;
            state.events = state.events.map((event) =>
                event.id === updated.id ? updated : event
            );
            state.eventsLoading = false;
        },
        removeEvent(state, action) {
            state.events = state.events.filter((event) => event.id !== action.payload);
            state.eventsLoading = false;
        },
        addRecurringEvent(state, action) {
            state.recurringEvents = [action.payload, ...state.recurringEvents];
            state.recurringLoading = false;
        },
        updateRecurringEvent(state, action) {
            const updated = action.payload;
            state.recurringEvents = state.recurringEvents.map((recurring) =>
                recurring.id === updated.id ? updated : recurring
            );
            state.recurringLoading = false;
        },
        removeRecurringEvent(state, action) {
            state.recurringEvents = state.recurringEvents.filter((recurring) => recurring.id !== action.payload);
            state.recurringLoading = false;
        },
        reset(state) {
            Object.assign(state, initialState);
        }
    }
});

export const calendarAvailabilityActions = slice.actions;
export const { reducer: calendarAvailabilityReducer } = slice;