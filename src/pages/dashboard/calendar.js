import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Calendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import { Box, Card, Container, Stack, useMediaQuery } from '@mui/material';
import { Seo } from 'src/components/seo';
import { useDialog } from 'src/hooks/use-dialog';
import { usePageView } from 'src/hooks/use-page-view';
import { CalendarEventDialog } from 'src/sections/dashboard/calendar/calendar-event-dialog';
import { CalendarToolbar } from 'src/sections/dashboard/calendar/calendar-toolbar';
import { CalendarContainer } from 'src/sections/dashboard/calendar/calendar-container';
import { useDispatch, useSelector } from 'src/store';
import { thunks } from 'src/thunks/calendar';

const useEvents = () => {
  const dispatch = useDispatch();
  const events = useSelector((state) => state.calendar.events);

  const handleEventsGet = useCallback(() => {
    dispatch(thunks.getEvents());
  }, [dispatch]);

  useEffect(() => {
      handleEventsGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);

  return events;
};

const useCurrentEvent = (events, dialogData) => {
  return useMemo(() => {
    if (!dialogData) {
      return undefined;
    }

    return events.find((event) => event.id === dialogData.eventId);
  }, [dialogData, events]);
};

const Page = () => {
  const dispatch = useDispatch();
  const calendarRef = useRef(null);
  const events = useEvents();
  const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState(mdUp ? 'timeGridDay' : 'dayGridMonth');
  const createDialog = useDialog();
  const updateDialog = useDialog();
  const updatingEvent = useCurrentEvent(events, updateDialog.data);

  usePageView();

  const handleScreenResize = useCallback(() => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      const newView = mdUp ? 'dayGridMonth' : 'timeGridDay';

      calendarApi.changeView(newView);
      setView(newView);
    }
  }, [calendarRef, mdUp]);

  useEffect(() => {
      handleScreenResize();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mdUp]);

  const handleViewChange = useCallback((view) => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.changeView(view);
      setView(view);
    }
  }, []);

  const handleDateToday = useCallback(() => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.today();
      setDate(calendarApi.getDate());
    }
  }, []);

  const handleDatePrev = useCallback(() => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.prev();
      setDate(calendarApi.getDate());
    }
  }, []);

  const handleDateNext = useCallback(() => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.next();
      setDate(calendarApi.getDate());
    }
  }, []);

  const handleAddClick = useCallback(() => {
    createDialog.handleOpen();
  }, [createDialog]);

  const handleRangeSelect = useCallback((arg) => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.unselect();
    }

    createDialog.handleOpen({
      range: {
        start: arg.start.getTime(),
        end: arg.end.getTime()
      }
    });
  }, [createDialog]);

  const handleEventSelect = useCallback((arg) => {
    updateDialog.handleOpen({
      eventId: arg.event.id
    });
  }, [updateDialog]);

  const handleEventResize = useCallback(async (arg) => {
    const { event } = arg;

    try {
      await dispatch(thunks.updateEvent({
        eventId: event.id,
        update: {
          allDay: event.allDay,
          start: event.start?.getTime(),
          end: event.end?.getTime()
        }
      }));
    } catch (err) {
      console.error(err);
    }
  }, [dispatch]);

  const handleEventDrop = useCallback(async (arg) => {
    const { event } = arg;

    try {
      await dispatch(thunks.updateEvent({
        eventId: event.id,
        update: {
          allDay: event.allDay,
          start: event.start?.getTime(),
          end: event.end?.getTime()
        }
      }));
    } catch (err) {
      console.error(err);
    }
  }, [dispatch]);

  return (
    <>
      <Seo title="Dashboard: Calendar" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <CalendarToolbar
              date={date}
              onAddClick={handleAddClick}
              onDateNext={handleDateNext}
              onDatePrev={handleDatePrev}
              onDateToday={handleDateToday}
              onViewChange={handleViewChange}
              view={view}
            />
            <Card>
              <CalendarContainer>
                <Calendar
                  allDayMaintainDuration
                  dayMaxEventRows={3}
                  droppable
                  editable
                  eventClick={handleEventSelect}
                  eventDisplay="block"
                  eventDrop={handleEventDrop}
                  eventResizableFromStart
                  eventResize={handleEventResize}
                  events={events}
                  headerToolbar={false}
                  height={800}
                  initialDate={date}
                  initialView={view}
                  plugins={[
                    dayGridPlugin,
                    interactionPlugin,
                    listPlugin,
                    timeGridPlugin,
                    timelinePlugin
                  ]}
                  ref={calendarRef}
                  rerenderDelay={10}
                  select={handleRangeSelect}
                  selectable
                  weekends
                />
              </CalendarContainer>
            </Card>
          </Stack>
        </Container>
      </Box>
      <CalendarEventDialog
        action="create"
        onAddComplete={createDialog.handleClose}
        onClose={createDialog.handleClose}
        open={createDialog.open}
        range={createDialog.data?.range}
      />
      <CalendarEventDialog
        action="update"
        event={updatingEvent}
        onClose={updateDialog.handleClose}
        onDeleteComplete={updateDialog.handleClose}
        onEditComplete={updateDialog.handleClose}
        open={updateDialog.open}
      />
    </>
  );
};

export default Page;
