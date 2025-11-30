import {
    addDoc,
    arrayUnion,
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc
} from 'firebase/firestore';
import { firestore } from 'src/libs/firebase';
import { createResourceId } from 'src/utils/create-resource-id';
import { calendarAvailabilityApi } from 'src/api/calendarAvailability';
import { projectsApi } from './projects-api';

const CONFIG_DOC_ID = 'config';
const DEFAULT_MAX_RESCHEDULES = 3;

const SCHEDULING_STATUS = {
    AWAITING: 'awaiting_schedule',
    MEETING_SCHEDULED: 'meeting_scheduled',
    VERBAL: 'verbal_agreement'
};

const stripUndefined = (value) => JSON.parse(JSON.stringify(value));

const normalizeTimestamp = (value) => {
    if (!value) return null;
    if (typeof value === 'number') return value;
    if (value instanceof Date) return value.getTime();
    if (typeof value.toDate === 'function') {
        return value.toDate().getTime();
    }
    return Number(value) || null;
};

const configCollectionRef = (projectId) => collection(firestore, 'projects', projectId, 'scheduling');
const configDocRef = (projectId) => doc(configCollectionRef(projectId), CONFIG_DOC_ID);
const proposalsCollectionRef = (projectId) => collection(firestore, 'projects', projectId, 'scheduling', 'proposals');
const proposalDocRef = (projectId, proposalId) => doc(proposalsCollectionRef(projectId), proposalId);

const normalizeConfig = (snapshot) => {
    if (!snapshot.exists()) {
        return null;
    }
    const data = snapshot.data();
    return {
        ...data,
        id: snapshot.id,
        status: data.status || SCHEDULING_STATUS.AWAITING,
        method: data.method ?? null,
        customerId: data.customerId ?? null,
        contractorId: data.contractorId ?? null,
        projectTitle: data.projectTitle ?? null,
        confirmedSlot: data.confirmedSlot
            ? {
                ...data.confirmedSlot,
                start: normalizeTimestamp(data.confirmedSlot.start),
                end: normalizeTimestamp(data.confirmedSlot.end),
                confirmedAt: normalizeTimestamp(data.confirmedSlot.confirmedAt)
            }
            : null,
        cancellations: Array.isArray(data.cancellations)
            ? data.cancellations.map((entry) => ({
                ...entry,
                cancelledAt: normalizeTimestamp(entry.cancelledAt)
            }))
            : [],
        cancellationCount: data.cancellationCount ?? 0,
        maxReschedules: data.maxReschedules ?? DEFAULT_MAX_RESCHEDULES,
        rescheduleCount: data.rescheduleCount ?? 0,
        createdAt: normalizeTimestamp(data.createdAt),
        updatedAt: normalizeTimestamp(data.updatedAt)
    };
};

const normalizeProposal = (snapshot) => {
    const data = snapshot.data();
    return {
        id: snapshot.id,
        projectId: data.projectId,
        proposerId: data.proposerId,
        proposerRole: data.proposerRole,
        slots: data.slots || [],
        comment: data.comment || '',
        status: data.status || 'pending',
        selectedSlot: data.selectedSlot || null,
        respondedBy: data.respondedBy || null,
        respondedAt: normalizeTimestamp(data.respondedAt),
        responseReason: data.responseReason || null,
        createdAt: normalizeTimestamp(data.createdAt),
        updatedAt: normalizeTimestamp(data.updatedAt)
    };
};

class ProjectSchedulingApi {
    async ensureInitialized(projectId, payload = {}) {
        if (!projectId) {
            throw new Error('projectId is required to initialize scheduling');
        }

        const docRef = configDocRef(projectId);
        const snapshot = await getDoc(docRef);

        if (!snapshot.exists()) {
            const configPayload = stripUndefined({
                projectId,
                projectTitle: payload.projectTitle || null,
                customerId: payload.customerId || null,
                contractorId: payload.contractorId || null,
                status: SCHEDULING_STATUS.AWAITING,
                method: payload.method || null,
                confirmedSlot: null,
                cancellationCount: 0,
                rescheduleCount: 0,
                cancellations: [],
                maxReschedules: payload.maxReschedules ?? DEFAULT_MAX_RESCHEDULES,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            await setDoc(docRef, configPayload, { merge: false });
            const fresh = await getDoc(docRef);
            return {
                created: true,
                updated: false,
                config: normalizeConfig(fresh)
            };
        }

        const existing = snapshot.data();
        const updates = {};

        if (payload.customerId && existing.customerId !== payload.customerId) {
            updates.customerId = payload.customerId;
        }
        if (payload.contractorId && existing.contractorId !== payload.contractorId) {
            updates.contractorId = payload.contractorId;
        }
        if (payload.projectTitle && existing.projectTitle !== payload.projectTitle) {
            updates.projectTitle = payload.projectTitle;
        }
        if (payload.maxReschedules && existing.maxReschedules !== payload.maxReschedules) {
            updates.maxReschedules = payload.maxReschedules;
        }
        if (payload.status && existing.status !== payload.status) {
            updates.status = payload.status;
        }

        let updated = false;
        if (Object.keys(updates).length > 0) {
            await updateDoc(docRef, {
                ...stripUndefined(updates),
                updatedAt: serverTimestamp()
            });
            updated = true;
        }

        const fresh = await getDoc(docRef);
        return {
            created: false,
            updated,
            config: normalizeConfig(fresh)
        };
    }

    async getState(projectId) {
        if (!projectId) {
            throw new Error('projectId is required to load scheduling');
        }

        const configSnap = await getDoc(configDocRef(projectId));

        const proposalsSnapshot = await getDocs(
            query(proposalsCollectionRef(projectId), orderBy('createdAt', 'desc'))
        );

        return {
            config: normalizeConfig(configSnap),
            proposals: proposalsSnapshot.docs.map((docSnap) => normalizeProposal(docSnap))
        };
    }

    async setMethod(projectId, method, context = {}) {
        if (!projectId) {
            throw new Error('projectId is required to set scheduling method');
        }

        const docRef = configDocRef(projectId);
        const snapshot = await getDoc(docRef);

        if (!snapshot.exists()) {
            throw new Error('Scheduling configuration is not initialized');
        }

        const nextStatus = method === 'verbal'
            ? SCHEDULING_STATUS.VERBAL
            : SCHEDULING_STATUS.AWAITING;

        await updateDoc(docRef, {
            method,
            status: nextStatus,
            updatedAt: serverTimestamp()
        });

        if (method === 'verbal' && context.projectId) {
            await projectsApi.updateStatus(context.projectId, 'IN_PROGRESS');
        }

        const fresh = await getDoc(docRef);
        return normalizeConfig(fresh);
    }

    async createProposal(projectId, proposal) {
        if (!projectId) {
            throw new Error('projectId is required to create proposal');
        }
        if (!Array.isArray(proposal.slots) || proposal.slots.length === 0) {
            throw new Error('At least one slot is required to create proposal');
        }

        const payload = stripUndefined({
            projectId,
            proposerId: proposal.proposerId,
            proposerRole: proposal.proposerRole || 'customer',
            slots: proposal.slots.map((slot) => ({
                start: slot.start,
                end: slot.end,
                dayKey: slot.dayKey || null,
                timeOfDay: slot.timeOfDay || null,
                availabilitySlotId: slot.id || null
            })),
            comment: proposal.comment || '',
            status: 'pending',
            selectedSlot: null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        const docRef = await addDoc(proposalsCollectionRef(projectId), payload);
        const saved = await getDoc(docRef);
        return normalizeProposal(saved);
    }

    async updateProposalStatus(projectId, proposalId, status, extra = {}) {
        if (!projectId || !proposalId) {
            throw new Error('projectId and proposalId are required to update proposal');
        }

        const docRef = proposalDocRef(projectId, proposalId);
        const snapshot = await getDoc(docRef);
        if (!snapshot.exists()) {
            throw new Error('Proposal not found');
        }

        await updateDoc(docRef, stripUndefined({
            status,
            respondedBy: extra.respondedBy || null,
            respondedAt: serverTimestamp(),
            responseReason: extra.reason || null,
            updatedAt: serverTimestamp()
        }));

        const fresh = await getDoc(docRef);
        return normalizeProposal(fresh);
    }

    async confirmProposal(projectId, proposalId, slot, context = {}) {
        if (!projectId || !proposalId) {
            throw new Error('projectId and proposalId are required to confirm proposal');
        }
        if (!slot || !slot.start || !slot.end) {
            throw new Error('Slot is required to confirm proposal');
        }
        if (!context.contractorId) {
            throw new Error('contractorId is required to confirm proposal');
        }

        const configSnapshot = await getDoc(configDocRef(projectId));
        if (!configSnapshot.exists()) {
            throw new Error('Scheduling configuration not found');
        }
        const config = normalizeConfig(configSnapshot);

        const proposalSnapshot = await getDoc(proposalDocRef(projectId, proposalId));
        if (!proposalSnapshot.exists()) {
            throw new Error('Proposal not found');
        }
        const proposalData = normalizeProposal(proposalSnapshot);

        const selectedSlot = proposalData.slots.find(
            (item) => item.start === slot.start && item.end === slot.end
        ) || {
            start: slot.start,
            end: slot.end,
            dayKey: slot.dayKey || null,
            timeOfDay: slot.timeOfDay || null
        };

        let calendarEvent = null;
        try {
            calendarEvent = await calendarAvailabilityApi.createEvent(context.contractorId, {
                title: context.projectTitle
                    ? `Project meeting: ${context.projectTitle}`
                    : 'Project meeting',
                description: context.comment || proposalData.comment || '',
                category: 'meeting',
                status: 'confirmed',
                color: '#3B82F6',
                allDay: false,
                start: slot.start,
                end: slot.end,
                metadata: {
                    projectId,
                    proposalId,
                    customerId: config.customerId || context.customerId || null,
                    contractorId: context.contractorId,
                    type: 'projectMeeting'
                }
            });
        } catch (error) {
            console.warn('[ProjectSchedulingApi] Failed to create calendar event', error);
        }

        await updateDoc(proposalDocRef(projectId, proposalId), stripUndefined({
            status: 'accepted',
            selectedSlot,
            respondedBy: context.contractorId,
            respondedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        }));

        await updateDoc(configDocRef(projectId), stripUndefined({
            status: SCHEDULING_STATUS.MEETING_SCHEDULED,
            method: 'calendar',
            confirmedSlot: {
                ...selectedSlot,
                proposalId,
                comment: context.comment || proposalData.comment || '',
                calendarEventId: calendarEvent?.id || null,
                confirmedAt: serverTimestamp(),
                createdBy: context.contractorId || null
            },
            updatedAt: serverTimestamp()
        }));

        await projectsApi.updateStatus(projectId, 'MEETING_SCHEDULED', {
            meetingScheduledAt: serverTimestamp()
        });

        const freshConfig = await getDoc(configDocRef(projectId));
        const freshProposal = await getDoc(proposalDocRef(projectId, proposalId));

        return {
            config: normalizeConfig(freshConfig),
            proposal: normalizeProposal(freshProposal),
            calendarEvent
        };
    }

    async cancelMeeting(projectId, payload) {
        if (!projectId) {
            throw new Error('projectId is required to cancel meeting');
        }

        const configRef = configDocRef(projectId);
        const configSnapshot = await getDoc(configRef);
        if (!configSnapshot.exists()) {
            throw new Error('Scheduling configuration not found');
        }

        const config = normalizeConfig(configSnapshot);

        if (!config.confirmedSlot) {
            throw new Error('There is no confirmed meeting to cancel');
        }

        const maxReschedules = config.maxReschedules ?? DEFAULT_MAX_RESCHEDULES;
        if ((config.cancellationCount || 0) >= maxReschedules) {
            throw new Error('Reschedule limit has been reached for this project');
        }

        if (config.confirmedSlot.calendarEventId && payload?.contractorId) {
            try {
                await calendarAvailabilityApi.deleteEvent(
                    payload.contractorId,
                    config.confirmedSlot.calendarEventId
                );
            } catch (error) {
                console.warn('[ProjectSchedulingApi] Failed to delete calendar event', error);
            }
        }

        const cancellationEntry = {
            id: createResourceId(),
            cancelledBy: payload.cancelledBy || null,
            reason: payload.reason || 'Cancelled',
            slot: {
                start: config.confirmedSlot.start,
                end: config.confirmedSlot.end
            },
            cancelledAt: serverTimestamp()
        };

        await updateDoc(configRef, {
            status: SCHEDULING_STATUS.AWAITING,
            method: 'calendar',
            confirmedSlot: null,
            cancellationCount: (config.cancellationCount || 0) + 1,
            rescheduleCount: (config.rescheduleCount || 0) + 1,
            cancellations: arrayUnion(cancellationEntry),
            updatedAt: serverTimestamp()
        });

        await projectsApi.updateStatus(projectId, 'AWAITING_SCHEDULE', {
            meetingCancelledAt: serverTimestamp()
        });

        const freshConfig = await getDoc(configRef);
        return normalizeConfig(freshConfig);
    }
}

export const projectSchedulingApi = new ProjectSchedulingApi();
export const projectSchedulingStatuses = SCHEDULING_STATUS;
export const projectSchedulingDefaults = {
    maxReschedules: DEFAULT_MAX_RESCHEDULES
};