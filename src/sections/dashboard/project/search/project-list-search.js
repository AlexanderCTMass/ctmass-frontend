import * as React from 'react';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {
    Box,
    Button,
    Card, Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    Divider,
    FormControlLabel,
    Stack,
    Typography
} from '@mui/material';
import {useDispatch, useSelector} from "../../../../store";
import {thunks} from "../../../../thunks/dictionary";
import {useUpdateEffect} from "../../../../hooks/use-update-effect";
import {useAuth} from "../../../../hooks/use-auth";
import {SpecialtySelectForm} from "../../../../components/specialty-select-form";
import ChevronDownIcon from "@untitled-ui/icons-react/build/esm/ChevronDown";
import {usePopover} from "../../../../hooks/use-popover";

import {DateRangePicker} from "@mui/x-date-pickers-pro";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {formatDateRange} from "../../../../utils/date-locale";
import {AddressAutoComplete} from "../../../../components/address/AddressAutoComplete";

const useCategories = () => {
    const dispatch = useDispatch();
    const {categories, specialties} = useSelector((state) => state.dictionary);

    useEffect(() => {
        dispatch(thunks.getCategories({}));
    }, [dispatch]);

    return [];
};


export const ProjectListSearch = (props) => {
    const {onFiltersChange, ...other} = props;
    const {user} = useAuth();
    const popover = usePopover();
    const datePopover = usePopover();
    const locationPopover = usePopover();

    const [location, setLocation] = useState(null);
    const [showNotinterested, setShowNotinterested] = useState(true);
    const [chips, setChips] = useState(user?.specialties?.map(spec => ({
        label: 'Specialty',
        field: 'specialty',
        value: spec,
        displayValue: spec.label
    })) || []);

    const handleShowNotinterested = () => {
        setShowNotinterested(!showNotinterested);
    }

    const handleChipDelete = useCallback((deletedChip) => {
        setChips((prevChips) => prevChips.filter((chip) => chip.field !== deletedChip.field || chip.value !== deletedChip.value));
    }, []);

    const handleSpecialtyChange = useCallback((value) => {
        setChips((prevChips) => [
            ...prevChips.filter(chip => chip.field !== 'specialty'),
            {
                label: 'Specialty',
                field: 'specialty',
                value,
                displayValue: value.label
            }
        ]);
    }, []);

    const handleProjectPeriodChange = useCallback((newValue) => {
        setChips((prevChips) => {
            const newPeriod = {startDate: newValue[0], endDate: newValue[1]};
            const filteredChips = prevChips.filter((chip) => chip.field !== 'projectPeriod');
            return [
                ...filteredChips,
                {
                    label: 'Project Period',
                    field: 'projectPeriod',
                    value: newPeriod,
                    displayValue: formatDateRange(newPeriod?.startDate?.toDate(), newPeriod?.endDate?.toDate()),
                },
            ];
        });
        datePopover.handleClose();
    }, [datePopover]);

    const handleLocationChange = useCallback((location) => {
        setLocation(location);
        setChips((prevChips) => [
            ...prevChips.filter(chip => chip.field !== 'location'),
            {
                label: 'Location',
                field: 'location',
                value: location,
                displayValue: location.place_name
            }
        ]);
        locationPopover.handleClose();
    }, [locationPopover]);

    const projectPeriod = useMemo(() => {
        const period = chips.find((chip) => chip.field === 'projectPeriod')?.value || {};
        return [period.startDate || null, period.endDate || null];
    }, [chips]);

    return (
        <Card {...other}>
            <Stack alignItems="center" direction="row" flexWrap="wrap" spacing={2} sx={{p: 1}}>
                <Button color="inherit" endIcon={<ChevronDownIcon/>} onClick={popover.handleOpen}>
                    Specialties
                </Button>
                <SpecialtySelectForm open={popover.open}
                                     selectedSpecialties={chips.filter(chip => chip.field === 'specialty').map(chip => chip.value)}
                                     onSpecialtyChange={handleSpecialtyChange} onClose={popover.handleClose}
                                     disabledSelected={false}/>
                <Button color="inherit" endIcon={<ChevronDownIcon/>} onClick={datePopover.handleOpen}>
                    Project Period
                </Button>
                <Button color="inherit" endIcon={<ChevronDownIcon/>} onClick={locationPopover.handleOpen}>
                    Location
                </Button>
                <FormControlLabel control={<Checkbox checked={showNotinterested}/>} label="Show not interested"
                                  onClick={handleShowNotinterested}/>
            </Stack>

            <Divider/>

            {chips.length > 0 ? (
                <Stack alignItems="center" direction="row" flexWrap="wrap" gap={1} sx={{p: 2}}>
                    {chips.map((chip, index) => (
                        <Chip key={index} label={`${chip.label}: ${chip.displayValue}`}
                              onDelete={() => handleChipDelete(chip)} variant="outlined"/>
                    ))}
                </Stack>
            ) : (
                <Box sx={{p: 2.5}}>
                    <Typography color="text.secondary" variant="subtitle2">
                        No filters applied
                    </Typography>
                </Box>
            )}

            {/* Диалог выбора дат */}
            <Dialog open={datePopover.open} onClose={datePopover.handleClose}>
                <DialogContent>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateRangePicker
                            startText="Start Date"
                            endText="End Date"
                            value={projectPeriod}
                            onChange={handleProjectPeriodChange}
                        />
                    </LocalizationProvider>
                </DialogContent>
                <DialogActions>
                    <Button onClick={datePopover.handleClose}>Cancel</Button>
                </DialogActions>
            </Dialog>

            {/* Диалог выбора локации */}
            <Dialog open={locationPopover.open} onClose={locationPopover.handleClose}>
                <DialogContent>
                    <AddressAutoComplete location={location} withMap={true}
                                         handleSuggestionClick={handleLocationChange}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={locationPopover.handleClose}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};
