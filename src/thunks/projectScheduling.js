import { startOfDay, addDays, endOfDay } from 'date-fns';
import toast from 'react-hot-toast';
import { calendarAvailabilityApi } from 'src/api/calendarAvailability';
import { aggregateEventsForRange, generateAvailableSlots } from 'src/pages/calendarAvailability/utils';
import { projectSchedulingApi } from 'src/api/projects/project-scheduling-api';
import { projectSchedulingActions } from 'src/slices/projectScheduling';
import { ProjectStatus } from 'src/enums/project-state';

const toPlainSlots = (slots = []) => slots.map((slot) => ({
    id: slot.id || null,
    start: slot.start,
    end: slot.end,
    dayKey: slot.dayKey || null,
    timeOfDay: slot.timeOfDay || null
}));

const DEFAULT_DAYS = 7;

const loadScheduling = ({ projectId, customerId, contractorId, projectTitle, projectStatus }) => async (dispatch) => {
    if (!projectId) {
        return;
    }

    dispatch(projectSchedulingActions.ensureEntry({ projectId }));
    dispatch(projectSchedulingActions.startLoading({ projectId }));

    try {
        if (projectStatus === ProjectStatus.AWAITING_SCHEDULE && customerId && contractorId) {
            await projectSchedulingApi.ensureInitialized(projectId, {
                customerId,
                contractorId,
                projectTitle
            });
        }

        const state = await projectSchedulingApi.getState(projectId);
        dispatch(projectSchedulingActions.setScheduling({
            projectId,
            config: state.config,
            proposals: state.proposals
        }));
    } catch (error) {
        console.error('[ProjectScheduling] loadScheduling error', error);
        dispatch(projectSchedulingActions.setError({ projectId, error: error.message }));
    }
};

const fetchAvailability = ({
    projectId,
    contractorId,
    startDate,
    days = DEFAULT_DAYS
}) => async (dispatch) => {
    if (!projectId || !contractorId) {
        return;
    }

    const start = startOfDay(startDate || new Date());
    const end = endOfDay(addDays(start, Math.max(days - 1, 0)));

    dispatch(projectSchedulingActions.startAvailabilityLoading({
        projectId,
        startDate: start.toISOString(),
        days
    }));

    try {
        const [settings, events, recurringEvents] = await Promise.all([
            calendarAvailabilityApi.getSettings(contractorId),
            calendarAvailabilityApi.getEvents(contractorId),
            calendarAvailabilityApi.getRecurringEvents(contractorId)
        ]);

        const combined = aggregateEventsForRange(events, recurringEvents, start, end);
        const slots = generateAvailableSlots(
            settings,
            combined,
            start,
            end,
            { bufferMinutes: settings?.bufferTime || 0 }
        );

        dispatch(projectSchedulingActions.setAvailability({
            projectId,
            slots,
            settings,
            events: combined,
            recurringEvents,
            range: {
                start: start.toISOString(),
                end: end.toISOString()
            }
        }));
    } catch (error) {
        console.error('[ProjectScheduling] fetchAvailability error', error);
        dispatch(projectSchedulingActions.setAvailabilityError({
            projectId,
            error: error.message
        }));
    }
};

const selectMethod = ({ projectId, method, context }) => async (dispatch) => {
    if (!projectId || !method) {
        return;
    }

    dispatch(projectSchedulingActions.startConfigUpdate({ projectId }));

    try {
        const config = await projectSchedulingApi.setMethod(projectId, method, context);
        dispatch(projectSchedulingActions.setConfig({ projectId, config }));

        if (method === 'verbal') {
            toast.success('Parties have opted for verbal coordination.');
        } else {
            toast.success('Calendar scheduling activated.');
        }
    } catch (error) {
        console.error('[ProjectScheduling] selectMethod error', error);
        dispatch(projectSchedulingActions.setError({ projectId, error: error.message }));
        toast.error(error.message || 'Failed to update scheduling method');
    }
};

const submitProposal = ({
    projectId,
    slots,
    comment,
    proposerId,
    proposerRole
}) => async (dispatch) => {
    if (!projectId || !proposerId || !Array.isArray(slots) || slots.length === 0) {
        toast.error('Please select at least one slot');
        return false;
    }

    dispatch(projectSchedulingActions.startSubmitting({ projectId }));

    try {
        const proposal = await projectSchedulingApi.createProposal(projectId, {
            proposerId,
            proposerRole,
            slots: toPlainSlots(slots),
            comment
        });

        dispatch(projectSchedulingActions.addProposal({ projectId, proposal }));
        toast.success('Scheduling proposal sent.');
        return true;
    } catch (error) {
        console.error('[ProjectScheduling] submitProposal error', error);
        toast.error(error.message || 'Failed to send proposal');
        return false;
    } finally {
        dispatch(projectSchedulingActions.finishSubmitting({ projectId }));
    }
};

const acceptProposal = ({
    projectId,
    proposalId,
    slot,
    context
}) => async (dispatch) => {
    if (!projectId || !proposalId || !slot) {
        return false;
    }

    dispatch(projectSchedulingActions.startResponding({ projectId }));

    try {
        const { config, proposal } = await projectSchedulingApi.confirmProposal(
            projectId,
            proposalId,
            slot,
            context
        );

        dispatch(projectSchedulingActions.setConfig({ projectId, config }));
        dispatch(projectSchedulingActions.updateProposal({ projectId, proposal }));
        toast.success('Meeting scheduled successfully.');
        return true;
    } catch (error) {
        console.error('[ProjectScheduling] acceptProposal error', error);
        toast.error(error.message || 'Failed to confirm meeting');
        return false;
    } finally {
        dispatch(projectSchedulingActions.finishResponding({ projectId }));
    }
};

const declineProposal = ({
    projectId,
    proposalId,
    reason,
    respondedBy,
    alternative
}) => async (dispatch) => {
    if (!projectId || !proposalId) {
        return false;
    }

    dispatch(projectSchedulingActions.startResponding({ projectId }));

    try {
        const proposal = await projectSchedulingApi.updateProposalStatus(
            projectId,
            proposalId,
            'declined',
            {
                reason,
                respondedBy
            }
        );

        dispatch(projectSchedulingActions.updateProposal({ projectId, proposal }));
        toast.success('Proposal declined.');

        if (alternative?.slots?.length) {
            await dispatch(submitProposal({
                projectId,
                slots: alternative.slots,
                comment: alternative.comment || '',
                proposerId: respondedBy,
                proposerRole: 'contractor'
            }));
        }

        return true;
    } catch (error) {
        console.error('[ProjectScheduling] declineProposal error', error);
        toast.error(error.message || 'Failed to decline proposal');
        return false;
    } finally {
        dispatch(projectSchedulingActions.finishResponding({ projectId }));
    }
};

const cancelMeeting = ({
    projectId,
    reason,
    cancelledBy,
    contractorId
}) => async (dispatch) => {
    if (!projectId || !reason) {
        toast.error('Reason is required to cancel a meeting');
        return false;
    }

    dispatch(projectSchedulingActions.startCancelling({ projectId }));

    try {
        const config = await projectSchedulingApi.cancelMeeting(projectId, {
            reason,
            cancelledBy,
            contractorId
        });

        dispatch(projectSchedulingActions.setConfig({ projectId, config }));
        toast.success('Meeting cancelled. Scheduling reopened.');
        return true;
    } catch (error) {
        console.error('[ProjectScheduling] cancelMeeting error', error);
        toast.error(error.message || 'Failed to cancel meeting');
        return false;
    } finally {
        dispatch(projectSchedulingActions.finishCancelling({ projectId }));
    }
};

export const projectSchedulingThunks = {
    loadScheduling,
    fetchAvailability,
    selectMethod,
    submitProposal,
    acceptProposal,
    declineProposal,
    cancelMeeting
};