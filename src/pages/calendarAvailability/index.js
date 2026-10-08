import { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Stack,
    Tab,
    Tabs,
    Typography
} from '@mui/material';
import { dashScopeSx, pillTabsSx, StatusPill } from 'src/components/ctmass-ui';
import { BRAND, RADIUS, displayTitleSx } from 'src/theme/ctmass-tokens';
import { useDispatch, useSelector } from 'src/store';
import { useAuth } from 'src/hooks/use-auth';
import { Seo } from 'src/components/seo';
import { SpecialistCalendarView } from './specialist-calendar-view';
import { CalendarSettingsForm } from './calendar-settings-form';
import { CalendarRecurringManager } from './calendar-recurring-manager';
import { CalendarEventDialog } from './calendar-event-dialog';
import { calendarAvailabilityThunks } from 'src/thunks/calendarAvailability';

const TABS = [
    { label: 'Calendar', value: 'calendar' },
    { label: 'Settings', value: 'settings' },
    { label: 'Repeating', value: 'recurring' }
];

const CalendarPage = () => {
    const { user } = useAuth();
    const dispatch = useDispatch();
    const [currentTab, setCurrentTab] = useState('calendar');
    const [dialogState, setDialogState] = useState({ open: false, mode: 'create', data: null });
    const [externalRecurringEdit, setExternalRecurringEdit] = useState(null);

    const { events, recurringEvents, settings, loading, initialized } = useSelector((state) => state.calendarAvailability);

    useEffect(() => {
        if (user?.id) {
            dispatch(calendarAvailabilityThunks.initializeCalendar(user.id));
        }
        return () => {
            dispatch(calendarAvailabilityThunks.resetCalendar());
        };
    }, [dispatch, user?.id]);

    const handleTabChange = (_, value) => {
        setCurrentTab(value);
    };

    const handleOpenCreate = (range) => {
        setDialogState({
            open: true,
            mode: 'create',
            data: range
        });
    };

    const handleOpenEdit = (event) => {
        setDialogState({
            open: true,
            mode: 'update',
            data: event
        });
    };

    const handleEventRangeUpdate = async ({ id, start, end, allDay }) => {
        if (!user?.id || !id) {
            return;
        }
        await dispatch(calendarAvailabilityThunks.updateEvent(user.id, id, {
            start: start?.getTime?.() || start,
            end: end?.getTime?.() || end,
            allDay
        }));
    };

    const handleDialogClose = () => {
        setDialogState({ open: false, mode: 'create', data: null });
    };

    const handleRecurringEdit = (recurringId) => {
        setCurrentTab('recurring');
        setExternalRecurringEdit(recurringId);
    };

    const settingsEnabled = Boolean(settings?.enabled);

    const pageTitle = 'Availability';

    return (
        <>
            <Seo title="Availability calendar" />
            <Box
                component="main"
                sx={{ flexGrow: 1, px: { xs: 2, sm: 3 }, ...dashScopeSx }}
            >
                <Box>
                    <Stack direction="row" alignItems="center" flexWrap="wrap" sx={{ columnGap: 1.5, rowGap: 1 }}>
                        <Typography component="h1" sx={{ ...displayTitleSx, fontSize: { xs: 30, sm: 38, md: 46 } }}>
                            {pageTitle}
                        </Typography>
                        <StatusPill tone={settingsEnabled ? 'green' : 'muted'}>{settingsEnabled ? 'Visible to clients' : 'Off'}</StatusPill>
                    </Stack>
                    <Typography sx={{ mt: { xs: 1, md: 1.5 }, mb: { xs: 3, md: 4 }, maxWidth: 620, color: BRAND.muted, fontSize: { xs: 15, md: 17 }, fontWeight: 500, lineHeight: 1.55 }}>
                        Show clients when you are free, block time off and keep confirmed jobs in one place.
                    </Typography>

                    <Tabs
                        onChange={handleTabChange}
                        scrollButtons={false}
                        value={currentTab}
                        variant="scrollable"
                        aria-label="Calendar sections"
                        sx={{ ...pillTabsSx, mb: { xs: 3, md: 4 }, width: { sm: 'fit-content' } }}
                    >
                        {TABS.map((tab) => (
                            <Tab key={tab.value} label={tab.label} value={tab.value} disableRipple />
                        ))}
                    </Tabs>

                    {currentTab === 'calendar' && (
                        <>
                            {!settingsEnabled && (
                                <Alert severity="warning" sx={{ mb: 2.5, borderRadius: RADIUS.inner }}>
                                    Your calendar is off. Turn it on in Settings so clients can see when you are free.
                                </Alert>
                            )}
                            <SpecialistCalendarView
                                events={events}
                                recurringEvents={recurringEvents}
                                settings={settings}
                                loading={loading}
                                onCreateEventRequest={handleOpenCreate}
                                onEditEventRequest={handleOpenEdit}
                                onRecurringEventRequest={handleRecurringEdit}
                                onEventRangeUpdate={handleEventRangeUpdate}
                            />
                        </>
                    )}

                    {currentTab === 'settings' && (
                        <CalendarSettingsForm onRecurringTabRequest={() => setCurrentTab('recurring')} />
                    )}

                    {currentTab === 'recurring' && (
                        <CalendarRecurringManager
                            externalEditId={externalRecurringEdit}
                            onExternalEditHandled={() => setExternalRecurringEdit(null)}
                        />
                    )}

                    <CalendarEventDialog
                        action={dialogState.mode}
                        event={dialogState.mode === 'update' ? dialogState.data : null}
                        range={dialogState.mode === 'create' ? dialogState.data : null}
                        open={dialogState.open}
                        onClose={handleDialogClose}
                        onAddComplete={handleDialogClose}
                        onEditComplete={handleDialogClose}
                        onDeleteComplete={handleDialogClose}
                    />
                </Box>
            </Box>
        </>
    );
};

export default CalendarPage;