import { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import ChevronLeftIcon from '@untitled-ui/icons-react/build/esm/ChevronLeft';
import ChevronRightIcon from '@untitled-ui/icons-react/build/esm/ChevronRight';
import PlusIcon from '@untitled-ui/icons-react/build/esm/Plus';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import {
    Button,
    IconButton,
    MenuItem,
    Stack,
    SvgIcon,
    TextField,
    Typography,
    useMediaQuery
} from '@mui/material';

const viewOptions = [
    {
        label: 'Month',
        value: 'dayGridMonth'
    },
    {
        label: 'Week',
        value: 'timeGridWeek'
    },
    {
        label: 'Day',
        value: 'timeGridDay'
    },
    {
        label: 'Agenda',
        value: 'listWeek'
    }
];

export const CalendarToolbar = ({
    date,
    onAddClick,
    onDateNext,
    onDatePrev,
    onDateToday,
    onViewChange,
    view,
    ...other
}) => {
    const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));

    const handleViewChange = useCallback((event) => {
        onViewChange?.(event.target.value);
    }, [onViewChange]);

    const monthLabel = format(date, 'LLLL').replace(/^\w/, (c) => c.toUpperCase());
    const yearLabel = format(date, 'yyyy');

    const availableViewOptions = useMemo(() => {
        return mdUp
            ? viewOptions
            : viewOptions.filter((option) => ['timeGridDay', 'listWeek'].includes(option.value));
    }, [mdUp]);

    return (
        <Stack
            alignItems="center"
            flexWrap="wrap"
            justifyContent="space-between"
            flexDirection={{
                xs: 'column',
                md: 'row'
            }}
            spacing={3}
            sx={{ px: 3, py: 2 }}
            {...other}
        >
            <Stack
                alignItems="center"
                direction="row"
                spacing={1.5}
            >
                <Typography variant="h4">
                    {monthLabel}
                </Typography>
                <Typography
                    sx={{ fontWeight: 400 }}
                    variant="h4"
                >
                    {yearLabel}
                </Typography>
            </Stack>

            <Stack
                alignItems="center"
                direction="row"
                spacing={1}
                sx={{
                    width: {
                        xs: '100%',
                        md: 'auto'
                    }
                }}
            >
                <IconButton onClick={onDatePrev}>
                    <SvgIcon>
                        <ChevronLeftIcon />
                    </SvgIcon>
                </IconButton>

                <IconButton onClick={onDateNext}>
                    <SvgIcon>
                        <ChevronRightIcon />
                    </SvgIcon>
                </IconButton>

                <Button
                    color="inherit"
                    onClick={onDateToday}
                    startIcon={(
                        <SvgIcon fontSize="small">
                            <TodayOutlinedIcon />
                        </SvgIcon>
                    )}
                    sx={{
                        display: {
                            xs: 'none',
                            sm: 'inline-flex'
                        }
                    }}
                >
                    Today
                </Button>

                <TextField
                    label="View"
                    name="view"
                    onChange={handleViewChange}
                    select
                    SelectProps={{ displayEmpty: true }}
                    size="small"
                    sx={{
                        minWidth: 140,
                        flexGrow: {
                            xs: 1,
                            md: 0
                        }
                    }}
                    value={view}
                >
                    {availableViewOptions.map((option) => (
                        <MenuItem
                            key={option.value}
                            value={option.value}
                        >
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>

                <Button
                    onClick={onAddClick}
                    startIcon={(
                        <SvgIcon>
                            <PlusIcon />
                        </SvgIcon>
                    )}
                    sx={{
                        flexGrow: {
                            xs: 1,
                            md: 0
                        }
                    }}
                    variant="contained"
                >
                    New event
                </Button>
            </Stack>
        </Stack>
    );
};

CalendarToolbar.propTypes = {
    date: PropTypes.instanceOf(Date).isRequired,
    onAddClick: PropTypes.func,
    onDateNext: PropTypes.func,
    onDatePrev: PropTypes.func,
    onDateToday: PropTypes.func,
    onViewChange: PropTypes.func,
    view: PropTypes.oneOf([
        'dayGridMonth',
        'timeGridWeek',
        'timeGridDay',
        'listWeek'
    ]).isRequired
};