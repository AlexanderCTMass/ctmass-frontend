import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Alert,
    Button,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Stack,
    Switch,
    Typography
} from '@mui/material';
import { useDispatch, useSelector } from 'src/store';
import { calendarAvailabilityThunks } from 'src/thunks/calendarAvailability';
import { useAuth } from 'src/hooks/use-auth';
import { DEFAULT_CALENDAR_SETTINGS } from 'src/api/calendarAvailability';
import { paths } from 'src/paths';

export const AccountCalendarSettings = ({ user, handleProfileChange }) => {
    const { user: authUser } = useAuth();
    const dispatch = useDispatch();
    const settings = useSelector((state) => state.calendarAvailability.settings);
    const loading = useSelector((state) => state.calendarAvailability.loading);
    const saving = useSelector((state) => state.calendarAvailability.settingsSaving);
    const [localEnabled, setLocalEnabled] = useState(false);

    useEffect(() => {
        if (authUser?.id) {
            dispatch(calendarAvailabilityThunks.initializeCalendar(authUser.id));
        }
    }, [dispatch, authUser?.id]);

    useEffect(() => {
        setLocalEnabled(Boolean(settings?.enabled));
    }, [settings]);

    const handleToggle = useCallback(async (_, checked) => {
        if (!authUser?.id) {
            return;
        }
        setLocalEnabled(checked);
        await dispatch(calendarAvailabilityThunks.saveSettings(authUser.id, {
            ...(settings || DEFAULT_CALENDAR_SETTINGS),
            enabled: checked
        }));
        await handleProfileChange?.({ calendarEnabled: checked });
    }, [authUser?.id, dispatch, handleProfileChange, settings]);

    const workingSummary = useMemo(() => {
        const activeDays = Object.entries(settings?.workingDays || DEFAULT_CALENDAR_SETTINGS.workingDays)
            .filter(([, value]) => value.enabled)
            .length;
        const slot = settings?.slotDuration || DEFAULT_CALENDAR_SETTINGS.slotDuration;
        const buffer = settings?.bufferTime || DEFAULT_CALENDAR_SETTINGS.bufferTime;
        return {
            activeDays,
            slot,
            buffer
        };
    }, [settings]);

    return (
        <Stack spacing={3}>
            <Card>
                <CardHeader title="Employment calendar" />
                <CardContent>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Manage your availability so clients can book appointments. You can always go to the "Calendar" section for detailed settings.
                    </Alert>

                    <Stack
                        alignItems="center"
                        direction="row"
                        justifyContent="space-between"
                        spacing={2}
                    >
                        <Typography variant="subtitle1">
                            Enable calendar
                        </Typography>
                        <Switch
                            checked={localEnabled}
                            disabled={loading || saving}
                            onChange={handleToggle}
                        />
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Stack spacing={1}>
                        <Typography variant="subtitle2">
                            Quick summary
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                            Working days per week: {workingSummary.activeDays}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                            Slot duration: {workingSummary.slot} min
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                            Buffer: {workingSummary.buffer} min
                        </Typography>
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <Button
                            color="primary"
                            href={paths.cabinet.calendar}
                            variant="contained"
                        >
                            Open calendar
                        </Button>
                        <Button
                            color="inherit"
                            href={paths.cabinet.calendar}
                            variant="text"
                        >
                            Set up working days
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Stack>
    );
};

AccountCalendarSettings.propTypes = {
    user: PropTypes.object,
    handleProfileChange: PropTypes.func
};