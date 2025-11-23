import { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { addMinutes } from 'date-fns';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import Trash02Icon from '@untitled-ui/icons-react/build/esm/Trash02';
import {
    Box,
    Button,
    Dialog,
    Divider,
    FormControl,
    FormControlLabel,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    SvgIcon,
    Switch,
    TextField,
    Typography
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { useDispatch } from 'src/store';
import { calendarAvailabilityThunks } from 'src/thunks/calendarAvailability';
import { useAuth } from 'src/hooks/use-auth';
import {
    EVENT_CATEGORY_COLORS,
    EVENT_CATEGORY_LABELS,
    EVENT_STATUS_LABELS
} from './utils';

const EVENT_CATEGORY_OPTIONS = [
    { value: 'meeting', label: EVENT_CATEGORY_LABELS.meeting, color: EVENT_CATEGORY_COLORS.meeting },
    { value: 'availability', label: EVENT_CATEGORY_LABELS.availability, color: EVENT_CATEGORY_COLORS.availability },
    { value: 'proposed', label: EVENT_CATEGORY_LABELS.proposed, color: EVENT_CATEGORY_COLORS.proposed },
    { value: 'blocked', label: EVENT_CATEGORY_LABELS.blocked, color: EVENT_CATEGORY_COLORS.blocked },
    { value: 'break', label: EVENT_CATEGORY_LABELS.break, color: EVENT_CATEGORY_COLORS.break }
];

const EVENT_STATUS_OPTIONS = [
    { value: 'confirmed', label: EVENT_STATUS_LABELS.confirmed },
    { value: 'tentative', label: EVENT_STATUS_LABELS.tentative },
    { value: 'proposed', label: EVENT_STATUS_LABELS.proposed },
    { value: 'blocked', label: EVENT_STATUS_LABELS.blocked },
    { value: 'cancelled', label: EVENT_STATUS_LABELS.cancelled }
];

const useInitialValues = (event, range) => useMemo(() => {
    if (event) {
        return {
            allDay: Boolean(event.allDay),
            category: event.category || 'meeting',
            color: event.color || EVENT_CATEGORY_COLORS[event.category] || EVENT_CATEGORY_COLORS.meeting,
            description: event.description || '',
            end: event.end ? new Date(event.end) : addMinutes(new Date(), 60),
            metadata: event.metadata || {},
            start: event.start ? new Date(event.start) : new Date(),
            status: event.status || 'confirmed',
            title: event.title || '',
            location: event.metadata?.location || '',
            submit: null
        };
    }

    if (range) {
        return {
            allDay: Boolean(range.allDay),
            category: 'meeting',
            color: EVENT_CATEGORY_COLORS.meeting,
            description: '',
            end: new Date(range.end),
            metadata: {},
            start: new Date(range.start),
            status: 'confirmed',
            title: '',
            location: '',
            submit: null
        };
    }

    return {
        allDay: false,
        category: 'meeting',
        color: EVENT_CATEGORY_COLORS.meeting,
        description: '',
        end: addMinutes(new Date(), 60),
        metadata: {},
        start: new Date(),
        status: 'confirmed',
        title: '',
        location: '',
        submit: null
    };
}, [event, range]);

const validationSchema = Yup.object({
    allDay: Yup.bool(),
    category: Yup.string().oneOf(EVENT_CATEGORY_OPTIONS.map((option) => option.value)).required('Категория обязательна'),
    description: Yup.string().max(5000, 'Maximum 5000 characters'),
    end: Yup.date().min(Yup.ref('start'), 'The end time must be later than the start time.'),
    start: Yup.date().required('Please enter a start date'),
    status: Yup.string().oneOf(EVENT_STATUS_OPTIONS.map((option) => option.value)).required('Status required'),
    title: Yup
        .string()
        .max(255, 'Maximum 255 characters')
        .required('Title required'),
    location: Yup.string().max(255, 'Maximum 255 characters')
});

export const CalendarEventDialog = ({
    action = 'create',
    event,
    onAddComplete,
    onClose,
    onDeleteComplete,
    onEditComplete,
    open = false,
    range
}) => {
    const dispatch = useDispatch();
    const { user } = useAuth();
    const initialValues = useInitialValues(event, range);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues,
        validationSchema,
        onSubmit: async (values, helpers) => {
            if (!user?.id) {
                toast.error('Failed to determine user');
                helpers.setSubmitting(false);
                return;
            }

            try {
                const payload = {
                    allDay: values.allDay,
                    category: values.category,
                    color: values.color || EVENT_CATEGORY_COLORS[values.category],
                    description: values.description,
                    end: values.end.getTime(),
                    start: values.start.getTime(),
                    status: values.status,
                    title: values.title,
                    metadata: {
                        ...(event?.metadata || {}),
                        location: values.location
                    }
                };

                if (action === 'update' && event?.id) {
                    await dispatch(calendarAvailabilityThunks.updateEvent(user.id, event.id, payload));
                    toast.success('The event has been updated.');
                    onEditComplete?.();
                } else {
                    await dispatch(calendarAvailabilityThunks.createEvent(user.id, payload));
                    toast.success('Event created');
                    onAddComplete?.();
                }
            } catch (err) {
                console.error(err);
                toast.error('Something went wrong');
                helpers.setStatus({ success: false });
                helpers.setErrors({ submit: err.message });
            } finally {
                helpers.setSubmitting(false);
            }
        }
    });

    const handleStartDateChange = useCallback((date) => {
        formik.setFieldValue('start', date);

        if (formik.values.end && date && date > formik.values.end) {
            const autoEnd = formik.values.allDay
                ? addMinutes(date, 24 * 60)
                : addMinutes(date, 60);
            formik.setFieldValue('end', autoEnd);
        }
    }, [formik]);

    const handleEndDateChange = useCallback((date) => {
        formik.setFieldValue('end', date);

        if (formik.values.start && date && date < formik.values.start) {
            formik.setFieldValue('start', addMinutes(date, -60));
        }
    }, [formik]);

    const handleDelete = useCallback(async () => {
        if (!event?.id || !user?.id) {
            return;
        }

        try {
            await dispatch(calendarAvailabilityThunks.deleteEvent(user.id, event.id));
            toast.success('The event has been deleted.');
            onDeleteComplete?.();
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete event');
        }
    }, [dispatch, event, onDeleteComplete, user?.id]);

    const handleCategoryChange = useCallback((eventChange) => {
        const nextCategory = eventChange.target.value;
        formik.setFieldValue('category', nextCategory);
        const categoryColor = EVENT_CATEGORY_COLORS[nextCategory] || EVENT_CATEGORY_COLORS.meeting;
        formik.setFieldValue('color', categoryColor);
    }, [formik]);

    useEffect(() => {
        if (formik.values.allDay) {
            const startDate = formik.values.start;
            const nextEnd = addMinutes(startDate, 24 * 60);
            formik.setFieldValue('end', nextEnd);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formik.values.allDay]);

    return (
        <Dialog
            fullWidth
            maxWidth="sm"
            onClose={onClose}
            open={open}
        >
            <form onSubmit={formik.handleSubmit}>
                <Box sx={{ p: 3 }}>
                    <Typography
                        align="center"
                        gutterBottom
                        variant="h5"
                    >
                        {event ? 'Edit event' : 'New event'}
                    </Typography>
                    <Typography align="center" color="text.secondary" variant="body2">
                        Fill out the meeting or time block details
                    </Typography>
                </Box>

                <Stack
                    spacing={2}
                    sx={{ p: 3 }}
                >
                    <TextField
                        error={Boolean(formik.touched.title && formik.errors.title)}
                        fullWidth
                        helperText={formik.touched.title && formik.errors.title}
                        label="Title"
                        name="title"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.title}
                    />

                    <FormControl fullWidth>
                        <InputLabel id="calendar-event-category-label">Category</InputLabel>
                        <Select
                            label="Category"
                            labelId="calendar-event-category-label"
                            name="category"
                            onChange={handleCategoryChange}
                            value={formik.values.category}
                        >
                            {EVENT_CATEGORY_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel id="calendar-event-status-label">Status</InputLabel>
                        <Select
                            label="Status"
                            labelId="calendar-event-status-label"
                            name="status"
                            onChange={formik.handleChange}
                            value={formik.values.status}
                        >
                            {EVENT_STATUS_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        error={Boolean(formik.touched.description && formik.errors.description)}
                        fullWidth
                        helperText={formik.touched.description && formik.errors.description}
                        label="Description / comment"
                        multiline
                        minRows={3}
                        name="description"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.description}
                    />

                    <TextField
                        error={Boolean(formik.touched.location && formik.errors.location)}
                        fullWidth
                        helperText={formik.touched.location && formik.errors.location}
                        label="Meeting place (optional)"
                        name="location"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.location}
                    />

                    <FormControlLabel
                        control={(
                            <Switch
                                checked={formik.values.allDay}
                                name="allDay"
                                onChange={formik.handleChange}
                            />
                        )}
                        label="All day"
                    />

                    {!formik.values.allDay && (
                        <TextField
                            disabled
                            fullWidth
                            label="Event color"
                            value={formik.values.color}
                        />
                    )}

                    <DateTimePicker
                        label="Start date"
                        onChange={handleStartDateChange}
                        renderInput={(inputProps) => (
                            <TextField
                                fullWidth
                                {...inputProps}
                            />
                        )}
                        value={formik.values.start}
                    />

                    <DateTimePicker
                        label={formik.values.allDay ? 'End date (next day equivalent)' : 'End date'}
                        onChange={handleEndDateChange}
                        renderInput={(inputProps) => (
                            <TextField
                                fullWidth
                                {...inputProps}
                            />
                        )}
                        value={formik.values.end}
                    />

                    {Boolean(formik.touched.end && formik.errors.end) && (
                        <FormHelperText error>
                            {formik.errors.end}
                        </FormHelperText>
                    )}

                    {formik.errors.submit && (
                        <FormHelperText error>
                            {formik.errors.submit}
                        </FormHelperText>
                    )}
                </Stack>

                <Divider />

                <Stack
                    alignItems="center"
                    direction="row"
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ p: 2 }}
                >
                    {event?.id && (
                        <Button
                            color="error"
                            onClick={handleDelete}
                            startIcon={(
                                <SvgIcon>
                                    <Trash02Icon />
                                </SvgIcon>
                            )}
                            variant="text"
                        >
                            Delete
                        </Button>
                    )}

                    <Stack
                        alignItems="center"
                        direction="row"
                        spacing={1}
                    >
                        <Button
                            color="inherit"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={formik.isSubmitting}
                            type="submit"
                            variant="contained"
                        >
                            Confirm
                        </Button>
                    </Stack>
                </Stack>
            </form>
        </Dialog>
    );
};

CalendarEventDialog.propTypes = {
    action: PropTypes.oneOf(['create', 'update']),
    event: PropTypes.object,
    onAddComplete: PropTypes.func,
    onClose: PropTypes.func,
    onDeleteComplete: PropTypes.func,
    onEditComplete: PropTypes.func,
    open: PropTypes.bool,
    range: PropTypes.object
};