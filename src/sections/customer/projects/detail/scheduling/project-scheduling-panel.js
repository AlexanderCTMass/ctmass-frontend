import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'src/store';
import { addDays, format, formatDistance, startOfDay } from 'date-fns';
import toast from 'react-hot-toast';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Divider,
    Grid,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import CalendarIcon from '@untitled-ui/icons-react/build/esm/Calendar';
import ClockIcon from '@untitled-ui/icons-react/build/esm/Clock';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import { findConflictingEvents } from 'src/pages/calendarAvailability/utils';
import { projectSchedulingThunks } from 'src/thunks/projectScheduling';
import { ProjectStatus } from 'src/enums/project-state';
import { roles } from 'src/roles';
import { extractParticipants, MAX_PROPOSED_SLOTS, TIME_OF_DAY_LABELS, TIME_OF_DAY_OPTIONS, SCHEDULING_STATUS_LABELS, DEFAULT_MAX_RESCHEDULES } from './utils'
import { CancelMeetingDialog } from './cancel-meeting-dialog';
import { DeclineProposalDialog } from './decline-proposal-dialog';
import { SlotPicker } from './slot-picker';

export const ProjectSchedulingPanel = ({
    project,
    role,
    user,
    sx
}) => {
    const dispatch = useDispatch();
    const projectId = project?.id;
    const schedulingEntry = useSelector((state) => state.projectScheduling.entries[projectId] || null);

    const config = schedulingEntry?.config || null;
    const proposals = schedulingEntry?.proposals || [];
    const availability = schedulingEntry?.availability || { slots: [], loading: false };
    const loading = schedulingEntry?.loading;
    const error = schedulingEntry?.error;
    const responding = schedulingEntry?.responding;
    const submitting = schedulingEntry?.submitting;
    const cancelling = schedulingEntry?.cancelling;

    const [rangeStart, setRangeStart] = useState(startOfDay(new Date()));
    const [rangeDays, setRangeDays] = useState(7);
    const [timeFilter, setTimeFilter] = useState('all');
    const [selectedSlotIds, setSelectedSlotIds] = useState([]);
    const [comment, setComment] = useState('');
    const [declineDialog, setDeclineDialog] = useState({ open: false, proposal: null });
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

    const {
        customerId,
        contractorId,
        customerName,
        contractorName
    } = useMemo(() => extractParticipants(project, config), [project, config]);

    const isCustomer = Boolean(user?.id)
        && (user.id === customerId || role === roles.CUSTOMER);

    const isContractor = Boolean(user?.id)
        && (user.id === contractorId || role === roles.WORKER);

    const shouldShowPanel = [ProjectStatus.AWAITING_SCHEDULE, ProjectStatus.MEETING_SCHEDULED].includes(project.status)
        || Boolean(config);

    const filteredSlots = useMemo(() => {
        if (!availability.slots?.length) {
            return [];
        }
        if (timeFilter === 'all') {
            return availability.slots;
        }
        return availability.slots.filter((slot) => slot.timeOfDay === timeFilter);
    }, [availability.slots, timeFilter]);

    useEffect(() => {
        if (!projectId) {
            return;
        }

        dispatch(projectSchedulingThunks.loadScheduling({
            projectId,
            customerId,
            contractorId,
            projectTitle: project?.title || '',
            projectStatus: project?.status
        }));
    }, [dispatch, projectId, project?.status, project?.title, customerId, contractorId]);

    useEffect(() => {
        if (!projectId || !contractorId || !config) {
            return;
        }

        if (config.method !== 'calendar') {
            return;
        }

        if (project.status !== ProjectStatus.AWAITING_SCHEDULE
            && config.status !== 'awaiting_schedule') {
            return;
        }

        dispatch(projectSchedulingThunks.fetchAvailability({
            projectId,
            contractorId,
            startDate: rangeStart,
            days: rangeDays
        }));
    }, [
        dispatch,
        projectId,
        contractorId,
        config,
        project.status,
        rangeStart,
        rangeDays
    ]);

    useEffect(() => {
        if (!filteredSlots.length) {
            setSelectedSlotIds([]);
            return;
        }

        setSelectedSlotIds((prev) => prev.filter((id) =>
            filteredSlots.some((slot) => slot.id === id)
        ));
    }, [filteredSlots]);

    if (!shouldShowPanel) {
        return null;
    }

    const maxReschedules = config?.maxReschedules ?? DEFAULT_MAX_RESCHEDULES;
    const reschedulesDone = config?.cancellationCount || 0;
    const reschedulesLeft = Math.max(maxReschedules - reschedulesDone, 0);

    const hasConfirmedMeeting = Boolean(config?.confirmedSlot);
    const schedulingStatusLabel = config?.status
        ? (SCHEDULING_STATUS_LABELS[config.status] || config.status)
        : null;

    const pendingProposals = proposals.filter((proposal) => proposal.status === 'pending');
    const historyProposals = proposals.filter((proposal) => proposal.status !== 'pending');

    const handleToggleSlot = (slotId) => {
        setSelectedSlotIds((prev) => {
            if (prev.includes(slotId)) {
                return prev.filter((id) => id !== slotId);
            }
            if (prev.length >= MAX_PROPOSED_SLOTS) {
                toast.error(`You can select up to ${MAX_PROPOSED_SLOTS} slots.`);
                return prev;
            }
            return [...prev, slotId];
        });
    };

    const handleSubmitProposal = async () => {
        const slots = availability.slots.filter((slot) => selectedSlotIds.includes(slot.id));

        if (!slots.length) {
            toast.error('Select at least one slot to propose.');
            return;
        }

        const success = await dispatch(projectSchedulingThunks.submitProposal({
            projectId,
            slots,
            comment,
            proposerId: user.id,
            proposerRole: isCustomer ? 'customer' : 'contractor'
        }));

        if (success) {
            setSelectedSlotIds([]);
            setComment('');
        }
    };

    const handleAcceptSlot = async (proposal, slot) => {
        await dispatch(projectSchedulingThunks.acceptProposal({
            projectId,
            proposalId: proposal.id,
            slot,
            context: {
                contractorId,
                customerId,
                projectTitle: project?.title || '',
                customerName,
                contractorName,
                comment: proposal.comment || ''
            }
        }));
    };

    const handleDeclineProposal = async (payload) => {
        const { proposal } = declineDialog;
        if (!proposal) {
            return;
        }

        await dispatch(projectSchedulingThunks.declineProposal({
            projectId,
            proposalId: proposal.id,
            reason: payload.reason,
            respondedBy: user.id,
            alternative: {
                slots: payload.slots,
                comment: payload.comment
            }
        }));

        setDeclineDialog({ open: false, proposal: null });
    };

    const handleCancelMeeting = async (reasonText) => {
        const success = await dispatch(projectSchedulingThunks.cancelMeeting({
            projectId,
            reason: reasonText,
            cancelledBy: user.id,
            contractorId
        }));

        if (success) {
            setCancelDialogOpen(false);
        }
    };

    const statusColor = hasConfirmedMeeting ? 'success' : 'primary';

    return (
        <Card
            sx={{
                mt: 2,
                ...sx
            }}
        >
            <CardHeader
                avatar={<CalendarIcon />}
                title="Meeting scheduling"
                subheader={schedulingStatusLabel}
            />
            <CardContent>
                <Stack spacing={3}>
                    {loading && <LinearProgress />}

                    {error && (
                        <Alert severity="error">
                            {error}
                        </Alert>
                    )}

                    {!isCustomer && !isContractor && (
                        <Alert severity="info">
                            Scheduling is available only to the project customer and the selected contractor.
                        </Alert>
                    )}

                    {config?.method == null && project.status === ProjectStatus.AWAITING_SCHEDULE && (isCustomer || isContractor) && (
                        <Box>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                                Choose how to coordinate the meeting
                            </Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => dispatch(projectSchedulingThunks.selectMethod({
                                        projectId,
                                        method: 'calendar',
                                        context: { projectId }
                                    }))}
                                >
                                    Schedule via calendar
                                </Button>
                                <Button
                                    variant="text"
                                    color="inherit"
                                    onClick={() => dispatch(projectSchedulingThunks.selectMethod({
                                        projectId,
                                        method: 'verbal',
                                        context: { projectId }
                                    }))}
                                >
                                    Agree verbally
                                </Button>
                            </Stack>
                        </Box>
                    )}

                    {config?.method === 'verbal' && (
                        <Alert severity="success">
                            Parties decided to proceed with a verbal agreement. The project moved to work-in-progress.
                        </Alert>
                    )}

                    {hasConfirmedMeeting && (
                        <Box
                            sx={{
                                borderRadius: 2,
                                border: (theme) => `1px solid ${theme.palette.success.light}`,
                                p: 2
                            }}
                        >
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
                                <Chip
                                    color={statusColor}
                                    label="Meeting scheduled"
                                    size="small"
                                />
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {format(new Date(config.confirmedSlot.start), 'EEEE, dd MMMM yyyy, HH:mm')} — {format(new Date(config.confirmedSlot.end), 'HH:mm')}
                                </Typography>
                            </Stack>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                {formatDistance(new Date(), new Date(config.confirmedSlot.start), { addSuffix: true })}
                            </Typography>
                            {config.confirmedSlot.comment && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    Comment: {config.confirmedSlot.comment}
                                </Typography>
                            )}
                            <Divider sx={{ my: 2 }} />
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <Typography variant="body2">
                                    Reschedules left: {reschedulesLeft}
                                </Typography>
                                <Typography variant="body2">
                                    Calendar event ID: {config.confirmedSlot.calendarEventId || 'Not linked'}
                                </Typography>
                            </Stack>

                            {(isCustomer || isContractor) && (
                                <Button
                                    color="error"
                                    variant="outlined"
                                    sx={{ mt: 2 }}
                                    onClick={() => setCancelDialogOpen(true)}
                                    disabled={reschedulesLeft <= 0 || cancelling}
                                >
                                    Cancel / reschedule meeting
                                </Button>
                            )}

                            {reschedulesLeft <= 0 && (
                                <Alert severity="warning" sx={{ mt: 2 }}>
                                    Reschedule limit reached. Contact support if you need further changes.
                                </Alert>
                            )}
                        </Box>
                    )}

                    {config?.method === 'calendar' && project.status === ProjectStatus.AWAITING_SCHEDULE && isCustomer && (
                        <Stack spacing={2}>
                            <Typography variant="h6">
                                Propose available slots
                            </Typography>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <DatePicker
                                    label="Start date"
                                    value={rangeStart}
                                    onChange={(value) => {
                                        const date = value?.toDate?.() || value;
                                        if (date) {
                                            setRangeStart(startOfDay(date));
                                        }
                                    }}
                                    slotProps={{
                                        textField: { size: 'small' }
                                    }}
                                    minDate={new Date()}
                                    maxDate={addDays(new Date(), 60)}
                                />
                                <ToggleButtonGroup
                                    exclusive
                                    size="small"
                                    value={rangeDays}
                                    onChange={(_, nextValue) => {
                                        if (nextValue) {
                                            setRangeDays(nextValue);
                                        }
                                    }}
                                >
                                    <ToggleButton value={7}>7 days</ToggleButton>
                                    <ToggleButton value={14}>14 days</ToggleButton>
                                </ToggleButtonGroup>
                                <ToggleButtonGroup
                                    exclusive
                                    size="small"
                                    value={timeFilter}
                                    onChange={(_, nextValue) => {
                                        if (nextValue) {
                                            setTimeFilter(nextValue);
                                        }
                                    }}
                                >
                                    {TIME_OF_DAY_OPTIONS.map((option) => (
                                        <ToggleButton key={option.value} value={option.value}>
                                            {option.label}
                                        </ToggleButton>
                                    ))}
                                </ToggleButtonGroup>
                            </Stack>

                            {availability.loading && <LinearProgress />}

                            <SlotPicker
                                slots={filteredSlots}
                                selectedIds={selectedSlotIds}
                                onToggle={handleToggleSlot}
                                disabled={availability.loading}
                            />

                            <TextField
                                label="Comment for the contractor (optional)"
                                value={comment}
                                onChange={(event) => setComment(event.target.value)}
                                multiline
                                minRows={2}
                            />

                            <Stack direction="row" spacing={2}>
                                <Button
                                    variant="contained"
                                    onClick={handleSubmitProposal}
                                    disabled={selectedSlotIds.length === 0 || submitting}
                                >
                                    Send proposal
                                </Button>
                                <Typography variant="body2" color="text.secondary">
                                    You can select up to {MAX_PROPOSED_SLOTS} slots per proposal.
                                </Typography>
                            </Stack>
                        </Stack>
                    )}

                    {config?.method === 'calendar' && (isContractor || pendingProposals.length > 0) && (
                        <Stack spacing={2}>
                            <Typography variant="h6">
                                Pending proposals
                            </Typography>
                            {pendingProposals.length === 0 ? (
                                <Alert severity="info">
                                    There are no pending proposals at the moment.
                                </Alert>
                            ) : (
                                pendingProposals.map((proposal) => (
                                    <Box
                                        key={proposal.id}
                                        sx={{
                                            border: (theme) => `1px solid ${theme.palette.divider}`,
                                            borderRadius: 2,
                                            p: 2
                                        }}
                                    >
                                        <Stack spacing={1}>
                                            <Stack
                                                direction={{ xs: 'column', sm: 'row' }}
                                                alignItems={{ xs: 'flex-start', sm: 'center' }}
                                                justifyContent="space-between"
                                                spacing={1}
                                            >
                                                <Typography variant="subtitle1">
                                                    From {proposal.proposerRole === 'customer' ? 'customer' : 'contractor'}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {proposal.createdAt
                                                        ? format(new Date(proposal.createdAt), 'dd MMM yyyy HH:mm')
                                                        : ''}
                                                </Typography>
                                            </Stack>
                                            {proposal.comment && (
                                                <Typography variant="body2">
                                                    "{proposal.comment}"
                                                </Typography>
                                            )}
                                            <Grid container spacing={2}>
                                                {proposal.slots.map((slot) => {
                                                    const conflicts = findConflictingEvents(
                                                        availability.events,
                                                        slot.start,
                                                        slot.end,
                                                        availability.settings?.bufferTime
                                                    );
                                                    const conflictCount = conflicts.length;
                                                    return (
                                                        <Grid item xs={12} sm={6} md={4} key={`${proposal.id}-${slot.start}`}>
                                                            <Box
                                                                sx={{
                                                                    borderRadius: 2,
                                                                    border: (theme) => `1px solid ${theme.palette.divider}`,
                                                                    p: 2,
                                                                    height: '100%'
                                                                }}
                                                            >
                                                                <Stack spacing={1}>
                                                                    <Typography variant="subtitle2">
                                                                        {format(new Date(slot.start), 'EEE, dd MMM HH:mm')} — {format(new Date(slot.end), 'HH:mm')}
                                                                    </Typography>
                                                                    <Chip
                                                                        label={TIME_OF_DAY_LABELS[slot.timeOfDay] || 'Flexible'}
                                                                        size="small"
                                                                        sx={{ width: 'fit-content' }}
                                                                    />
                                                                    {conflictCount > 0 && (
                                                                        <Tooltip
                                                                            title={
                                                                                <Stack spacing={0.5}>
                                                                                    {conflicts.slice(0, 3).map((conflict) => (
                                                                                        <Typography key={conflict.id} variant="caption">
                                                                                            • {conflict.title || 'Busy'} ({format(new Date(conflict.start), 'dd MMM HH:mm')})
                                                                                        </Typography>
                                                                                    ))}
                                                                                    {conflictCount > 3 && (
                                                                                        <Typography variant="caption">
                                                                                            +{conflictCount - 3} more
                                                                                        </Typography>
                                                                                    )}
                                                                                </Stack>
                                                                            }
                                                                        >
                                                                            <Chip
                                                                                color="warning"
                                                                                size="small"
                                                                                icon={<ClockIcon />}
                                                                                label={`${conflictCount} conflict${conflictCount > 1 ? 's' : ''}`}
                                                                            />
                                                                        </Tooltip>
                                                                    )}
                                                                    {isContractor && (
                                                                        <Button
                                                                            variant="contained"
                                                                            size="small"
                                                                            onClick={() => handleAcceptSlot(proposal, slot)}
                                                                            disabled={responding}
                                                                        >
                                                                            Confirm this slot
                                                                        </Button>
                                                                    )}
                                                                </Stack>
                                                            </Box>
                                                        </Grid>
                                                    );
                                                })}
                                            </Grid>
                                            {isContractor && (
                                                <Button
                                                    color="inherit"
                                                    size="small"
                                                    startIcon={<XIcon />}
                                                    onClick={() => setDeclineDialog({ open: true, proposal })}
                                                    disabled={responding}
                                                >
                                                    Decline proposal
                                                </Button>
                                            )}
                                        </Stack>
                                    </Box>
                                ))
                            )}
                        </Stack>
                    )}

                    {historyProposals.length > 0 && (
                        <Box>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Proposal history
                            </Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Author</TableCell>
                                        <TableCell>Slots</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Comment</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {historyProposals.map((proposal) => (
                                        <TableRow key={proposal.id}>
                                            <TableCell>
                                                {proposal.createdAt
                                                    ? format(new Date(proposal.createdAt), 'dd MMM yyyy HH:mm')
                                                    : '—'}
                                            </TableCell>
                                            <TableCell>
                                                {proposal.proposerRole === 'customer' ? 'Customer' : 'Contractor'}
                                            </TableCell>
                                            <TableCell>{proposal.slots.length}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={proposal.status}
                                                    size="small"
                                                    color={
                                                        proposal.status === 'accepted'
                                                            ? 'success'
                                                            : proposal.status === 'declined'
                                                                ? 'default'
                                                                : 'warning'
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>{proposal.comment || '—'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    )}

                    {config?.cancellations?.length > 0 && (
                        <Box>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                                Cancellation history
                            </Typography>
                            <List dense>
                                {config.cancellations.map((item) => (
                                    <ListItem key={item.id} disableGutters>
                                        <ListItemText
                                            primary={`${format(new Date(item.cancelledAt), 'dd MMM yyyy HH:mm')} — ${item.reason}`}
                                            secondary={`Initiator: ${item.cancelledBy || 'unknown'}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}
                </Stack>
            </CardContent>

            <DeclineProposalDialog
                open={declineDialog.open}
                onClose={() => setDeclineDialog({ open: false, proposal: null })}
                onSubmit={handleDeclineProposal}
                availability={availability}
                maxSlots={MAX_PROPOSED_SLOTS}
            />

            <CancelMeetingDialog
                open={cancelDialogOpen}
                onClose={() => setCancelDialogOpen(false)}
                onSubmit={handleCancelMeeting}
            />
        </Card>
    );
};

ProjectSchedulingPanel.propTypes = {
    project: PropTypes.object.isRequired,
    role: PropTypes.string,
    user: PropTypes.object,
    sx: PropTypes.object
};