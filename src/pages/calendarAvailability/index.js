import { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Container,
    Divider,
    Tab,
    Tabs,
    Typography
} from '@mui/material';
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
    { label: 'Replays', value: 'recurring' }
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

    const pageTitle = settingsEnabled ? 'Employment calendar' : 'Calendar (off)';

    return (
        <>
            <Seo title="Cabinet: Calendar" />
            <Box
                component="main"
                sx={{ flexGrow: 1 }}
            >
                <Container maxWidth="xl">
                    <Typography variant="h2" sx={{ mb: 3 }}>
                        {pageTitle}
                    </Typography>

                    <Tabs
                        indicatorColor="primary"
                        onChange={handleTabChange}
                        scrollButtons="auto"
                        textColor="primary"
                        value={currentTab}
                        variant="scrollable"
                    >
                        {TABS.map((tab) => (
                            <Tab key={tab.value} label={tab.label} value={tab.value} />
                        ))}
                    </Tabs>
                    <Divider sx={{ mb: 3 }} />

                    {currentTab === 'calendar' && (
                        <>
                            {!settingsEnabled && (
                                <Alert severity="warning" sx={{ mb: 2 }}>
                                    The calendar is disabled. Enable it in the "Settings" tab so clients can see your availability.
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
                </Container>
            </Box>
        </>
    );
};

export default CalendarPage;