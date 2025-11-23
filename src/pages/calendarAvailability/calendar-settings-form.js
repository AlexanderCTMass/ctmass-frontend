import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Checkbox,
    Divider,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    SvgIcon,
    TextField,
    Typography
} from '@mui/material';
import AddCircleIcon from '@untitled-ui/icons-react/build/esm/Plus';
import RemoveIcon from '@untitled-ui/icons-react/build/esm/Minus';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import { DatePicker } from '@mui/x-date-pickers';
import { useDispatch, useSelector } from 'src/store';
import { calendarAvailabilityThunks } from 'src/thunks/calendarAvailability';
import {
    CALENDAR_BUILT_IN_TEMPLATES,
    DEFAULT_CALENDAR_SETTINGS
} from 'src/api/calendarAvailability';
import { minutesToTimeString, timeStringToMinutes } from './utils';
import { useAuth } from 'src/hooks/use-auth';

const WEEK_DAYS = [
    { key: 'mon', label: 'Monday' },
    { key: 'tue', label: 'Tuesday' },
    { key: 'wed', label: 'Wednesday' },
    { key: 'thu', label: 'Thursday' },
    { key: 'fri', label: 'Friday' },
    { key: 'sat', label: 'Saturday' },
    { key: 'sun', label: 'Sunday' }
];

const SLOT_OPTIONS = [30, 45, 60, 90, 120];
const BUFFER_OPTIONS = [0, 5, 10, 15, 20, 30];
const MIN_NOTICE_OPTIONS = [
    { value: 0, label: 'Instantly' },
    { value: 1, label: '1 day' },
    { value: 2, label: '2 days' },
    { value: 3, label: '3 days' },
    { value: 7, label: '7 days' }
];

const validationSchema = Yup.object({
    enabled: Yup.bool().required(),
    slotDuration: Yup.number().oneOf(SLOT_OPTIONS).required(),
    bufferTime: Yup.number().oneOf(BUFFER_OPTIONS).required(),
    minBookingNotice: Yup.number().oneOf(MIN_NOTICE_OPTIONS.map((option) => option.value)).required(),
    workingDays: Yup.object().shape(
        WEEK_DAYS.reduce((shape, day) => ({
            ...shape,
            [day.key]: Yup.object({
                enabled: Yup.bool().required(),
                intervals: Yup.array().of(
                    Yup.object({
                        start: Yup.string().required(),
                        end: Yup.string().required()
                    })
                )
            })
        }), {})
    )
});

const sanitizeIntervals = (intervals) => intervals
    .filter((interval) => !!interval && interval.start && interval.end)
    .map((interval) => {
        const startMinutes = timeStringToMinutes(interval.start);
        const endMinutes = timeStringToMinutes(interval.end);
        return startMinutes >= endMinutes
            ? { start: interval.start, end: minutesToTimeString(startMinutes + 30) }
            : interval;
    });

const buildInitialValues = (settings) => ({
    ...(settings || DEFAULT_CALENDAR_SETTINGS),
    workingDays: WEEK_DAYS.reduce((acc, day) => ({
        ...acc,
        [day.key]: {
            enabled: settings?.workingDays?.[day.key]?.enabled ?? DEFAULT_CALENDAR_SETTINGS.workingDays[day.key].enabled,
            intervals: settings?.workingDays?.[day.key]?.intervals?.length
                ? settings.workingDays[day.key].intervals
                : DEFAULT_CALENDAR_SETTINGS.workingDays[day.key].intervals
        }
    }), {}),
    customTemplates: settings?.customTemplates || []
});

export const CalendarSettingsForm = ({ onRecurringTabRequest }) => {
    const { user } = useAuth();
    const dispatch = useDispatch();
    const settings = useSelector((state) => state.calendarAvailability.settings);
    const saving = useSelector((state) => state.calendarAvailability.settingsSaving);
    const [blockFrom, setBlockFrom] = useState(null);
    const [blockTo, setBlockTo] = useState(null);
    const [blockReason, setBlockReason] = useState('');

    const initialValues = useMemo(() => buildInitialValues(settings), [settings]);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues,
        validationSchema,
        onSubmit: async (values, helpers) => {
            if (!user?.id) {
                helpers.setSubmitting(false);
                return;
            }

            try {
                await dispatch(calendarAvailabilityThunks.saveSettings(user.id, values));
            } catch (error) {
                console.error(error);
            } finally {
                helpers.setSubmitting(false);
            }
        }
    });

    const handleDayToggle = useCallback((dayKey) => (event) => {
        formik.setFieldValue(`workingDays.${dayKey}.enabled`, event.target.checked);
    }, [formik]);

    const handleAddInterval = useCallback((dayKey) => () => {
        const current = formik.values.workingDays[dayKey].intervals || [];
        formik.setFieldValue(`workingDays.${dayKey}.intervals`, [
            ...current,
            { start: '09:00', end: '18:00' }
        ]);
    }, [formik.values.workingDays]);

    const handleIntervalChange = useCallback((dayKey, index, field) => (event) => {
        const intervals = [...formik.values.workingDays[dayKey].intervals];
        intervals[index] = {
            ...intervals[index],
            [field]: event.target.value
        };
        formik.setFieldValue(`workingDays.${dayKey}.intervals`, sanitizeIntervals(intervals));
    }, [formik.values.workingDays]);

    const handleRemoveInterval = useCallback((dayKey, index) => () => {
        const intervals = [...formik.values.workingDays[dayKey].intervals];
        intervals.splice(index, 1);
        formik.setFieldValue(`workingDays.${dayKey}.intervals`, intervals.length ? intervals : [{ start: '09:00', end: '18:00' }]);
    }, [formik.values.workingDays]);

    const handleApplyTemplate = useCallback((template) => {
        formik.setValues({
            ...formik.values,
            slotDuration: template.slotDuration,
            bufferTime: template.bufferTime,
            minBookingNotice: template.minBookingNotice,
            workingDays: template.workingDays
        });
    }, [formik]);

    const handleSaveTemplate = useCallback(async () => {
        const name = window.prompt('Enter template name');
        if (!name) {
            return;
        }

        const newTemplate = {
            key: `custom-${Date.now()}`,
            name,
            description: 'Custom template',
            slotDuration: formik.values.slotDuration,
            bufferTime: formik.values.bufferTime,
            minBookingNotice: formik.values.minBookingNotice,
            workingDays: formik.values.workingDays
        };

        formik.setFieldValue('customTemplates', [
            newTemplate,
            ...(formik.values.customTemplates || [])
        ]);

        await dispatch(calendarAvailabilityThunks.saveSettings(user.id, {
            ...formik.values,
            customTemplates: [newTemplate, ...(formik.values.customTemplates || [])]
        }));
    }, [dispatch, formik, user?.id]);

    const handleBulkBlock = useCallback(async () => {
        if (!user?.id || !blockFrom || !blockTo) {
            return;
        }

        await dispatch(calendarAvailabilityThunks.bulkBlockDays(user.id, {
            startDate: blockFrom,
            endDate: blockTo,
            reason: blockReason || 'Blocked'
        }));

        setBlockFrom(null);
        setBlockTo(null);
        setBlockReason('');
    }, [blockFrom, blockReason, blockTo, dispatch, user?.id]);

    useEffect(() => {
        if (!settings && user?.id) {
            dispatch(calendarAvailabilityThunks.refreshSettings(user.id));
        }
    }, [dispatch, settings, user?.id]);

    const builtInTemplates = CALENDAR_BUILT_IN_TEMPLATES;
    const customTemplates = formik.values.customTemplates || [];

    return (
        <Stack spacing={3}>
            <Card>
                <CardHeader title="Global calendar settings" />
                <CardContent>
                    <Stack spacing={3}>
                        <Alert severity="info">
                            Enable the calendar so clients can book appointments with you. Disabling the calendar hides the time selection step in requests.
                        </Alert>

                        <FormControlLabel
                            control={(
                                <Checkbox
                                    checked={formik.values.enabled}
                                    onChange={(event) => formik.setFieldValue('enabled', event.target.checked)}
                                />
                            )}
                            label="Enable calendar"
                        />

                        <Grid container spacing={3} sx={{ pr: 3 }}>
                            <Grid item xs={11} md={4}>
                                <FormControl fullWidth>
                                    <InputLabel id="slot-duration-label">Slot duration</InputLabel>
                                    <Select
                                        label="Slot duration"
                                        labelId="slot-duration-label"
                                        name="slotDuration"
                                        onChange={formik.handleChange}
                                        value={formik.values.slotDuration}
                                    >
                                        {SLOT_OPTIONS.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option} min.
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={11} md={4}>
                                <FormControl fullWidth>
                                    <InputLabel id="buffer-time-label">Buffer between meetings</InputLabel>
                                    <Select
                                        label="Buffer between meetings"
                                        labelId="buffer-time-label"
                                        name="bufferTime"
                                        onChange={formik.handleChange}
                                        value={formik.values.bufferTime}
                                    >
                                        {BUFFER_OPTIONS.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option} min.
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={11} md={4}>
                                <FormControl fullWidth>
                                    <InputLabel id="min-notice-label">Minimum time before booking</InputLabel>
                                    <Select
                                        label="Minimum time before booking"
                                        labelId="min-notice-label"
                                        name="minBookingNotice"
                                        onChange={formik.handleChange}
                                        value={formik.values.minBookingNotice}
                                    >
                                        {MIN_NOTICE_OPTIONS.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <Divider />

                        <Stack spacing={2}>
                            <Typography variant="h6">
                                Working days and intervals
                            </Typography>
                            {WEEK_DAYS.map((day) => {
                                const dayConfig = formik.values.workingDays[day.key];
                                return (
                                    <Box
                                        key={day.key}
                                        sx={{
                                            border: (theme) => `1px solid ${theme.palette.divider}`,
                                            borderRadius: 2,
                                            p: 2
                                        }}
                                    >
                                        <Stack
                                            alignItems="flex-start"
                                            direction="row"
                                            justifyContent="space-between"
                                            spacing={2}
                                            sx={{ flexWrap: 'wrap' }}
                                        >
                                            <FormControlLabel
                                                control={(
                                                    <Checkbox
                                                        checked={dayConfig.enabled}
                                                        onChange={handleDayToggle(day.key)}
                                                    />
                                                )}
                                                label={day.label}
                                            />

                                            <Button
                                                disabled={!dayConfig.enabled}
                                                onClick={handleAddInterval(day.key)}
                                                size="small"
                                                startIcon={(
                                                    <SvgIcon>
                                                        <AddCircleIcon />
                                                    </SvgIcon>
                                                )}
                                            >
                                                Add interval
                                            </Button>
                                        </Stack>

                                        <Stack spacing={1} sx={{ mt: 2 }}>
                                            {dayConfig.intervals.map((interval, index) => (
                                                <Stack
                                                    key={`${day.key}-${index}`}
                                                    alignItems="center"
                                                    direction="row"
                                                    spacing={1}
                                                    sx={{ flexWrap: 'wrap' }}
                                                >
                                                    <TextField
                                                        disabled={!dayConfig.enabled}
                                                        label="Start"
                                                        onChange={handleIntervalChange(day.key, index, 'start')}
                                                        size="small"
                                                        type="time"
                                                        value={interval.start}
                                                    />
                                                    <TextField
                                                        disabled={!dayConfig.enabled}
                                                        label="End"
                                                        onChange={handleIntervalChange(day.key, index, 'end')}
                                                        size="small"
                                                        type="time"
                                                        value={interval.end}
                                                    />
                                                    <IconButton
                                                        color="error"
                                                        disabled={!dayConfig.enabled || dayConfig.intervals.length === 1}
                                                        onClick={handleRemoveInterval(day.key, index)}
                                                        size="small"
                                                    >
                                                        <SvgIcon fontSize="small">
                                                            <RemoveIcon />
                                                        </SvgIcon>
                                                    </IconButton>
                                                </Stack>
                                            ))}
                                        </Stack>
                                    </Box>
                                );
                            })}
                        </Stack>

                        <Divider />

                        <Stack spacing={2}>
                            <Typography variant="h6">
                                Pre-installed templates
                            </Typography>
                            <Alert severity="info">
                                Click on the template to apply the working time and interval settings.
                            </Alert>

                            <Grid container spacing={2} sx={{ pr: 3 }}>
                                {[...builtInTemplates, ...customTemplates].map((template) => (
                                    <Grid item xs={12} md={4} key={template.key}>
                                        <Card
                                            variant="outlined"
                                            sx={{
                                                height: '100%',
                                                cursor: 'pointer',
                                                borderColor: 'divider',
                                                '&:hover': {
                                                    borderColor: 'primary.main',
                                                    boxShadow: (theme) => theme.shadows[2]
                                                }
                                            }}
                                            onClick={() => handleApplyTemplate(template)}
                                        >
                                            <CardContent>
                                                <Typography variant="subtitle1">
                                                    {template.name}
                                                </Typography>
                                                <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">
                                                    {template.description}
                                                </Typography>
                                                <Stack spacing={0.5} sx={{ mt: 2 }}>
                                                    <Typography variant="caption">
                                                        Slot: {template.slotDuration} min
                                                    </Typography>
                                                    <Typography variant="caption">
                                                        Buffer: {template.bufferTime} min
                                                    </Typography>
                                                    <Typography variant="caption">
                                                        Minimum notice: {template.minBookingNotice} day.
                                                    </Typography>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>

                            <Button
                                onClick={handleSaveTemplate}
                                startIcon={(
                                    <SvgIcon>
                                        <SaveAsIcon />
                                    </SvgIcon>
                                )}
                                variant="outlined"
                            >
                                Save current settings as a template
                            </Button>
                        </Stack>

                        <Divider />

                        <Stack spacing={2}>
                            <Typography variant="h6">
                                Mass blocking of days
                            </Typography>
                            <Alert severity="warning">
                                Use date ranges to quickly block vacations, holidays, or large projects.
                            </Alert>
                            <Stack
                                alignItems="center"
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={2}
                            >
                                <DatePicker
                                    label="Start date"
                                    onChange={(value) => setBlockFrom(value ? value.toDate?.() || value : null)}
                                    value={blockFrom}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                                <DatePicker
                                    label="End date"
                                    onChange={(value) => setBlockTo(value ? value.toDate?.() || value : null)}
                                    value={blockTo}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                                <TextField
                                    label="Reason"
                                    onChange={(event) => setBlockReason(event.target.value)}
                                    value={blockReason}
                                />
                                <Button
                                    disabled={!blockFrom || !blockTo}
                                    onClick={handleBulkBlock}
                                    variant="contained"
                                >
                                    Block
                                </Button>
                            </Stack>
                        </Stack>

                        <Divider />

                        <Stack
                            direction={{ xs: 'column', md: 'row' }}
                            justifyContent="space-between"
                            spacing={2}
                        >
                            <Button
                                color="inherit"
                                onClick={onRecurringTabRequest}
                                variant="text"
                            >
                                Managing recurring events
                            </Button>

                            <Stack direction="row" spacing={2}>
                                <Button
                                    color="inherit"
                                    onClick={() => formik.resetForm()}
                                    variant="outlined"
                                >
                                    Reset changes
                                </Button>
                                <Button
                                    disabled={saving || !formik.dirty}
                                    onClick={formik.handleSubmit}
                                    variant="contained"
                                >
                                    Save
                                </Button>
                            </Stack>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        </Stack>
    );
};

CalendarSettingsForm.propTypes = {
    onRecurringTabRequest: PropTypes.func
};