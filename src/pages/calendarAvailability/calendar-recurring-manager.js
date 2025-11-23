import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    SvgIcon,
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
import EditIcon from '@untitled-ui/icons-react/build/esm/Edit02';
import DeleteIcon from '@untitled-ui/icons-react/build/esm/Trash03';
import AddIcon from '@untitled-ui/icons-react/build/esm/Plus';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { DatePicker } from '@mui/x-date-pickers';
import { useDispatch, useSelector } from 'src/store';
import { calendarAvailabilityThunks } from 'src/thunks/calendarAvailability';
import { useAuth } from 'src/hooks/use-auth';
import {
    EVENT_CATEGORY_COLORS,
    EVENT_CATEGORY_LABELS,
    EVENT_STATUS_LABELS
} from './utils';

const DAY_OPTIONS = [
    { value: 'mon', label: 'Monday' },
    { value: 'tue', label: 'Tuesday' },
    { value: 'wed', label: 'Wednesday' },
    { value: 'thu', label: 'Thursday' },
    { value: 'fri', label: 'Friday' },
    { value: 'sat', label: 'Saturday' },
    { value: 'sun', label: 'Sunday' }
];

const validationSchema = Yup.object({
    title: Yup.string().required('Title required'),
    category: Yup.string().required('Category required'),
    status: Yup.string().required('Status required'),
    daysOfWeek: Yup.array().of(Yup.string()).min(1, 'Please select at least one day of the week'),
    startTime: Yup.string().required('Specify start time'),
    endTime: Yup.string().required('Specify end time'),
    startDate: Yup.string().required('Select start date')
});

const defaultValues = {
    id: null,
    title: '',
    description: '',
    category: 'meeting',
    status: 'confirmed',
    daysOfWeek: ['mon'],
    startTime: '09:00',
    endTime: '10:00',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: null,
    color: EVENT_CATEGORY_COLORS.meeting
};

export const CalendarRecurringManager = ({ externalEditId, onExternalEditHandled }) => {
    const { user } = useAuth();
    const dispatch = useDispatch();
    const recurringEvents = useSelector((state) => state.calendarAvailability.recurringEvents);
    const loading = useSelector((state) => state.calendarAvailability.recurringLoading);
    const [dialogOpen, setDialogOpen] = useState(false);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: defaultValues,
        validationSchema,
        onSubmit: async (values, helpers) => {
            if (!user?.id) {
                helpers.setSubmitting(false);
                return;
            }

            try {
                const payload = {
                    ...values,
                    daysOfWeek: values.daysOfWeek,
                    startDate: values.startDate,
                    endDate: values.endDate || null,
                    color: EVENT_CATEGORY_COLORS[values.category] || EVENT_CATEGORY_COLORS.meeting
                };

                if (values.id) {
                    await dispatch(calendarAvailabilityThunks.updateRecurringEvent(user.id, values.id, payload));
                } else {
                    await dispatch(calendarAvailabilityThunks.createRecurringEvent(user.id, payload));
                }

                setDialogOpen(false);
                formik.resetForm();
            } catch (error) {
                console.error(error);
            } finally {
                helpers.setSubmitting(false);
            }
        }
    });

    const openDialog = useCallback((recurring = null) => {
        if (recurring) {
            formik.setValues({
                id: recurring.id,
                title: recurring.title,
                description: recurring.description,
                category: recurring.category,
                status: recurring.status,
                daysOfWeek: recurring.daysOfWeek || ['mon'],
                startTime: recurring.startTime || '09:00',
                endTime: recurring.endTime || '10:00',
                startDate: recurring.startDate || new Date().toISOString().slice(0, 10),
                endDate: recurring.endDate || null,
                color: recurring.color || EVENT_CATEGORY_COLORS[recurring.category] || EVENT_CATEGORY_COLORS.meeting
            });
        } else {
            formik.resetForm();
            formik.setValues(defaultValues);
        }
        setDialogOpen(true);
    }, [formik]);

    const handleDelete = useCallback(async (recurringId) => {
        if (!user?.id || !recurringId) {
            return;
        }
        await dispatch(calendarAvailabilityThunks.deleteRecurringEvent(user.id, recurringId));
    }, [dispatch, user?.id]);

    useEffect(() => {
        if (externalEditId) {
            const target = recurringEvents.find((event) => event.id === externalEditId);
            if (target) {
                openDialog(target);
            }
            onExternalEditHandled?.();
        }
    }, [externalEditId, recurringEvents, openDialog, onExternalEditHandled]);

    const rows = useMemo(() => recurringEvents, [recurringEvents]);

    return (
        <Card>
            <CardHeader
                action={(
                    <Button
                        onClick={() => openDialog(null)}
                        startIcon={(
                            <SvgIcon>
                                <AddIcon />
                            </SvgIcon>
                        )}
                        variant="contained"
                    >
                        Add repeat
                    </Button>
                )}
                title="Recurring Events"
                subheader="Set up regular meetings, conferences, and blocks"
            />
            <CardContent>
                {rows.length === 0 ? (
                    <Typography color="text.secondary" variant="body2">
                        There are no repeating events yet. Create your first one.
                    </Typography>
                ) : (
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell>Days of the week</TableCell>
                                <TableCell>Time</TableCell>
                                <TableCell>Period</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row) => (
                                <TableRow key={row.id} hover>
                                    <TableCell>
                                        <Typography variant="subtitle2">{row.title}</Typography>
                                        {row.description && (
                                            <Typography color="text.secondary" variant="caption">
                                                {row.description}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {row.daysOfWeek.map((day) => DAY_OPTIONS.find((option) => option.value === day)?.label).join(', ')}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {row.startTime} — {row.endTime}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {row.startDate ? new Date(row.startDate).toLocaleDateString() : 'Не указано'} — {row.endDate ? new Date(row.endDate).toLocaleDateString() : 'Без окончания'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {EVENT_CATEGORY_LABELS[row.category] || row.category}
                                    </TableCell>
                                    <TableCell>
                                        {EVENT_STATUS_LABELS[row.status] || row.status}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Edit">
                                            <IconButton onClick={() => openDialog(row)} size="small">
                                                <SvgIcon fontSize="small">
                                                    <EditIcon />
                                                </SvgIcon>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton
                                                color="error"
                                                disabled={loading}
                                                onClick={() => handleDelete(row.id)}
                                                size="small"
                                            >
                                                <SvgIcon fontSize="small">
                                                    <DeleteIcon />
                                                </SvgIcon>
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            <Dialog
                fullWidth
                maxWidth="sm"
                onClose={() => setDialogOpen(false)}
                open={dialogOpen}
            >
                <form onSubmit={formik.handleSubmit}>
                    <DialogTitle>
                        {formik.values.id ? 'Editing a Recurrence' : 'New repetition'}
                    </DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ pt: 1 }}>
                            <TextField
                                label="Title"
                                name="title"
                                onChange={formik.handleChange}
                                value={formik.values.title}
                            />
                            <TextField
                                label="Description"
                                multiline
                                minRows={2}
                                name="description"
                                onChange={formik.handleChange}
                                value={formik.values.description}
                            />
                            <Stack spacing={1}>
                                <Typography variant="subtitle2">
                                    Days of the week
                                </Typography>
                                <ToggleButtonGroup
                                    color="primary"
                                    onChange={(_, newDays) => formik.setFieldValue('daysOfWeek', newDays)}
                                    value={formik.values.daysOfWeek}
                                >
                                    {DAY_OPTIONS.map((option) => (
                                        <ToggleButton key={option.value} value={option.value}>
                                            {option.label}
                                        </ToggleButton>
                                    ))}
                                </ToggleButtonGroup>
                            </Stack>
                            <Stack direction="row" spacing={2}>
                                <TextField
                                    label="Start time"
                                    name="startTime"
                                    onChange={formik.handleChange}
                                    type="time"
                                    value={formik.values.startTime}
                                />
                                <TextField
                                    label="End time"
                                    name="endTime"
                                    onChange={formik.handleChange}
                                    type="time"
                                    value={formik.values.endTime}
                                />
                            </Stack>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <DatePicker
                                    label="Start date"
                                    onChange={(value) => formik.setFieldValue('startDate', value ? value.toISOString().slice(0, 10) : null)}
                                    value={formik.values.startDate ? new Date(formik.values.startDate) : null}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                                <DatePicker
                                    label="End date (optional)"
                                    onChange={(value) => formik.setFieldValue('endDate', value ? value.toISOString().slice(0, 10) : null)}
                                    value={formik.values.endDate ? new Date(formik.values.endDate) : null}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                            </Stack>
                            <TextField
                                label="Category (meeting, blocked, etc.)"
                                name="category"
                                onChange={(event) => {
                                    formik.handleChange(event);
                                    const nextColor = EVENT_CATEGORY_COLORS[event.target.value] || EVENT_CATEGORY_COLORS.meeting;
                                    formik.setFieldValue('color', nextColor);
                                }}
                                value={formik.values.category}
                            />
                            <TextField
                                label="Status"
                                name="status"
                                onChange={formik.handleChange}
                                value={formik.values.status}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            disabled={formik.isSubmitting}
                            type="submit"
                            variant="contained"
                        >
                            Save
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Card>
    );
};

CalendarRecurringManager.propTypes = {
    externalEditId: PropTypes.string,
    onExternalEditHandled: PropTypes.func
};