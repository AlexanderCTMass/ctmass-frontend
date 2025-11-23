import { createSlice } from '@reduxjs/toolkit';

const createEntryState = () => ({
    loading: false,
    error: null,
    config: null,
    configUpdating: false,
    proposals: [],
    availability: {
        loading: false,
        error: null,
        slots: [],
        settings: null,
        events: [],
        recurringEvents: [],
        range: null,
        startDate: null,
        days: 0
    },
    submitting: false,
    responding: false,
    cancelling: false
});

const initialState = {
    entries: {}
};

const ensureEntry = (state, projectId) => {
    if (!state.entries[projectId]) {
        state.entries[projectId] = createEntryState();
    }
    return state.entries[projectId];
};

const sortProposals = (proposals) =>
    [...proposals].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

const slice = createSlice({
    name: 'projectScheduling',
    initialState,
    reducers: {
        ensureEntry(state, action) {
            ensureEntry(state, action.payload.projectId);
        },
        startLoading(state, action) {
            const entry = ensureEntry(state, action.payload.projectId);
            entry.loading = true;
            entry.error = null;
        },
        setScheduling(state, action) {
            const entry = ensureEntry(state, action.payload.projectId);
            entry.loading = false;
            entry.error = null;
            entry.config = action.payload.config || null;
            entry.proposals = sortProposals(action.payload.proposals || []);
        },
        setError(state, action) {
            const entry = ensureEntry(state, action.payload.projectId);
            entry.loading = false;
            entry.configUpdating = false;
            entry.error = action.payload.error || null;
        },
        startAvailabilityLoading(state, action) {
            const entry = ensureEntry(state, action.payload.projectId);
            entry.availability.loading = true;
            entry.availability.error = null;
            entry.availability.startDate = action.payload.startDate || null;
            entry.availability.days = action.payload.days || 0;
        },
        setAvailability(state, action) {
            const entry = ensureEntry(state, action.payload.projectId);
            entry.availability.loading = false;
            entry.availability.error = null;
            entry.availability.slots = action.payload.slots || [];
            entry.availability.settings = action.payload.settings || null;
            entry.availability.events = action.payload.events || [];
            entry.availability.recurringEvents = action.payload.recurringEvents || [];
            entry.availability.range = action.payload.range || null;
        },
        setAvailabilityError(state, action) {
            const entry = ensureEntry(state, action.payload.projectId);
            entry.availability.loading = false;
            entry.availability.error = action.payload.error || null;
        },
        startSubmitting(state, action) {
            const entry = ensureEntry(state, action.payload.projectId);
            entry.submitting = true;
        },
        finishSubmitting(state, action) {
            const entry = ensureEntry(state, action.payload.projectId);
            entry.submitting = false;
        },
        addProposal(state, action) {
            const entry = ensureEntry(state, action.payload.projectId);
            entry.proposals = sortProposals([action.payload.proposal, ...entry.proposals]);
        },
        updateProposal(state, action) {
            const entry = ensureEntry(state, action.payload.projectId);
            entry.proposals = sortProposals(entry.proposals.map((proposal) =>
                proposal.id === action.payload.proposal.id
                    ? action.payload.proposal
                    : proposal
            ));
        },
        startResponding(state, action) {
            const entry = ensureEntry(state, action.payload.projectId);
            entry.responding = true;
        },
        finishResponding(state, action) {
            const entry = ensureEntry(state, action.payload.projectId);
            entry.responding = false;
        },
        startCancelling(state, action) {
            const entry = ensureEntry(state, action.payload.projectId);
            entry.cancelling = true;
        },
        finishCancelling(state, action) {
            const entry = ensureEntry(state, action.payload.projectId);
            entry.cancelling = false;
        },
        startConfigUpdate(state, action) {
            const entry = ensureEntry(state, action.payload.projectId);
            entry.configUpdating = true;
        },
        setConfig(state, action) {
            const entry = ensureEntry(state, action.payload.projectId);
            entry.configUpdating = false;
            entry.config = action.payload.config || null;
        }
    }
});

export const projectSchedulingActions = slice.actions;
export const { reducer: projectSchedulingReducer } = slice;