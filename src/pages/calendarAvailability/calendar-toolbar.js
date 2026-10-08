import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { Box, Button, IconButton, Stack, Typography, useMediaQuery } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { btn, focusRingSx } from 'src/components/ctmass-ui';
import { BRAND, FONT, RADIUS, SHADOW } from 'src/theme/ctmass-tokens';

const viewOptions = [
    { label: 'Month', value: 'dayGridMonth' },
    { label: 'Week', value: 'timeGridWeek' },
    { label: 'Day', value: 'timeGridDay' },
    { label: 'Agenda', value: 'listWeek' }
];

const navButtonSx = {
    width: 40,
    height: 40,
    borderRadius: '12px',
    color: BRAND.navy,
    border: `1px solid ${alpha(BRAND.navy, 0.12)}`,
    '&:hover': { bgcolor: BRAND.mist, borderColor: BRAND.navy }
};

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

    const availableViewOptions = useMemo(() => (
        mdUp ? viewOptions : viewOptions.filter((option) => ['timeGridDay', 'listWeek'].includes(option.value))
    ), [mdUp]);

    return (
        <Stack
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'stretch', md: 'center' }}
            justifyContent="space-between"
            sx={{ gap: 2, px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 }, pb: 2 }}
            {...other}
        >
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
                <Typography sx={{ fontFamily: FONT.display, fontWeight: 800, fontSize: { xs: 24, md: 30 }, letterSpacing: '-0.02em', color: BRAND.navy }}>
                    {format(date, 'MMMM')}{' '}
                    <Box component="span" sx={{ fontWeight: 600, color: BRAND.muted }}>{format(date, 'yyyy')}</Box>
                </Typography>
                <Stack direction="row" spacing={0.75} alignItems="center">
                    <IconButton aria-label="Previous" onClick={onDatePrev} sx={navButtonSx}>
                        <ChevronLeftRoundedIcon />
                    </IconButton>
                    <Button onClick={onDateToday} sx={{ ...btn.outline, minHeight: 40, px: 1.75, fontSize: 14 }}>
                        Today
                    </Button>
                    <IconButton aria-label="Next" onClick={onDateNext} sx={navButtonSx}>
                        <ChevronRightRoundedIcon />
                    </IconButton>
                </Stack>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                    role="tablist"
                    aria-label="Calendar view"
                    sx={{
                        flex: { xs: 1, md: 'none' },
                        display: 'grid',
                        gridTemplateColumns: `repeat(${availableViewOptions.length}, minmax(0, 1fr))`,
                        p: 0.5,
                        borderRadius: RADIUS.pill,
                        bgcolor: alpha(BRAND.navy, 0.07)
                    }}
                >
                    {availableViewOptions.map((option) => {
                        const active = option.value === view;
                        return (
                            <Box
                                key={option.value}
                                component="button"
                                type="button"
                                role="tab"
                                aria-selected={active}
                                onClick={() => onViewChange?.(option.value)}
                                sx={{
                                    height: 38,
                                    px: 2,
                                    border: 0,
                                    borderRadius: RADIUS.pill,
                                    bgcolor: active ? BRAND.navy : 'transparent',
                                    color: active ? '#FFFFFF' : BRAND.navy,
                                    boxShadow: active ? SHADOW.sm : 'none',
                                    font: 'inherit',
                                    fontSize: 14,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'background-color .25s ease, color .25s ease',
                                    ...focusRingSx
                                }}
                            >
                                {option.label}
                            </Box>
                        );
                    })}
                </Box>
                <Button onClick={onAddClick} startIcon={<AddRoundedIcon />} sx={{ ...btn.green, minHeight: 46, flexShrink: 0 }}>
                    {mdUp ? 'New event' : 'Add'}
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
