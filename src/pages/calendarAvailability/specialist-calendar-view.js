import { useCallback, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Box, Chip, Stack, Tooltip, Typography } from '@mui/material';
import { format } from 'date-fns';
import { CalendarContainer } from 'src/sections/dashboard/calendar/calendar-container';
import { CalendarToolbar } from './calendar-toolbar';
import {
    aggregateEventsForRange,
    buildDayStatusMap,
    EVENT_CATEGORY_COLORS,
    EVENT_STATUS_ICONS,
    getStatusEmoji,
    mapEventToFullCalendar
} from './utils';

const VIEW_TO_DURATION = {
    dayGridMonth: 'month',
    timeGridWeek: 'week',
    timeGridDay: 'day',
    listWeek: 'week'
};

export const SpecialistCalendarView = ({
    events,
    recurringEvents,
    settings,
    loading,
    onCreateEventRequest,
    onEditEventRequest,
    onRecurringEventRequest,
    onEventRangeUpdate
}) => {
    const calendarRef = useRef(null);
    const [currentView, setCurrentView] = useState('dayGridMonth');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [visibleRange, setVisibleRange] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    });

    const combinedEvents = useMemo(() => aggregateEventsForRange(
        events,
        recurringEvents,
        visibleRange?.start,
        visibleRange?.end
    ), [events, recurringEvents, visibleRange]);

    const fullCalendarEvents = useMemo(
        () => combinedEvents.map(mapEventToFullCalendar),
        [combinedEvents]
    );

    const dayStatusMap = useMemo(
        () => buildDayStatusMap(settings, combinedEvents, visibleRange?.start, visibleRange?.end),
        [settings, combinedEvents, visibleRange]
    );

    const handleViewChange = useCallback((view) => {
        const calendarApi = calendarRef.current?.getApi();
        calendarApi?.changeView(view);
        setCurrentView(view);
    }, []);

    const handleDateNext = useCallback(() => {
        const calendarApi = calendarRef.current?.getApi();
        calendarApi?.next();
    }, []);

    const handleDatePrev = useCallback(() => {
        const calendarApi = calendarRef.current?.getApi();
        calendarApi?.prev();
    }, []);

    const handleDateToday = useCallback(() => {
        const calendarApi = calendarRef.current?.getApi();
        calendarApi?.today();
    }, []);

    const handleDateSet = useCallback((arg) => {
        setCurrentDate(arg.start);
        setCurrentView(arg.view.type);

        setVisibleRange({
            start: arg.view.currentStart,
            end: arg.view.currentEnd
        });
    }, []);

    const handleSelect = useCallback((selection) => {
        onCreateEventRequest?.({
            start: selection.start,
            end: selection.end,
            allDay: selection.allDay
        });
    }, [onCreateEventRequest]);

    const handleDateClick = useCallback((info) => {
        const start = info.date;
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + (settings?.slotDuration || 60));
        onCreateEventRequest?.({
            start,
            end,
            allDay: false
        });
    }, [onCreateEventRequest, settings?.slotDuration]);

    const handleEventClick = useCallback((info) => {
        const { extendedProps } = info.event;
        if (extendedProps?.source === 'recurring' && extendedProps?.metadata?.recurringId) {
            onRecurringEventRequest?.(extendedProps.metadata.recurringId);
            return;
        }

        onEditEventRequest?.({
            id: info.event.id,
            title: info.event.title,
            start: info.event.start?.getTime?.() || info.event.start,
            end: info.event.end?.getTime?.() || info.event.end,
            allDay: info.event.allDay,
            category: extendedProps?.category,
            status: extendedProps?.status,
            description: extendedProps?.description,
            color: extendedProps?.color,
            metadata: extendedProps?.metadata,
            source: extendedProps?.source
        });
    }, [onEditEventRequest, onRecurringEventRequest]);

    const handleEventDropOrResize = useCallback((info) => {
        onEventRangeUpdate?.({
            id: info.event.id,
            start: info.event.start,
            end: info.event.end,
            allDay: info.event.allDay
        });
    }, [onEventRangeUpdate]);

    const renderEventContent = useCallback((eventInfo) => {
        const { extendedProps } = eventInfo.event;
        const icon = EVENT_STATUS_ICONS[extendedProps?.status] || '';
        const categoryColor = extendedProps?.color || EVENT_CATEGORY_COLORS.meeting;

        return (
            <Tooltip
                arrow
                placement="top"
                title={
                    <Stack spacing={0.5}>
                        <Typography variant="subtitle2">{eventInfo.event.title}</Typography>
                        <Typography variant="caption">
                            {format(eventInfo.event.start, 'dd MMM HH:mm')} — {format(eventInfo.event.end || eventInfo.event.start, 'HH:mm')}
                        </Typography>
                        <Typography color="inherit" variant="caption">
                            {extendedProps?.description || 'No description'}
                        </Typography>
                    </Stack>
                }
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.25,
                        color: '#FFFFFF'
                    }}
                >
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {icon} {eventInfo.timeText}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                        {eventInfo.event.title}
                    </Typography>
                    {extendedProps?.metadata?.location && (
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                            📍 {extendedProps.metadata.location}
                        </Typography>
                    )}
                </Box>
            </Tooltip>
        );
    }, []);

    const dayCellContent = useCallback((arg) => {
        const dayKey = arg.date.toISOString().slice(0, 10);
        const status = dayStatusMap[dayKey];
        const emoji = getStatusEmoji(status);
        const count = combinedEvents.filter((event) => {
            const eventDate = new Date(event.start);
            return eventDate.getFullYear() === arg.date.getFullYear()
                && eventDate.getMonth() === arg.date.getMonth()
                && eventDate.getDate() === arg.date.getDate();
        }).length;

        return (
            <Stack spacing={0.5}>
                <Stack
                    alignItems="center"
                    direction="row"
                    justifyContent="space-between"
                    spacing={1}
                >
                    <Typography component="span" variant="subtitle2">
                        {arg.dayNumberText}
                    </Typography>
                    {emoji && (
                        <Typography component="span" variant="caption">
                            {emoji}
                        </Typography>
                    )}
                </Stack>
                {count > 0 && (
                    <Typography
                        color="text.secondary"
                        component="span"
                        sx={{ fontSize: '0.65rem' }}
                    >
                        {count} events
                    </Typography>
                )}
            </Stack>
        );
    }, [combinedEvents, dayStatusMap]);

    const handleEventClassNames = useCallback((event) => {
        const classes = ['calendar-event'];
        const category = event.extendedProps?.category;
        if (category) {
            classes.push(`calendar-event--${category}`);
        }
        return classes;
    }, []);

    const renderLegend = useMemo(() => (
        <Stack
            direction="row"
            flexWrap="wrap"
            spacing={1}
            sx={{ px: 3, pb: 2 }}
        >
            <Chip
                label="Free"
                size="small"
                sx={{ backgroundColor: '#10B981', color: '#fff' }}
            />
            <Chip
                label="Blocked"
                size="small"
                sx={{ backgroundColor: '#EF4444', color: '#fff' }}
            />
            <Chip
                label="Confirmed"
                size="small"
                sx={{ backgroundColor: '#3B82F6', color: '#fff' }}
            />
            <Chip
                label="Suggested"
                size="small"
                sx={{ backgroundColor: '#F59E0B', color: '#fff' }}
            />
            <Chip
                label="Non-working day"
                size="small"
                sx={{ backgroundColor: '#9CA3AF', color: '#fff' }}
            />
        </Stack>
    ), []);

    return (
        <Box sx={{ position: 'relative' }}>
            <CalendarToolbar
                date={currentDate}
                onAddClick={() => onCreateEventRequest?.(null)}
                onDateNext={handleDateNext}
                onDatePrev={handleDatePrev}
                onDateToday={handleDateToday}
                onViewChange={handleViewChange}
                view={currentView}
            />
            {renderLegend}
            <CalendarContainer>
                <FullCalendar
                    ref={calendarRef}
                    allDaySlot={true}
                    dayMaxEvents={3}
                    dayMaxEventRows={3}
                    displayEventEnd
                    editable={!loading}
                    eventClick={handleEventClick}
                    eventClassNames={handleEventClassNames}
                    eventContent={renderEventContent}
                    eventDrop={handleEventDropOrResize}
                    eventResize={handleEventDropOrResize}
                    events={fullCalendarEvents}
                    headerToolbar={false}
                    height="auto"
                    initialView="dayGridMonth"
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                    selectable
                    select={handleSelect}
                    selectMirror
                    dayCellContent={dayCellContent}
                    dateClick={handleDateClick}
                    initialDate={new Date()}
                    datesSet={handleDateSet}
                    eventBorderColor="transparent"
                    eventDisplay="block"
                    eventOverlap
                />
            </CalendarContainer>
        </Box>
    );
};

SpecialistCalendarView.propTypes = {
    events: PropTypes.array,
    recurringEvents: PropTypes.array,
    settings: PropTypes.object,
    loading: PropTypes.bool,
    onCreateEventRequest: PropTypes.func,
    onEditEventRequest: PropTypes.func,
    onRecurringEventRequest: PropTypes.func,
    onEventRangeUpdate: PropTypes.func
};