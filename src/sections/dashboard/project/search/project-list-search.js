import * as React from 'react';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {
    Box,
    Button,
    Card,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    Divider,
    FormControlLabel,
    Stack,
    Typography
} from '@mui/material';
import {useDispatch} from "src/store";
import {useAuth} from "src/hooks/use-auth";
import {SpecialtySelectForm} from "src/components/specialty-select-form";
import ChevronDownIcon from "@untitled-ui/icons-react/build/esm/ChevronDown";
import {usePopover} from "src/hooks/use-popover";

import {DateRangePicker} from "@mui/x-date-pickers-pro";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {formatDateRange} from "src/utils/date-locale";
import {AddressAutoComplete} from "src/components/address/AddressAutoComplete";
import useDictionary from "src/hooks/use-dictionaries";
import {profileApi} from "src/api/profile";
import {ERROR, INFO} from "src/libs/log";
import {useUpdateEffect} from "src/hooks/use-update-effect";


const useSpecialistDefaultFilters = () => {
    const {specialties, loading} = useDictionary();
    const {user} = useAuth();
    const [filters, setFilters] = useState([])
    const [initialized, setInitialized] = useState(false);

    const fetchDefaultFilters = async () => {
        setInitialized(false);
        const filtersInLocalStorage = getFiltersInLocalStorage();
        if (filtersInLocalStorage) {
            INFO("Fetch filters from local storage", filtersInLocalStorage);
            setFilters(filtersInLocalStorage);
        } else {
            INFO("Start fetch user specialties for", user.id, specialties);
            const userSpecialtiesData = await profileApi.getUserSpecialtiesById(user.id);

            const userSpec = userSpecialtiesData.map(uS => ({
                ...uS,
                id: uS.specialty,
                label: specialties.byId[uS.specialty]?.label
            }));
            INFO("User specialties:", userSpec);
            setFilters(userSpec.map(spec => ({
                label: 'Specialty',
                field: 'specialty',
                value: spec,
                displayValue: spec.label
            })));
        }
        setInitialized(true);
    }

    useEffect(() => {
        if (user && loading && !initialized) {
            fetchDefaultFilters();
        }
    }, [user, loading]);

    useEffect(() => {
        INFO("initialized", initialized);
    }, [initialized]);

    return {filters, initialized, fetchDefaultFilters};
};

const updateFiltersInLocalStorage = (filters) => {
    try {
        window.localStorage.setItem(window.location.href, JSON.stringify(filters));
    } catch (e) {
        ERROR("Error updateFiltersInLocalStorage", e);
    }
};


const getFiltersInLocalStorage = () => {
    try {
        return JSON.parse(window.localStorage.getItem(window.location.href));
    } catch (e) {
        ERROR("Error updateFiltersInLocalStorage", e);
    }
};

export const ProjectListSearch = (props) => {
    const {onFiltersChange, onDefaultFiltersInitialized, periodEnabled = false, ...other} = props;
    const popover = usePopover();
    const datePopover = usePopover();
    const locationPopover = usePopover();
    const [location, setLocation] = useState(null);
    const [isoData, setIsoData] = useState(null);
    const [showNotInterested, setShowNotInterested] = useState(true);
    const defaultFilters = useSpecialistDefaultFilters();

    const [chips, setChips] = useState([]);

    //for update Chips after Default filters initialized
    useUpdateEffect(() => {
        if (defaultFilters.initialized) {
            INFO("setChips", defaultFilters);
            setChips(defaultFilters.filters);
        }
    }, [defaultFilters.initialized]);

    const handleChipsUpdate = useCallback(() => {
        const filters = {
            specialties: []
        };

        chips.forEach((chip) => {
            switch (chip.field) {
                case 'specialty':
                    filters.specialties.push(chip.value);
                    break;
                default:
                    break;
            }
        });

        updateFiltersInLocalStorage(chips);
        onFiltersChange?.(filters);
        onDefaultFiltersInitialized?.(true);
    }, [chips, onFiltersChange]);

    useUpdateEffect(() => {
        handleChipsUpdate();
    }, [chips, handleChipsUpdate]);

    const handleShowNotinterested = () => {
        setShowNotInterested(!showNotInterested);
    }

    const handleDefaultFiltersRefresh = () => {
        window.localStorage.removeItem(window.location.href);
        defaultFilters.fetchDefaultFilters();

    }

    const handleChipDelete = useCallback((deletedChip) => {
        setChips((prevChips) => prevChips.filter((chip) => chip.field !== deletedChip.field || chip.value !== deletedChip.value));
    }, []);

    const handleSpecialtyChange = useCallback((value) => {
        setChips((prevChips) => [
            ...prevChips,
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

    const handleLocationChange = useCallback((location, isoData) => {
        INFO("LOCATION CHANGE", {location, isoData})
        setLocation(location);
        setIsoData(isoData)
    }, []);

    const handleApplyLocationFilters = useCallback(() => {
        setChips((prevChips) => [
            ...prevChips.filter(chip => (chip.field !== 'location' && chip.field !== 'isoData')),
            {
                label: 'Location',
                field: 'location',
                value: location,
                displayValue: location.place_name
            },
            {
                label: 'Region',
                field: 'isoData',
                value: isoData,
                displayValue: `${isoData.profile} [${isoData.minutes} min]`
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

                {periodEnabled &&
                    <Button color="inherit" endIcon={<ChevronDownIcon/>} onClick={datePopover.handleOpen}>
                        Project Period
                    </Button>}
                <Button color="inherit" endIcon={<ChevronDownIcon/>} onClick={locationPopover.handleOpen}>
                    Location
                </Button>
                <FormControlLabel control={<Checkbox checked={showNotInterested}/>} label="Show not interested"
                                  onClick={handleShowNotinterested}/>
                <Box sx={{flexGrow: 1}}/>
                <Button
                    color="inherit"
                    onClick={handleDefaultFiltersRefresh}
                >
                    Default filters
                </Button>
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

            <Dialog open={locationPopover.open} onClose={locationPopover.handleClose}>
                <DialogContent>
                    <AddressAutoComplete location={chips.find(c => c.field === "location")?.value}
                                         isoData={chips.find(c => c.field === "isoData")?.value}
                                         withMap={true}
                                         regionEnabled={true}
                                         handleSuggestionClick={handleLocationChange}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleApplyLocationFilters}>Apply</Button>
                    <Button onClick={locationPopover.handleClose} color={"error"}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};
