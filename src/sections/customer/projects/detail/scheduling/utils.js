export const MAX_PROPOSED_SLOTS = 3;
export const DEFAULT_MAX_RESCHEDULES = 3;

export const TIME_OF_DAY_LABELS = {
    morning: 'Morning',
    day: 'Daytime',
    evening: 'Evening'
};

export const TIME_OF_DAY_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'morning', label: 'Morning (06:00-12:00)' },
    { value: 'day', label: 'Day (12:00-17:00)' },
    { value: 'evening', label: 'Evening (17:00-22:00)' }
];

export const SCHEDULING_STATUS_LABELS = {
    awaiting_schedule: 'Awaiting scheduling',
    meeting_scheduled: 'Meeting scheduled',
    verbal_agreement: 'Verbal agreement in place'
};

export const attemptPaths = (object, paths = []) => {
    if (!object) {
        return null;
    }
    for (const path of paths) {
        const segments = path.split('.');
        let value = object;
        let found = true;

        for (const segment of segments) {
            if (value && Object.prototype.hasOwnProperty.call(value, segment)) {
                value = value[segment];
            } else {
                found = false;
                break;
            }
        }

        if (found && value !== undefined && value !== null) {
            return value;
        }
    }
    return null;
};

export const extractParticipants = (project = {}, config = {}) => {
    const customerId = config?.customerId
        || attemptPaths(project, ['customer.id', 'customerId', 'user.id', 'userId', 'ownerId', 'createdBy']);
    const contractorId = config?.contractorId
        || attemptPaths(project, [
            'contractor.id',
            'contractorUserId',
            'executor.id',
            'executorId',
            'assignedSpecialistId',
            'workerId',
            'performerId',
            'providerId',
            'assigneeId'
        ]);

    const customerName = attemptPaths(project, [
        'customer.displayName',
        'customer.name',
        'customer.fullName',
        'customerTitle',
        'customerCompany'
    ]);

    const contractorName = attemptPaths(project, [
        'contractor.displayName',
        'contractor.name',
        'executor.displayName',
        'executor.name',
        'performerName'
    ]);

    return {
        customerId: customerId || null,
        contractorId: contractorId || null,
        customerName: customerName || null,
        contractorName: contractorName || null
    };
};