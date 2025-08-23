import React, { useState } from 'react';
import {
    Accordion, AccordionDetails, AccordionSummary,
    Box,
    Button,
    ButtonGroup,
    Grid,
    IconButton,
    Paper,
    Tooltip,
    Typography
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers';
import { Delete, RestartAlt, Schedule, WorkHistory, Weekend, ExpandMore } from '@mui/icons-material';
import {
    format,
    startOfWeek,
    eachDayOfInterval,
    isWeekend,
    addWeeks
} from 'date-fns';

export const SmartAvailabilityCalendar = ({ editMode }) => {
    const [selectedDays, setSelectedDays] = useState([]);
    const [timeRange, setTimeRange] = useState({
        start: new Date().setHours(9, 0),
        end: new Date().setHours(17, 0)
    });
    const [availability, setAvailability] = useState({});
    const [currentWeek, setCurrentWeek] = useState(0);
    const [expanded, setExpanded] = useState(false);

    // Generate days for current week
    const days = eachDayOfInterval({
        start: startOfWeek(addWeeks(new Date(), currentWeek)),
        end: addWeeks(startOfWeek(addWeeks(new Date(), currentWeek)), 1)
    });

    // Reset all settings
    const resetAll = () => {
        if (window.confirm('Reset all settings?')) {
            setAvailability({});
            setSelectedDays([]);
            setTimeRange({
                start: new Date().setHours(9, 0),
                end: new Date().setHours(17, 0)
            });
            setCurrentWeek(0);
        }
    };

    const toMinutes = (timeStr) => {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');
        hours = parseInt(hours);
        minutes = parseInt(minutes);

        if (modifier === 'PM' && hours !== 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        return hours * 60 + minutes;
    };

    const fromMinutes = (minutes) => {
        let hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const modifier = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours || 12; // 0 часов становится 12 AM

        return {
            time: `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${modifier}`,
            minutes: minutes
        };
    };

    // Delete schedule for specific day
    const deleteDaySchedule = (dateStr) => {
        if (window.confirm('Delete schedule for this day?')) {
            const newAvailability = { ...availability };
            delete newAvailability[dateStr];
            setAvailability(newAvailability);
        }
    };
    const applyToWorkdays = () => {
        const start = new Date(timeRange.start);
        const end = new Date(timeRange.end);

        if (end <= start) {
            alert('End time must be after start time');
            return;
        }

        const newSlot = {
            start: format(start, 'hh:mm a'),
            end: format(end, 'hh:mm a'),
            startMinutes: toMinutes(format(start, 'hh:mm a')),
            endMinutes: toMinutes(format(end, 'hh:mm a'))
        };

        const newAvailability = { ...availability };
        days.filter(day => !isWeekend(day)).forEach(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const existingSlots = (newAvailability[dateStr] || []).map(s => ({
                ...s,
                startMinutes: toMinutes(s.start),
                endMinutes: toMinutes(s.end)
            }));

            newAvailability[dateStr] = mergeIntervals(existingSlots, newSlot);
        });

        setAvailability(newAvailability);
    };

    const mergeIntervals = (existingIntervals, newInterval) => {
        const merged = [...existingIntervals];
        merged.push(newInterval);

        // Сортировка по времени начала
        merged.sort((a, b) => a.startMinutes - b.startMinutes);

        const result = [];
        let previous = merged[0];

        for (let i = 1; i < merged.length; i++) {
            const current = merged[i];

            if (previous.endMinutes >= current.startMinutes) {
                // Пересекаются или соприкасаются - объединяем
                previous = {
                    startMinutes: Math.min(previous.startMinutes, current.startMinutes),
                    endMinutes: Math.max(previous.endMinutes, current.endMinutes),
                    start: fromMinutes(Math.min(previous.startMinutes, current.startMinutes)).time,
                    end: fromMinutes(Math.max(previous.endMinutes, current.endMinutes)).time
                };
            } else {
                result.push(previous);
                previous = current;
            }
        }

        result.push(previous);
        return result;
    };

    // Mark weekends as busy
    const markWeekendsAsBusy = () => {
        const newAvailability = { ...availability };
        days.filter(isWeekend).forEach(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            delete newAvailability[dateStr];
        });
        setAvailability(newAvailability);
    };

    // Handle day selection
    const handleDayClick = (day) => {
        if (!editMode) return;

        const dateStr = format(day, 'yyyy-MM-dd');
        setSelectedDays(prev =>
            prev.includes(dateStr)
                ? prev.filter(d => d !== dateStr)
                : [...prev, dateStr]
        );
    };

    const saveTimeRange = () => {
        const start = new Date(timeRange.start);
        const end = new Date(timeRange.end);

        if (end <= start) {
            alert('End time must be after start time');
            return;
        }

        const newSlot = {
            start: format(start, 'hh:mm a'),
            end: format(end, 'hh:mm a'),
            startMinutes: toMinutes(format(start, 'hh:mm a')),
            endMinutes: toMinutes(format(end, 'hh:mm a'))
        };

        const newAvailability = { ...availability };
        selectedDays.forEach(dateStr => {
            const existingSlots = (newAvailability[dateStr] || []).map(s => ({
                ...s,
                startMinutes: toMinutes(s.start),
                endMinutes: toMinutes(s.end)
            }));

            newAvailability[dateStr] = mergeIntervals(existingSlots, newSlot);
        });

        setAvailability(newAvailability);
        setSelectedDays([]);
    };

    // Handle time change
    const handleTimeChange = (type, value) => {
        setTimeRange(prev => ({
            ...prev,
            [type]: value.getTime()
        }));
    };

    // Week navigation
    const handleWeekNavigation = (direction) => {
        setCurrentWeek(prev => Math.max(0, prev + direction));
        setSelectedDays([]);
    };

    return (
        <Accordion sx={{ mt: 2 }} expanded={expanded} onChange={() => setExpanded(!expanded)}>
            <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Schedule fontSize="large" color="primary" />

                    {editMode ? (
                        <Typography variant="h5"> Availability Schedule</Typography>) : (
                        <Typography variant="h5">Free time</Typography>
                    )}
                </Box>
            </AccordionSummary>

            <AccordionDetails>

                <Box sx={{ p: 1, maxWidth: 1200, margin: 'auto' }}>
                    {/* Header */}
                    <Box sx={{
                        display: 'flex',
                        gap: 2,
                        mb: 2,
                        alignItems: 'center',
                        flexWrap: 'wrap'
                    }}>
                        <Box sx={{
                            ml: 'auto',
                            display: 'flex',
                            gap: 1,
                            flexWrap: 'wrap'
                        }}>
                            <ButtonGroup variant="outlined" size="small">
                                <Button
                                    onClick={() => handleWeekNavigation(-1)}
                                    disabled={currentWeek === 0}
                                >
                                    ← Previous
                                </Button>
                                <Button onClick={() => handleWeekNavigation(1)}>
                                    Next →
                                </Button>
                            </ButtonGroup>

                            {editMode && (
                                <Tooltip title="Reset all">
                                    <IconButton onClick={resetAll} color="error">
                                        <RestartAlt fontSize="large" />
                                    </IconButton>
                                </Tooltip>)}
                        </Box>
                    </Box>

                    {/* Control Panel */}
                    {editMode && (
                        <Box sx={{
                            mb: 2,
                            display: 'flex',
                            gap: 1,
                            alignItems: 'center',
                            flexWrap: 'wrap'
                        }}>
                            <TimePicker
                                label="Start Time"
                                value={new Date(timeRange.start)}
                                onChange={(v) => handleTimeChange('start', v)}
                                ampm={true}
                                minutesStep={15}
                                sx={{ minWidth: 140 }}
                            />

                            <TimePicker
                                label="End Time"
                                value={new Date(timeRange.end)}
                                onChange={(v) => handleTimeChange('end', v)}
                                ampm={true}
                                minutesStep={15}
                                sx={{ minWidth: 140 }}
                            />

                            <Button
                                variant="contained"
                                onClick={saveTimeRange}
                                disabled={selectedDays.length === 0}
                                sx={{ height: 56 }}
                            >
                                Apply to {selectedDays.length} days
                            </Button>

                            <ButtonGroup
                                variant="outlined"
                                sx={{
                                    ml: 'auto',
                                    '& .MuiButton-root': { height: 56 }
                                }}
                            >
                                <Button
                                    onClick={applyToWorkdays}
                                    startIcon={<WorkHistory />}
                                >
                                    Workdays
                                </Button>
                                <Button
                                    onClick={markWeekendsAsBusy}
                                    startIcon={<Weekend />}
                                    color="secondary"
                                >
                                    Clear Weekends
                                </Button>
                            </ButtonGroup>
                        </Box>
                    )}

                    {/* Days Grid */}
                    <Grid container spacing={1}>
                        {days.map(day => (
                            <DayCard
                                key={format(day, 'yyyy-MM-dd')}
                                day={day}
                                mode={editMode}
                                availability={availability}
                                onDelete={deleteDaySchedule}
                                onSelect={handleDayClick}
                                isSelected={selectedDays.includes(format(day, 'yyyy-MM-dd'))}
                            />
                        ))}
                    </Grid>
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};

// Day Card Component
const DayCard = ({ day, editMode, availability, onDelete, onSelect, isSelected }) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayAvailability = availability[dateStr] || [];

    return (
        <Grid item xs={12} sm={6} md={4} lg={3}>
            <Paper
                elevation={isSelected ? 3 : 1}
                sx={{
                    p: 1,
                    cursor: editMode ? 'pointer' : 'default',
                    border: isSelected ? '2px solid #1976d2' : '1px solid #ddd',
                    transition: 'all 0.2s',
                    minHeight: 120,
                    position: 'relative',
                    bgcolor: isWeekend(day) ? '#f8f9fa' : 'background.paper',
                    '&:hover .delete-btn': { opacity: editMode ? 1 : 0 }
                }}
                onClick={() => onSelect(day)}
            >
                {editMode && dayAvailability.length > 0 && (
                    <IconButton
                        className="delete-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(dateStr);
                        }}
                        sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            color: 'error.main'
                        }}
                    >
                        <Delete fontSize="small" />
                    </IconButton>
                )}

                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {format(day, 'EEE, MMM d')}
                </Typography>

                <Box sx={{ mt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {dayAvailability.map((slot, i) => (
                        <Typography
                            key={i}
                            variant="body2"
                            sx={{
                                bgcolor: '#4caf50',
                                color: 'white',
                                p: '1px 6px',
                                borderRadius: 0.5,
                                fontSize: 13,
                                lineHeight: 1.2
                            }}
                        >
                            {`${slot.start} - ${slot.end}`}
                        </Typography>
                    ))}

                    {!dayAvailability.length && (
                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: 13 }}>
                            No availability
                        </Typography>
                    )}
                </Box>
            </Paper>
        </Grid>
    );
};